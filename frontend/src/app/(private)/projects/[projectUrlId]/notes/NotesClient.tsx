'use client';

import NoteListContainer from '@/features/notes/containers/NoteListContainer';

type NotesClientProps = {
  projectUrlId: string;
};

const NotesClient = ({ projectUrlId }: NotesClientProps) => {
  return <NoteListContainer projectUrlId={projectUrlId} />;
};

export default NotesClient;
