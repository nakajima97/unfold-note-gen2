# Next.js テンプレート

このリポジトリは、Next.js プロジェクトのテンプレートです。  
App Routerを使っています。  
Page Routerは以下リポジトリを参照してください。  
https://github.com/nakajima97/next-template-page-router

## 技術スタック
最新の情報は`package.json`を参照してください。  
主な技術スタックとしては以下を使っています。  

* Next.js
* React
* Yarn
* Biome

## セットアップ

1. リポジトリをクローンします。
2. 依存関係をインストールします: `yarn install`
3. TipTap Proを使用する場合は、.yarnrc.ymlを設定します:
   ```bash
   yarn generate-yarnrc
   ```
   このスクリプトは`.env.local`から`TIPTAP_TOKEN`を読み取り、.yarnrc.ymlファイルを生成します。
   トークンが見つからない場合は、入力を求められます。
4. プロジェクトを起動します: `yarn dev`

## テスト

`yarn test` を実行してテストを実行します。

## インストールオプション
NextJSインストール時のオプションは以下を選択しています。
```
✔ What is your project named? … next-template
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … No
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to customize the default import alias (@/*)? … Yes
✔ What import alias would you like configured? … @/*
```
