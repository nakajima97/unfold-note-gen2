'use client';

import NoteList from '@/features/notes/components/NoteList';
import type { Note } from '@/lib/api/note';
import { useEffect, useRef } from 'react';
import { useNoteListContainer } from './useNoteListContainer';

type NoteListContainerProps = {
  projectUrlId: string;
  projectId?: string;
  initialNotes?: Note[]; // サーバーから取得した初期ノートデータ
};

const NoteListContainer: React.FC<NoteListContainerProps> = ({
  projectUrlId,
  projectId,
  initialNotes = [],
}) => {
  const {
    notes,
    isLoading,
    error,
    searchTerm,
    handleNoteClick,
    handleSearchChange,
    handleNewNoteClick,
    hasMore,
    fetchMoreNotes,
  } = useNoteListContainer({
    projectUrlId,
    projectId,
    initialNotes,
  });

  // 無限スクロールのための参照オブジェクト
  const bottomRef = useRef<HTMLDivElement>(null);

  // 無限スクロールのロジック
  useEffect(() => {
    if (!fetchMoreNotes || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          fetchMoreNotes();
        }
      },
      { threshold: 0.1 }
    );
    
    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }
    
    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
      observer.disconnect();
    };
  }, [fetchMoreNotes, hasMore, isLoading]);

  return (
    <NoteList
      notes={notes}
      isLoading={isLoading}
      error={error}
      onNoteClick={handleNoteClick}
      onSearchChange={handleSearchChange}
      searchTerm={searchTerm}
      onNewNoteClick={handleNewNoteClick}
      hasMore={hasMore}
      bottomRef={bottomRef}
    />
  );
};

export default NoteListContainer;
