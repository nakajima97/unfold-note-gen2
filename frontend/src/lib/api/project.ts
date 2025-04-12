import { supabase } from '@/lib/supabase';
import { generateUniqueUrlId } from '@/lib/utils/urlId';

export interface Project {
  id: string;
  urlId: string;
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

  // url_idをurlIdに変換
  // typescriptではキャメルケースを使いたいが、DBはスネークケースを使いたいため変換が必要
  return data?.map(project => ({ ...project, urlId: project.url_id })) || [];
};

/**
 * Get a project by its ID
 */
export const getProjectById = async (
  projectId: string,
): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      return null;
    }
    console.error('Error fetching project:', error);
    throw error;
  }

  return data;
};

/**
 * Get a project by its URL ID
 */
export const getProjectByUrlId = async (
  urlId: string,
): Promise<Project | null> => {
  try {
    // 直接SQLを使用してプロジェクトを取得
    const { data, error } = await supabase.rpc('get_project_by_url_id', {
      url_id_param: urlId,
    });

    if (error) {
      console.error('Error fetching project by URL ID using RPC:', error);

      // RPCが失敗した場合、直接クエリを試みる
      const { data: queryData, error: queryError } = await supabase
        .from('projects')
        .select('*')
        .eq('url_id', urlId)
        .single();

      if (queryError) {
        console.error(
          'Error fetching project by URL ID using direct query:',
          queryError,
        );
        return null;
      }

      return queryData;
    }

    // RPCから返されたデータが配列の場合は最初の要素を取得
    const project = Array.isArray(data) ? data[0] : data;
    return project;
  } catch (error) {
    console.error('Error in getProjectByUrlId:', error);
    return null;
  }
};

/**
 * Create a new project
 */
export const createProject = async (
  name: string,
  ownerId: string,
  description = '',
): Promise<Project> => {
  try {
    // URL識別子の生成
    const urlId = await generateUniqueUrlId(async (id) => {
      try {
        // 直接SQLを使用して存在チェック
        const { data, error } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('url_id', id);

        if (error) {
          console.error('Error checking urlId existence:', error);
          return false;
        }

        return (data?.length ?? 0) > 0;
      } catch (error) {
        console.error('Error checking urlId existence:', error);
        return false;
      }
    });

    try {
      // 直接SQLを使用してプロジェクトを作成
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          owner_id: ownerId,
          is_archived: false,
          url_id: urlId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project with direct insert:', error);

        // 直接挿入が失敗した場合、RPCを試みる
        console.log('Falling back to RPC for project creation');
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'create_project_with_url_id',
          {
            name_param: name,
            description_param: description,
            owner_id_param: ownerId,
            url_id_param: urlId,
          },
        );

        if (rpcError) {
          console.error('Error creating project with RPC:', rpcError);
          throw rpcError;
        }

        return rpcData;
      }

      return data;
    } catch (insertError) {
      console.error('Error in project creation process:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
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
