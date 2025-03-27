'use client';

import NoteList from '@/features/notes/components/NoteList';
import type React from 'react';
import { useNoteListContainer } from './useNoteListContainer';

interface NoteListContainerProps {
  projectId: string;
}

const NoteListContainer: React.FC<NoteListContainerProps> = ({ projectId }) => {
  const {
    notes,
    isLoading,
    error,
    searchTerm,
    handleNoteClick,
    handleSearchChange,
  } = useNoteListContainer(projectId);

  return (
    <NoteList
      notes={notes}
      isLoading={isLoading}
      error={error}
      onNoteClick={handleNoteClick}
      onSearchChange={handleSearchChange}
      searchTerm={searchTerm}
    />
  );
};

export default NoteListContainer;
