'use client';

import NoteEditContainer from '@/features/notes/containers/NoteEditContainer';
import { useParams } from 'next/navigation';
import type React from 'react';

const NoteEditPage: React.FC = () => {
  const params = useParams();
  const projectId = String(params.projectId);
  const noteId = String(params.noteId);

  return <NoteEditContainer projectId={projectId} noteId={noteId} />;
};

export default NoteEditPage;
