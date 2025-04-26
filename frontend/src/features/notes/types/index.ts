import type { Note } from '@/lib/api/note';
import type { RefObject } from 'react';

export type { Note };

export type NoteListProps = {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  onNoteClick: (noteId: string) => void;
  onSearchChange: (searchTerm: string) => void;
  searchTerm: string;
  onNewNoteClick?: () => void;
  hasMore?: boolean;
  bottomRef?: RefObject<HTMLDivElement | null>;
};
