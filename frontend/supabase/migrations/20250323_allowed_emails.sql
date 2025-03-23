-- Create allowed_emails table
CREATE TABLE IF NOT EXISTS public.allowed_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for allowed_emails table
-- Only authenticated users can view allowed emails
CREATE POLICY "Allow authenticated users to view allowed emails" ON public.allowed_emails
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated users with admin role can insert allowed emails
CREATE POLICY "Allow admins to insert allowed emails" ON public.allowed_emails
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  ));

-- Only authenticated users with admin role can update allowed emails
CREATE POLICY "Allow admins to update allowed emails" ON public.allowed_emails
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  ));

-- Only authenticated users with admin role can delete allowed emails
CREATE POLICY "Allow admins to delete allowed emails" ON public.allowed_emails
  FOR DELETE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  ));

-- Create a function to check if an email is allowed
CREATE OR REPLACE FUNCTION public.is_email_allowed(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.allowed_emails
    WHERE allowed_emails.email = is_email_allowed.email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to check if the email is allowed before signup
CREATE OR REPLACE FUNCTION public.check_email_allowed()
RETURNS TRIGGER AS $$
BEGIN
  -- メールアドレスが許可リストに含まれているか確認
  IF NOT public.is_email_allowed(NEW.email) THEN
    RAISE EXCEPTION 'Email not allowed to register';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- サインアップトリガーを作成
DROP TRIGGER IF EXISTS check_email_allowed_before_signup ON auth.users;
CREATE TRIGGER check_email_allowed_before_signup
BEFORE INSERT ON auth.users
FOR EACH ROW
WHEN (NEW.email IS NOT NULL)
EXECUTE FUNCTION public.check_email_allowed();

-- OAuth用の関数を作成
CREATE OR REPLACE FUNCTION public.handle_oauth_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- メールアドレスが許可リストに含まれているか確認
  IF NOT public.is_email_allowed(NEW.email) THEN
    RAISE EXCEPTION 'Email not allowed to register via OAuth';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- OAuthトリガーを作成
DROP TRIGGER IF EXISTS check_oauth_email_allowed ON auth.users;
CREATE TRIGGER check_oauth_email_allowed
AFTER INSERT ON auth.users
FOR EACH ROW
WHEN (NEW.email IS NOT NULL AND NEW.confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.handle_oauth_signup();

-- 開発用の承認済みメールアドレスを追加
INSERT INTO public.allowed_emails (email)
VALUES 
  ('admin@example.com'),
  ('user@example.com')
ON CONFLICT (email) DO NOTHING;
