import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';

/**
 * Googleログイン用のカスタムフック（Supabase版）
 */
export const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // SupabaseのOAuth（Google）で認証
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      // 通常、ここで画面遷移するため以降の処理は実行されない
    } catch (err: any) {
      setError('Googleログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    googleLoading: loading,
    googleError: error,
  };
};
