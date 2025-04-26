'use client';

import NoteList from '@/features/notes/components/NoteList';
import type { Note } from '@/lib/api/note';
import type React from 'react';
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

  return (
    <NoteList
      notes={notes}
      isLoading={isLoading}
      error={error}
      onNoteClick={handleNoteClick}
      onSearchChange={handleSearchChange}
      searchTerm={searchTerm}
      onNewNoteClick={handleNewNoteClick}
      onLoadMore={fetchMoreNotes}
      hasMore={hasMore}
    />
  );
};

export default NoteListContainer;
