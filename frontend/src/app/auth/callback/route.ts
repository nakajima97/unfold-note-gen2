import { getUserProjects } from '@/lib/api/project';
import { supabase } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // If we have a user, redirect to their notes page
    if (data.user) {
      try {
        // Get user's projects
        const projects = await getUserProjects(data.user.id);

        // If user has projects, redirect to the first project's notes page
        if (projects.length > 0) {
          return NextResponse.redirect(
            new URL(`/projects/${projects[0].id}/notes`, requestUrl.origin),
          );
        }
      } catch (error) {
        console.error('Error redirecting to notes:', error);
        // Fall through to default redirect if there's an error
      }
    }
  }

  // Fallback to home page if there's no code, no user, or an error occurred
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
