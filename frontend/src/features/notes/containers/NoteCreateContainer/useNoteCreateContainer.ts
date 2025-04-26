'use client';

import type { Note } from '@/features/notes/types';
import { createNote } from '@/lib/api/note';
import { updateNoteTags } from '@/lib/api/tag';
import { attachImagesToNote } from '@/lib/api/file';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type UseNoteCreateContainerProps = {
  projectId: string;
  projectUrlId: string;
};

export const useNoteCreateContainer = ({
  projectId,
  projectUrlId,
}: UseNoteCreateContainerProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ノート一覧のURL
  const notesUrl = `/projects/${projectUrlId}/notes`;

  /**
   * ノートの作成処理
   * @param note - 作成するノートの情報
   * @returns
   */
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

      // 作成されたノートのIDとurlIdが存在することを確認
      if (!newNote) {
        throw new Error(
          'ノートの作成に失敗しました: ノートデータが取得できません',
        );
      }

      if (!newNote.id) {
        throw new Error('ノートの作成に失敗しました: ノートIDが取得できません');
      }

      if (!newNote.urlId) {
        throw new Error(
          'ノートの作成に失敗しました: ノートのURL IDが取得できません',
        );
      }

      // ノートからタグを抽出して保存
      try {
        await updateNoteTags(newNote.id, note.content || '', projectId);
      } catch (tagError) {
        console.error('Tag update error:', tagError);
        // タグ更新エラーはノート作成自体を失敗とはしない
      }

      // 画像紐付け処理を共通APIで実行
      await attachImagesToNote(newNote.id, note.content || '');

      // ノート一覧に遷移
      router.push(notesUrl);
    } catch (err) {
      console.error('Note creation error:', err);
      setError(
        err instanceof Error ? err : new Error('ノートの作成に失敗しました'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * ノート一覧に戻る
   */
  const handleCancel = () => {
    // ノート一覧に戻る
    router.push(notesUrl);
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
    handleCancel,
  };
};
