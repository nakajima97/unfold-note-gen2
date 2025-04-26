import { supabase } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * 画像ファイルをアップロードする
 * @param projectId プロジェクトID
 * @param file アップロードするファイル
 * @param noteId 紐付けるノートID（任意）
 * @returns アップロードされたファイルの署名付きURL
 */
export const uploadImage = async (
  projectId: string,
  file: File,
  noteId?: string // 画像をノートに紐付ける場合
) => {
  try {
    // バケット名を定義
    const bucketName = 'notes';
    let filePath = '';
    let fileName = '';
    let fileExt = '';
    let mimeType = file.type;
    let fileSize = file.size;
    let originalName = file.name;
    try {
      // バケットの存在確認
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('バケット一覧取得エラー:', error);
        // エラーがあっても処理を続行
      } else {
        // バケットが存在するか確認
        const bucketExists = buckets.some(
          (bucket) => bucket.name === bucketName,
        );
        // バケットが存在しない場合は作成
        if (!bucketExists) {
          const { error: createError } = await supabase.storage.createBucket(
            bucketName,
            {
              public: false, // プライベートバケットとして作成
            },
          );
          if (createError) {
            console.error('バケット作成エラー:', createError);
            // エラーがあっても処理を続行
          }
        }
      }
    } catch (bucketError) {
      console.error('バケット確認/作成エラー:', bucketError);
      // エラーがあっても処理を続行
    }
    // ファイル名をUUIDに変更して衝突を避ける
    fileExt = file.name.split('.').pop() || 'bin';
    fileName = `${uuidv4()}.${fileExt}`;
    filePath = `${projectId}/${fileName}`;
    // Supabase Storageにアップロード
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    let signedUrl = '';
    if (error) {
      // バケットが見つからない場合は、publicバケットを試す
      if (error.message.includes('Bucket not found')) {
        const { error: publicError } = await supabase.storage
          .from('public')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
        if (publicError) {
          throw new Error(
            `画像のアップロードに失敗しました: ${publicError.message}`,
          );
        }
        // publicバケットから署名付きURLを取得（60分間有効）
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from('public')
            .createSignedUrl(filePath, 60 * 60); // 60分（3600秒）
        if (signedUrlError) {
          throw new Error(`署名付きURL生成エラー: ${signedUrlError.message}`);
        }
        signedUrl = signedUrlData.signedUrl;
      } else {
        throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
      }
    } else {
      // 画像の署名付きURLを取得（60分間有効）
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from(bucketName)
          .createSignedUrl(filePath, 60 * 60); // 60分（3600秒）
      if (signedUrlError) {
        throw new Error(`署名付きURL生成エラー: ${signedUrlError.message}`);
      }
      signedUrl = signedUrlData.signedUrl;
    }
    // --- ここからfilesテーブルへinsert ---
    // プロジェクトIDからUUIDを取得（projectIdはurlIdの可能性があるため、UUIDでなければDB検索が必要）
    // ただし、ここではprojectIdがUUIDで渡ってくる前提とする
    // noteIdも同様
    const { error: insertError } = await supabase.from('files').insert([
      {
        original_name: originalName,
        storage_path: filePath,
        mime_type: mimeType,
        size: fileSize,
        note_id: noteId || null,
        project_id: projectId,
      },
    ]);
    if (insertError) {
      console.error('filesテーブルへのinsertエラー:', insertError);
      // 画像アップロード自体は成功してているので、URLは返す
    }
    return signedUrl;
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    throw error;
  }
};

/**
 * Supabase Storage URLからファイル情報を抽出する
 * @param url Supabase Storage URL
 * @returns バケット名とファイルパスを含むオブジェクト、または解析できない場合はnull
 */
export const getFileInfoFromUrl = (url: string) => {
  try {
    // URLからパスを抽出
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');

    // Supabase Storageの標準パスフォーマット: /storage/v1/object/public/[bucket]/[path]
    if (
      pathParts.length >= 6 &&
      pathParts[1] === 'storage' &&
      pathParts[2] === 'v1'
    ) {
      const bucket = pathParts[5];
      const filePath = pathParts.slice(6).join('/');
      return { bucket, filePath };
    }

    return null;
  } catch (error) {
    console.error('URL解析エラー:', error);
    return null;
  }
};

/**
 * プロジェクトに関連する全ての画像を取得する
 * @param projectId プロジェクトID
 * @param bucketName バケット名（デフォルト: 'notes'）
 * @returns 画像ファイルの一覧
 */
