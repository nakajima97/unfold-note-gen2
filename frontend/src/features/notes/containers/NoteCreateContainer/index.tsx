'use client';

import NoteCreate from '@/features/notes/components/NoteCreate';
import type React from 'react';
import { useNoteCreateContainer } from './useNoteCreateContainer';

export interface NoteCreateContainerProps {
  projectId: string;
}

const NoteCreateContainer: React.FC<NoteCreateContainerProps> = ({
  projectId,
}) => {
  const { isSubmitting, error, handleSubmit, handleCancel } =
    useNoteCreateContainer({
      projectId,
    });

  // エラーがある場合は表示
  if (error) {
    console.error('ノート作成エラー:', error);
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
