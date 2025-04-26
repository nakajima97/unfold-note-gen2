#!/usr/bin/env node

/**
 * Unfold Noteのデータベースに120件のサンプルノートを生成するスクリプト
 * 
 * 使用方法:
 * 1. .env.localファイルにSupabaseの認証情報が設定されていることを確認
 * 2. 以下のコマンドを実行:
 *    node scripts/generate-sample-notes.js <プロジェクトID>
 * 
 * 注意: プロジェクトIDを指定しない場合、ユーザーの最初のプロジェクトを使用します
 */

// ESM形式で必要なモジュールをインポート
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { customAlphabet } from 'nanoid';
import fs from 'fs';
import path from 'path';

// .env.localファイルを読み込む
dotenv.config({ path: '.env.local' });

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません。.env.localファイルを確認してください。');
  process.exit(1);
}

// 匿名キーを使用した通常のクライアント
const supabase = createClient(supabaseUrl, supabaseKey);

// サービスロールキーを使用した管理者権限のクライアント（RLSをバイパス）
const adminSupabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// URLIDの生成に使用するアルファベット（紛らわしい文字を除外）
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const generateUrlId = customAlphabet(alphabet, 15);

// 生成済みのノートIDを追跡するセット
const generatedNoteUrlIds = new Set();

/**
 * 一意のURL識別子を生成する関数
 */
function generateUniqueUrlId() {
  // 最大100回試行する
  let attempts = 0;
  const maxAttempts = 100;
  
  return new Promise((resolve, reject) => {
    const tryGenerate = async () => {
      if (attempts >= maxAttempts) {
        return reject(new Error(`一意のURL識別子の生成に失敗しました（${maxAttempts}回試行）`));
      }
      
      attempts++;
      const urlId = generateUrlId();
      
      // 既に生成済みのurlIdでないことを確認
      if (generatedNoteUrlIds.has(urlId)) {
        return tryGenerate();
      }
      
      try {
        // データベースに既に存在するか確認
        const { data, error } = await supabase
          .from('notes')
          .select('id')
          .eq('url_id', urlId)
          .maybeSingle();
        
        if (error) {
          console.error('URL識別子の重複チェック中にエラーが発生しました:', error);
          return tryGenerate();
        }
        
        if (data) {
          // 既に存在する場合は再試行
          return tryGenerate();
        }
        
        // 重複がなければこのurlIdを使用
        generatedNoteUrlIds.add(urlId);
        return resolve(urlId);
      } catch (error) {
        console.error('URL識別子の生成中にエラーが発生しました:', error);
        return tryGenerate();
      }
    };
    
    tryGenerate();
  });
}

// サンプルデータの生成に使用するタイトルテンプレート
const titleTemplates = [
  '【メモ】に関する考察',
  'プロジェクトの進捗状況',
  'の学習ノート',
  'についてのアイデア',
  'に関する会議メモ',
  'の実装方法',
  'の使い方メモ',
  'のベストプラクティス',
  'に関する問題と解決策',
  'の今後の展望'
];

// サンプルデータの生成に使用する本文テンプレート
const contentTemplates = [
  `# {{タイトル}}

## 概要
重要なポイントをまとめました。

## 詳細
- ポイント1: 基本的な考え方
- ポイント2: 実践における注意点
- ポイント3: 応用方法

## 次のステップ
- さらに調査する
- 実際に試してみる
- フィードバックを集める`,

  `# {{タイトル}}

今日は考えてみました。

## 主なポイント
1. 現状分析
2. 問題点の洗い出し
3. 改善案の検討

## メモ
- 参考資料をもっと集める
- 専門家の意見を聞いてみる`,

  `# {{タイトル}}

に関する学習記録です。

## 学んだこと
- 基本概念
- 実践的な使い方
- 応用テクニック

## 疑問点
- 最適な活用方法は？
- 他の技術との組み合わせ方は？

## 参考リソース
- 書籍：「入門」
- オンラインコース
- 公式ドキュメント`,

  `# {{タイトル}}

に関するプロジェクト進捗状況です。

## 現在の状況
- フェーズ1：完了
- フェーズ2：進行中（80%）
- フェーズ3：未着手

## 課題
- リソース不足
- 技術的な障壁
- スケジュールの遅れ

## 次のアクション
- チームミーティングの開催
- リソースの再配分
- スケジュールの見直し`,

  `# {{タイトル}}

に関する技術メモです。

## 技術概要
は、効率的な開発を可能にする技術です。

## 実装例
\`\`\`
function example() {
  console.log("This is an example of ");
}
\`\`\`

## 注意点
- パフォーマンスへの影響
- 互換性の問題
- セキュリティ考慮事項`
];

/**
 * ランダムなタイトルを生成する関数
 */
function generateRandomTitle() {
  const template = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  return template;
}

