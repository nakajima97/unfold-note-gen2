# Unfold Note

タグを活用したマークダウンノートアプリ

## 概要

Unfold Noteは、マークダウン形式でノートを作成・管理するためのアプリケーションです。階層構造を使わず、タグを活用してノート同士のつながりを表現することで、情報が埋もれることなく効率的にメモを管理できます。

詳細な要件や機能については[要件定義書](docs/requirements.md)を参照してください。

## セットアップ方法

### 前提条件

- Node.js (v18以上)
- Yarn
- Supabaseアカウント

### 環境構築

1. リポジトリをクローンする

```bash
git clone https://github.com/yourusername/unfold-note-gen2.git
cd unfold-note-gen2
```

2. 依存関係をインストールする

```bash
cd frontend
yarn install
```

3. Supabaseプロジェクトを作成する
  - ローカルのSupabaseプロジェクトを起動する
  - `yarn supabase start`を実行
  - 出力されたAPIキーなどの情報を4で設定するためにコピーする

4. 環境変数を設定する
   - `frontend`ディレクトリに`.env.local`ファイルを作成し、以下の内容を追加します

```
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabaseプロジェクト匿名キー
ENABLE_PASSWORD_LOGIN=true  # 開発環境でID/パスワードログインを有効にする場合
```

5. yarnrc.ymlを設定する

```yml
nodeLinker: node-modules

yarnPath: .yarn/releases/yarn-4.3.1.cjs

npmRegistries:
  "https://registry.tiptap.dev/":
    npmAlwaysAuth: true
    npmAuthToken: "あなたのトークン"

npmScopes:
  tiptap-pro:
    npmRegistryServer: "https://registry.tiptap.dev/"
    npmAlwaysAuth: true
    npmAuthToken: "あなたのトークン"
```

6. データベースマイグレーションを実行する

```bash
cd frontend
yarn supabase migration up
```

7. 開発サーバーを起動する

```bash
yarn dev
```

8. ブラウザで http://localhost:3000 にアクセスする

9. storybookを起動する

```bash
yarn storybook
```

10. ブラウザで http://localhost:6006 にアクセスする

### 管理者設定

1. [Supabaseダッシュボード](http://127.0.0.1:54323)にアクセスする
2. SQLエディタを開き、以下のSQLを実行して許可するメールアドレスを登録する

```sql
INSERT INTO allowed_emails (email) VALUES ('your-email@example.com');
```

## 開発ガイド

### コードスタイル

コードスタイルはBiomeを使用して統一しています。以下のコマンドでlintとformatを実行できます。

```bash
yarn bc
```

### テスト実行

```bash
# ユニットテスト
yarn test

# Storybookの起動
yarn storybook

# E2Eテスト
yarn test:e2e
```

### ビルド

```bash
yarn build
```

## デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com/)にアクセスし、GitHubリポジトリと連携します
2. 環境変数を設定します（Supabase URLとAPIキー）
3. デプロイを実行します

## 主な機能

- マークダウン形式でのノート作成・編集
- タグを使ったノート管理（`#タグ名`形式でタグ付け）
- プロジェクト管理
- 画像やファイルのアップロード
- Google OAuthによる認証

## ドキュメント

詳細なドキュメントは以下を参照してください：

- [要件定義書](docs/requirements.md) - 詳細な機能要件と技術仕様

## ライセンス

このプロジェクトは個人利用を目的としています。
