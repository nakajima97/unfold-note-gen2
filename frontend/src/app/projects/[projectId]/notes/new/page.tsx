'use client';

import NoteCreateContainer from '@/features/notes/containers/NoteCreateContainer';
import { useParams } from 'next/navigation';
import React from 'react';

const NewNotePage: React.FC = () => {
  const params = useParams();
  const projectId = String(params.projectId);

  return <NoteCreateContainer projectId={projectId} />;
};

export default NewNotePage;
