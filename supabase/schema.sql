-- ============================================================
-- 麻雀ポイントトラッカー Supabase スキーマ (Next.js 版)
-- 使い方:
--   Supabase ダッシュボード > SQL Editor を開き、
--   このファイル全部を貼り付けて Run を押す。
-- ============================================================

-- 1. 設定テーブル (シングルロー: id=1 のみを使う)
create table if not exists public.config (
  id            integer primary key default 1,
  password_hash text    not null,
  players       jsonb   not null,           -- 例: ["A","B","C","D"]
  updated_at    timestamptz not null default now(),
  constraint config_singleton check (id = 1)
);

-- 2. 半荘テーブル
create table if not exists public.hanchans (
  id          text primary key,             -- クライアント生成のID
  date        timestamptz not null default now(),
  mode        text not null check (mode in ('yonma','sanma')),
  absent_idx  integer,                      -- sanma のみ。0..3 / yonma は null
  scores      jsonb not null,               -- [number,number,number,number]
  events      jsonb not null,               -- [{type, winner, discarder?, isTsumo}]
                                            --   type: 'ippatsu' | 'uradora' | 'menzen_aka' | 'yakuman'
  ranks       jsonb not null,               -- [number,number,number,number] (sanmaの休みは null)
  points      jsonb not null,               -- [number,number,number,number]
  created_at  timestamptz not null default now()
);

create index if not exists hanchans_date_idx on public.hanchans (date desc);

-- 3. RLS (Row Level Security)
--    アプリ内の合言葉で守る運用なので、
--    anon キーで読み書きを許可する単純ポリシーを敷く。
alter table public.config   enable row level security;
alter table public.hanchans enable row level security;

drop policy if exists "config_anon_all" on public.config;
create policy "config_anon_all" on public.config
  for all
  to anon
  using (true)
  with check (true);

drop policy if exists "hanchans_anon_all" on public.hanchans;
create policy "hanchans_anon_all" on public.hanchans
  for all
  to anon
  using (true)
  with check (true);

-- ============================================================
-- 完了!
-- 続いて Project Settings > API から
--   Project URL  と  anon public key
-- をコピーして .env.local に貼り付けてください。
-- ============================================================