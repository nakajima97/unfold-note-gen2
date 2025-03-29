import { supabase } from '@/lib/supabase';

export interface Note {
  id: string;
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
  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        title: noteData.title,
        content: noteData.content,
        project_id: noteData.projectId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('ノート作成エラー:', error);
    throw error;
  }

  return data;
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
