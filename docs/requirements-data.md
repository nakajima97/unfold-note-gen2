# 要件定義書 - データモデル

## データモデル

### 1.1 ユーザーモデル
```
User {
  id: string (primary key)
  email: string
  displayName: string
  avatarUrl: string (optional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 1.2 プロジェクトモデル
```
Project {
  id: string (primary key)
  name: string
  description: string (optional)
  ownerId: string (foreign key -> User.id)
  isArchived: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 1.3 ノートモデル
```
Note {
  id: string (primary key)
  title: string
  content: string (markdown)
  projectId: string (foreign key -> Project.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 1.4 タグモデル
```
Tag {
  id: string (primary key)
  name: string
  projectId: string (foreign key -> Project.id)
  createdAt: timestamp
}
```

### 1.5 ノートタグ関連モデル
```
NoteTag {
  noteId: string (foreign key -> Note.id)
  tagId: string (foreign key -> Tag.id)
  primary key (noteId, tagId)
}
```

### 1.6 ファイルモデル
```
File {
  id: string (primary key)
  originalName: string
  storagePath: string
  mimeType: string
  size: number
  noteId: string (foreign key -> Note.id)
  projectId: string (foreign key -> Project.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 1.7 許可メールモデル
```
AllowedEmail {
  id: string (primary key)
  email: string (unique)
  createdAt: timestamp
  createdBy: string (foreign key -> User.id, nullable)
}
```

### 1.8 データベース設計

#### 1.8.1 インデックス
- ユーザーテーブル: email列にユニークインデックス
- プロジェクトテーブル: ownerId列にインデックス
- ノートテーブル: projectId列にインデックス、title列にインデックス
- タグテーブル: name列とprojectId列の複合インデックス
- ファイルテーブル: noteId列とprojectId列にインデックス

#### 1.8.2 RLSポリシー（Row Level Security）
- **ユーザーテーブル**: 自分自身のデータのみ読み取り/更新可能
- **プロジェクトテーブル**: 所有者のみ読み取り/更新/削除可能
- **ノートテーブル**: プロジェクト所有者のみ読み取り/更新/削除可能
- **タグテーブル**: プロジェクト所有者のみ読み取り/更新/削除可能
- **ノートタグ関連テーブル**: プロジェクト所有者のみ読み取り/更新/削除可能
- **ファイルテーブル**: プロジェクト所有者のみ読み取り/更新/削除可能
- **許可メールテーブル**: 管理者ロールを持つユーザーのみ読み取り/作成/更新/削除可能
