'use client';

import type { Note } from '@/features/notes/types';
import { createNote } from '@/lib/api/note';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface UseNoteCreateContainerProps {
  projectId: string;
}

export const useNoteCreateContainer = ({
  projectId,
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
      const newNote = await createNote({
        title: note.title,
        content: note.content,
        projectId,
      });

      // 新しく作成されたノートに遷移
      router.push(`/projects/${projectId}/notes/${newNote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('ノートの作成に失敗しました'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // ノート一覧に戻る
    router.push(`/projects/${projectId}/notes`);
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
    handleCancel,
  };
};
