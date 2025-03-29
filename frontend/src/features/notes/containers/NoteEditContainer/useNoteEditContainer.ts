'use client';

import type { Note } from '@/features/notes/types';
import { getNoteById, updateNote } from '@/lib/api/note';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface UseNoteEditContainerProps {
  projectId: string;
  noteId: string;
}

export const useNoteEditContainer = ({
  projectId,
  noteId,
}: UseNoteEditContainerProps) => {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ノートデータの取得
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        const fetchedNote = await getNoteById(noteId);

        if (!fetchedNote) {
          setError(new Error('ノートが見つかりませんでした'));
          return;
        }

        if (fetchedNote.project_id !== projectId) {
          setError(new Error('このプロジェクトに属するノートではありません'));
          return;
        }

        setNote(fetchedNote);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('ノートの取得に失敗しました'),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId, projectId]);

  // ノート更新処理
  const handleSubmit = async (updatedNote: Partial<Note>) => {
    if (!updatedNote.title || !updatedNote.content) {
      setError(new Error('タイトルと内容は必須です'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateNote(noteId, {
        title: updatedNote.title,
        content: updatedNote.content,
      });

      // 更新後、ノート一覧ページに戻る
      router.push(`/projects/${projectId}/notes`);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('ノートの更新に失敗しました'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    // ノート一覧に戻る
    router.push(`/projects/${projectId}/notes`);
  };

  return {
    note,
    isLoading,
    isSubmitting,
    error,
    handleSubmit,
    handleCancel,
  };
};
