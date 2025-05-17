import { supabase } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export const useNavbarContainer = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 現在のプロジェクトのURLパラメータを取得
  const currentProjectUrlId = params?.projectUrlId ? String(params.projectUrlId) : null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // ログアウト後はログインページにリダイレクト
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    isLoggingOut,
    handleLogout,
    currentProjectUrlId,
  };
};
