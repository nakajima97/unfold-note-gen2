import type { Meta, StoryObj } from '@storybook/react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type React from 'react';
import { useState } from 'react';
import NoteCreate from './index';

const meta: Meta<typeof NoteCreate> = {
  title: 'Features/Notes/NoteCreate',
  component: NoteCreate,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof NoteCreate>;

// Storybook用のラッパー
type NoteCreateStoryProps = {
  isSubmitting: boolean;
  onSubmit: (note: { title: string; content: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialTitle?: string;
  initialContent?: string;
  projectId: string;
  projectUrlId?: string;
  noteId?: string;
};

const NoteCreateStory = (args: NoteCreateStoryProps) => {
  const [title, setTitle] = useState(args.initialTitle || '');
  const [content, setContent] = useState(args.initialContent || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshingImages, setIsRefreshingImages] = useState(false);
  const [debouncedContent, setDebouncedContent] = useState(content);

  // editorインスタンスの生成
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      setDebouncedContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[300px]',
      },
    },
    autofocus: false,
    editable: !args.isSubmitting,
  });

  // handleSubmit, handleCancelのモック
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (args.onSubmit) args.onSubmit({ title, content });
  };
  const handleCancel = () => {
    if (args.onCancel) args.onCancel();
  };

  return (
    <NoteCreate
      {...args}
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      debouncedContent={debouncedContent}
      isUploading={isUploading}
      isRefreshingImages={isRefreshingImages}
      editor={editor}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
    />
  );
};

export const Default: Story = {
  render: (args) => <NoteCreateStory {...args} />,
  args: {
    isSubmitting: false,
    onSubmit: (note) => console.log('ノート保存:', note),
    onCancel: () => console.log('キャンセルがクリックされました'),
    initialTitle: '',
    initialContent: '',
    projectId: 'project-123',
  },
};

export const WithInitialValues: Story = {
  render: (args) => <NoteCreateStory {...args} />,
  args: {
    isSubmitting: false,
    onSubmit: (note) => console.log('ノート保存:', note),
    onCancel: () => console.log('キャンセルがクリックされました'),
    initialTitle: '新しいノートのタイトル',
    initialContent:
      'これは新しいノートの内容です。\n\n#タグ #メモ #Unfold_Note',
    projectId: 'project-123',
  },
};

export const Submitting: Story = {
  render: (args) => <NoteCreateStory {...args} />,
  args: {
    isSubmitting: true,
    onSubmit: (note) => console.log('ノート保存:', note),
    onCancel: () => console.log('キャンセルがクリックされました'),
    initialTitle: 'ノートを保存中...',
    initialContent: 'この内容は現在保存中です。#保存中',
    projectId: 'project-123',
  },
};

export const LongContent: Story = {
  render: (args) => <NoteCreateStory {...args} />,
  args: {
    isSubmitting: false,
    onSubmit: (note) => console.log('ノート保存:', note),
    onCancel: () => console.log('キャンセルがクリックされました'),
    initialTitle: '長い内容のノート',
    initialContent: `# 長い内容のノート

これは長い内容のノートのサンプルです。エディタがどのように表示されるかを確認するためのものです。

## セクション1
これは最初のセクションです。#長文 #テスト

- 項目1
- 項目2
- 項目3

## セクション2
これは2番目のセクションです。#サンプル

1. 番号付きリスト1
2. 番号付きリスト2
3. 番号付きリスト3

## セクション3
これは3番目のセクションです。#Unfold_Note

> これは引用文です。引用文がどのように表示されるかを確認します。

### サブセクション
これはサブセクションです。

\`\`\`
// コードブロックのサンプル
function hello() {
  console.log('Hello, Unfold Note!');
}
\`\`\`

最後の段落です。これでサンプルノートは終わりです。`,
    projectId: 'project-123',
  },
};

export const WithJapaneseContent: Story = {
  render: (args) => <NoteCreateStory {...args} />,
  args: {
    isSubmitting: false,
    onSubmit: (note) => console.log('ノート保存:', note),
    onCancel: () => console.log('キャンセルがクリックされました'),
    initialTitle: '日本語のノート',
    initialContent: `# 日本語のノート

これは日本語で書かれたノートのサンプルです。#日本語 #テスト

## 特徴
- マークダウン記法が使えます
- タグ機能（#タグ）があります
- 階層構造を作らずにノートを管理できます

## Unfold Noteとは
Unfold Noteは、シンプルなノート管理アプリです。#Unfold_Note

> 書くのが簡単なマークダウン記法を使ってメモを作成できます。
> タグを使ってメモ同士のつながりを表現します。

### 使い方
1. ノートを作成する
2. タグを付ける（#タグ形式）
3. 検索して見つける

以上です！`,
    projectId: 'project-123',
  },
};
