import NoteEditContainer from '@/features/notes/containers/NoteEditContainer';
import { getNoteByUrlId } from '@/lib/api/note';
import { getProjectByUrlId } from '@/lib/api/project';

type NotePageProps = {
  params: {
    projectUrlId: string;
    noteUrlId: string;
  };
};

const NotePage = async ({ params }: NotePageProps) => {
  // paramsオブジェクト自体をawaitする
  const resolvedParams = await params;
  const { projectUrlId, noteUrlId } = resolvedParams;

  // urlIdからプロジェクトとノートを取得
  const project = await getProjectByUrlId(projectUrlId);
  
  if (!project) {
    throw new Error(`Project with URL ID ${projectUrlId} not found`);
  }

  const note = await getNoteByUrlId(noteUrlId);
  
  if (!note) {
    throw new Error(`Note with URL ID ${noteUrlId} not found`);
  }

  // プロジェクトIDが一致するか確認
  if (note.project_id !== project.id) {
    throw new Error('Note does not belong to this project');
  }

  return <NoteEditContainer noteId={note.id} projectId={project.id} projectUrlId={projectUrlId} />;
};

export default NotePage;
