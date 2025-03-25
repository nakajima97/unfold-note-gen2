-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for notes table
-- Only project owners can view notes in their projects
CREATE POLICY "Allow users to view notes in their projects" ON public.notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.notes.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can insert notes in their projects
CREATE POLICY "Allow users to insert notes in their projects" ON public.notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.notes.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can update notes in their projects
CREATE POLICY "Allow users to update notes in their projects" ON public.notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.notes.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can delete notes in their projects
CREATE POLICY "Allow users to delete notes in their projects" ON public.notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.notes.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS notes_project_id_idx ON public.notes(project_id);
CREATE INDEX IF NOT EXISTS notes_title_idx ON public.notes(title);

-- Create trigger to update the updated_at column
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, project_id)
);

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags table
-- Only project owners can view tags in their projects
CREATE POLICY "Allow users to view tags in their projects" ON public.tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.tags.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can insert tags in their projects
CREATE POLICY "Allow users to insert tags in their projects" ON public.tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.tags.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can update tags in their projects
CREATE POLICY "Allow users to update tags in their projects" ON public.tags
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.tags.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can delete tags in their projects
CREATE POLICY "Allow users to delete tags in their projects" ON public.tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.tags.project_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS tags_project_id_idx ON public.tags(project_id);
CREATE INDEX IF NOT EXISTS tags_name_project_id_idx ON public.tags(name, project_id);

-- Create note_tags junction table
CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for note_tags table
-- Only project owners can view note_tags in their projects
CREATE POLICY "Allow users to view note_tags in their projects" ON public.note_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      JOIN public.projects ON public.notes.project_id = public.projects.id
      WHERE public.notes.id = public.note_tags.note_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can insert note_tags in their projects
CREATE POLICY "Allow users to insert note_tags in their projects" ON public.note_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.notes
      JOIN public.projects ON public.notes.project_id = public.projects.id
      WHERE public.notes.id = public.note_tags.note_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Only project owners can delete note_tags in their projects
CREATE POLICY "Allow users to delete note_tags in their projects" ON public.note_tags
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      JOIN public.projects ON public.notes.project_id = public.projects.id
      WHERE public.notes.id = public.note_tags.note_id
      AND public.projects.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS note_tags_note_id_idx ON public.note_tags(note_id);
CREATE INDEX IF NOT EXISTS note_tags_tag_id_idx ON public.note_tags(tag_id);
