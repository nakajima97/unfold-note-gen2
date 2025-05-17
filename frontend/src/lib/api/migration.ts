import { supabase } from '@/utils/supabase/client';
import { extractFirstImageUrl } from './note';

/**
 * 既存のノートのサムネイルURLを更新する関数
 * thumbnail_urlがnullのノートに対して、コンテンツから画像URLを抽出して設定する
 * @returns 更新されたノートの数
 */
export async function updateExistingNotesThumbnails(): Promise<number> {
  try {
    // thumbnail_urlがnullのノートを取得
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .is('thumbnail_url', null);

    if (error) {
      return 0;
    }

    if (!notes || notes.length === 0) {
      return 0;
    }

    let updatedCount = 0;

    // 各ノートのサムネイルURLを更新
    for (const note of notes) {
      const thumbnailUrl = extractFirstImageUrl(note.content);

      if (thumbnailUrl) {
        const { error: updateError } = await supabase
          .from('notes')
          .update({ thumbnail_url: thumbnailUrl })
          .eq('id', note.id);

        if (!updateError) {
          updatedCount++;
        }
      }
    }

    return updatedCount;
  } catch {
    return 0;
  }
}

/**
 * 特定のプロジェクトのノートのサムネイルURLを更新する関数
 * @param projectId プロジェクトID
 * @returns 更新されたノートの数
 */
export async function updateProjectNotesThumbnails(
  projectId: string,
): Promise<number> {
  try {
    // 指定されたプロジェクトのthumbnail_urlがnullのノートを取得
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .is('thumbnail_url', null);

    if (error) {
      return 0;
    }

    if (!notes || notes.length === 0) {
      return 0;
    }

    let updatedCount = 0;

    // 各ノートのサムネイルURLを更新
    for (const note of notes) {
      const thumbnailUrl = extractFirstImageUrl(note.content);

      if (thumbnailUrl) {
        const { error: updateError } = await supabase
          .from('notes')
          .update({ thumbnail_url: thumbnailUrl })
          .eq('id', note.id);

        if (!updateError) {
          updatedCount++;
        }
      }
    }

    return updatedCount;
  } catch {
    return 0;
  }
}
