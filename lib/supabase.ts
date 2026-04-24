// ============================================================
// Supabase クライアント
// .env.local の NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を使う
// ============================================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig, Hanchan } from './types';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = url.startsWith('http') && anon.length > 20;

let _client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  if (!isSupabaseConfigured) {
    throw new Error('Supabase が設定されていません。.env.local を確認してください。');
  }
  _client = createClient(url, anon);
  return _client;
}

// ===== config =====
export async function fetchConfig(): Promise<AppConfig | null> {
  const sb = getSupabase();
  const { data, error } = await sb.from('config').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { passwordHash: data.password_hash, players: data.players };
}

export async function saveConfig(c: AppConfig): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from('config').upsert(
    {
      id: 1,
      password_hash: c.passwordHash,
      players: c.players,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

// ===== hanchans =====
export async function fetchHanchans(): Promise<Hanchan[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('hanchans')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    date: r.date ? String(r.date).slice(0, 10) : '',
    mode: r.mode,
    absentIdx: r.absent_idx,
    scores: r.scores,
    events: r.events,
    ranks: r.ranks,
    points: r.points,
  }));
}

export async function insertHanchan(h: Hanchan): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from('hanchans').insert({
    id: h.id,
    date: h.date,
    mode: h.mode,
    absent_idx: h.absentIdx,
    scores: h.scores,
    events: h.events,
    ranks: h.ranks,
    points: h.points,
  });
  if (error) throw error;
}

export async function deleteHanchan(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from('hanchans').delete().eq('id', id);
  if (error) throw error;
}

export async function clearAll(): Promise<void> {
  const sb = getSupabase();
  const { error: e1 } = await sb.from('hanchans').delete().neq('id', '');
  if (e1) throw e1;
  const { error: e2 } = await sb.from('config').delete().eq('id', 1);
  if (e2) throw e2;
}