const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// ミドルウェアの設定
app.use(cors());
app.use(bodyParser.json());

// SQLiteデータベースの初期化
const db = new sqlite3.Database('./form_data.db', (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log('SQLiteデータベースに接続しました');
    initDatabase();
  }
});

// データベースの初期化
function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('テーブル作成エラー:', err.message);
    } else {
      console.log('form_submissionsテーブルが作成されました');
    }
  });
}

// フォームデータを保存するAPI
app.post('/api/submit-form', (req, res) => {
  const formData = req.body;
  
  if (!formData) {
    return res.status(400).json({ error: 'フォームデータが必要です' });
  }

  const jsonData = JSON.stringify(formData);
  
  db.run(
    'INSERT INTO form_submissions (form_data) VALUES (?)',
    [jsonData],
    function(err) {
      if (err) {
        console.error('データ保存エラー:', err.message);
        return res.status(500).json({ error: 'データの保存に失敗しました' });
      }
      
      console.log(`フォームデータが保存されました。ID: ${this.lastID}`);
      res.json({ 
        success: true, 
        message: 'フォームデータが正常に保存されました',
        id: this.lastID 
      });
    }
  );
});

// 保存されたフォームデータを取得するAPI
app.get('/api/submissions', (req, res) => {
  db.all(
    'SELECT * FROM form_submissions ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        console.error('データ取得エラー:', err.message);
        return res.status(500).json({ error: 'データの取得に失敗しました' });
      }
      
      const submissions = rows.map(row => ({
        id: row.id,
        form_data: JSON.parse(row.form_data),
        created_at: row.created_at
      }));
      
      res.json(submissions);
    }
  );
});

// 既存のフォームデータを更新するAPI
app.put('/api/submissions/:id', (req, res) => {
  const id = req.params.id;
  const formData = req.body;

  if (!formData) {
    return res.status(400).json({ error: 'フォームデータが必要です' });
  }

  const jsonData = JSON.stringify(formData);

  db.run(
    'UPDATE form_submissions SET form_data = ? WHERE id = ?',
    [jsonData, id],
    function (err) {
      if (err) {
        console.error('データ更新エラー:', err.message);
        return res.status(500).json({ error: 'データの更新に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: '指定されたIDのデータが見つかりません' });
      }

      res.json({ success: true, message: 'データを更新しました', id: Number(id) });
    }
  );
});

// 特定のフォームデータを取得するAPI
app.get('/api/submissions/:id', (req, res) => {
  const id = req.params.id;
  
  db.get(
    'SELECT * FROM form_submissions WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('データ取得エラー:', err.message);
        return res.status(500).json({ error: 'データの取得に失敗しました' });
      }
      
      if (!row) {
        return res.status(404).json({ error: '指定されたIDのデータが見つかりません' });
      }
      
      res.json({
        id: row.id,
        form_data: JSON.parse(row.form_data),
        created_at: row.created_at
      });
    }
  );
});

// フォームデータを削除するAPI
app.delete('/api/submissions/:id', (req, res) => {
  const id = req.params.id;
  
  db.run(
    'DELETE FROM form_submissions WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        console.error('データ削除エラー:', err.message);
        return res.status(500).json({ error: 'データの削除に失敗しました' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: '指定されたIDのデータが見つかりません' });
      }
      
      res.json({ 
        success: true, 
        message: 'フォームデータが正常に削除されました' 
      });
    }
  );
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
  console.log(`APIエンドポイント: http://localhost:${PORT}/api`);
});

// アプリケーション終了時の処理
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('データベース接続終了エラー:', err.message);
    } else {
      console.log('データベース接続が正常に終了しました');
    }
    process.exit(0);
  });
});
