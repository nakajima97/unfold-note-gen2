# スクリプト

このディレクトリにはプロジェクト用のユーティリティスクリプトが含まれています。

## generate-yarnrc.ts

このスクリプトは、TipTap Proトークンを使用して`.yarnrc.yml`ファイルを生成します。

### 使用方法

```bash
# スクリプトを実行
cd frontend
yarn generate-yarnrc
```

### 機能

1. `.env.local`からTipTapトークンを確認
2. トークンが見つからない場合、入力を促す
3. 必要に応じてトークンを`.env.local`に保存
4. トークンを使用して`.yarnrc.yml`を生成
5. `.yarn/releases`ディレクトリが存在しない場合は作成

### 環境変数

スクリプトは`.env.local`から以下の環境変数を探します：

- `TIPTAP_TOKEN`: TipTap Pro認証トークン

すでに`TIPTAP_TOKEN`を含む`.env.local`ファイルがある場合、スクリプトはその値を使用します。ない場合は、トークンの入力を求め、`.env.local`に保存します。
