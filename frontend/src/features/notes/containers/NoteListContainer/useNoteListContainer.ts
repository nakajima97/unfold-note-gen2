'use client';

import { getProjectNotes, searchNotes } from '@/lib/api/note';
import type { Note } from '@/lib/api/note';
import { getProjectByUrlId } from '@/lib/api/project';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { refreshImageUrls } from '@/lib/api/file';

export type UseNoteListContainerProps = {
  projectUrlId: string;
  projectId?: string;
  initialNotes?: Note[];
};

export const useNoteListContainer = ({
  projectUrlId,
  projectId: initialProjectId,
  initialNotes = [],
}: UseNoteListContainerProps) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isLoading, setIsLoading] = useState(initialNotes.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectId, setProjectId] = useState<string | null>(
    initialProjectId || null,
  );
  const router = useRouter();

  // プロジェクトの内部IDを取得（提供されていない場合のみ）
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

  // プロジェクトIDが利用可能な場合にノートを取得（initialNotesが空の場合のみ）
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
        
        // ノートコンテンツ内の画像URLを更新
        const updatedNotes = await Promise.all(
          fetchedNotes.map(async (note) => {
            if (note.content) {
              try {
                const updatedContent = await refreshImageUrls(note.content);
                return { ...note, content: updatedContent };
              } catch (refreshError) {
                console.error('画像URL更新エラー:', refreshError);
                // エラーがあっても元のノートを返す
                return note;
              }
            }
            return note;
          })
        );
        
        setNotes(updatedNotes);
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

  // 検索語の変更を遅延処理（デバウンス）
  useEffect(() => {
    if (!projectId) return;

    const debounceTimeout = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        // 検索語が空の場合、すべてのノートを取得
        try {
          const fetchedNotes = await getProjectNotes(projectId);
          
          // ノートコンテンツ内の画像URLを更新
          const updatedNotes = await Promise.all(
            fetchedNotes.map(async (note) => {
              if (note.content) {
                try {
                  const updatedContent = await refreshImageUrls(note.content);
                  return { ...note, content: updatedContent };
                } catch (refreshError) {
                  console.error('画像URL更新エラー:', refreshError);
                  // エラーがあっても元のノートを返す
                  return note;
                }
              }
              return note;
            })
          );
          
          setNotes(updatedNotes);
        } catch (err) {
          console.error('Error fetching notes during search:', err);
          setError(
            err instanceof Error ? err : new Error('Failed to fetch notes'),
          );
        }
      } else {
        // それ以外の場合、ノートを検索
        try {
          const searchResults = await searchNotes(projectId, searchTerm);
          
          // ノートコンテンツ内の画像URLを更新
          const updatedResults = await Promise.all(
            searchResults.map(async (note) => {
              if (note.content) {
                try {
                  const updatedContent = await refreshImageUrls(note.content);
                  return { ...note, content: updatedContent };
                } catch (refreshError) {
                  console.error('画像URL更新エラー:', refreshError);
                  // エラーがあっても元のノートを返す
                  return note;
                }
              }
              return note;
            })
          );
          
          setNotes(updatedResults);
        } catch (err) {
          console.error('Error searching notes:', err);
          setError(
            err instanceof Error ? err : new Error('Failed to search notes'),
          );
        }
      }
    }, 300); // 300ms デバウンス

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, projectId]);

  // ノートクリックの処理
  const handleNoteClick = (noteUrlId: string) => {
    // noteUrlIdを直接使用してページ遷移
    router.push(`/projects/${projectUrlId}/notes/${noteUrlId}`);
  };

  const handleNewNoteClick = () => {
    router.push(`/projects/${projectUrlId}/notes/new`);
  };

  // 検索変更の処理
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
