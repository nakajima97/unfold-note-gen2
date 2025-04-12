import { getUserProjects } from '@/lib/api/project';
import { supabase } from '@/lib/supabase';
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
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const redirectToNotes = async (userId: string) => {
    try {
      // ユーザーのプロジェクトを取得
      const projects = await getUserProjects(userId);

      // ユーザーがプロジェクトを持っている場合、最初のプロジェクトのノート一覧ページにリダイレクト
      if (projects.length > 0) {
        router.push(`/projects/${projects[0].urlId}/notes`);
      } else {
        // 要件上はあり得ないはずですが、念のため
        router.push('/');
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
        await redirectToNotes(data.user.id);
      }
    } catch (error: unknown) {
      const errorWithMessage = error as ErrorWithMessage;
      setError(errorWithMessage.message || 'ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // メールアドレスがallowed_emailsテーブルに存在するか確認
      const { data: allowedEmails, error: allowedEmailError } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', email)
        .single();

      if (allowedEmailError && allowedEmailError.code !== 'PGRST116') {
        // PGRST116は「行が返されなかった」エラーコード
        throw new Error('メールアドレスの検証中にエラーが発生しました。');
      }

      if (!allowedEmails) {
        throw new Error(
          'このメールアドレスは登録が許可されていません。管理者に連絡してください。',
        );
      }

      // メールアドレスが許可されている場合、サインアップを続行
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage(
        '登録確認メールを送信しました。メールを確認してアカウントを有効化してください。',
      );
      setIsSignUp(false); // ログインビューに戻す
    } catch (error: unknown) {
      const errorWithMessage = error as ErrorWithMessage;
      setError(errorWithMessage.message);
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

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setMessage(null);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    message,
    isSignUp,
    handleLogin,
    handleSignUp,
    handleGoogleLogin,
    toggleSignUp,
  };
};
