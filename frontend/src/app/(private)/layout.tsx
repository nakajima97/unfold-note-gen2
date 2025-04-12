'use client';

import NavbarContainer from '@/features/layout/containers/NavbarContainer';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type PrivateLayoutProps = {
  children: React.ReactNode;
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          // 未認証ユーザーをログインページにリダイレクト
          router.push('/login');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('認証確認エラー:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarContainer />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default PrivateLayout;
