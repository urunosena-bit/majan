# 麻雀記録アプリ (Next.js + Supabase + Vercel 版)

友達4人で同じデータを共有できる麻雀ポイント記録アプリ。
スマホ4台それぞれから記録 → リアルタイムで同じ通算成績が見られます。

## ポイント仕様

| 項目 | 四人麻雀 | 三人麻雀 |
|---|---|---|
| 1位 | **+200pt** | **+100pt** |
| 2位 | 0 | 0 |
| 3位 | 0 | **−100pt** (最下位) |
| 4位 | **−200pt** (最下位) | (休み) |
| 一発・裏ドラ・面前赤 (ロン) | 放銃者が **−100pt** | 同左 |
| 一発・裏ドラ・面前赤 (ツモ) | あがった人以外 各 **−100pt** | 休み以外で各 **−100pt** |
| **役満（ご褒美）** | **あがった人に +1000pt** | **あがった人に +300pt** |

役満は「あがった人へのご褒美ボーナス」として加点のみ。他のプレイヤーへの罰則はなし。

---

## 技術スタック

- **Next.js 14** (App Router, TypeScript)
- **React 18** (Client Components)
- **Supabase** (Postgres + RLS)
- **Vercel** (デプロイ)

---

## ディレクトリ構成

```
majan_app/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # メインアプリ (全画面・全タブ)
│   └── globals.css         # スタイル
├── lib/
│   ├── types.ts            # TypeScript型定義
│   ├── supabase.ts         # Supabaseクライアント + CRUD
│   └── calc.ts             # 順位/ポイント計算ロジック (役満含む)
├── supabase/
│   └── schema.sql          # DBスキーマ (一度だけ実行)
├── package.json
├── tsconfig.json
├── next.config.mjs
├── .gitignore
├── .env.local.example
└── README.md
```

---

## セットアップ手順 (Ubuntu + VSCode)

### 1. このフォルダを VSCode で開く

```bash
cd /projects_app/majan_app
code .
```

### 2. 依存パッケージをインストール

VSCodeのターミナル (Ctrl+\`) で:

```bash
npm install
```

### 3. Supabase プロジェクトを用意

1. https://supabase.com/ にログイン → **New project**
2. 名前は `mahjong` 等、リージョンは Tokyo 推奨、無料プランでOK
3. 1〜2分でプロジェクト立ち上げ完了

### 4. テーブルを作る

1. 左メニュー → **SQL Editor** → **New query**
2. `supabase/schema.sql` を全部コピーして貼り付け
3. **Run** を押す。緑のチェックが出ればOK

### 5. APIキーを取ってくる

左メニュー一番下の **Project Settings (歯車)** → **API** から:
- **Project URL** (`https://xxxx.supabase.co`)
- **anon public** キー (`eyJ...` で始まる長い文字列)

の2つをコピー。

### 6. 環境変数を設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集 (VSCode上で開いて編集):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...(ペースト)
```

### 7. ローカルで動作確認

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。
最初のアクセスで共通パスワードを決め、4人の名前を入力して動作確認。

---

## GitHub にプッシュ

```bash
git init
git add .
git commit -m "initial commit: mahjong tracker"

# GitHubで新規リポジトリを作ってから:
git remote add origin https://github.com/<your-username>/mahjong-tracker.git
git branch -M main
git push -u origin main
```

`.env.local` は `.gitignore` で除外されているので Supabase のキーが GitHub に上がる心配はありません。

---

## Vercel にデプロイ

### 方法A: Vercel ダッシュボードから (推奨)

1. https://vercel.com/new にアクセス
2. **Import Git Repository** で先ほど作った GitHub リポジトリを選ぶ
3. Framework Preset は **Next.js** が自動検出される
4. **Environment Variables** を展開して、以下2つを追加:
   - `NEXT_PUBLIC_SUPABASE_URL` = (`.env.local` と同じ値)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (`.env.local` と同じ値)
5. **Deploy** を押す
6. 1〜2分で `https://mahjong-tracker-xxx.vercel.app` のURLが発行される

以後、`git push` するたびに自動で再デプロイされます。

### 方法B: Vercel CLI から

```bash
sudo npm install -g vercel
vercel login
vercel --prod
# 環境変数の追加プロンプトに従う
```

### 共有

発行されたURLを4人のグループに共有 → 全員同じデータを使えます。

---

## 使い方（アプリ内）

- **新規記録タブ**
  - モード切替（四人麻雀 / 三人麻雀）
  - 三麻なら「お休みの人」を選ぶ
  - 持ち点を入力（順位は自動計算）
  - イベント追加（一発・裏ドラ・面前赤・**役満**）
  - 「この半荘を保存」
- **履歴タブ**: 過去の半荘一覧（モードバッジ付き）。削除可能
- **成績タブ**:
  - 通算ランキング（累計ポイント順）
  - モード別 平均順位（四麻と三麻が両方ある場合）
  - 順位回数
  - **役満達成数とご褒美累計**
  - 累計持ち点
- **設定（右上）**: 名前変更、パスワード変更、データエクスポート/全削除、ログアウト

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| 起動時に「Supabase が設定されていません」 | `.env.local` を作って `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を入れる。`npm run dev` を再起動 |
| `npm install` で `EACCES` エラー | `sudo chown -R $USER /projects_app/majan_app` で所有権を直す |
| Vercel デプロイ後に画面が白い | Vercel の Environment Variables に2つの環境変数を入れ忘れ。設定して **Redeploy** |
| 「permission denied for table hanchans」 | `schema.sql` の RLS ポリシー作成箇所が走っていない。SQL Editor でもう一度全部実行 |
| パスワードを忘れた | Supabase の Table Editor で `config` テーブルの行を削除 → アプリで再ログインすると初回扱いになる |

---

## セキュリティについて（小さなグループ向け）

- Supabase の `anon key` はクライアント (ブラウザ) に埋め込まれるため、URLを知っていれば取得可能です
- パスワード判定はクライアント側で行うシンプル運用 = **URLを公開掲示板等に貼ると第三者でも読み書きできる**
- そのため、Vercel発行URLは **4人のクローズドな場 (LINE, Discord 等)** でのみ共有してください
- 漏洩した場合は Supabase ダッシュボードから anon key を再発行 → Vercel の環境変数を更新で対応可能

---

## 次の拡張アイデア

- 一発/裏ドラ/面前赤の **個数指定** (今は1イベント=1個)
- グラフ化 (累計ポイント推移を recharts で表示)
- PWA化 (ホーム画面にアプリとしてインストール)
- Supabase Realtime で他の端末の変更を即時反映
- 個人ログイン (パスワード共有ではなく、各自のメール認証)