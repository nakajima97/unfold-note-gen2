'use client';

import NoteCreate from '@/features/notes/components/NoteCreate';
import type React from 'react';
import { useNoteEditor } from '../../hooks/useNoteEditor';
import { useNoteCreateContainer } from './useNoteCreateContainer';

export type NoteCreateContainerProps = {
  projectId: string;
  projectUrlId: string;
};

const NoteCreateContainer: React.FC<NoteCreateContainerProps> = ({
  projectId,
  projectUrlId,
}) => {
  const { isSubmitting, error, handleSubmit, handleCancel } =
    useNoteCreateContainer({
      projectId,
      projectUrlId,
    });

  const {
    editor,
    title,
    setTitle,
    content,
    setContent,
    debouncedContent,
    isUploading,
    handleSubmit: noteEditSubmit,
    isRefreshingImages,
  } = useNoteEditor({
    initialTitle: '',
    initialContent: '',
    projectId,
    projectUrlId,
    noteId: undefined,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onDelete: undefined,
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
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      debouncedContent={debouncedContent}
      isUploading={isUploading}
      editor={editor}
      handleSubmit={noteEditSubmit}
      isRefreshingImages={isRefreshingImages}
      handleCancel={handleCancel}
    />
  );
};

export default NoteCreateContainer;
