# 要件定義書 - 概要

## はじめに

### 1.1 目的
このドキュメントは、このリポジトリで開発を進めているアプリの要件を定義します。  
アプリ名は"Unfold Note"です。  

### 1.2 対象読者
- 開発チーム
- プロジェクト管理者
- テスト担当者
- その他の利害関係者

### 1.3 このシステムが解決したい課題
- 雑にメモを保存しても必要な情報が埋もれることないようにしたい

### 1.4 1.3の解決策
- 書くのが簡単なマークダウン記法を使ってメモを作成できるようにする
- フォルダなどの階層構造を作成しない
- タグを使ってメモ同士のつながりを表現する

### 1.5 ターゲットユーザー
- 開発者本人の個人利用を想定

## 用語集
- **ノート**: マークダウン形式で作成されるドキュメント
- **プロジェクト**: ノートを整理するためのコンテナ
- **タグ**: ノートを分類・関連付けるためのキーワード
- **マークダウン**: テキストを構造化するための軽量マークアップ言語

## 付録

### 2.1 参考資料
- Next.js ドキュメント: [Next.js](https://nextjs.org/docs)
- Supabase ドキュメント: [Supabase](https://supabase.com/docs)
- Tiptap ドキュメント: [Tiptap](https://tiptap.dev/docs)

### 2.2 UI/UXデザイン参考
- 基本的なカラーパレット: ダークモード/ライトモード対応
- フォント: システムフォントスタック（読みやすさ重視）
- アイコン: Heroicons または Material Icons
