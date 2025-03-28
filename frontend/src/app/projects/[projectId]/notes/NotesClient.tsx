'use client';

import NoteListContainer from '@/features/notes/containers/NoteListContainer';

interface NotesClientProps {
  projectId: string;
}

const NotesClient = ({ projectId }: NotesClientProps) => {
  return <NoteListContainer projectId={projectId} />;
};

export default NotesClient;
