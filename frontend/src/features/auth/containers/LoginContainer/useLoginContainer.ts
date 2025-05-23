import { createProject, getUserProjects } from '@/lib/api/project';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// エラー型の定義
type ErrorWithMessage = {
  message: string;
};

export const useLoginContainer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const redirectToNotes = async (userId: string, displayName: string) => {
    try {
      // ユーザーのプロジェクトを取得
      const projects = await getUserProjects(userId);

      // ユーザーがプロジェクトを持っている場合、最初のプロジェクトのノート一覧ページにリダイレクト
      if (projects.length > 0) {
        router.push(`/projects/${projects[0].urlId}/notes`);
      } else {
        // プロジェクトがない場合は、デフォルトプロジェクトを作成してリダイレクト
        const defaultProject = await createProject(
          `${displayName}'s Project`,
          userId,
          'Default project',
        );

        console.log('デフォルトプロジェクト作成完了:', defaultProject);

        // 新しく作成したプロジェクトにリダイレクト
        router.push(`/projects/${defaultProject.urlId}/notes`);
      }
      router.refresh();
    } catch (error) {
      console.error('ノートページへのリダイレクトエラー:', error);
      // エラーが発生した場合はホームページにフォールバック
      router.push('/');
      router.refresh();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await redirectToNotes(
          data.user.id,
          data.user.user_metadata?.full_name ||
            data.user.email?.split('@')[0] ||
            'My',
        );
      }
    } catch (error: unknown) {
      const errorWithMessage = error as ErrorWithMessage;
      setError(errorWithMessage.message || 'ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error: unknown) {
      const errorWithMessage = error as ErrorWithMessage;
      setError(errorWithMessage.message || 'Googleログインに失敗しました。');
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    message,
    handleLogin,
    handleGoogleLogin,
  };
};
