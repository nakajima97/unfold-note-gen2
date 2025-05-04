-- デフォルトプロジェクト自動作成トリガーと関数を削除するマイグレーション
-- 本マイグレーションは既存環境・新規環境どちらにも安全に適用できます

DROP TRIGGER IF EXISTS create_default_project_after_signup ON auth.users;
DROP FUNCTION IF EXISTS public.create_default_project_for_new_user();
