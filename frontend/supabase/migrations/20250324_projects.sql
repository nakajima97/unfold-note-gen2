-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
-- Only project owners can view their own projects
CREATE POLICY "Allow users to view their own projects" ON public.projects
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Only project owners can insert their own projects
CREATE POLICY "Allow users to insert their own projects" ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only project owners can update their own projects
CREATE POLICY "Allow users to update their own projects" ON public.projects
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Only project owners can delete their own projects
CREATE POLICY "Allow users to delete their own projects" ON public.projects
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON public.projects(owner_id);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create a default project for new users
CREATE OR REPLACE FUNCTION public.create_default_project_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  display_name TEXT;
BEGIN
  -- Get user's display name or email
  IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    display_name := NEW.raw_user_meta_data->>'full_name';
  ELSE
    display_name := split_part(NEW.email, '@', 1);
  END IF;

  -- Create default project
  INSERT INTO public.projects (name, description, owner_id)
  VALUES (display_name || '''s Project', 'Default project', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create default project for new users
CREATE TRIGGER create_default_project_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_default_project_for_new_user();
