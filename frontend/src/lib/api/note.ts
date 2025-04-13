import { generateUniqueUrlId } from '@/lib/utils/urlId';
import { supabase } from '@/utils/supabase/client';

export type Note = {
  id: string;
  urlId: string;
  title: string;
  content: string;
  project_id: string;
  created_at: string;
  updated_at: string;
};

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

  return data.map((note) => ({ ...note, urlId: note.url_id })) || [];
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

  return { ...data, urlId: data.url_id };
};

/**
 * urlIdによる単一ノートの取得
 */
export const getNoteByUrlId = async (urlId: string): Promise<Note | null> => {
  try {
    // まず直接クエリを試みる（RPCよりも信頼性が高い）
    const { data: queryData, error: queryError } = await supabase
      .from('notes')
      .select('*')
      .eq('url_id', urlId)
      .single();

    if (!queryError) {
      return { ...queryData, urlId: queryData.url_id };
    }

    if (queryError.code !== 'PGRST116') {
      // PGRST116以外のエラーの場合はエラーを投げる
      console.error(
        'Error fetching note by URL ID using direct query:',
        queryError,
      );
      throw queryError;
    }

    // 直接クエリで見つからなかった場合はRPCを試みる
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_note_by_url_id',
      {
        url_id_param: urlId,
      },
    );

    if (rpcError) {
      console.error('Error fetching note by URL ID using RPC:', rpcError);
      return null;
    }

    if (Array.isArray(rpcData)) {
      if (rpcData.length === 0) {
        return null;
      }
      return { ...rpcData[0], urlId: rpcData[0].url_id };
    }

    return { ...rpcData, urlId: rpcData.url_id };
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

  return data.map((note) => ({ ...note, urlId: note.url_id })) || [];
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

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'create_note_with_url_id',
        {
          title_param: noteData.title,
          content_param: noteData.content,
          project_id_param: noteData.projectId,
          url_id_param: urlId,
        },
      );

      if (rpcError) {
        console.error('Error creating note with RPC:', rpcError);

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

        return { ...insertData, urlId: insertData.url_id };
      }

      if (Array.isArray(rpcData)) {
        if (rpcData.length === 0) {
          throw new Error('ノート作成に失敗しました: 空の配列が返されました');
        }
        return { ...rpcData[0], urlId: rpcData[0].url_id };
      }

      if (!rpcData) {
        throw new Error('ノート作成に失敗しました: データが返されませんでした');
      }

      return { ...rpcData, urlId: rpcData.url_id };
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

  return { ...data, urlId: data.url_id };
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
