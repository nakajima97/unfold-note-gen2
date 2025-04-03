#!/usr/bin/env ts-node --project tsconfig.json
// CommonJS imports
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// パス
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const yarnrcPath = path.join(rootDir, '.yarnrc.yml');

// .yarnrc.ymlのテンプレート
const yarnrcTemplate = `nodeLinker: node-modules

yarnPath: .yarn/releases/yarn-4.3.1.cjs

npmRegistries:
  "https://registry.tiptap.dev/":
    npmAlwaysAuth: true
    npmAuthToken: "{TOKEN}"

npmScopes:
  tiptap-pro:
    npmRegistryServer: "https://registry.tiptap.dev/"
    npmAlwaysAuth: true
    npmAuthToken: "{TOKEN}"
`;

/**
 * .env.localファイルからトークンを読み取る
 * @returns トークン、見つからない場合はnull
 */
function readTokenFromEnv(): string | null {
  if (!fs.existsSync(envPath)) {
    console.log(`ファイルが見つかりません: ${envPath}`);
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const tokenMatch = envContent.match(/TIPTAP_TOKEN=["']?([^"'\r\n]+)["']?/);
  
  if (tokenMatch && tokenMatch[1]) {
    return tokenMatch[1];
  }
  
  return null;
}

/**
 * トークンを使用して.env.localファイルを作成または更新する
 * @param token 追加するトークン
 */
function writeTokenToEnv(token: string): void {
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // TIPTAP_TOKENが既に存在するかチェック
    if (envContent.match(/TIPTAP_TOKEN=/)) {
      // 既存のトークンを置き換え
      envContent = envContent.replace(
        /TIPTAP_TOKEN=["']?([^"'\r\n]+)["']?/,
        `TIPTAP_TOKEN="${token}"`
      );
    } else {
      // 既存のファイルにトークンを追加
      envContent += `\nTIPTAP_TOKEN="${token}"\n`;
    }
  } else {
    // 新しい.env.localファイルを作成
    envContent = `TIPTAP_TOKEN="${token}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`トークンを ${envPath} に保存しました`);
}

/**
 * トークンを使用して.yarnrc.ymlファイルを生成する
 * @param token 使用するトークン
 */
function generateYarnrc(token: string): void {
  const yarnrcContent = yarnrcTemplate.replace(/\{TOKEN\}/g, token);
  
  // .yarn/releasesディレクトリが存在しない場合は作成
  const releasesDir = path.join(rootDir, '.yarn', 'releases');
  if (!fs.existsSync(releasesDir)) {
    fs.mkdirSync(releasesDir, { recursive: true });
    console.log(`ディレクトリを作成しました: ${releasesDir}`);
  }
  
  fs.writeFileSync(yarnrcPath, yarnrcContent);
  console.log(`${yarnrcPath} を生成しました`);
}

/**
 * ユーザーに入力を促す
 * @param question 質問内容
 * @returns ユーザーの入力で解決するPromise
 */
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * メイン関数
 */
async function main(): Promise<void> {
  console.log('.yarnrc.yml ファイルを生成しています...');
  
  // .env.localからトークンを読み取る
  let token = readTokenFromEnv();
  
  // トークンが見つからない場合、ユーザーに入力を促す
  if (!token) {
    console.log('.env.local に TipTap トークンが見つかりません');
    token = await promptUser('TipTap トークンを入力してください: ');
    
    if (token) {
      writeTokenToEnv(token);
    } else {
      console.error('トークンが提供されませんでした。終了します。');
      process.exit(1);
    }
  }
  
  // .yarnrc.ymlを生成
  generateYarnrc(token);
  
  console.log('完了しました！');
}

// メイン関数を実行
main().catch((error) => {
  console.error('エラー:', error);
  process.exit(1);
});
