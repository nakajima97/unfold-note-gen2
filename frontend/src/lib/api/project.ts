import { supabase } from '@/utils/supabase/client';
import { generateUniqueUrlId } from '@/lib/utils/urlId';

export type Project = {
  id: string;
  urlId: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * ユーザーの全プロジェクトを取得
 */
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ユーザーのプロジェクト取得エラー:', error);
    throw error;
  }

  // url_idをurlIdに変換
  // typescriptではキャメルケースを使いたいが、DBはスネークケースを使いたいため変換が必要
  return data?.map((project) => ({ ...project, urlId: project.url_id })) || [];
};

/**
 * IDによるプロジェクト取得
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
      // PGRST116は「行が返されなかった」エラーコード
      return null;
    }
    console.error('プロジェクト取得エラー:', error);
    throw error;
  }

  return data;
};

/**
 * URL IDによるプロジェクト取得
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
      console.error('URL IDによるプロジェクト取得エラー(RPC):', error);

      // RPCが失敗した場合、直接クエリを試みる
      const { data: queryData, error: queryError } = await supabase
        .from('projects')
        .select('*')
        .eq('url_id', urlId)
        .single();

      if (queryError) {
        console.error(
          'URL IDによるプロジェクト取得エラー(直接クエリ):',
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
    console.error('URL IDによるプロジェクト取得エラー:', error);
    return null;
  }
};

/**
 * 新しいプロジェクトの作成
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
          console.error('URL識別子存在チェックエラー:', error);
          return false;
        }

        return (data?.length ?? 0) > 0;
      } catch (error) {
        console.error('URL識別子存在チェックエラー:', error);
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
        console.error('プロジェクト作成エラー(直接挿入):', error);

        // 直接挿入が失敗した場合、RPCを試みる
        console.log('プロジェクト作成にRPCを使用');
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
          console.error('プロジェクト作成エラー(RPC):', rpcError);
          throw rpcError;
        }

        return rpcData;
      }

      return data;
    } catch (insertError) {
      console.error('プロジェクト作成エラー:', insertError);
      throw insertError;
    }
  } catch (error) {
    console.error('プロジェクト作成エラー:', error);
    throw error;
  }
};

/**
 * ユーザーがプロジェクトを持っているか確認し、なければデフォルトプロジェクトを作成
 * 注: この関数は現在冗長です。新規ユーザーに対して自動的にデフォルトプロジェクトを作成する
 * データベーストリガーがあるためですが、安全性とテスト目的のために残しています。
 */
export const ensureUserHasProject = async (
  userId: string,
  userName = '',
): Promise<Project> => {
  try {
    // ユーザーのプロジェクトを取得
    const projects = await getUserProjects(userId);

    // ユーザーがプロジェクトを持っている場合、最初のプロジェクトを返す
    if (projects.length > 0) {
      return projects[0];
    }

    // プロジェクトがない場合、ユーザー名またはメールアドレスでプロジェクトを作成
    const defaultName = userName || 'My Project';
    return await createProject(defaultName, userId);
  } catch (error) {
    console.error('ユーザーがプロジェクトを持っているか確認エラー:', error);
    throw error;
  }
};
