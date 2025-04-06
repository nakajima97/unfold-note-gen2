-- Add url_id column to projects table
ALTER TABLE public.projects
ADD COLUMN url_id TEXT;

-- Add url_id column to notes table
ALTER TABLE public.notes
ADD COLUMN url_id TEXT;

-- Create unique indexes
CREATE UNIQUE INDEX projects_url_id_idx ON public.projects (url_id);
CREATE UNIQUE INDEX notes_url_id_idx ON public.notes (url_id);

-- Update existing projects with generated url_id
-- This is a placeholder that will be replaced with actual nanoid generation in the application
UPDATE public.projects
SET url_id = encode(gen_random_bytes(10), 'hex')
WHERE url_id IS NULL;

-- Update existing notes with generated url_id
-- This is a placeholder that will be replaced with actual nanoid generation in the application
UPDATE public.notes
SET url_id = encode(gen_random_bytes(10), 'hex')
WHERE url_id IS NULL;

-- Make url_id NOT NULL after all existing records have been updated
ALTER TABLE public.projects
ALTER COLUMN url_id SET NOT NULL;

ALTER TABLE public.notes
ALTER COLUMN url_id SET NOT NULL;

-- Disable the automatic project creation trigger
DROP TRIGGER IF EXISTS create_default_project_after_signup ON auth.users;
DROP FUNCTION IF EXISTS public.create_default_project_for_new_user();

-- Create trigger function to ensure url_id is set on new records
CREATE OR REPLACE FUNCTION public.set_url_id_if_not_provided()
RETURNS TRIGGER AS $$
BEGIN
  -- If url_id is not provided, generate a random one
  -- This is a placeholder that will be replaced with actual nanoid generation in the application
  IF NEW.url_id IS NULL THEN
    NEW.url_id := encode(gen_random_bytes(10), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for projects and notes tables
CREATE TRIGGER set_url_id_before_insert_projects
BEFORE INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_url_id_if_not_provided();

CREATE TRIGGER set_url_id_before_insert_notes
BEFORE INSERT ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.set_url_id_if_not_provided();
