'use client';

import NoteCreate from '@/features/notes/components/NoteCreate';
import type React from 'react';
import { useNoteCreateContainer } from './useNoteCreateContainer';

export interface NoteCreateContainerProps {
  projectId: string;
  projectUrlId: string;
}

const NoteCreateContainer: React.FC<NoteCreateContainerProps> = ({
  projectId,
  projectUrlId,
}) => {
  const { isSubmitting, error, handleSubmit, handleCancel } =
    useNoteCreateContainer({
      projectId,
      projectUrlId,
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
      projectId={projectId}
    />
  );
};

export default NoteCreateContainer;
