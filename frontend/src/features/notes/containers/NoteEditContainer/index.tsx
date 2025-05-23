'use client';

import NoteCreate from '@/features/notes/components/NoteCreate';
import { useNoteEditor } from '../../hooks/useNoteEditor';
import { useNoteEditContainer } from './useNoteEditContainer';

export type NoteEditContainerProps = {
  projectId: string;
  noteId: string;
  projectUrlId: string;
};

export const NoteEditContainer = ({
  projectId,
  noteId,
  projectUrlId,
}: NoteEditContainerProps) => {
  const {
    note,
    isLoading,
    isSubmitting,
    error,
    handleSubmit,
    handleDelete,
    handleCancel,
  } = useNoteEditContainer({
    projectId,
    noteId,
    projectUrlId,
  });

  const {
    editor,
    title,
    setTitle,
    content,
    isUploading,
    handleSubmit: noteEditSubmit,
    isRefreshingImages,
  } = useNoteEditor({
    initialTitle: note?.title || '',
    initialContent: note?.content || '',
    projectId,
    projectUrlId,
    noteId,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onDelete: handleDelete,
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
      projectId={projectId}
      noteId={noteId}
      onDelete={handleDelete}
      handleSubmit={noteEditSubmit}
      handleCancel={handleCancel}
      title={title}
      setTitle={setTitle}
      content={content}
      isUploading={isUploading}
      editor={editor}
      isRefreshingImages={isRefreshingImages}
    />
  );
};
