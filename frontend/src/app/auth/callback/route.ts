import { createProject, getUserProjects } from '@/lib/api/project';
import { createClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // サーバーコンポーネント用のSupabaseクライアントを作成
  const supabase = await createClient();

  if (code) {
    try {
      console.log('認証コールバックコード:', code);
      const { data } = await supabase.auth.exchangeCodeForSession(code);

      // ユーザーがいる場合、ノートページにリダイレクト
      if (data.user) {
        console.log('ユーザー認証完了:', data.user.id);

        try {
          // ユーザーのプロジェクトを取得
          const projects = await getUserProjects(data.user.id);
          console.log('ユーザープロジェクト数:', projects.length);

          // ユーザーにプロジェクトがない場合、デフォルトプロジェクトを作成
          if (projects.length === 0) {
            console.log('ユーザー用のデフォルトプロジェクトを作成');

            const displayName =
              data.user.user_metadata?.full_name ||
              data.user.email?.split('@')[0] ||
              'My';

            try {
              const defaultProject = await createProject(
                `${displayName}'s Project`,
                data.user.id,
                'Default project',
              );

              console.log('デフォルトプロジェクト作成完了:', defaultProject);

              // 新しく作成したプロジェクトにリダイレクト
              return NextResponse.redirect(
                new URL(
                  `/projects/${defaultProject.urlId}/notes`,
                  requestUrl.origin,
                ),
              );
            } catch (projectError) {
              console.error('デフォルトプロジェクト作成エラー:', projectError);
              // ホームページリダイレクトにフォールバック
            }
          } else {
            // ユーザーがプロジェクトを持っている場合、最初のプロジェクトのノートページにリダイレクト
            console.log('既存プロジェクトへリダイレクト:', projects[0].urlId);

            return NextResponse.redirect(
              new URL(
                `/projects/${projects[0].urlId}/notes`,
                requestUrl.origin,
              ),
            );
          }
        } catch (error) {
          console.error('ユーザープロジェクト処理エラー:', error);
          // エラーが発生した場合はデフォルトリダイレクトにフォールバック
        }
      } else {
        console.log('認証レスポンスにユーザーデータがありません');
      }
    } catch (authError) {
      console.error('認証中のエラー:', authError);
      // デフォルトリダイレクトにフォールバック
    }
  } else {
    console.log('コールバックURLにcodeパラメータがありません');
  }

  // コードがない、ユーザーがいない、またはエラーが発生した場合はホームページにフォールバック
  console.log('ホームページにリダイレクト');
  return NextResponse.redirect(new URL('/', requestUrl.origin));
};
