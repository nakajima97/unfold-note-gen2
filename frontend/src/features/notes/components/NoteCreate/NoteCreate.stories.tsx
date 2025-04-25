import type { Note } from '@/features/notes/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import NoteCreate from '.';

const meta: Meta<typeof NoteCreate> = {
  title: 'Features/Notes/Components/NoteCreate',
  component: NoteCreate,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NoteCreate>;

type NoteCreateStoryProps = {
  isSubmitting: boolean;
  projectId: string;
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  onSubmit?: (note: Partial<Note>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
};

const NoteCreateStory = (args: NoteCreateStoryProps) => {
  const [title, setTitle] = useState(args.initialTitle || '');
  const [content, setContent] = useState(args.initialContent || '');
  const [isUploading, _setIsUploading] = useState(false);
  const [isRefreshingImages, _setIsRefreshingImages] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (args.onSubmit) args.onSubmit({ title, content } as Partial<Note>);
  };
  const handleCancel = () => {
    if (args.onCancel) args.onCancel();
  };

  return (
    <NoteCreate
      isSubmitting={args.isSubmitting}
      projectId={args.projectId}
      noteId={args.noteId}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      title={title}
      setTitle={setTitle}
      content={content}
      isUploading={isUploading}
      editor={editor}
      isRefreshingImages={isRefreshingImages}
      onDelete={args.onDelete}
    />
  );
};

export const Default: Story = {
  args: {
    isSubmitting: false,
    projectId: 'project-123',
  },
  render: (args) => {
    const initialTitle = '';
    const initialContent = '';
    return (
      <NoteCreateStory
        {...args}
        initialTitle={initialTitle}
        initialContent={initialContent}
        onSubmit={(note: Partial<Note>) => console.log('ノート保存:', note)}
        onCancel={() => console.log('キャンセルがクリックされました')}
      />
    );
  },
};

export const WithInitialValues: Story = {
  args: {
    isSubmitting: false,
    projectId: 'project-123',
  },
  render: (args) => {
    const initialTitle = '新しいノートのタイトル';
    const initialContent =
      'これは新しいノートの内容です。\n\n#タグ #メモ #Unfold_Note';
    return (
      <NoteCreateStory
        {...args}
        initialTitle={initialTitle}
        initialContent={initialContent}
        onSubmit={(note: Partial<Note>) => console.log('ノート保存:', note)}
        onCancel={() => console.log('キャンセルがクリックされました')}
      />
    );
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    projectId: 'project-123',
  },
  render: (args) => {
    const initialTitle = 'ノートを保存中...';
    const initialContent = 'この内容は現在保存中です。#保存中';
    return (
      <NoteCreateStory
        {...args}
        initialTitle={initialTitle}
        initialContent={initialContent}
        onSubmit={(note: Partial<Note>) => console.log('ノート保存:', note)}
        onCancel={() => console.log('キャンセルがクリックされました')}
      />
    );
  },
};

export const LongContent: Story = {
  args: {
    isSubmitting: false,
    projectId: 'project-123',
  },
  render: (args) => {
    const initialTitle = '長い内容のノート';
    const initialContent =
      "# 長い内容のノート\n\nこれは長い内容のノートのサンプルです。エディタがどのように表示されるかを確認するためのものです。\n\n## セクション1\nこれは最初のセクションです。#長文 #テスト\n\n- 項目1\n- 項目2\n- 項目3\n\n## セクション2\nこれは2番目のセクションです。#サンプル\n\n1. 番号付きリスト1\n2. 番号付きリスト2\n3. 番号付きリスト3\n\n## セクション3\nこれは3番目のセクションです。#Unfold_Note\n\n> これは引用文です。引用文がどのように表示されるかを確認します。\n\n### サブセクション\nこれはサブセクションです。\n\n```\n// コードブロックのサンプル\nfunction hello() {\n  console.log('Hello, Unfold Note!');\n}\n```\n\n最後の段落です。これでサンプルノートは終わりです。";
    return (
      <NoteCreateStory
        {...args}
        initialTitle={initialTitle}
        initialContent={initialContent}
        onSubmit={(note: Partial<Note>) => console.log('ノート保存:', note)}
        onCancel={() => console.log('キャンセルがクリックされました')}
      />
    );
  },
};

export const WithJapaneseContent: Story = {
  args: {
    isSubmitting: false,
    projectId: 'project-123',
  },
  render: (args) => {
    const initialTitle = '日本語のノート';
    const initialContent =
      '# 日本語のノート\n\nこれは日本語で書かれたノートのサンプルです。#日本語 #テスト\n\n## 特徴\n- マークダウン記法が使えます\n- タグ機能（#タグ）があります\n- 階層構造を作らずにノートを管理できます\n\n## Unfold Noteとは\nUnfold Noteは、シンプルなノート管理アプリです。#Unfold_Note\n\n> 書くのが簡単なマークダウン記法を使ってメモを作成できます。\n> タグを使ってメモ同士のつながりを表現します。\n\n### 使い方\n1. ノートを作成する\n2. タグを付ける（#タグ形式）\n3. 検索して見つける\n\n以上です！';
    return (
      <NoteCreateStory
        {...args}
        initialTitle={initialTitle}
        initialContent={initialContent}
        onSubmit={(note: Partial<Note>) => console.log('ノート保存:', note)}
        onCancel={() => console.log('キャンセルがクリックされました')}
      />
    );
  },
};
