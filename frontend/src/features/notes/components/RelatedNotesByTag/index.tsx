'use client';

import NoteCard from '@/features/notes/components/NoteCard';
import type { Note } from '@/lib/api/note';
import type React from 'react';

// Note型を拡張してurl_idを明示的に含める
interface NoteWithUrlId extends Note {
  url_id: string;
}

export interface RelatedNotesByTagProps {
  groupedNotes: Record<string, NoteWithUrlId[]>;
  isLoading: boolean;
  error: Error | null;
  tags: string[];
  projectId: string;
  onNoteClick: (noteUrlId: string) => void;
}

const RelatedNotesByTag: React.FC<RelatedNotesByTagProps> = ({
  groupedNotes,
  isLoading,
  error,
  tags,
  projectId,
  onNoteClick,
}) => {
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

  // 関連ノートがない場合（すべてのタグに関連ノートがない）
  const hasAnyNotes = Object.values(groupedNotes).some(
    (notes) => notes.length > 0,
  );
  if (!hasAnyNotes) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
        <p className="text-muted-foreground text-center py-4">
          同じタグがついているノートはありません
        </p>
      </div>
    );
  }

  // タグごとにグループ化された関連ノートの表示
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">同じタグがついているノート</h3>
      {Object.entries(groupedNotes).map(([tagName, notes]) => (
        <div key={tagName} className="mb-6">
          <h4 className="text-md font-medium mb-2">{tagName}</h4>
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={`${tagName}-${note.id}`}
                  note={note}
                  onClick={onNoteClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-2">
              このタグがついている他のノートはありません
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default RelatedNotesByTag;
