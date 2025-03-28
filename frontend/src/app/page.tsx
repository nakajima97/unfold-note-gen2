'use client';

import { SignOutButton } from '@/components/SignOutButton';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

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
