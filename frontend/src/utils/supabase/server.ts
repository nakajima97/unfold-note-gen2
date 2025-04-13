import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          // 直接cookies()を呼び出す
          return cookies().get(name)?.value;
        },
        set(name, value, options) {
          try {
            // 直接cookies()を呼び出す
            cookies().set({ name, value, ...options });
          } catch (error) {
            // Server Componentからの呼び出しの場合、エラーが発生する可能性がある
            // ミドルウェアがセッションを更新するので無視できる
          }
        },
        remove(name, options) {
          try {
            // 直接cookies()を呼び出す
            cookies().set({ name, value: '', ...options });
          } catch (error) {
            // 同上
          }
        },
      },
    },
  );
}
