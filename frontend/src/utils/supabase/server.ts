import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        async get(name) {
          // cookies()がPromiseを返すので、awaitを使用
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        async set(name, value, options) {
          try {
            // cookies()がPromiseを返すので、awaitを使用
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Componentからの呼び出しの場合、エラーが発生する可能性がある
            // ミドルウェアがセッションを更新するので無視できる
          }
        },
        async remove(name, options) {
          try {
            // cookies()がPromiseを返すので、awaitを使用
            const cookieStore = await cookies();
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 同上
          }
        },
      },
    },
  );
}
