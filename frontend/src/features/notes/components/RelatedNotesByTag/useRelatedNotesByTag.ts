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
  const [groupedNotes, setGroupedNotes] = useState<Record<string, Note[]>>({});
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
        setGroupedNotes({});
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // タグごとにノートをグループ化
        const grouped: Record<string, Note[]> = {};
        
        // 各タグについて処理
        for (const tag of tags) {
          // そのタグを持つノートIDを取得
          const noteIds = await getNotesByTagName(tag, projectId);
          
          // 現在のノートを除外
          const filteredNoteIds = noteIds.filter(id => id !== currentNoteId);
          
          if (filteredNoteIds.length > 0) {
            // ノートの詳細情報を取得
            const notesPromises = filteredNoteIds.map(id => getNoteById(id));
            const notes = await Promise.all(notesPromises);
            
            // nullを除外
            const validNotes = notes.filter((note): note is Note => note !== null);
            
            // タグをキーとしてノートを格納
            grouped[tag] = validNotes;
          } else {
            // 関連ノートがない場合は空配列
            grouped[tag] = [];
          }
        }
        
        setGroupedNotes(grouped);
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
    groupedNotes,
    isLoading,
    error,
    tags,
  };
};
