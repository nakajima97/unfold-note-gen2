import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * 画像ファイルをアップロードする
 * @param projectId プロジェクトID
 * @param file アップロードするファイル
 * @returns アップロードされたファイルのURL
 */
export const uploadImage = async (projectId: string, file: File) => {
  try {
    // バケット名を定義
    const bucketName = 'notes';

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
              public: true, // 公開バケットとして作成
            },
          );

          if (createError) {
            console.error('バケット作成エラー:', createError);
            // エラーがあっても処理を続行
          } else {
          }
        }
      }
    } catch (bucketError) {
      console.error('バケット確認/作成エラー:', bucketError);
      // エラーがあっても処理を続行
    }

    // ファイル名をUUIDに変更して衝突を避ける
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      // バケットが見つからない場合は、publicバケットを試す
      if (error.message.includes('Bucket not found')) {
        // publicバケットにアップロード
        const { data: publicData, error: publicError } = await supabase.storage
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

        // publicバケットからURLを取得
        const { data: publicUrlData } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      }

      throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
    }

    // 画像のURLを取得
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
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
    if (pathParts.length >= 6 && pathParts[1] === 'storage' && pathParts[2] === 'v1') {
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
export const getProjectImages = async (projectId: string, bucketName = 'notes') => {
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
