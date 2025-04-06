import NoteCreateContainer from '@/features/notes/containers/NoteCreateContainer';
import { getProjectByUrlId } from '@/lib/api/project';
import { notFound } from 'next/navigation';

type NewNotePageProps = {
  params: {
    projectUrlId: string;
  };
};

const NewNotePage = async ({ params }: NewNotePageProps) => {
  // paramsオブジェクト自体をawaitする
  const resolvedParams = await params;
  const projectUrlId = resolvedParams.projectUrlId;
  
  console.log('NewNotePage: Fetching project with URL ID:', projectUrlId);
  
  // urlIdからプロジェクトを取得
  const projectData = await getProjectByUrlId(projectUrlId);
  
  if (!projectData) {
    console.error('NewNotePage: Project not found with URL ID:', projectUrlId);
    notFound();
  }

  // プロジェクトデータが配列の場合は最初の要素を取得
  const project = Array.isArray(projectData) ? projectData[0] : projectData;
  
  console.log('NewNotePage: Project found:', project);

  return (
    <NoteCreateContainer 
      projectId={project.id} 
      projectUrlId={projectUrlId} 
    />
  );
};

export default NewNotePage;
