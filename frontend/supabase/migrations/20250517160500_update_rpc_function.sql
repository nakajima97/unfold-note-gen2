-- url_idとthumbnail_urlを使用してノートを作成するRPC関数を更新
DROP FUNCTION IF EXISTS public.create_note_with_url_id;

CREATE OR REPLACE FUNCTION public.create_note_with_url_id(
  title_param TEXT,
  content_param TEXT,
  project_id_param UUID,
  url_id_param TEXT,
  thumbnail_url_param TEXT DEFAULT NULL
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
    url_id,
    thumbnail_url
  ) VALUES (
    title_param,
    content_param,
    project_id_param,
    url_id_param,
    thumbnail_url_param
  )
  RETURNING *;
END;
$$;
