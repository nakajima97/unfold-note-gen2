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
import type { Note } from '@/features/notes/types';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useEffect } from 'react';

export interface NoteCreateProps {
  isSubmitting: boolean;
  onSubmit: (note: Partial<Note>) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialContent?: string;
}

const NoteCreate: React.FC<NoteCreateProps> = ({
  isSubmitting,
  onSubmit,
  onCancel,
  initialTitle = '',
  initialContent = '',
}) => {
  const [title, setTitle] = React.useState(initialTitle);
  const [content, setContent] = React.useState(initialContent);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[300px]',
        placeholder: 'ノート内容をここに入力してください...',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="mr-2"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold">
          {initialTitle ? 'ノートを編集' : '新規ノート作成'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <Label htmlFor="title" className="text-lg font-medium mb-2">
              タイトル
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ノートタイトルを入力"
              className="text-xl"
              required
            />
          </CardHeader>
          <CardContent>
            <Label htmlFor="content" className="text-lg font-medium mb-2">
              内容
            </Label>
            <div className="min-h-[300px] border rounded-md p-4">
              <EditorContent
                editor={editor}
                className="prose max-w-none min-h-[300px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
              ) : (
                <Save size={16} />
              )}
              保存
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default NoteCreate;