/**
 * ランダムな本文を生成する関数
 */
function generateRandomContent(title) {
  // ランダムにテンプレートを選択
  const template = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
  
  // タイトルを置換
  let content = template.replace(/{{タイトル}}/g, title);
  
  return content;
}

/**
 * ユーザーの最初のプロジェクトを取得する関数
 */
async function getFirstProject() {
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('ユーザー情報の取得に失敗しました:', userError);
    process.exit(1);
  }
  
  if (!user) {
    console.error('ログインしていません。先にログインしてください。');
    process.exit(1);
  }
  
  // ユーザーのプロジェクトを取得
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });
  
  if (projectError) {
    console.error('プロジェクト情報の取得に失敗しました:', projectError);
    process.exit(1);
  }
  
  if (!projects || projects.length === 0) {
    console.error('プロジェクトが見つかりません。先にプロジェクトを作成してください。');
    process.exit(1);
  }
  
  return projects[0];
}

/**
 * 指定した関数を最大試行回数までリトライする関数
 * @param {Function} fn 実行する関数
 * @param {number} maxRetries 最大リトライ回数
 * @param {number} delay リトライ間の遅延（ミリ秒）
 * @returns {Promise<any>} 関数の実行結果
 */
async function withRetry(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 最後の試行でなければリトライ
      if (attempt < maxRetries - 1) {
        // 指数バックオフ（リトライごとに待機時間を増やす）
        const waitTime = delay * Math.pow(2, attempt);
        console.log(`リトライ ${attempt + 1}/${maxRetries}... ${waitTime}ms後に再試行します`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}

/**
 * サンプルノートを生成する関数
 */
async function generateSampleNotes(projectId, count = 120) {
  console.log(`プロジェクトID: ${projectId} に ${count} 件のサンプルノートを生成します...`);
  
  // サービスロールキーがない場合は警告を表示
  if (!adminSupabase) {
    console.warn('SUPABASE_SERVICE_ROLE_KEYが設定されていません。RLSポリシーによりデータ挿入が制限される可能性があります。');
  }
  
  const batchSize = 10; // 一度に処理するノートの数
  const batches = Math.ceil(count / batchSize);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < batches; i++) {
    const batchCount = Math.min(batchSize, count - i * batchSize);
    console.log(`バッチ ${i + 1}/${batches}: ${batchCount} 件のノートを生成中...`);
    
    const batchPromises = [];
    
    for (let j = 0; j < batchCount; j++) {
      const title = generateRandomTitle();
      const content = generateRandomContent(title);
      
      // ここでurlIdを先に生成する
      const urlId = await generateUniqueUrlId();
      
      const promise = (async () => {
        try {
          // 管理者権限のクライアントがあれば使用し、なければ通常のクライアントを使用
          const client = adminSupabase || supabase;
          
          // リトライメカニズムを使用してデータ挿入を実行
          const result = await withRetry(async () => {
            const { data, error } = await client
              .from('notes')
              .insert({
                title,
                content,
                project_id: projectId,
                url_id: urlId,
              })
              .select()
              .single();
            
            if (error) {
              console.error(`ノート挿入エラー (${title}):`, error);
              throw error;
            }
            
            return data;
          }, 3, 1000); // 最大3回、初回遅延1000ms（以降は指数バックオフ）
          
          successCount++;
          return result;
        } catch (error) {
          // エラーの種類に応じたメッセージを表示
          if (error.message && error.message.includes('upstream server')) {
            console.error(`サーバー応答エラー (${title}): 一時的なネットワーク問題が発生しました`);
          } else if (error.code === '23505') {
            console.error(`重複キーエラー (${title}): url_idが重複しています`);
          } else if (error.code === '42501') {
            console.error(`権限エラー (${title}): RLSポリシーによりアクセスが拒否されました`);
          } else {
            console.error(`ノート生成エラー (${title}):`, error);
          }
          
          errorCount++;
          return null;
        }
      })();
      
      batchPromises.push(promise);
    }
    
    await Promise.all(batchPromises);
    console.log(`バッチ ${i + 1}/${batches} 完了: 成功=${successCount}, 失敗=${errorCount}`);
  }
  
  console.log('=== サンプルノート生成完了 ===');
  console.log(`合計: ${count} 件`);
  console.log(`成功: ${successCount} 件`);
  console.log(`失敗: ${errorCount} 件`);
}

/**
 * メイン処理
 */
async function main() {
  try {
    // コマンドライン引数からプロジェクトIDを取得
    const projectId = process.argv[2];
    
    // プロジェクトIDが指定されていない場合は最初のプロジェクトを使用
    const targetProjectId = projectId || (await getFirstProject()).id;
    
    // サンプルノートを生成
    await generateSampleNotes(targetProjectId);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの実行
main();
