import NoteListContainer from '@/features/notes/containers/NoteListContainer';
import { getProjectByUrlId } from '@/lib/api/project';
import { getProjectNotes } from '@/lib/api/note';
import { notFound } from 'next/navigation';

type NoteListPageProps = {
  params: {
    projectUrlId: string;
  };
};

const NotesPage = async ({ params }: NoteListPageProps) => {
  // paramsオブジェクト自体をawaitする
  const resolvedParams = await params;
  const projectUrlId = resolvedParams.projectUrlId;

  console.log('NotesPage: Fetching project with URL ID:', projectUrlId);
  
  // urlIdからプロジェクトを取得
  const projectData = await getProjectByUrlId(projectUrlId);
  
  if (!projectData) {
    console.error('NotesPage: Project not found with URL ID:', projectUrlId);
    notFound();
  }

  // プロジェクトデータが配列の場合は最初の要素を取得
  const project = Array.isArray(projectData) ? projectData[0] : projectData;
  
  console.log('NotesPage: Project found:', project);

  // プロジェクトのノートを取得
  const notes = await getProjectNotes(project.id);
  console.log('NotesPage: Notes fetched:', notes.length);

  // プロジェクトのIDとURLID、およびノートデータをクライアントコンポーネントに渡す
  return (
    <NoteListContainer 
      projectId={project.id} 
      projectUrlId={projectUrlId} 
      initialNotes={notes} 
    />
  );
};

export default NotesPage;
