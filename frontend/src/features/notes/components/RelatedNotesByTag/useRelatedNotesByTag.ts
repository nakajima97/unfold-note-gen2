'use client';

import { Note, getNoteById } from '@/lib/api/note';
import { Tag, extractTagsFromText, getNotesByTagName } from '@/lib/api/tag';
import { useEffect, useState, useRef } from 'react';

export interface UseRelatedNotesByTagProps {
  currentNoteId: string;
  projectId: string;
  content: string;
}

export const useRelatedNotesByTag = ({
  currentNoteId,
  projectId,
  content,
}: UseRelatedNotesByTagProps) => {
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  
  // 前回のコンテンツを保存するためのref
  const prevContentRef = useRef<string>('');
  
  // コンテンツからタグを抽出（コンテンツが変更された場合のみ）
  useEffect(() => {
    // 前回と同じコンテンツなら処理をスキップ
    if (prevContentRef.current === content) {
      return;
    }
    
    // 新しいタグを抽出
    const extractedTags = extractTagsFromText(content);
    setTags(extractedTags);
    
    // 現在のコンテンツを保存
    prevContentRef.current = content;
  }, [content]);

  // タグが変更された場合のみ関連ノートを取得
  useEffect(() => {
    const fetchRelatedNotes = async () => {
      if (!tags.length) {
        setRelatedNotes([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 各タグに関連するノートIDを取得
        const noteIdsPromises = tags.map((tag) => getNotesByTagName(tag, projectId));
        const noteIdsArrays = await Promise.all(noteIdsPromises);

        // すべてのノートIDを平坦化して重複を削除
        const allNoteIds = Array.from(
          new Set(noteIdsArrays.flat())
        ).filter((noteId) => noteId !== currentNoteId); // 現在のノートを除外

        if (allNoteIds.length === 0) {
          setRelatedNotes([]);
          setIsLoading(false);
          return;
        }

        // 各ノートの詳細情報を取得
        const notesPromises = allNoteIds.map((noteId) => getNoteById(noteId));
        const notes = await Promise.all(notesPromises);

        // nullを除外して結果を設定
        setRelatedNotes(notes.filter((note): note is Note => note !== null));
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('関連ノートの取得に失敗しました')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedNotes();
  }, [currentNoteId, projectId, tags]);

  return {
    relatedNotes,
    isLoading,
    error,
    tags,
  };
};
