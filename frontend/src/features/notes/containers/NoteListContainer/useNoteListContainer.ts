'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProjectNotes, searchNotes } from '@/lib/api/note';
import { Note } from '@/lib/api/note';

export function useNoteListContainer(projectId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Fetch notes when component mounts or projectId changes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const fetchedNotes = await getProjectNotes(projectId);
        setNotes(fetchedNotes);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch notes'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [projectId]);

  // Handle search term changes with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        // If search term is empty, fetch all notes
        try {
          const fetchedNotes = await getProjectNotes(projectId);
          setNotes(fetchedNotes);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch notes'));
        }
      } else {
        // Otherwise, search for notes
        try {
          const searchResults = await searchNotes(projectId, searchTerm);
          setNotes(searchResults);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to search notes'));
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, projectId]);

  // Handle note click
  const handleNoteClick = (noteId: string) => {
    router.push(`/projects/${projectId}/notes/${noteId}`);
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
  };
}
