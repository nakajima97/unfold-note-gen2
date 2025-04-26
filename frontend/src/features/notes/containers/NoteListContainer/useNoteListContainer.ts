'use client';

import { refreshImageUrls } from '@/lib/api/file';
import { getProjectNotes } from '@/lib/api/note';
import type { Note } from '@/lib/api/note';
import { getProjectByUrlId } from '@/lib/api/project';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [cursor, setCursor] = useState<string | null>(null); // updated_at
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectId, setProjectId] = useState<string | null>(
    initialProjectId || null,
  );
  const router = useRouter();

  // 無限スクロールのための参照オブジェクト
  const bottomRef = useRef<HTMLDivElement>(null);

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

  const NOTES_PAGE_SIZE = 50;

  // --- 初回取得（プロジェクトIDが決まったら） ---
  useEffect(() => {
    if (!projectId) return;
    if (initialNotes.length > 0) {
      setIsLoading(false);
      setHasMore(initialNotes.length === NOTES_PAGE_SIZE);
      if (initialNotes.length > 0) {
        setCursor(initialNotes[initialNotes.length - 1].updated_at);
      }
      return;
    }

    const fetchInitialNotes = async () => {
      try {
        setIsLoading(true);
        const fetchedNotes = await getProjectNotes(projectId, NOTES_PAGE_SIZE);
        // 画像URL更新
        const updatedNotes = await Promise.all(
          fetchedNotes.map(async (note) => {
            if (note.content) {
              try {
                const updatedContent = await refreshImageUrls(note.content);
                return { ...note, content: updatedContent };
              } catch {
                return note;
              }
            }
            return note;
          }),
        );
        setNotes(updatedNotes);
        setHasMore(updatedNotes.length === NOTES_PAGE_SIZE);
        setCursor(
          updatedNotes.length > 0
            ? updatedNotes[updatedNotes.length - 1].updated_at
            : null,
        );
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch notes'),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialNotes();
  }, [
    projectId,
    initialNotes.length,
    initialNotes[initialNotes.length - 1]?.updated_at,
  ]);

  // --- 追加取得（無限スクロール用） ---
  const fetchMoreNotes = useCallback(async () => {
    if (!projectId || !hasMore || isLoading || !cursor) return;
    setIsLoading(true);
    try {
      const fetchedNotes = await getProjectNotes(
        projectId,
        NOTES_PAGE_SIZE,
        cursor,
      );
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
        }),
      );
      setNotes((prevNotes) => [...prevNotes, ...updatedNotes]);
      setHasMore(updatedNotes.length === NOTES_PAGE_SIZE);
      setCursor(
        updatedNotes.length > 0
          ? updatedNotes[updatedNotes.length - 1].updated_at
          : null,
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notes'));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, hasMore, isLoading, cursor]);

  // 無限スクロールのロジック
  useEffect(() => {
    if (!hasMore || isLoading || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          fetchMoreNotes();
        }
      },
      { threshold: 0.1 },
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoading, cursor, fetchMoreNotes]);

  // 検索語の変更を遅延処理（デバウンス）
  useEffect(() => {
    if (!projectId) return;

    const debounceTimeout = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        // 検索語が空の場合、すべてのノートを取得
        try {
          const fetchedNotes = await getProjectNotes(
            projectId,
            NOTES_PAGE_SIZE,
          );
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
            }),
          );

          setNotes(updatedNotes);
          setHasMore(updatedNotes.length === NOTES_PAGE_SIZE);
          setCursor(
            updatedNotes.length > 0
              ? updatedNotes[updatedNotes.length - 1].updated_at
              : null,
          );
        } catch (err) {
          console.error('Error fetching notes during search:', err);
          setError(
            err instanceof Error ? err : new Error('Failed to fetch notes'),
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
    cursor,
    hasMore,
    isLoading,
    error,
    searchTerm,
    handleNoteClick,
    handleSearchChange,
    handleNewNoteClick,
    fetchMoreNotes,
    bottomRef,
  };
};
