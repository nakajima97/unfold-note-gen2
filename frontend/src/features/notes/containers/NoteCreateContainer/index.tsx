'use client';

import NoteCreate from '@/features/notes/components/NoteCreate';
import { useNoteCreateContainer } from './useNoteCreateContainer';
import React from 'react';

export interface NoteCreateContainerProps {
  projectId: string;
}

const NoteCreateContainer: React.FC<NoteCreateContainerProps> = ({ projectId }) => {
  const { isSubmitting, error, handleSubmit, handleCancel } = useNoteCreateContainer({
    projectId,
  });

  // エラーがある場合は表示
  if (error) {
    console.error('Error creating note:', error);
    // エラーは実際のUIでは適切に処理する必要があります
  }

  return (
    <NoteCreate
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default NoteCreateContainer;
