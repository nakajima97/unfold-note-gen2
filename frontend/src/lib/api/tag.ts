import { supabase } from '@/lib/supabase';

export interface Tag {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
}

/**
 * プロジェクト内のすべてのタグを取得する
 */
export const getProjectTags = async (projectId: string): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('project_id', projectId)
    .order('name');

  if (error) {
    console.error('プロジェクトタグの取得エラー:', error);
    throw error;
  }

  return data || [];
};

/**
 * タグ名からタグを取得する（存在しない場合は作成する）
 */
export const getOrCreateTag = async (
  tagName: string,
  projectId: string,
): Promise<Tag> => {
  // まず既存のタグを検索
  const { data: existingTag, error: searchError } = await supabase
    .from('tags')
    .select('*')
    .eq('name', tagName)
    .eq('project_id', projectId)
    .single();

  if (!searchError && existingTag) {
    return existingTag;
  }

  // 存在しない場合は新規作成
  const { data: newTag, error: createError } = await supabase
    .from('tags')
    .insert([
      {
        name: tagName,
        project_id: projectId,
      },
    ])
    .select()
    .single();

  if (createError) {
    console.error('タグ作成エラー:', createError);
    throw createError;
  }

  return newTag;
};

/**
 * ノートとタグの関連付けを作成する
 */
export const associateTagWithNote = async (
  noteId: string,
  tagId: string,
): Promise<void> => {
  const { error } = await supabase
    .from('note_tags')
    .insert([
      {
        note_id: noteId,
        tag_id: tagId,
      },
    ]);

  if (error) {
    // 既に関連付けが存在する場合は無視（一意制約違反）
    if (error.code === '23505') {
      return;
    }
    console.error('タグとノートの関連付けエラー:', error);
    throw error;
  }
};

/**
 * ノートに関連付けられたすべてのタグを削除する
 */
export const removeAllTagsFromNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase
    .from('note_tags')
    .delete()
    .eq('note_id', noteId);

  if (error) {
    console.error('ノートからのタグ削除エラー:', error);
    throw error;
  }
};

/**
 * ノートに関連付けられたすべてのタグを取得する
 */
export const getTagsByNoteId = async (noteId: string): Promise<Tag[]> => {
  // まずノートに関連付けられたタグIDを取得
  const { data: tagIds, error: tagIdsError } = await supabase
    .from('note_tags')
    .select('tag_id')
    .eq('note_id', noteId);

  if (tagIdsError) {
    console.error('ノートのタグID取得エラー:', tagIdsError);
    throw tagIdsError;
  }

  if (!tagIds.length) {
    return [];
  }

  // 取得したタグIDを使ってタグ情報を取得
  const tagIdArray = tagIds.map(item => item.tag_id);
  
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .in('id', tagIdArray);

  if (tagsError) {
    console.error('タグ情報取得エラー:', tagsError);
    throw tagsError;
  }

  return tags || [];
};

/**
 * 特定のタグが付けられたすべてのノートを取得する
 */
export const getNotesByTagName = async (
  tagName: string,
  projectId: string,
): Promise<string[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('id')
    .eq('name', tagName)
    .eq('project_id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // タグが存在しない場合は空配列を返す
      return [];
    }
    console.error('タグIDの取得エラー:', error);
    throw error;
  }

  const tagId = data.id;

  const { data: noteTagsData, error: noteTagsError } = await supabase
    .from('note_tags')
    .select('note_id')
    .eq('tag_id', tagId);

  if (noteTagsError) {
    console.error('タグに関連するノートの取得エラー:', noteTagsError);
    throw noteTagsError;
  }

  return noteTagsData.map((item) => item.note_id);
};

/**
 * テキストからタグを抽出する
 * @param text タグを抽出するテキスト
 * @returns 抽出されたタグ名の配列（#を除いた部分）
 */
export const extractTagsFromText = (text: string): string[] => {
  // HTMLタグを除去
  const plainText = text.replace(/<[^>]*>/g, ' ');
  
  // タグを抽出（#で始まり、文字、数字、アンダースコア、ハイフンを含む単語）
  const tagRegex = /#([\p{L}\p{N}_-]+)/gu;
  const matches = [...plainText.matchAll(tagRegex)];
  
  // 重複を除去して返す
  return [...new Set(matches.map((match) => match[1]))];
};

/**
 * ノートのタグを更新する（既存のタグを削除して新しいタグを追加）
 */
export const updateNoteTags = async (
  noteId: string,
  content: string,
  projectId: string,
): Promise<void> => {
  try {
    // コンテンツからタグを抽出
    const tagNames = extractTagsFromText(content);
    
    // 既存のタグ関連付けをすべて削除
    await removeAllTagsFromNote(noteId);
    
    // 新しいタグを作成または取得して関連付け
    for (const tagName of tagNames) {
      const tag = await getOrCreateTag(tagName, projectId);
      await associateTagWithNote(noteId, tag.id);
    }
  } catch (error) {
    console.error('ノートのタグ更新エラー:', error);
    throw error;
  }
};
