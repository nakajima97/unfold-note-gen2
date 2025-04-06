'use client';

import { getProjectByUrlId } from '@/lib/api/project';
import { getNoteByUrlId, getProjectNotes, searchNotes } from '@/lib/api/note';
import type { Note } from '@/lib/api/note';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface UseNoteListContainerProps {
  projectUrlId: string;
  projectId?: string; 
  initialNotes?: Note[]; // サーバーから取得した初期ノートデータ
}

export const useNoteListContainer = ({
  projectUrlId,
  projectId: initialProjectId,
  initialNotes = [],
}: UseNoteListContainerProps) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isLoading, setIsLoading] = useState(initialNotes.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectId, setProjectId] = useState<string | null>(initialProjectId || null);
  const router = useRouter();

  console.log('NoteListContainer initialized with:', { 
    projectUrlId, 
    initialProjectId, 
    initialNotesCount: initialNotes.length 
  });

  // Fetch project to get internal ID (only if not provided)
  useEffect(() => {
    // 既にプロジェクトIDが提供されている場合はスキップ
    if (projectId) {
      console.log('Project ID already provided:', projectId);
      return;
    }

    console.log('Fetching project by URL ID:', projectUrlId);
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const project = await getProjectByUrlId(projectUrlId);
        console.log('Project fetch result:', project);
        
        if (project) {
          console.log('Setting project ID:', project.id);
          setProjectId(project.id);
        } else {
          console.error('Project not found with URL ID:', projectUrlId);
          setError(new Error(`Project with URL ID ${projectUrlId} not found`));
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to fetch project'),
        );
      }
    };

    fetchProject();
  }, [projectUrlId, projectId]);

  // Fetch notes when projectId is available (only if initialNotes is empty)
  useEffect(() => {
    // 初期ノートデータが提供されている場合はスキップ
    if (initialNotes.length > 0) {
      console.log('Using initial notes data, skipping fetch');
      setIsLoading(false);
      return;
    }

    if (!projectId) {
      console.log('Project ID not available yet, skipping note fetch');
      return;
    }

    console.log('Fetching notes for project ID:', projectId);
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const fetchedNotes = await getProjectNotes(projectId);
        console.log('Fetched notes:', fetchedNotes);
        setNotes(fetchedNotes);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to fetch notes'),
        );
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [projectId, initialNotes.length]);

  // Handle search term changes with debounce
  useEffect(() => {
    if (!projectId) return;

    const debounceTimeout = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        // If search term is empty, fetch all notes
        try {
          console.log('Fetching all notes (search term empty)');
          const fetchedNotes = await getProjectNotes(projectId);
          setNotes(fetchedNotes);
        } catch (err) {
          console.error('Error fetching notes during search:', err);
          setError(
            err instanceof Error ? err : new Error('Failed to fetch notes'),
          );
        }
      } else {
        // Otherwise, search for notes
        try {
          console.log('Searching notes with term:', searchTerm);
          const searchResults = await searchNotes(projectId, searchTerm);
          setNotes(searchResults);
        } catch (err) {
          console.error('Error searching notes:', err);
          setError(
            err instanceof Error ? err : new Error('Failed to search notes'),
          );
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, projectId]);

  // Handle note click
  const handleNoteClick = (noteId: string) => {
    // Find the note to get its urlId
    const note = notes.find(n => n.id === noteId);
    if (note) {
      console.log('Navigating to note:', note);
      router.push(`/projects/${projectUrlId}/notes/${note.url_id}`);
    }
  };

  const handleNewNoteClick = () => {
    console.log('Navigating to new note page');
    router.push(`/projects/${projectUrlId}/notes/new`);
  };

  // Handle search change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return {
    notes,
    isLoading,
    error,
    searchTerm,
    handleNoteClick,
    handleSearchChange,
    handleNewNoteClick,
  };
};
