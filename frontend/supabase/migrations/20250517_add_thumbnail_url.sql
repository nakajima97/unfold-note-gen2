-- notesテーブルにthumbnail_urlカラムを追加
ALTER TABLE public.notes
ADD COLUMN thumbnail_url TEXT;

-- 既存のノートのサムネイルURLを更新するためのインデックスを作成
CREATE INDEX IF NOT EXISTS notes_thumbnail_url_idx ON public.notes(thumbnail_url);

-- コメント追加
COMMENT ON COLUMN public.notes.thumbnail_url IS 'ノートのサムネイルとして表示する画像のURL';
