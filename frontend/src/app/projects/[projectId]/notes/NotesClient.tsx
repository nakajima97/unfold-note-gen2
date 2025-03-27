'use client';

import NoteListContainer from '@/features/notes/containers/NoteListContainer';

interface NotesClientProps {
  projectId: string;
}

export default function NotesClient({ projectId }: NotesClientProps) {
  return <NoteListContainer projectId={projectId} />;
}
