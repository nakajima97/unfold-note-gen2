import NoteCreateContainer from '@/features/notes/containers/NoteCreateContainer';
import { getProjectByUrlId } from '@/lib/api/project';

type NewNotePageProps = {
  params: {
    projectUrlId: string;
  };
};

const NewNotePage = async ({ params }: NewNotePageProps) => {
  // paramsオブジェクト自体をawaitする
  const resolvedParams = await params;
  const projectUrlId = resolvedParams.projectUrlId;
  
  // urlIdからプロジェクトを取得
  const project = await getProjectByUrlId(projectUrlId);
  
  if (!project) {
    throw new Error(`Project with URL ID ${projectUrlId} not found`);
  }

  return <NoteCreateContainer projectId={project.id} />;
};

export default NewNotePage;
