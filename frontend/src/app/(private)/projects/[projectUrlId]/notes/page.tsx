import NoteListContainer from '@/features/notes/containers/NoteListContainer';
import { getProjectNotes } from '@/lib/api/note';
import { getProjectByUrlId } from '@/lib/api/project';
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

  // urlIdからプロジェクトを取得
  const projectData = await getProjectByUrlId(projectUrlId);

  if (!projectData) {
    notFound();
  }

  // プロジェクトデータが配列の場合は最初の要素を取得
  const project = Array.isArray(projectData) ? projectData[0] : projectData;

  // プロジェクトのノートを取得
  const notes = await getProjectNotes(project.id);

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
