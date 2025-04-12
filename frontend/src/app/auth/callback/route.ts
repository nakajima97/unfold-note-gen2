import { createProject, getUserProjects } from '@/lib/api/project';
import { supabase } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      console.log('Authentication callback with code:', code);
      const { data } = await supabase.auth.exchangeCodeForSession(code);

      // If we have a user, redirect to their notes page
      if (data.user) {
        console.log('User authenticated:', data.user.id);

        try {
          // Get user's projects
          const projects = await getUserProjects(data.user.id);
          console.log('User projects:', projects.length);

          // If user has no projects, create a default project
          if (projects.length === 0) {
            console.log('Creating default project for user');

            const displayName =
              data.user.user_metadata?.full_name ||
              data.user.email?.split('@')[0] ||
              'My';

            try {
              const defaultProject = await createProject(
                `${displayName}'s Project`,
                data.user.id,
                'Default project',
              );

              console.log('Default project created:', defaultProject);

              // Redirect to the newly created project
              return NextResponse.redirect(
                new URL(
                  `/projects/${defaultProject.urlId}/notes`,
                  requestUrl.origin,
                ),
              );
            } catch (projectError) {
              console.error('Error creating default project:', projectError);
              // Fall through to home page redirect
            }
          } else {
            // If user has projects, redirect to the first project's notes page
            console.log('Redirecting to existing project:', projects[0].urlId);

            return NextResponse.redirect(
              new URL(
                `/projects/${projects[0].urlId}/notes`,
                requestUrl.origin,
              ),
            );
          }
        } catch (error) {
          console.error('Error handling user projects:', error);
          // Fall through to default redirect if there's an error
        }
      } else {
        console.log('No user data in authentication response');
      }
    } catch (authError) {
      console.error('Error during authentication:', authError);
      // Fall through to default redirect
    }
  } else {
    console.log('No code parameter in callback URL');
  }

  // Fallback to home page if there's no code, no user, or an error occurred
  console.log('Redirecting to home page');
  return NextResponse.redirect(new URL('/', requestUrl.origin));
};
