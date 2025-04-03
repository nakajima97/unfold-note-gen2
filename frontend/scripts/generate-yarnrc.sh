#!/bin/bash
# generate-yarnrc.sh

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/.env.local"
YARNRC_FILE="$ROOT_DIR/.yarnrc.yml"

# 環境変数からトークンを取得
TOKEN=${TIPTAP_TOKEN}

# 環境変数にトークンがない場合は.env.localから読み取る
if [ -z "$TOKEN" ] && [ -f "$ENV_FILE" ]; then
  echo ".env.localファイルからトークンを読み取ります..."
  # .env.localからトークンを抽出
  TOKEN=$(grep -o 'TIPTAP_TOKEN=["]*[^"]*["]*' "$ENV_FILE" | sed 's/TIPTAP_TOKEN=["]*\([^"]*\)["]*$/\1/')
fi

# トークンが見つからない場合はデフォルト値を使用
if [ -z "$TOKEN" ]; then
  TOKEN="default_token"
  echo "警告: TIPTAP_TOKENが見つかりません。デフォルト値を使用します。"
fi

# トークンの頭文字5文字を取得（セキュリティのため）
TOKEN_PREFIX=$(echo "$TOKEN" | cut -c 1-5)
TOKEN_LENGTH=${#TOKEN}

cat > "$YARNRC_FILE" << EOL
nodeLinker: node-modules

yarnPath: .yarn/releases/yarn-4.3.1.cjs

npmRegistries:
  "https://registry.tiptap.dev/":
    npmAlwaysAuth: true
    npmAuthToken: "$TOKEN"

npmScopes:
  tiptap-pro:
    npmRegistryServer: "https://registry.tiptap.dev/"
    npmAlwaysAuth: true
    npmAuthToken: "$TOKEN"
EOL

mkdir -p "$ROOT_DIR/.yarn/releases"
echo "$YARNRC_FILE を生成しました"
echo "トークン情報: 頭文字 $TOKEN_PREFIX... (全 $TOKEN_LENGTH 文字)"