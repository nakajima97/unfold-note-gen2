#!/bin/bash
# generate-yarnrc.sh

# 環境変数からトークンを取得
TOKEN=${TIPTAP_TOKEN}

# 環境変数にトークンがない場合は.env.localから読み取る
if [ -z "$TOKEN" ] && [ -f ".env.local" ]; then
  # .env.localからトークンを抽出
  TOKEN=$(grep -o 'TIPTAP_TOKEN=["]*[^"]*["]*' ".env.local" | sed 's/TIPTAP_TOKEN=["]*\([^"]*\)["]*$/\1/')
fi

# トークンが見つからない場合はデフォルト値を使用
if [ -z "$TOKEN" ]; then
  TOKEN="default_token"
  echo "警告: TIPTAP_TOKENが見つかりません。デフォルト値を使用します。"
fi

cat > .yarnrc.yml << EOL
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

echo ".yarnrc.yml を生成しました"