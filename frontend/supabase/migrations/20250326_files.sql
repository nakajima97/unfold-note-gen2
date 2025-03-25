-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create policies for files table
-- Only project owners can view files in their projects
CREATE POLICY "Allow users to view files in their projects" ON public.files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.files.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can insert files in their projects
CREATE POLICY "Allow users to insert files in their projects" ON public.files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.files.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can update files in their projects
CREATE POLICY "Allow users to update files in their projects" ON public.files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.files.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can delete files in their projects
CREATE POLICY "Allow users to delete files in their projects" ON public.files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.files.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS files_note_id_idx ON public.files(note_id);
CREATE INDEX IF NOT EXISTS files_project_id_idx ON public.files(project_id);

-- Create trigger to update the updated_at column
CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON public.files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
