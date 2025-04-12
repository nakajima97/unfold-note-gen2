'use client';

import { type Note, getNoteById } from '@/lib/api/note';
import { Tag, extractTagsFromText, getNotesByTagName } from '@/lib/api/tag';
import { useEffect, useRef, useState } from 'react';

export interface UseRelatedNotesByTagProps {
  currentNoteId: string;
  projectId: string;
  content: string;
}

// Note型を拡張してurlIdを明示的に含める
interface NoteWithUrlId extends Note {
  urlId: string;
}

export const useRelatedNotesByTag = ({
  currentNoteId,
  projectId,
  content,
}: UseRelatedNotesByTagProps) => {
  const [groupedNotes, setGroupedNotes] = useState<
    Record<string, NoteWithUrlId[]>
  >({});
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
          // そのタグを持つノート情報（id, urlId）を取得
          const taggedNotes = await getNotesByTagName(tag, projectId);

          // 現在のノートを除外
          const filteredNotes = taggedNotes.filter(
            (note) => note.id !== currentNoteId,
          );

          if (filteredNotes.length > 0) {
            // ノートの詳細情報を取得
            const notesPromises = filteredNotes.map(async (note) => {
              try {
                const noteData = await getNoteById(note.id);

                if (noteData) {
                  // 重要: urlIdを明示的に上書き
                  const noteWithUrlId = {
                    ...noteData,
                    urlId: note.urlId, // getNotesByTagNameから取得したurlIdを使用
                  } as NoteWithUrlId;

                  return noteWithUrlId;
                }
              } catch (error) {
                // エラーが発生した場合は静かに処理
              }

              // getNoteByIdでエラーが発生した場合や、ノートが見つからなかった場合は、
              // タグから取得したノート情報を最低限の情報として返す
              return {
                id: note.id,
                urlId: note.urlId,
                title: 'タイトル不明',
                content: '',
                project_id: projectId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as NoteWithUrlId;
            });

            const notes = await Promise.all(notesPromises);

            // nullを除外（この実装では常にnullではないはずだが、型安全のため）
            const validNotes = notes.filter(
              (note): note is NoteWithUrlId => note !== null && !!note.urlId,
            );

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
