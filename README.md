# UI Editor with SQLite

フォームビルダーとSQLiteデータベースを組み合わせたWebアプリケーションです。

## 機能

- **管理モード**: ドラッグ&ドロップでフォームを作成・編集
- **ユーザーモード**: 作成したフォームに入力し、SQLiteに保存
- **リアルタイムバリデーション**: 正規表現による入力検証
- **テーマ切り替え**: ブルー、グリーン、ダークテーマ
- **JSON入出力**: フォーム設定の保存・読み込み

## セットアップ

### 1. フロントエンド（React）

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm start
```

フロントエンドは http://localhost:3000 で起動します。

### 2. バックエンド（Node.js + SQLite）

```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

バックエンドは http://localhost:3001 で起動します。

## 使用方法

### 管理モード

1. 管理モードでフォームを設計
2. パレットからフィールドをドラッグ&ドロップ
3. フィールドの設定（ラベル、デフォルト値、バリデーションなど）
4. JSONで設定を保存・読み込み

### ユーザーモード

1. ユーザーモードに切り替え
2. フォームに入力
3. 送信ボタンをクリックしてSQLiteに保存
4. 保存されたデータを確認・削除

## API エンドポイント

- `POST /api/submit-form` - フォームデータを保存
- `GET /api/submissions` - 保存されたデータを取得
- `GET /api/submissions/:id` - 特定のデータを取得
- `DELETE /api/submissions/:id` - データを削除

## データベース

SQLiteデータベース（`form_data.db`）が自動的に作成されます。

### テーブル構造

```sql
CREATE TABLE form_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- CSS-in-JS

### バックエンド
- Node.js
- Express.js
- SQLite3
- CORS

## 開発

### ファイル構成

```
ui-editor/
├── src/
│   ├── components/
│   │   ├── AdminMode.tsx
│   │   ├── UserMode.tsx
│   │   └── SubmissionsList.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types.ts
│   ├── styles.ts
│   └── App.tsx
├── backend/
│   ├── server.js
│   └── package.json
└── README.md
```

### 環境変数

必要に応じて、以下の環境変数を設定できます：

- `PORT` - バックエンドのポート番号（デフォルト: 3001）
- `DB_PATH` - SQLiteデータベースのパス（デフォルト: ./form_data.db）

## トラブルシューティング

### バックエンドが起動しない場合

1. Node.jsがインストールされているか確認
2. バックエンドディレクトリで`npm install`を実行
3. ポート3001が使用可能か確認

### データが保存されない場合

1. バックエンドサーバーが起動しているか確認
2. ブラウザのコンソールでエラーを確認
3. ネットワークタブでAPIリクエストを確認

## ライセンス

Apache License
