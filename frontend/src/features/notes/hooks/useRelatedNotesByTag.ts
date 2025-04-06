'use client';

import { type Note, getNoteById } from '@/lib/api/note';
import { Tag, extractTagsFromText, getNotesByTagName } from '@/lib/api/tag';
import { useEffect, useRef, useState } from 'react';

export interface UseRelatedNotesByTagProps {
  currentNoteId: string;
  projectId: string;
  content: string;
}

// Note型を拡張してurl_idを明示的に含める
interface NoteWithUrlId extends Note {
  url_id: string;
}

export const useRelatedNotesByTag = ({
  currentNoteId,
  projectId,
  content,
}: UseRelatedNotesByTagProps) => {
  const [groupedNotes, setGroupedNotes] = useState<Record<string, NoteWithUrlId[]>>({});
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
        const grouped: Record<string, NoteWithUrlId[]> = {};

        // 各タグについて処理
        for (const tag of tags) {
          // そのタグを持つノート情報（id, url_id）を取得
          const taggedNotes = await getNotesByTagName(tag, projectId);
          console.log('タグ付きノート情報:', tag, taggedNotes);
          console.log('タグ付きノートのurl_id:', taggedNotes.map(note => note.url_id));

          // 現在のノートを除外
          const filteredNotes = taggedNotes.filter((note) => note.id !== currentNoteId);
          console.log('フィルタリング後のノート:', filteredNotes);
          console.log('フィルタリング後のノートのurl_id:', filteredNotes.map(note => note.url_id));

          if (filteredNotes.length > 0) {
            // ノートの詳細情報を取得
            const notesPromises = filteredNotes.map(async (note) => {
              console.log('ノート情報取得前:', note);
              console.log('ノート情報取得前のurl_id:', note.url_id);
              
              try {
                const noteData = await getNoteById(note.id);
                console.log('getNoteByIdの結果:', noteData);
                console.log('getNoteByIdの結果のurl_id:', noteData?.url_id);
                
                if (noteData) {
                  // 重要: url_idを明示的に上書き
                  const noteWithUrlId = {
                    ...noteData,
                    url_id: note.url_id // getNotesByTagNameから取得したurl_idを使用
                  } as NoteWithUrlId;
                  
                  console.log('url_id追加後のノート:', noteWithUrlId);
                  console.log('url_id追加後のノートのurl_id:', noteWithUrlId.url_id);
                  console.log('url_id追加後のノートのurl_idの型:', typeof noteWithUrlId.url_id);
                  
                  // url_idが存在しない場合はエラーログを出力
                  if (!noteWithUrlId.url_id) {
                    console.error('Error: url_id is missing after assignment');
                  }
                  
                  return noteWithUrlId;
                }
              } catch (error) {
                console.error('Error fetching note details:', error);
              }
              
              // getNoteByIdでエラーが発生した場合や、ノートが見つからなかった場合は、
              // タグから取得したノート情報を最低限の情報として返す
              return {
                id: note.id,
                url_id: note.url_id,
                title: 'タイトル不明',
                content: '',
                project_id: projectId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as NoteWithUrlId;
            });
            
            const notes = await Promise.all(notesPromises);
            console.log('取得したノート一覧:', notes);
            console.log('取得したノート一覧のurl_id:', notes.map(note => note?.url_id));

            // nullを除外（この実装では常にnullではないはずだが、型安全のため）
            const validNotes = notes.filter(
              (note): note is NoteWithUrlId => note !== null && !!note.url_id
            );
            console.log('有効なノート:', validNotes);
            console.log('有効なノートのurl_id:', validNotes.map(note => note.url_id));

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
          err instanceof Error
            ? err
            : new Error('関連ノートの取得に失敗しました'),
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
