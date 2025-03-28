import { supabase } from '@/lib/supabase';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all projects for a user
 */
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }

  return data || [];
};

/**
 * Create a new project
 */
export const createProject = async (
  name: string,
  ownerId: string,
  description = '',
): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        name,
        description,
        owner_id: ownerId,
        is_archived: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return data;
};

/**
 * Check if a user has any projects and create a default one if not
 * Note: This function is now redundant as we have a database trigger that automatically
 * creates a default project for new users, but we keep it for safety and testing purposes.
 */
export const ensureUserHasProject = async (
  userId: string,
  userName = '',
): Promise<Project> => {
  try {
    // Get user's projects
    const projects = await getUserProjects(userId);

    // If user has projects, return the first one
    if (projects.length > 0) {
      return projects[0];
    }

    // If no projects, create one with the user's name or email
    const defaultName = userName || 'My Project';
    return await createProject(defaultName, userId);
  } catch (error) {
    console.error('Error ensuring user has project:', error);
    throw error;
  }
};
