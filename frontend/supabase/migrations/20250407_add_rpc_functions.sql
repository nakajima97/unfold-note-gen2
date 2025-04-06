-- プロジェクトをurl_idで取得するRPC関数
CREATE OR REPLACE FUNCTION public.get_project_by_url_id(url_id_param TEXT)
RETURNS SETOF public.projects
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.projects WHERE url_id = url_id_param LIMIT 1;
$$;

-- url_idを使用してプロジェクトを作成するRPC関数
CREATE OR REPLACE FUNCTION public.create_project_with_url_id(
  name_param TEXT,
  description_param TEXT,
  owner_id_param UUID,
  url_id_param TEXT
)
RETURNS SETOF public.projects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.projects (
    name,
    description,
    owner_id,
    is_archived,
    url_id
  ) VALUES (
    name_param,
    description_param,
    owner_id_param,
    false,
    url_id_param
  )
  RETURNING *;
END;
$$;

-- ノートをurl_idで取得するRPC関数
CREATE OR REPLACE FUNCTION public.get_note_by_url_id(url_id_param TEXT)
RETURNS SETOF public.notes
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.notes WHERE url_id = url_id_param LIMIT 1;
$$;

-- url_idを使用してノートを作成するRPC関数
CREATE OR REPLACE FUNCTION public.create_note_with_url_id(
  title_param TEXT,
  content_param TEXT,
  project_id_param UUID,
  url_id_param TEXT
)
RETURNS SETOF public.notes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.notes (
    title,
    content,
    project_id,
    url_id
  ) VALUES (
    title_param,
    content_param,
    project_id_param,
    url_id_param
  )
  RETURNING *;
END;
$$;
