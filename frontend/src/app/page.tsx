'use client';

import { SignOutButton } from '@/components/SignOutButton';
import { createProject, getUserProjects } from '@/lib/api/project';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);

        // ユーザーがログインしている場合、プロジェクトを確認
        if (data.user) {
          console.log('User logged in:', data.user.id);
          await checkAndCreateProject(data.user);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  // ユーザーのプロジェクトを確認し、必要に応じて作成してリダイレクト
  const checkAndCreateProject = async (user: User) => {
    try {
      console.log('Checking user projects');
      const projects = await getUserProjects(user.id);
      console.log('User projects:', projects.length);

      if (projects.length === 0) {
        // プロジェクトがない場合は作成
        console.log('Creating default project for user');
        const displayName =
          user.user_metadata?.full_name || user.email?.split('@')[0] || 'My';

        const defaultProject = await createProject(
          `${displayName}'s Project`,
          user.id,
          'Default project',
        );

        console.log('Default project created:', defaultProject);

        // 作成したプロジェクトのノート一覧ページにリダイレクト
        router.push(`/projects/${defaultProject.url_id}/notes`);
      } else {
        // ユーザーがプロジェクトを持っている場合、最初のプロジェクトにリダイレクト
        if (projects.length > 0) {
          console.log('User has projects, redirecting to first project');
          router.push(`/projects/${projects[0].url_id}/notes`);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking/creating projects:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Unfold Note</h1>

        {loading ? (
          <p className="text-center">読み込み中...</p>
        ) : user ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h2 className="mb-2 font-semibold">ユーザー情報</h2>
              <p>
                <span className="font-medium">メール:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">ID:</span> {user.id}
              </p>
              <p>
                <span className="font-medium">名前:</span>{' '}
                {user.user_metadata?.full_name || '未設定'}
              </p>
            </div>

            <div className="flex justify-center">
              <SignOutButton />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center">サインインしていません</p>
            <div className="flex justify-center">
              <a
                href="/login"
                className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
              >
                ログインページへ
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
