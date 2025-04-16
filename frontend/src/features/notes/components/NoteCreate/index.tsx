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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import NoteActionMenu from '@/features/notes/components/NoteActionMenu';
import RelatedNotesByTagContainer from '@/features/notes/containers/RelatedNotesByTagContainer';
import Tag from '@/features/notes/extensions/tag';
import type { Note } from '@/features/notes/types';
import { refreshImageUrls, uploadImage } from '@/lib/api/file';
import FileHandler from '@tiptap-pro/extension-file-handler';
import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ArrowLeft, HelpCircle, Save } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import './editor.css';

export type NoteCreateProps = {
  isSubmitting: boolean;
  onSubmit: (note: Partial<Note>) => void;
  onCancel: () => void;
  onDelete?: () => void; // 削除機能（編集時のみ）
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
  onDelete,
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

  // エディタが初期化されていない場合はローディング表示
  if (!editor && !isRefreshingImages) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // フォーム送信処理
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
            {/* 編集時のみメニューボタンを表示 */}
            {noteId && onDelete ? (
              <NoteActionMenu onDelete={onDelete} isSubmitting={isSubmitting} />
            ) : (
              <div className="w-24" />
            )}
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
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="content" className="text-lg font-medium">
                内容
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs bg-secondary text-secondary-foreground p-2 space-y-1">
                    <p>画像はドラッグ＆ドロップまたは貼り付けで追加できます（最大10MB）</p>
                    <p><span className="tag-highlight">#タグ</span> のように入力するとタグとして認識されます</p>
                    <p className="text-xs">
                      タグの色: <span style={{ color: '#ff69b4', fontWeight: 600 }}>ピンク</span> = 同名のノートが存在しない、
                      <span style={{ color: '#1e90ff', fontWeight: 600 }}>青</span> = 同名のノートが存在する
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="min-h-[300px] border rounded-md p-4 editor-container relative">
              {isUploading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                </div>
              )}
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
