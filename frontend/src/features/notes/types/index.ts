import type { Note } from '@/lib/api/note';

export { Note };

export interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  onNoteClick: (noteId: string) => void;
  onSearchChange: (searchTerm: string) => void;
  searchTerm: string;
  onNewNoteClick?: () => void;
}
