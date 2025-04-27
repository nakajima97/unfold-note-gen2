import NoteCreateContainer from '@/features/notes/containers/NoteCreateContainer';
import { getProjectByUrlId } from '@/lib/api/project';
import { notFound } from 'next/navigation';

type NewNotePageProps = {
  params: Promise<{
    projectUrlId: string;
  }>;
};

const NewNotePage = async ({ params }: NewNotePageProps) => {
  const { projectUrlId } = await params;

  // urlIdからプロジェクトを取得
  const projectData = await getProjectByUrlId(projectUrlId);

  if (!projectData) {
    notFound();
  }

  // プロジェクトデータが配列の場合は最初の要素を取得
  const project = Array.isArray(projectData) ? projectData[0] : projectData;

  return (
    <NoteCreateContainer projectId={project.id} projectUrlId={projectUrlId} />
  );
};

export default NewNotePage;
