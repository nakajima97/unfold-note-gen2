import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// 認証済みユーザーがアクセスできないルート
const AUTH_ROUTES = ['/login', '/signup', '/reset-password', '/auth/callback']

export async function middleware(request: NextRequest) {
  // セッションを更新するための基本的なレスポンス
  const response = await updateSession(request)
  
  // パスを取得
  const path = request.nextUrl.pathname
  
  // 認証関連パスでない場合は処理をスキップ
  if (!AUTH_ROUTES.some(route => path.startsWith(route))) {
    return response
  }
  
  // Supabaseクライアントを作成
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {
          // ミドルウェア内でのリダイレクト時には新しいレスポンスを作成するため、
          // ここでのCookieの設定は不要
        },
        remove() {
          // 同上
        },
      },
    }
  )
  
  // ユーザー情報を取得（getUser()を使用して確実に検証）
  const { data: { user } } = await supabase.auth.getUser()
  
  // 認証済みユーザーが認証関連ページにアクセスした場合
  if (user) {
    try {
      // ユーザーのプロジェクトを取得
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // url_idをurlIdに変換
      const projects = data?.map((project) => ({ ...project, urlId: project.url_id })) || []
      
      if (projects.length > 0) {
        // 最初のプロジェクトのノート一覧ページにリダイレクト
        const url = new URL(`/projects/${projects[0].urlId}/notes`, request.url)
        return NextResponse.redirect(url)
      } else {
        // プロジェクトがない場合はホームページにリダイレクト
        const url = new URL('/', request.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('ミドルウェアでのプロジェクト取得エラー:', error)
      // エラーが発生した場合はホームページにリダイレクト
      const url = new URL('/', request.url)
      return NextResponse.redirect(url)
    }
  }
  
  return response
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    // 認証関連ルート
    '/login',
    '/signup',
    '/reset-password',
    '/auth/callback',
    
    // 静的ファイルなどは除外
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
