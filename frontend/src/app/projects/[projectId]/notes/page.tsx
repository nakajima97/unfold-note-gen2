import NoteListContainer from '@/features/notes/containers/NoteListContainer';
import { use } from 'react';

type NoteListPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default function NotesPage({ params }: NoteListPageProps) {
  const { projectId } = use(params);

  return <NoteListContainer projectId={projectId} />;
}
