-- Add urlId column to projects table
ALTER TABLE public.projects
ADD COLUMN urlId TEXT;

-- Add urlId column to notes table
ALTER TABLE public.notes
ADD COLUMN urlId TEXT;

-- Create unique indexes
CREATE UNIQUE INDEX projects_url_id_idx ON public.projects (urlId);
CREATE UNIQUE INDEX notes_url_id_idx ON public.notes (urlId);

-- Update existing projects with generated urlId
-- This is a placeholder that will be replaced with actual nanoid generation in the application
UPDATE public.projects
SET urlId = encode(gen_random_bytes(10), 'hex')
WHERE urlId IS NULL;

-- Update existing notes with generated urlId
-- This is a placeholder that will be replaced with actual nanoid generation in the application
UPDATE public.notes
SET urlId = encode(gen_random_bytes(10), 'hex')
WHERE urlId IS NULL;

-- Make urlId NOT NULL after all existing records have been updated
ALTER TABLE public.projects
ALTER COLUMN urlId SET NOT NULL;

ALTER TABLE public.notes
ALTER COLUMN urlId SET NOT NULL;

-- Disable the automatic project creation trigger
DROP TRIGGER IF EXISTS create_default_project_after_signup ON auth.users;
DROP FUNCTION IF EXISTS public.create_default_project_for_new_user();

-- Create trigger function to ensure urlId is set on new records
CREATE OR REPLACE FUNCTION public.set_url_id_if_not_provided()
RETURNS TRIGGER AS $$
BEGIN
  -- If urlId is not provided, generate a random one
  -- This is a placeholder that will be replaced with actual nanoid generation in the application
  IF NEW.urlId IS NULL THEN
    NEW.urlId := encode(gen_random_bytes(10), 'hex');
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
