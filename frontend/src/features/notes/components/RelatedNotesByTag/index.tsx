'use client';

import NoteCard from '@/features/notes/components/NoteCard';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useRelatedNotesByTag } from './useRelatedNotesByTag';

export interface RelatedNotesByTagProps {
  currentNoteId: string;
  projectId: string;
  content: string;
}

const RelatedNotesByTag: React.FC<RelatedNotesByTagProps> = ({
  currentNoteId,
  projectId,
  content,
}) => {
  const router = useRouter();
  
  const { relatedNotes, isLoading, error, tags } = useRelatedNotesByTag({
    currentNoteId,
    projectId,
    content,
  });

  // タグがない場合は何も表示しない
  if (tags.length === 0) {
    return null;
  }

  // ロード中の表示
  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  // エラーがある場合の表示
  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
        <div className="text-red-500 p-4 border border-red-200 rounded-md">
          エラー: {error.message}
        </div>
      </div>
    );
  }

  // 関連ノートがない場合
  if (relatedNotes.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
        <p className="text-muted-foreground text-center py-4">
          同じタグがついているノートはありません
        </p>
      </div>
    );
  }

  // 関連ノートの表示
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onClick={(noteId) => router.push(`/projects/${projectId}/notes/${noteId}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedNotesByTag;
