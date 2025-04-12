'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import RelatedNotesByTagContainer from '@/features/notes/containers/RelatedNotesByTagContainer';
import Tag from '@/features/notes/extensions/tag';
import type { Note } from '@/features/notes/types';
import { uploadImage, refreshImageUrls } from '@/lib/api/file';
import FileHandler from '@tiptap-pro/extension-file-handler';
import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import './editor.css';

export type NoteCreateProps = {
  isSubmitting: boolean;
  onSubmit: (note: Partial<Note>) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialContent?: string;
  projectId: string;
  projectUrlId?: string; // プロジェクトのURL ID
  noteId?: string; // 編集時のノートID
};

const NoteCreate: React.FC<NoteCreateProps> = ({
  isSubmitting,
  onSubmit,
  onCancel,
  initialTitle = '',
  initialContent = '',
  projectId,
  projectUrlId,
  noteId,
}) => {
  const [title, setTitle] = React.useState(initialTitle);
  const [content, setContent] = React.useState('');
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
        } catch (error) {
          console.error('画像URL更新エラー:', error);
          setContent(initialContent);
        } finally {
          setIsRefreshingImages(false);
        }
      } else {
        setContent('');
      }
    };

    updateInitialContent();
  }, [initialContent]);

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

          // HTMLコンテンツがある場合は他の拡張機能に処理を任せる
          if (htmlContent) return false;

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

              // エディタに画像を挿入（現在のカーソル位置）
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
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
      const newContent = editor.getHTML();
      setContent(newContent);

      // 既存のタイマーをクリア
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 500ms後にdebouncedContentを更新
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedContent(newContent);
      }, 500);
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm sm:prose lg:prose-lg xl:prose-xl',
      },
    },
    immediatelyRender: false,
  });

  // エディタの初期化を検出
  useEffect(() => {
    if (editor) {
      setEditorInitialized(true);
    }
  }, [editor]);

  // エディタが初期化されたら、初期コンテンツを適切に設定
  useEffect(() => {
    if (editor && editorInitialized && content) {
      // 少し遅延させて確実にエディタが準備できた状態で実行
      const timer = setTimeout(() => {
        // 既存のコンテンツをクリア
        editor.commands.clearContent();

        // HTMLコンテンツを設定
        editor.commands.setContent(content);

        // 初期コンテンツの設定後、カーソルを先頭に移動
        editor.commands.focus('start');
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [editor, editorInitialized, content]);

  useEffect(() => {
    setTitle(initialTitle);
    setDebouncedContent(content);
  }, [initialTitle, content]);

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Button>
            <h2 className="text-2xl font-bold">
              {initialContent ? 'ノートを編集' : 'ノートを作成'}
            </h2>
            <div className="w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg font-medium">
              タイトル
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ノートのタイトルを入力してください"
              required
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content" className="text-lg font-medium mb-2">
              内容
            </Label>
            <div className="min-h-[300px] border rounded-md p-4 editor-container relative">
              {isUploading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                </div>
              )}
              <div className="mb-2 text-sm text-muted-foreground">
                画像はドラッグ＆ドロップまたは貼り付けで追加できます（最大10MB）
                <br />
                <span className="tag-highlight">#タグ</span>{' '}
                のように入力するとタグとして認識されます
                <br />
                <span style={{ fontSize: '0.8em' }}>
                  タグの色:{' '}
                  <span style={{ color: '#ff69b4', fontWeight: 600 }}>
                    ピンク
                  </span>{' '}
                  = 同名のノートが存在しない、
                  <span style={{ color: '#1e90ff', fontWeight: 600 }}>青</span>{' '}
                  = 同名のノートが存在する
                </span>
              </div>
              <EditorContent
                editor={editor}
                className="prose max-w-none min-h-[300px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  保存
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </form>

      {/* 同じタグがついているノートの表示 */}
      {initialContent && noteId && (
        <div className="px-6 pb-6">
          <RelatedNotesByTagContainer
            currentNoteId={noteId}
            projectId={projectId}
            projectUrlId={projectUrlId}
            content={debouncedContent}
          />
        </div>
      )}
    </Card>
  );
};

export default NoteCreate;
