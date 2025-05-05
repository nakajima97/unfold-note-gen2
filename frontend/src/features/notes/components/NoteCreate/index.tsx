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
import EditorHelpTooltip from '@/features/notes/components/EditorHelpTooltip';
import NoteActionMenu from '@/features/notes/components/NoteActionMenu';
import RelatedNotesByTagContainer from '@/features/notes/containers/RelatedNotesByTagContainer';
import { type Editor, EditorContent } from '@tiptap/react';
import { ArrowLeft, Save } from 'lucide-react';
import type React from 'react';
import './editor.css';

export type NoteCreateProps = {
  isSubmitting: boolean;
  projectId: string;
  noteId?: string; // 編集時のノートID
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  isUploading: boolean;
  editor: Editor | null;
  isRefreshingImages: boolean;
  onDelete?: () => void; // 削除機能（編集時のみ）
};

const NoteCreate: React.FC<NoteCreateProps> = ({
  isSubmitting,
  projectId,
  noteId,
  handleSubmit,
  handleCancel,
  title,
  setTitle,
  content,
  isUploading,
  editor,
  isRefreshingImages,
  onDelete,
}) => {
  // エディタが初期化されていない場合はローディング表示
  if (!editor && !isRefreshingImages) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Button>
            <h2 className="text-2xl font-bold">
              {noteId ? 'ノートを編集' : 'ノートを作成'}
            </h2>
            {/* 編集時のみメニューボタンを表示 */}
            {noteId && onDelete && (
              <NoteActionMenu 
                onDelete={onDelete} 
                isSubmitting={isSubmitting}
                editor={editor}
              />
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
              <EditorHelpTooltip />
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
              onClick={handleCancel}
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
      {noteId && (
        <div className="px-6 pb-6">
          <RelatedNotesByTagContainer
            currentNoteId={noteId}
            projectId={projectId}
            content={content}
          />
        </div>
      )}
    </Card>
  );
};

export default NoteCreate;
