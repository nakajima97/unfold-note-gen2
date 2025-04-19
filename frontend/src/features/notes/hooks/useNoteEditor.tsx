'use client';

import Tag from '@/features/notes/extensions/tag';
import type { Note } from '@/features/notes/types';
import { refreshImageUrls, uploadImage } from '@/lib/api/file';
import FileHandler from '@tiptap-pro/extension-file-handler';
import Image from '@tiptap/extension-image';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useState, useRef } from 'react';


type Props = {
    initialTitle: string;
    initialContent: string;
    projectId: string;
    projectUrlId?: string;
    noteId?: string;
    onSubmit: (note: Partial<Note>) => void;
    onCancel: () => void;
    onDelete?: () => void;
}

export const useNoteEditor = ({
    initialTitle,
    initialContent,
    projectId,
    onSubmit,
}: Props) => {
    const [title, setTitle] = useState('');
    // tiptap表示用content
    const [content, setContent] = useState('');
    // 即座にcontentの内容に対して処理を行うと負荷がかかるため、500ms後にcontentと同期させてdebouncedContentの値でタグ抽出等の処理を行っている
    const [debouncedContent, setDebouncedContent] = useState('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [editorInitialized, setEditorInitialized] = useState(false);
    const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  
    // 初期コンテンツの画像URLを更新
    useEffect(() => {
      const updateInitialContent = async () => {
        if (initialContent) {
          setIsRefreshingImages(true);
          try {
            // 初期コンテンツ内の画像URLを更新
            const updatedContent = await refreshImageUrls(initialContent);
            setContent(updatedContent);
            setDebouncedContent(updatedContent);
          } catch (error) {
            console.error('画像URL更新エラー:', error);
            setContent(initialContent);
            setDebouncedContent(initialContent);
          } finally {
            setIsRefreshingImages(false);
          }
        } else {
          setContent('');
        }
      };
  
      updateInitialContent();
    }, [initialContent]);

    // 初期タイトル
    useEffect(() => {
      setTitle(initialTitle);
    }, [initialTitle]);
  
    const editor = useEditor({
      extensions: [
        StarterKit,
        Image.configure({
          allowBase64: true, // 一時的な画像表示のために残す
          inline: false,
        }),
        Tag, // タグ拡張を追加
        FileHandler.configure({
          allowedMimeTypes: [
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ],
          onDrop: async (currentEditor, files, pos) => {
            if (!files.length) return;
  
            setIsUploading(true);
  
            try {
              for (const file of files) {
                if (file.size > 10 * 1024 * 1024) {
                  // 10MB制限
                  alert('画像サイズは10MB以下にしてください');
                  continue;
                }
  
                // Supabase Storageに画像をアップロード
                const imageUrl = await uploadImage(projectId, file);
  
                // エディタに画像を挿入
                currentEditor
                  .chain()
                  .insertContentAt(pos, {
                    type: 'image',
                    attrs: {
                      src: imageUrl,
                      alt: file.name,
                    },
                  })
                  .focus()
                  .run();
              }
            } catch (error) {
              console.error('画像アップロードエラー:', error);
              alert('画像のアップロードに失敗しました');
            } finally {
              setIsUploading(false);
            }
          },
          onPaste: async (currentEditor, files, htmlContent) => {
            if (!files.length) return;
  
            setIsUploading(true);
  
            try {
              for (const file of files) {
                if (file.size > 10 * 1024 * 1024) {
                  // 10MB制限
                  alert('画像サイズは10MB以下にしてください');
                  continue;
                }
  
                // Supabase Storageに画像をアップロード
                const imageUrl = await uploadImage(projectId, file);
  
                // エディタに画像を挿入
                currentEditor
                  .chain()
                  .insertContent({
                    type: 'image',
                    attrs: {
                      src: imageUrl,
                      alt: file.name,
                    },
                  })
                  .focus()
                  .run();
              }
            } catch (error) {
              console.error('画像アップロードエラー:', error);
              alert('画像のアップロードに失敗しました');
            } finally {
              setIsUploading(false);
            }
          },
        }),
      ],
      content: content,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        setContent(html);
  
        // コンテンツの変更を遅延させて関連ノートの検索を最適化
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
  
        debounceTimerRef.current = setTimeout(() => {
          setDebouncedContent(html);
        }, 500); // 500ms後に更新
      },
      editorProps: {
        attributes: {
          class: 'prose focus:outline-none max-w-none',
        },
      },
      // SSR対応のため、即時レンダリングをオフに
      immediatelyRender: false,
    });
  
    // エディタが初期化されたときに初期コンテンツを設定
    useEffect(() => {
      if (editor && content && !editorInitialized) {
        editor.commands.setContent(content);
        setEditorInitialized(true);
      }
    }, [editor, content, editorInitialized]);
  
    // コンポーネントがアンマウントされるときにタイマーをクリア
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);
  
    // フォーム送信処理
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        title,
        content,
      });
    };

    return {
      editor,
      title,
      setTitle,
      content,
      setContent,
      debouncedContent,
      isUploading,
      handleSubmit,
      isRefreshingImages
    };
};
