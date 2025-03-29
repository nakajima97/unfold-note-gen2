'use client';

import { createNote } from '@/lib/api/note';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Note } from '@/features/notes/types';

export interface UseNoteCreateContainerProps {
  projectId: string;
}

export const useNoteCreateContainer = ({ projectId }: UseNoteCreateContainerProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (note: Partial<Note>) => {
    if (!note.title || !note.content) {
      setError(new Error('Title and content are required'));
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

      // Navigate to the newly created note
      router.push(`/projects/${projectId}/notes/${newNote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create note'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to the notes list
    router.push(`/projects/${projectId}/notes`);
  };

  return {
    isSubmitting,
    error,
    handleSubmit,
    handleCancel,
  };
};
