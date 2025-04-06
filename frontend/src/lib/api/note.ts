import { supabase } from '@/lib/supabase';
import { generateUniqueUrlId } from '@/lib/utils/urlId';

export interface Note {
  id: string;
  url_id: string;
  title: string;
  content: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * プロジェクトの全ノートを取得する
 */
export const getProjectNotes = async (projectId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('プロジェクトノートの取得エラー:', error);
    throw error;
  }

  return data || [];
};

/**
 * IDによる単一ノートの取得
 */
export const getNoteById = async (noteId: string): Promise<Note | null> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116は「行が返されなかった」エラーコード
      return null;
    }
    console.error('ノート取得エラー:', error);
    throw error;
  }

  return data;
};

/**
 * urlIdによる単一ノートの取得
 */
export const getNoteByUrlId = async (urlId: string): Promise<Note | null> => {
  try {
    console.log('getNoteByUrlId called with:', urlId);
    
    // まずRPCを試す
    console.log('Attempting to fetch note using RPC');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_note_by_url_id', {
      url_id_param: urlId
    });
    
    if (rpcError) {
      console.error('Error fetching note by URL ID using RPC:', rpcError);
      
      // RPCが失敗した場合、直接クエリを実行
      console.log('Falling back to direct query for note');
      const { data: queryData, error: queryError } = await supabase
        .from('notes')
        .select('*')
        .eq('url_id', urlId)
        .single();
        
      if (queryError) {
        if (queryError.code === 'PGRST116') {
          // PGRST116は「行が返されなかった」エラーコード
          console.log('Note not found with URL ID:', urlId);
          return null;
        }
        console.error('Error fetching note by URL ID using direct query:', queryError);
        return null;
      }
      
      console.log('Note found using direct query:', queryData);
      return queryData;
    }
    
    // RPCから返されるデータをログに出力
    console.log('RPC returned note data:', rpcData);
    
    // RPCから返されるデータが配列の場合は最初の要素を取得
    if (Array.isArray(rpcData)) {
      console.log('RPC returned an array for note, extracting first element');
      if (rpcData.length === 0) {
        console.log('Note not found (empty array) with URL ID:', urlId);
        return null;
      }
      return rpcData[0];
    }
    
    return rpcData;
  } catch (error) {
    console.error('Error in getNoteByUrlId:', error);
    return null;
  }
};

/**
 * タイトル、内容、またはタグによるノート検索
 */
export const searchNotes = async (
  projectId: string,
  searchTerm: string,
): Promise<Note[]> => {
  if (!searchTerm.trim()) {
    return getProjectNotes(projectId);
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('ノート検索エラー:', error);
    throw error;
  }

  return data || [];
};

/**
 * 新規ノートの作成
 */
export const createNote = async (noteData: {
  title: string;
  content: string;
  projectId: string;
}): Promise<Note> => {
  try {
    // URL識別子の生成
    const urlId = await generateUniqueUrlId(async (id) => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('id', { count: 'exact', head: true })
          .eq('url_id', id);
          
        if (error) {
          console.error('Error checking urlId existence:', error);
          return false;
        }
        
        return (data?.length ?? 0) > 0;
      } catch (error) {
        console.error('Error checking urlId existence:', error);
        return false;
      }
    });

    console.log('Generated urlId for note:', urlId);

    try {
      // まずRPCを使用してノートを作成
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_note_with_url_id', {
        title_param: noteData.title,
        content_param: noteData.content,
        project_id_param: noteData.projectId,
        url_id_param: urlId
      });

      if (rpcError) {
        console.error('Error creating note with RPC:', rpcError);
        
        // RPCが失敗した場合、直接挿入を試みる
        console.log('Falling back to direct insert for note');
        const { data: insertData, error: insertError } = await supabase
          .from('notes')
          .insert({
            title: noteData.title,
            content: noteData.content,
            project_id: noteData.projectId,
            url_id: urlId,
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error in direct insert fallback:', insertError);
          throw insertError;
        }
        
        console.log('Note created via direct insert:', insertData);
        return insertData;
      }

      // RPCから返されるデータをログに出力
      console.log('RPC returned data:', rpcData);
      
      // RPCから返されるデータが配列の場合は最初の要素を取得
      if (Array.isArray(rpcData)) {
        console.log('RPC returned an array, extracting first element');
        if (rpcData.length === 0) {
          throw new Error('ノート作成に失敗しました: 空の配列が返されました');
        }
        return rpcData[0];
      }
      
      // nullやundefinedの場合はエラーを投げる
      if (!rpcData) {
        throw new Error('ノート作成に失敗しました: データが返されませんでした');
      }

      return rpcData;
    } catch (createError) {
      console.error('Error in note creation process:', createError);
      throw createError;
    }
  } catch (error) {
    console.error('ノート作成エラー:', error);
    throw error;
  }
};

/**
 * 既存ノートの更新
 */
export const updateNote = async (
  noteId: string,
  noteData: {
    title?: string;
    content?: string;
  },
): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update(noteData)
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    console.error('ノート更新エラー:', error);
    throw error;
  }

  return data;
};

/**
 * ノートの削除
 */
export const deleteNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);

  if (error) {
    console.error('ノート削除エラー:', error);
    throw error;
  }
};