export const getProjectImages = async (
  projectId: string,
  bucketName = 'notes',
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(projectId);

    if (error) {
      console.error('プロジェクト画像一覧取得エラー:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('プロジェクト画像一覧取得エラー:', error);
    return [];
  }
};

/**
 * 画像URLを新しい署名付きURLに更新する
 * @param imageUrl 元の画像URL
 * @param expiresIn 有効期限（秒）、デフォルトは1日
 * @returns 新しい署名付きURL、または処理できない場合は元のURL
 */
export const refreshImageUrl = async (
  imageUrl: string,
  expiresIn = 60 * 60 * 24,
) => {
  try {
    // URLからファイル情報を抽出
    const fileInfo = getFileInfoFromUrl(imageUrl);
    if (!fileInfo) {
      console.warn('URLからファイル情報を抽出できませんでした:', imageUrl);
      return imageUrl; // 処理できない場合は元のURLを返す
    }

    // 新しい署名付きURLを生成
    const { data, error } = await supabase.storage
      .from(fileInfo.bucket)
      .createSignedUrl(fileInfo.filePath, expiresIn);

    if (error) {
      console.error('署名付きURL生成エラー:', error);
      return imageUrl; // エラーの場合は元のURLを返す
    }

    return data.signedUrl;
  } catch (error) {
    console.error('画像URL更新エラー:', error);
    return imageUrl; // エラーの場合は元のURLを返す
  }
};

/**
 * ノートコンテンツ内のすべての画像URLを新しい署名付きURLに更新する
 * @param content ノートのコンテンツ（HTML形式）
 * @param expiresIn 有効期限（秒）、デフォルトは1日
 * @returns 画像URLが更新されたコンテンツ
 */
export const refreshImageUrls = async (
  content: string,
  expiresIn = 60 * 60 * 24,
) => {
  if (!content) return content;

  try {
    // img要素のsrc属性からURLを抽出する正規表現
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    const urls = new Set<string>();
    let match: RegExpExecArray | null = imgRegex.exec(content);

    // すべての画像URLを抽出
    while (match !== null) {
      const url = match[1];
      // Supabase Storageのパスを含むURLのみを処理
      if (url.includes('/storage/v1/object/')) {
        urls.add(url);
      }
      match = imgRegex.exec(content);
    }

    // URLがない場合は元のコンテンツを返す
    if (urls.size === 0) {
      return content;
    }

    // 各URLを新しい署名付きURLに更新
    let updatedContent = content;
    for (const url of urls) {
      const newUrl = await refreshImageUrl(url, expiresIn);
      // 元のURLを新しいURLで置換
      updatedContent = updatedContent.replace(
        new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        newUrl,
      );
    }

    return updatedContent;
  } catch (error) {
    console.error('コンテンツ内の画像URL更新エラー:', error);
    return content; // エラーの場合は元のコンテンツを返す
  }
};

/**
 * ノート本文からSupabase Storageのstorage_path一覧を抽出
 * @param content HTML形式のノート本文
 * @returns storage_pathの配列（例: ["projectId/uuid1.jpg", ...]）
 */
export function extractImagePathsFromContent(content: string): string[] {
  // 例: https://xxxx.supabase.co/storage/v1/object/sign/notes/projectId/uuid.jpg?...
  const regex = /\/storage\/v1\/object\/sign\/notes\/([^"?]+)/g;
  const paths: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1]); // "projectId/uuid.jpg" など
  }
  return paths;
}

/**
 * filesテーブルの画像レコードをノートIDで一括紐付けする
 * @param noteId ノートID
 * @param content ノート本文（HTML）
 * @returns エラーがあればconsole.errorに出力
 */
export async function attachImagesToNote(noteId: string, content: string) {
  const imagePaths = extractImagePathsFromContent(content || '');
  if (imagePaths.length === 0) return;
  const { error } = await supabase.from('files')
    .update({ note_id: noteId })
    .in('storage_path', imagePaths);
  if (error) {
    console.error('画像ファイル紐付けエラー:', error);
  }
}

/**
 * 指定したノートから削除された画像のfiles.note_idをnullにする
 * @param noteId ノートID
 * @param content ノート本文（HTML、最新状態）
 * @returns エラーがあればconsole.errorに出力
 */
export async function detachRemovedImagesFromNote(noteId: string, content: string) {
  // 現在本文に含まれている画像storage_path一覧
  const currentImagePaths = extractImagePathsFromContent(content || '');
  // note_idがこのノートで、かつ現在本文に含まれていないstorage_pathを特定
  const { data, error: selectError } = await supabase.from('files')
    .select('storage_path')
    .eq('note_id', noteId);
  if (selectError) {
    console.error('画像紐付け解除selectエラー:', selectError);
    return;
  }
  const toDetach = (data || [])
    .map((row: { storage_path: string }) => row.storage_path)
    .filter((path: string) => !currentImagePaths.includes(path));
  if (toDetach.length === 0) return;
  const { error: updateError } = await supabase.from('files')
    .update({ note_id: null })
    .in('storage_path', toDetach)
    .eq('note_id', noteId);
  if (updateError) {
    console.error('画像紐付け解除updateエラー:', updateError);
  }
}

/**
 * ノート本文とfilesテーブルの画像紐付け状態を同期する（追加・削除両対応）
 * @param noteId ノートID
 * @param content ノート本文（HTML、最新状態）
 * @returns エラーがあればconsole.errorに出力
 */
export async function syncNoteImages(noteId: string, content: string) {
  // 紐付け追加
  await attachImagesToNote(noteId, content);
  // 紐付け解除
  await detachRemovedImagesFromNote(noteId, content);
}
