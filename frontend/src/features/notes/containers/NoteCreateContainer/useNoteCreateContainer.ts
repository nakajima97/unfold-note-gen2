'use client';

import type { Note } from '@/features/notes/types';
import { createNote } from '@/lib/api/note';
import { updateNoteTags } from '@/lib/api/tag';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface UseNoteCreateContainerProps {
  projectId: string;
  projectUrlId: string;
}

export const useNoteCreateContainer = ({
  projectId,
  projectUrlId,
}: UseNoteCreateContainerProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (note: Partial<Note>) => {
    if (!note.title || !note.content) {
      setError(new Error('タイトルと内容は必須です'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // ノートを作成
      const newNote = await createNote({
        title: note.title,
        content: note.content,
        projectId,
      });

      // 作成されたノートのIDとurl_idが存在することを確認
      if (!newNote) {
        throw new Error('ノートの作成に失敗しました: ノートデータが取得できません');
      }
      
      if (!newNote.id) {
        throw new Error('ノートの作成に失敗しました: ノートIDが取得できません');
      }
      
      if (!newNote.url_id) {
        throw new Error('ノートの作成に失敗しました: ノートのURL IDが取得できません');
      }

      // ノートからタグを抽出して保存
      try {
        await updateNoteTags(newNote.id, note.content || '', projectId);
      } catch (tagError) {
        console.error('Tag update error:', tagError);
        // タグ更新エラーはノート作成自体を失敗とはしない
      }

      // 新しく作成されたノートに遷移（url_idを使用）
      router.push(`/projects/${projectUrlId}/notes/${newNote.url_id}`);
    } catch (err) {
      console.error('Note creation error:', err);
      setError(
        err instanceof Error ? err : new Error('ノートの作成に失敗しました'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // ノート一覧に戻る
    router.push(`/projects/${projectUrlId}/notes`);
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
    handleCancel,
  };
};
