'use client';

import type { Note } from '@/features/notes/types';
import { refreshImageUrls } from '@/lib/api/file';
import { deleteNote, getNoteById, updateNote } from '@/lib/api/note';
import { updateNoteTags } from '@/lib/api/tag';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type UseNoteEditContainerProps = {
  projectId: string;
  noteId: string;
  projectUrlId?: string; // プロジェクトのURLID
};

export const useNoteEditContainer = ({
  projectId,
  noteId,
  projectUrlId,
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

        // 画像URLを更新
        if (fetchedNote.content) {
          try {
            const updatedContent = await refreshImageUrls(fetchedNote.content);
            fetchedNote.content = updatedContent;
          } catch (refreshError) {
            console.error('画像URL更新エラー:', refreshError);
            // エラーがあっても処理を続行
          }
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
      // ノート内容を更新
      await updateNote(noteId, {
        title: updatedNote.title,
        content: updatedNote.content,
      });

      // ノートからタグを抽出して保存
      await updateNoteTags(noteId, updatedNote.content, projectId);

      // 更新後、ノート一覧ページに戻る
      if (projectUrlId) {
        router.push(`/projects/${projectUrlId}/notes`);
      } else {
        // フォールバック: 内部IDを使用
        router.push(`/projects/${projectId}/notes`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('ノートの更新に失敗しました'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ノート削除処理
  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteNote(noteId);

      // 削除後、ノート一覧ページに戻る
      if (projectUrlId) {
        router.push(`/projects/${projectUrlId}/notes`);
      } else {
        // フォールバック: 内部IDを使用
        router.push(`/projects/${projectId}/notes`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('ノートの削除に失敗しました'),
      );
      setIsSubmitting(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    // ノート一覧に戻る
    if (projectUrlId) {
      router.push(`/projects/${projectUrlId}/notes`);
    } else {
      // フォールバック: 内部IDを使用
      router.push(`/projects/${projectId}/notes`);
    }
  };

  return {
    note,
    isLoading,
    isSubmitting,
    error,
    handleSubmit,
    handleDelete,
    handleCancel,
  };
};
