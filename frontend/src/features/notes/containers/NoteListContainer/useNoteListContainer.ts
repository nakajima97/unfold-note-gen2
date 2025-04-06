'use client';

import { getProjectByUrlId } from '@/lib/api/project';
import { getNoteByUrlId, getProjectNotes, searchNotes } from '@/lib/api/note';
import type { Note } from '@/lib/api/note';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface UseNoteListContainerProps {
  projectUrlId: string;
  projectId?: string; 
  initialNotes?: Note[];
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

  // Fetch project to get internal ID (only if not provided)
  useEffect(() => {
    // 既にプロジェクトIDが提供されている場合はスキップ
    if (projectId) {
      return;
    }

    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const project = await getProjectByUrlId(projectUrlId);
        
        if (project) {
          setProjectId(project.id);
        } else {
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
      setIsLoading(false);
      return;
    }

    if (!projectId) {
      return;
    }

    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const fetchedNotes = await getProjectNotes(projectId);
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
      router.push(`/projects/${projectUrlId}/notes/${note.url_id}`);
    }
  };

  const handleNewNoteClick = () => {
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
