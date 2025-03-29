import type { Meta, StoryObj } from '@storybook/react';
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

export const Default: Story = {
  args: {
    isSubmitting: false,
    onSubmit: (note) => console.log('ノート保存:', note),
    onCancel: () => console.log('キャンセルがクリックされました'),
    initialTitle: '',
    initialContent: '',
  },
};

export const WithInitialValues: Story = {
  args: {
    isSubmitting: false,
    onSubmit: (note) => console.log('ノート保存:', note),
    onCancel: () => console.log('キャンセルがクリックされました'),
    initialTitle: '新しいノートのタイトル',
    initialContent: 'これは新しいノートの内容です。\n\n#タグ #メモ #Unfold_Note',
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
    onSubmit: (note) => console.log('ノート保存:', note),
    onCancel: () => console.log('キャンセルがクリックされました'),
    initialTitle: 'ノートを保存中...',
    initialContent: 'この内容は現在保存中です。#保存中',
  },
};

export const LongContent: Story = {
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
  },
};

export const WithJapaneseContent: Story = {
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
  },
};
