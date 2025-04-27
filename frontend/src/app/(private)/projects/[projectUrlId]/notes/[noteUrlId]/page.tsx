import { NoteEditContainer } from '@/features/notes/containers/NoteEditContainer';
import { getNoteByUrlId } from '@/lib/api/note';
import { getProjectByUrlId } from '@/lib/api/project';
import { notFound } from 'next/navigation';

type NotePageProps = {
  params: Promise<{
    projectUrlId: string;
    noteUrlId: string;
  }>;
};

const NotePage = async ({ params }: NotePageProps) => {
  const { projectUrlId, noteUrlId } = await params;

  // urlIdからプロジェクトを取得
  const projectData = await getProjectByUrlId(projectUrlId);

  if (!projectData) {
    notFound();
  }

  // プロジェクトデータが配列の場合は最初の要素を取得
  const project = Array.isArray(projectData) ? projectData[0] : projectData;

  // urlIdからノートを取得
  const noteData = await getNoteByUrlId(noteUrlId);

  if (!noteData) {
    notFound();
  }

  // ノートデータが配列の場合は最初の要素を取得
  const note = Array.isArray(noteData) ? noteData[0] : noteData;

  // プロジェクトIDが一致するか確認
  if (note.project_id !== project.id) {
    notFound();
  }

  return (
    <NoteEditContainer
      noteId={note.id}
      projectId={project.id}
      projectUrlId={projectUrlId}
    />
  );
};

export default NotePage;
