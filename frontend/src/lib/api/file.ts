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
        const bucketExists = buckets.some(bucket => bucket.name === bucketName);
        
        // バケットが存在しない場合は作成
        if (!bucketExists) {
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true, // 公開バケットとして作成
          });
          
          if (createError) {
            console.error('バケット作成エラー:', createError);
            // エラーがあっても処理を続行
          } else {
            console.log(`バケット '${bucketName}' を作成しました`);
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
        console.log('バケットが見つからないため、publicバケットを使用します');
        
        // publicバケットにアップロード
        const { data: publicData, error: publicError } = await supabase.storage
          .from('public')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });
          
        if (publicError) {
          throw new Error(`画像のアップロードに失敗しました: ${publicError.message}`);
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
