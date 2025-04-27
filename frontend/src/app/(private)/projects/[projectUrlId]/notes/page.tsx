import NoteListContainer from '@/features/notes/containers/NoteListContainer';
import { getProjectNotes } from '@/lib/api/note';
import { getProjectByUrlId } from '@/lib/api/project';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

type NoteListPageProps = {
  params: Promise<{
    projectUrlId: string;
  }>;
};

const NotesPage = async ({ params }: NoteListPageProps) => {
  const { projectUrlId } = await params;

  // サーバーコンポーネント用のSupabaseクライアントを作成
  const supabase = await createClient();

  // urlIdからプロジェクトを取得
  const projectData = await getProjectByUrlId(projectUrlId);

  if (!projectData) {
    notFound();
  }

  // プロジェクトデータが配列の場合は最初の要素を取得
  const project = Array.isArray(projectData) ? projectData[0] : projectData;

  // 認証ユーザーID取得
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    notFound();
  }

  // 所有者チェック
  if (project.owner_id !== session.user.id) {
    notFound();
  }

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
