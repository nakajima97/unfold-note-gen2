import { Metadata } from 'next';
import NoteListContainer from '@/features/notes/containers/NoteListContainer';

interface NoteListPageProps {
  params: {
    projectId: string;
  };
}

export const metadata: Metadata = {
  title: 'Notes | Unfold Note',
  description: 'View and manage your notes',
};

export default function NotesPage({ params }: NoteListPageProps) {
  const { projectId } = params;
  
  return <NoteListContainer projectId={projectId} />;
}
