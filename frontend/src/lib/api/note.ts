import { supabase } from '@/lib/supabase';

export interface Note {
  id: string;
  title: string;
  content: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all notes for a project
 */
export const getProjectNotes = async (projectId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching project notes:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a single note by ID
 */
export const getNoteById = async (noteId: string): Promise<Note | null> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 is the error code for "no rows returned"
      return null;
    }
    console.error('Error fetching note:', error);
    throw error;
  }

  return data;
};

/**
 * Search notes by title, content, or tags
 */
export const searchNotes = async (
  projectId: string,
  searchTerm: string,
): Promise<Note[]> => {
  if (!searchTerm.trim()) {
    return getProjectNotes(projectId);
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error searching notes:', error);
    throw error;
  }

  return data || [];
};

/**
 * Create a new note
 */
export const createNote = async (noteData: {
  title: string;
  content: string;
  projectId: string;
}): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        title: noteData.title,
        content: noteData.content,
        project_id: noteData.projectId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }

  return data;
};

/**
 * Update an existing note
 */
export const updateNote = async (
  noteId: string,
  noteData: {
    title?: string;
    content?: string;
  },
): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update(noteData)
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }

  return data;
};

/**
 * Delete a note
 */
export const deleteNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};
