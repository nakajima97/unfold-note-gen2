'use client';

import type { Note } from '@/features/notes/types';
import { refreshImageUrls } from '@/lib/api/file';
import { deleteNote, getNoteById, updateNote } from '@/lib/api/note';
import { updateNoteTags } from '@/lib/api/tag';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

export type UseNoteEditContainerProps = {
  projectId: string;
  noteId: string;
  projectUrlId?: string; // プロジェクトのURLID
};

export const useNoteEditContainer = ({
  projectId,
  noteId,
  projectUrlId,
}: UseNoteEditContainerProps) => {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ノートデータの取得
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setIsLoading(true);
        const fetchedNote = await getNoteById(noteId);

        if (!fetchedNote) {
          setError(new Error('ノートが見つかりませんでした'));
          return;
        }

        if (fetchedNote.project_id !== projectId) {
          setError(new Error('このプロジェクトに属するノートではありません'));
          return;
        }

        // 画像URLを更新
        if (fetchedNote.content) {
          try {
            const updatedContent = await refreshImageUrls(fetchedNote.content);
            fetchedNote.content = updatedContent;
          } catch (refreshError) {
            console.error('画像URL更新エラー:', refreshError);
            // エラーがあっても処理を続行
          }
        }

        setNote(fetchedNote);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('ノートの取得に失敗しました'),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId, projectId]);

  // ノート更新処理
  const handleSubmit = async (updatedNote: Partial<Note>) => {
    if (!updatedNote.title || !updatedNote.content) {
      setError(new Error('タイトルと内容は必須です'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // ノート内容を更新
      await updateNote(noteId, {
        title: updatedNote.title,
        content: updatedNote.content,
      });

      // ノートからタグを抽出して保存
      await updateNoteTags(noteId, updatedNote.content, projectId);

      // --- ここから画像のfilesテーブル紐付け処理 ---
      try {
        const imagePaths = extractImagePathsFromContent(updatedNote.content || '');
        if (imagePaths.length > 0) {
          const { error: updateError } = await supabase.from('files')
            .update({ note_id: noteId })
            .in('storage_path', imagePaths);
          if (updateError) {
            console.error('画像ファイル紐付けエラー:', updateError);
          }
        }
      } catch (fileLinkError) {
        console.error('画像ファイル紐付け処理エラー:', fileLinkError);
      }
      // --- ここまで追加 ---

      // 更新後、ノート一覧ページに戻る
      if (projectUrlId) {
        router.push(`/projects/${projectUrlId}/notes`);
      } else {
        // フォールバック: 内部IDを使用
        router.push(`/projects/${projectId}/notes`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('ノートの更新に失敗しました'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ノート削除処理
  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteNote(noteId);

      // 削除後、ノート一覧ページに戻る
      if (projectUrlId) {
        router.push(`/projects/${projectUrlId}/notes`);
      } else {
        // フォールバック: 内部IDを使用
        router.push(`/projects/${projectId}/notes`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('ノートの削除に失敗しました'),
      );
      setIsSubmitting(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    // ノート一覧に戻る
    if (projectUrlId) {
      router.push(`/projects/${projectUrlId}/notes`);
    } else {
      // フォールバック: 内部IDを使用
      router.push(`/projects/${projectId}/notes`);
    }
  };

  /**
   * ノート本文からSupabase Storageのstorage_path一覧を抽出
   * @param content HTML形式のノート本文
   * @returns storage_pathの配列（例: ["projectId/uuid1.jpg", ...]）
   */
  function extractImagePathsFromContent(content: string): string[] {
    // 例: https://xxxx.supabase.co/storage/v1/object/sign/notes/projectId/uuid.jpg?...
    const regex = /\/storage\/v1\/object\/sign\/notes\/([^"?]+)/g;
    const paths: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      paths.push(match[1]); // "projectId/uuid.jpg" など
    }
    return paths;
  }

  return {
    note,
    isLoading,
    isSubmitting,
    error,
    handleSubmit,
    handleDelete,
    handleCancel,
  };
};
