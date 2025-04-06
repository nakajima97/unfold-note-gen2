'use client';

import NoteList from '@/features/notes/components/NoteList';
import type React from 'react';
import { useNoteListContainer } from './useNoteListContainer';
import type { Note } from '@/lib/api/note';

interface NoteListContainerProps {
  projectUrlId: string;
  projectId?: string; 
  initialNotes?: Note[]; // サーバーから取得した初期ノートデータ
}

const NoteListContainer: React.FC<NoteListContainerProps> = ({ 
  projectUrlId, 
  projectId,
  initialNotes = [] 
}) => {
  const {
    notes,
    isLoading,
    error,
    searchTerm,
    handleNoteClick,
    handleSearchChange,
    handleNewNoteClick,
  } = useNoteListContainer({ 
    projectUrlId, 
    projectId,
    initialNotes
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
    />
  );
};

export default NoteListContainer;
