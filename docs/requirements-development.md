# 要件定義書 - 開発ガイドライン

## コーディングガイドライン

### 1.1 コーディング規約
- TypeScriptの型定義を厳格に行う
- Biomeを使用したコード品質の維持
- コンポーネント設計はPresentational/Containerパターンに従う
- 関数宣言は`function`キーワードを使わず、`const`とアロー関数を使用する
  ```typescript
  // 推奨
  export const MyComponent = () => {
    // 実装
  };

  // 非推奨
  export function MyComponent() {
    // 実装
  }
  ```
- テスト駆動開発（TDD）の採用
  - Presentationalコンポーネントのテスト
    - Storybookのストーリーの作成
  - Containerコンポーネントのテスト
    - vitestによる単体テスト

### 1.2 ディレクトリ構造
```
/
├── frontend/
│   ├── .storybook/            # Storybook 設定
│   ├── public/                # 静的ファイル
│   └── src/                   # Next.js アプリディレクトリ
│       ├── app/               # アプリのエントリポイント (Next.js App Router 使用)
│       │   └── (pages/)       # 各ページのファイル (app router の規約に従う)
│       ├── components/        # 再利用可能な UI コンポーネント (アプリ全体で共有)
│       │   ├── ComponentName/ # 例: Button, Input, Header など
│       │   │   ├── index.tsx
│       │   │   └── ComponentName.stories.tsx
│       │   └── ...
│       ├── features/          # 特定の機能に関するコンポーネント、ロジック、ページ
│       │   ├── featureName/   # 例: auth, productList, checkout など
│       │   │   ├── components/      # 機能固有の Presentational Components
│       │   │   │   ├── ComponentName/
│       │   │   │   │   ├── index.tsx
│       │   │   │   │   └── ComponentName.stories.tsx
│       │   │   │   └── ...
│       │   │   ├── containers/     # 機能固有の Container Components (ロジックと状態管理)
│       │   │   │   ├── ContainerName/
│       │   │   │   │   ├── index.tsx
│       │   │   │   │   └── useContainerHook.ts  # コンテナ用のカスタムフック
│       │   │   │   └── ...
│       │   │   ├── hooks/          # 機能固有のカスタムフック
│       │   │   ├── types/          # 機能固有の型定義
│       │   │   └── utils/          # 機能固有のユーティリティ関数
│       │   └── ...
│       ├── hooks/             # アプリ全体で共有するカスタム React フック
│       ├── lib/               # 共有ユーティリティとライブラリ
│       ├── services/          # API サービスレイヤー (API クライアント、データ変換など)
│       └── utils/             # アプリ全体で共有するユーティリティ関数
└── docs/                 # プロジェクトドキュメント
```

### 1.3 開発フロー
- Gitブランチ戦略: GitHub Flow
- プルリクエスト必須
  - 一人で開発しているためセルフレビュー
- CIパイプラインによる自動テスト
- セマンティックバージョニングの採用

### 1.4 テスト戦略
- ユニットテスト: Vitest
- コンポーネントテスト: React Testing Library、Storybook
- E2Eテスト: PlayWright
- テストカバレッジ目標: 80%以上

## マイルストーンとリリース計画

### 2.1 フェーズ1: MVP（最小実用製品）
- Google OAuth
- 初回ログイン時にユーザ名のプロジェクトが自動作成
- ノート作成・編集機能
  - Tiptapを用いたエディタ
- タグ機能
  - 同じタグが付いたノートの表示
  - タグをクリックすることで、完全一致するノートに遷移する
  - タグの色変更
- PC/モバイル対応
- 画像ファイルの添付機能
  - 画像のアップロードと表示
  - Supabase Storageを使用したファイル保存
  - RLSによるアクセス制御

### 2.2 フェーズ2: 機能拡張
- ノート検索機能
- ノート削除機能
- ノート編集内容の自動保存
- プロジェクト作成・編集・アーカイブ・削除機能
- タグでの自動検索

### 2.3 フェーズ3: 洗練と最適化
- パフォーマンス最適化
- タグの自動補完
- ノート作成時に類似ノートが表示される
- タグのつながりをマップ表示する
- テンプレート機能
- 拡張ファイル添付機能
  - 動画ファイルのアップロードと再生
  - PDFファイルのアップロードとプレビュー
  - ファイル管理機能の強化
  - プロジェクトごとに1GBの容量制限
  - ファイル管理画面の実装（一覧表示、削除、メタデータ確認など）
- ユーザー設定
  - パスワードの変更
- ノートエクスポート
