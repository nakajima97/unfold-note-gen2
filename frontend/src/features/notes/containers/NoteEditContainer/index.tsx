'use client';

import NoteCreate from '@/features/notes/components/NoteCreate';
import type React from 'react';
import { useNoteEditContainer } from './useNoteEditContainer';

export interface NoteEditContainerProps {
  projectId: string;
  noteId: string;
  projectUrlId?: string;
}

const NoteEditContainer: React.FC<NoteEditContainerProps> = ({
  projectId,
  noteId,
  projectUrlId,
}) => {
  const { note, isLoading, isSubmitting, error, handleSubmit, handleCancel } =
    useNoteEditContainer({
      projectId,
      noteId,
      projectUrlId,
    });

  // ロード中の表示
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  // エラーがある場合の表示
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">エラー: {error.message}</div>
        </div>
      </div>
    );
  }

  // ノートが見つからない場合
  if (!note) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">ノートが見つかりませんでした</div>
        </div>
      </div>
    );
  }

  return (
    <NoteCreate
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialTitle={note.title}
      initialContent={note.content}
      projectId={projectId}
      projectUrlId={projectUrlId}
      noteId={noteId}
    />
  );
};

export default NoteEditContainer;
