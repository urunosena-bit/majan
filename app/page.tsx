'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  isSupabaseConfigured,
  fetchConfig,
  saveConfig,
  fetchHanchans,
  insertHanchan,
  deleteHanchan as deleteHanchanRemote,
  clearAll as clearAllRemote,
} from '@/lib/supabase';
import { calculatePoints, calculateRanks, djb2Hash, todayStr } from '@/lib/calc';
import {
  AppConfig,
  Hanchan,
  HanchanEvent,
  HanchanChip,
  EventType,
  ChipType,
  EVENT_LABELS,
  CHIP_LABELS,
  CHIP_VALUES,
  Mode,
} from '@/lib/types';

type Screen = 'boot' | 'login' | 'setup' | 'main';
type Tab = 'new' | 'history' | 'stats';

export default function Page() {
  // ===== 全体state =====
  const [screen, setScreen] = useState<Screen>('boot');
  const [tab, setTab] = useState<Tab>('new');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [hanchans, setHanchans] = useState<Hanchan[]>([]);
  const [syncStatus, setSyncStatus] = useState('');
  const [bootError, setBootError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const sync = useCallback((s: string, ms = 0) => {
    setSyncStatus(s);
    if (ms > 0) setTimeout(() => setSyncStatus((cur) => (cur === s ? '' : cur)), ms);
  }, []);

  const reload = useCallback(async () => {
    sync('同期中…');
    const [c, h] = await Promise.all([fetchConfig(), fetchHanchans()]);
    setConfig(c);
    setHanchans(h);
    sync('同期済', 1500);
  }, [sync]);

  // ===== 初期化 =====
  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured) {
        setBootError('not-configured');
        return;
      }
      try {
        await reload();
        setScreen('login');
      } catch (e: any) {
        setBootError(e?.message ?? String(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== ログイン =====
  const [loginPw, setLoginPw] = useState('');
  const [loginErr, setLoginErr] = useState('');

  async function handleLogin() {
    setLoginErr('');
    if (!loginPw) {
      setLoginErr('パスワードを入力してください');
      return;
    }
    try {
      await reload();
    } catch (e: any) {
      setLoginErr('接続エラー: ' + e.message);
      return;
    }
    if (!config) {
      // 初回 → setup
      const newCfg: AppConfig = { passwordHash: djb2Hash(loginPw), players: ['', '', '', ''] };
      try {
        await saveConfig(newCfg);
        setConfig(newCfg);
        setScreen('setup');
      } catch (e: any) {
        setLoginErr('保存エラー: ' + e.message);
      }
    } else {
      if (djb2Hash(loginPw) === config.passwordHash) {
        setScreen('main');
        setTab('new');
      } else {
        setLoginErr('パスワードが違います');
      }
    }
  }

  function handleLogout() {
    setLoginPw('');
    setLoginErr('');
    setScreen('login');
  }

  // ===== セットアップ =====
  const [setupNames, setSetupNames] = useState<string[]>(['', '', '', '']);
  useEffect(() => {
    if (screen === 'setup' && config) {
      setSetupNames([...config.players]);
    }
  }, [screen, config]);

  async function handleSaveSetup() {
    for (let i = 0; i < 4; i++) {
      if (!setupNames[i].trim()) {
        alert(`プレイヤー${i + 1}の名前を入力してください`);
        return;
      }
    }
    if (!config) return;
    const newCfg = { ...config, players: setupNames.map((s) => s.trim()) };
    try {
      await saveConfig(newCfg);
      setConfig(newCfg);
      setScreen('main');
      setTab('new');
    } catch (e: any) {
      alert('保存エラー: ' + e.message);
    }
  }

  // ===================================================
  // ===== boot / config-warning =====
  // ===================================================
  if (bootError === 'not-configured') {
    return (
      <div className="config-warning">
        <strong>Supabase が設定されていません</strong>
        <br />
        プロジェクト直下に <code>.env.local</code> を作成し、
        <br />
        <code>NEXT_PUBLIC_SUPABASE_URL</code> と <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> を入れてください。
        <br />
        詳しくは README.md を参照。
      </div>
    );
  }
  if (bootError) {
    return (
      <div className="config-warning">
        <strong>接続エラー</strong>
        <br />
        {bootError}
        <br />
        Supabase の URL / anon key が正しいか確認してください。
      </div>
    );
  }
  if (screen === 'boot') {
    return (
      <div className="loading">
        <div className="spinner" />
        接続中…
      </div>
    );
  }

  // ===================================================
  // ===== ログイン画面 =====
  // ===================================================
  if (screen === 'login') {
    const isFirst = !config;
    return (
      <div className="container">
        <div className="login-box">
          <h2>麻雀記録</h2>
          <div className="form-group">
            <label>共通パスワード</label>
            <input
              type="password"
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              placeholder="パスワードを入力"
              autoComplete="current-password"
            />
          </div>
          <button className="btn btn-primary btn-block" onClick={handleLogin}>
            ログイン
          </button>
          <p className="text-center mt-3" style={{ color: '#c53030', minHeight: '1.2em' }}>
            {loginErr}
          </p>
          {isFirst && <p className="text-center text-muted mt-3">※ 初回はパスワードを設定します</p>}
        </div>
      </div>
    );
  }

  // ===================================================
  // ===== セットアップ画面 =====
  // ===================================================
  if (screen === 'setup') {
    return (
      <div className="container">
        <div className="login-box">
          <h2>初期設定</h2>
          <p className="text-muted text-center mt-2 mb-2">
            プレイヤー4人の名前を入力してください
            <br />
            (三麻ではこの中から3人を選びます)
          </p>
          <div className="mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div className="form-group" key={i}>
                <label>プレイヤー{i + 1}</label>
                <input
                  type="text"
                  value={setupNames[i]}
                  onChange={(e) => {
                    const a = [...setupNames];
                    a[i] = e.target.value;
                    setSetupNames(a);
                  }}
                  placeholder="名前を入力"
                />
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-block mt-3" onClick={handleSaveSetup}>
            保存して開始
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // ===== メイン画面 =====
  // ===================================================
  if (!config) return null;

  return (
    <>
      <div className="header">
        <h1>麻雀記録</h1>
        <span className="sync-indicator">{syncStatus}</span>
        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          設定
        </button>
      </div>
      <div className="tabs">
        {(['new', 'history', 'stats'] as Tab[]).map((t) => (
          <button
            key={t}
            className={'tab' + (tab === t ? ' active' : '')}
            onClick={async () => {
              setTab(t);
              if (t !== 'new') {
                try {
                  await reload();
                } catch {}
              }
            }}
          >
            {t === 'new' ? '新規記録' : t === 'history' ? '履歴' : '成績'}
          </button>
        ))}
      </div>
      <div className="container">
        {tab === 'new' && (
          <NewHanchanTab
            config={config}
            onSaved={async (h) => {
              try {
                await insertHanchan(h);
                setHanchans((prev) => [h, ...prev]);
                alert('保存しました');
                setTab('history');
                sync('保存済', 1500);
              } catch (e: any) {
                alert('保存エラー: ' + e.message);
              }
            }}
            sync={sync}
          />
        )}
        {tab === 'history' && (
          <HistoryTab
            config={config}
            hanchans={hanchans}
            onDelete={async (id) => {
              if (!confirm('この半荘を削除しますか？')) return;
              try {
                await deleteHanchanRemote(id);
                setHanchans((prev) => prev.filter((h) => h.id !== id));
              } catch (e: any) {
                alert('削除エラー: ' + e.message);
              }
            }}
          />
        )}
        {tab === 'stats' && <StatsTab config={config} hanchans={hanchans} />}
      </div>

      {showSettings && (
        <SettingsModal
          config={config}
          onClose={() => setShowSettings(false)}
          onSaved={async (newCfg) => {
            try {
              await saveConfig(newCfg);
              setConfig(newCfg);
              setShowSettings(false);
              alert('設定を保存しました');
            } catch (e: any) {
              alert('保存エラー: ' + e.message);
            }
          }}
          onLogout={() => {
            setShowSettings(false);
            handleLogout();
          }}
          onClearAll={async () => {
            if (!confirm('全データを完全に削除します。よろしいですか？')) return;
            if (!confirm('本当に削除しますか？元に戻せません。')) return;
            try {
              await clearAllRemote();
              setConfig(null);
              setHanchans([]);
              setShowSettings(false);
              setScreen('login');
              setLoginPw('');
            } catch (e: any) {
              alert('削除エラー: ' + e.message);
            }
          }}
          onExport={() => {
            const blob = new Blob(
              [JSON.stringify({ config, hanchans }, null, 2)],
              { type: 'application/json' }
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mahjong-data-${todayStr()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        />
      )}
    </>
  );
}

// ============================================================
// 新規記録タブ
// ============================================================
function NewHanchanTab({
  config,
  onSaved,
  sync,
}: {
  config: AppConfig;
  onSaved: (h: Hanchan) => Promise<void>;
  sync: (s: string, ms?: number) => void;
}) {
  const [mode, setMode] = useState<Mode>('yonma');
  const [absentIdx, setAbsentIdx] = useState(3);
  const [scores, setScores] = useState<number[]>([25000, 25000, 25000, 25000]);
  const [events, setEvents] = useState<HanchanEvent[]>([]);
  const [chips, setChips] = useState<HanchanChip[]>([]);
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  const activeIndices = (): number[] =>
    mode === 'sanma' ? [0, 1, 2, 3].filter((i) => i !== absentIdx) : [0, 1, 2, 3];

  function changeMode(next: Mode) {
    if ((events.length > 0 || chips.length > 0) && next !== mode) {
      if (!confirm('モードを変更すると入力済みのイベント・チップがクリアされます。よろしいですか？')) return;
    }
    setMode(next);
    setEvents([]);
    setChips([]);
    if (next === 'sanma') {
      const s = [35000, 35000, 35000, 35000];
      s[absentIdx] = 0;
      setScores(s);
    } else {
      setScores([25000, 25000, 25000, 25000]);
    }
  }

  function changeAbsent(idx: number) {
    if (events.length > 0 || chips.length > 0) {
      if (!confirm('お休みの人を変更すると入力済みのイベント・チップがクリアされます。よろしいですか？')) return;
      setEvents([]);
      setChips([]);
    }
    setAbsentIdx(idx);
    const s = [35000, 35000, 35000, 35000];
    s[idx] = 0;
    setScores(s);
  }

  function setScoreAt(i: number, v: number) {
    const s = [...scores];
    s[i] = v;
    setScores(s);
  }

  function addEvent() {
    const active = activeIndices();
    const winner = active[0];
    const discarder = active.find((i) => i !== winner);
    setEvents([...events, { type: 'ippatsu', winner, isTsumo: false, discarder, count: 1 }]);
  }

  function removeEvent(idx: number) {
    setEvents(events.filter((_, i) => i !== idx));
  }

  function updateEvent(idx: number, patch: Partial<HanchanEvent>) {
    const next = events.map((e, i) => (i === idx ? { ...e, ...patch } : e));
    // winner変更時/ツモ切替時に discarder を整合
    const ev = next[idx];
    const active = activeIndices();
    if (!ev.isTsumo) {
      if (typeof ev.discarder !== 'number' || ev.discarder === ev.winner || !active.includes(ev.discarder)) {
        ev.discarder = active.find((i) => i !== ev.winner);
      }
    }
    setEvents(next);
  }

  // ===== チップ操作 =====
  function addChip() {
    const active = activeIndices();
    setChips([...chips, { type: 'chombo', target: active[0] }]);
  }
  function removeChip(idx: number) {
    setChips(chips.filter((_, i) => i !== idx));
  }
  function updateChip(idx: number, patch: Partial<HanchanChip>) {
    setChips(chips.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  const ranks = calculateRanks(scores, mode, mode === 'sanma' ? absentIdx : null);
  const { points } = calculatePoints(
    scores,
    events,
    mode,
    mode === 'sanma' ? absentIdx : null,
    chips
  );
  const active = activeIndices();
  const sumScore = active.reduce((s, i) => s + scores[i], 0);
  const expectedSum = mode === 'sanma' ? 105000 : 100000;
  const sumDiff = sumScore - expectedSum;

  async function handleSave() {
    if (saving) return;
    const modeText = mode === 'sanma' ? '三麻' : '四麻';
    if (!confirm(`この半荘(${modeText})を保存しますか？\n合計持ち点: ${sumScore.toLocaleString()}`)) return;
    const savedScores: (number | null)[] = [...scores];
    if (mode === 'sanma') savedScores[absentIdx] = null;
    const h: Hanchan = {
      id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 7),
      date,
      mode,
      absentIdx: mode === 'sanma' ? absentIdx : null,
      scores: savedScores,
      events: JSON.parse(JSON.stringify(events)),
      chips: JSON.parse(JSON.stringify(chips)),
      ranks,
      points,
    };
    setSaving(true);
    sync('保存中…');
    try {
      await onSaved(h);
      // 入力をリセット
      setMode('yonma');
      setAbsentIdx(3);
      setScores([25000, 25000, 25000, 25000]);
      setEvents([]);
      setChips([]);
      setDate(todayStr());
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-title">対局モード</div>
        <div className="mode-toggle">
          <button
            className={'mode-btn' + (mode === 'yonma' ? ' active' : '')}
            onClick={() => changeMode('yonma')}
          >
            四人麻雀
          </button>
          <button
            className={'mode-btn' + (mode === 'sanma' ? ' active' : '')}
            onClick={() => changeMode('sanma')}
          >
            三人麻雀
          </button>
        </div>
        {mode === 'sanma' && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>お休みの人</label>
            <select value={absentIdx} onChange={(e) => changeAbsent(parseInt(e.target.value))}>
              {config.players.map((p, i) => (
                <option key={i} value={i}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>日付</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="card-title">最終持ち点</div>
        {[0, 1, 2, 3].map((i) => {
          const isAbsent = mode === 'sanma' && i === absentIdx;
          return (
            <div key={i} className={'score-row' + (isAbsent ? ' absent' : '')}>
              <span className="player-name">{config.players[i]}</span>
              {isAbsent ? (
                <>
                  <span className="text-muted text-center">休み</span>
                  <span className="rank-badge rank-absent">−</span>
                </>
              ) : (
                <>
                  <input
                    type="number"
                    className="score-input"
                    value={scores[i]}
                    step={100}
                    inputMode="numeric"
                    onChange={(e) => {
                      // マイナス値を許可。空欄は0扱い
                      const v = e.target.value;
                      if (v === '' || v === '-') {
                        setScoreAt(i, 0);
                      } else {
                        const n = parseInt(v, 10);
                        setScoreAt(i, Number.isNaN(n) ? 0 : n);
                      }
                    }}
                  />
                  <span className={`rank-badge rank-${ranks[i]}`}>{ranks[i]}</span>
                </>
              )}
            </div>
          );
        })}
        <div className="text-muted text-center mt-3">
          合計: {sumScore.toLocaleString()}点
          {sumDiff !== 0 && (
            <>
              {' '}(基準{expectedSum.toLocaleString()}との差: {sumDiff > 0 ? '+' : ''}
              {sumDiff.toLocaleString()})
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">役イベント</div>
        <p className="text-muted mb-2">
          一発・裏ドラ・面前赤: ロン→放銃者-100 / ツモ→他全員-100ずつ
          <br />
          <strong style={{ color: '#b7791f' }}>役満: あがった人にご褒美 +1000 (三麻は +300)</strong>
        </p>
        {events.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '16px 0' }}>
            イベントなし
          </p>
        ) : (
          events.map((ev, idx) => (
            <div key={idx} className={'event-item' + (ev.type === 'yakuman' ? ' yakuman' : '')}>
              <div className="event-grid">
                <div>
                  <label>役</label>
                  <select
                    value={ev.type}
                    onChange={(e) => updateEvent(idx, { type: e.target.value as EventType })}
                  >
                    {(Object.keys(EVENT_LABELS) as EventType[]).map((k) => (
                      <option key={k} value={k}>
                        {EVENT_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>あがった人</label>
                  <select
                    value={ev.winner}
                    onChange={(e) => updateEvent(idx, { winner: parseInt(e.target.value) })}
                  >
                    {active.map((i) => (
                      <option key={i} value={i}>
                        {config.players[i]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>あがり方</label>
                  <select
                    value={ev.isTsumo ? 'tsumo' : 'ron'}
                    onChange={(e) => updateEvent(idx, { isTsumo: e.target.value === 'tsumo' })}
                  >
                    <option value="ron">ロン</option>
                    <option value="tsumo">ツモ</option>
                  </select>
                </div>
                {!ev.isTsumo && ev.type !== 'yakuman' && (
                  <div>
                    <label>放銃者</label>
                    <select
                      value={ev.discarder ?? active.find((i) => i !== ev.winner) ?? 0}
                      onChange={(e) => updateEvent(idx, { discarder: parseInt(e.target.value) })}
                    >
                      {active
                        .filter((i) => i !== ev.winner)
                        .map((i) => (
                          <option key={i} value={i}>
                            {config.players[i]}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <div>
                  <label>個数</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={ev.count ?? 1}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      updateEvent(idx, { count: Number.isNaN(n) || n < 1 ? 1 : n });
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              {ev.type === 'yakuman' ? (
                <div className="yakuman-bonus-note">
                  ご褒美: {config.players[ev.winner]} に +
                  {(mode === 'sanma' ? 300 : 1000) * (ev.count ?? 1)}pt
                  {(ev.count ?? 1) > 1 && ` (×${ev.count})`}
                </div>
              ) : (
                (ev.count ?? 1) > 1 && (
                  <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: 6 }}>
                    {EVENT_LABELS[ev.type]} × {ev.count} → {ev.isTsumo ? '他全員' : '放銃者'}が
                    -{100 * (ev.count ?? 1)}pt
                  </div>
                )
              )}
              <div className="event-actions">
                <button className="btn btn-danger btn-sm" onClick={() => removeEvent(idx)}>
                  削除
                </button>
              </div>
            </div>
          ))
        )}
        <button className="btn btn-secondary btn-sm mt-3" onClick={addEvent}>
          ＋ イベント追加
        </button>
      </div>

      <div className="card">
        <div className="card-title">チップ (罰金)</div>
        <p className="text-muted mb-2">
          チョンボ -100 / NGワード -100 / 飛び -200
        </p>
        {chips.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '16px 0' }}>
            チップなし
          </p>
        ) : (
          chips.map((c, idx) => (
            <div key={idx} className="event-item">
              <div className="event-grid">
                <div>
                  <label>種別</label>
                  <select
                    value={c.type}
                    onChange={(e) => updateChip(idx, { type: e.target.value as ChipType })}
                  >
                    {(Object.keys(CHIP_LABELS) as ChipType[]).map((k) => (
                      <option key={k} value={k}>
                        {CHIP_LABELS[k]} ({CHIP_VALUES[k]}pt)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>対象</label>
                  <select
                    value={c.target}
                    onChange={(e) => updateChip(idx, { target: parseInt(e.target.value) })}
                  >
                    {active.map((i) => (
                      <option key={i} value={i}>
                        {config.players[i]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: 6 }}>
                {config.players[c.target]} に {CHIP_VALUES[c.type]}pt
              </div>
              <div className="event-actions">
                <button className="btn btn-danger btn-sm" onClick={() => removeChip(idx)}>
                  削除
                </button>
              </div>
            </div>
          ))
        )}
        <button className="btn btn-secondary btn-sm mt-3" onClick={addChip}>
          ＋ チップ追加
        </button>
      </div>

      <div className="card">
        <div className="card-title">この半荘のポイント</div>
        <div className="history-results">
          {[0, 1, 2, 3].map((i) => {
            const isAbsent = mode === 'sanma' && i === absentIdx;
            if (isAbsent) {
              return (
                <div key={i} className="history-player absent">
                  <div className="name">{config.players[i]}</div>
                  <div className="score">休み</div>
                  <div className="points points-zero">0pt</div>
                </div>
              );
            }
            const cls =
              points[i] > 0 ? 'points-pos' : points[i] < 0 ? 'points-neg' : 'points-zero';
            const sign = points[i] > 0 ? '+' : '';
            return (
              <div key={i} className="history-player">
                <div className="name">{config.players[i]}</div>
                <div className="score">{ranks[i]}位</div>
                <div className={`points ${cls}`}>
                  {sign}
                  {points[i]}pt
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="btn btn-primary btn-block mt-3"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? '保存中…' : 'この半荘を保存'}
      </button>
      <div style={{ height: 60 }} />
    </>
  );
}

// ============================================================
// 履歴タブ
// ============================================================
function HistoryTab({
  config,
  hanchans,
  onDelete,
}: {
  config: AppConfig;
  hanchans: Hanchan[];
  onDelete: (id: string) => Promise<void>;
}) {
  if (hanchans.length === 0) return <div className="empty">まだ記録がありません</div>;

  const sorted = [...hanchans].sort((a, b) => String(b.id).localeCompare(String(a.id)));

  return (
    <>
      {sorted.map((h) => {
        const mode = h.mode || 'yonma';
        return (
          <div key={h.id} className="history-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="history-date">{h.date}</span>
                <span className={'history-mode-badge' + (mode === 'sanma' ? ' sanma' : '')}>
                  {mode === 'sanma' ? '三麻' : '四麻'}
                </span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(h.id)}>
                削除
              </button>
            </div>
            <div className="history-results">
              {[0, 1, 2, 3].map((i) => {
                const isAbsent = mode === 'sanma' && i === h.absentIdx;
                if (isAbsent) {
                  return (
                    <div key={i} className="history-player absent">
                      <div className="name">{config.players[i]}</div>
                      <div className="score">休み</div>
                      <div className="points points-zero">−</div>
                    </div>
                  );
                }
                const cls =
                  h.points[i] > 0 ? 'points-pos' : h.points[i] < 0 ? 'points-neg' : 'points-zero';
                const sign = h.points[i] > 0 ? '+' : '';
                return (
                  <div key={i} className="history-player">
                    <div className="name">{config.players[i]}</div>
                    <div className="score">{(h.scores[i] ?? 0).toLocaleString()}</div>
                    <div className={`points ${cls}`}>
                      {h.ranks[i]}位 {sign}
                      {h.points[i]}pt
                    </div>
                  </div>
                );
              })}
            </div>
            {h.events && h.events.length > 0 && (
              <div className="text-muted mt-3" style={{ fontSize: '0.82rem' }}>
                イベント:{' '}
                {h.events
                  .map((e) => {
                    const winner = config.players[e.winner];
                    const cnt = e.count ?? 1;
                    const cntStr = cnt > 1 ? `×${cnt}` : '';
                    if (e.type === 'yakuman') {
                      return `${EVENT_LABELS[e.type]}${cntStr}(${winner}・${e.isTsumo ? 'ツモ' : 'ロン'}) ご褒美`;
                    }
                    if (e.isTsumo) return `${EVENT_LABELS[e.type]}${cntStr}(${winner}・ツモ)`;
                    return `${EVENT_LABELS[e.type]}${cntStr}(${winner}←${
                      typeof e.discarder === 'number' ? config.players[e.discarder] : '?'
                    })`;
                  })
                  .join(' / ')}
              </div>
            )}
            {h.chips && h.chips.length > 0 && (
              <div className="text-muted mt-2" style={{ fontSize: '0.82rem' }}>
                チップ:{' '}
                {h.chips
                  .map((c) => `${CHIP_LABELS[c.type]}(${config.players[c.target]} ${CHIP_VALUES[c.type]}pt)`)
                  .join(' / ')}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

// ============================================================
// 成績タブ
// ============================================================
function StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[] }) {
  // ===== 3麻/4麻 切替フィルタ =====
  const [rankingMode, setRankingMode] = useState<'all' | 'yonma' | 'sanma'>('all');

  if (hanchans.length === 0) return <div className="empty">まだ記録がありません</div>;

  // モードフィルタ適用
  const viewHanchans = hanchans.filter((h) => {
    const m = h.mode || 'yonma';
    if (rankingMode === 'all') return true;
    return m === rankingMode;
  });

  type Row = {
    name: string;
    idx: number;
    totalPoints: number;       // 累計ポイント (プラス・マイナス全部)
    paidPoints: number;        // 支払ポイント (マイナス成分の合計、負の値)
    totalScore: number;
    rankCounts: number[];
    hanchanCount: number;
    yonmaCount: number;
    sanmaCount: number;
    yonmaRankSum: number;
    sanmaRankSum: number;
    yakumanYonma: number;
    yakumanSanma: number;
  };

  const stats: Row[] = config.players.map((name, i) => ({
    name,
    idx: i,
    totalPoints: 0,
    paidPoints: 0,
    totalScore: 0,
    rankCounts: [0, 0, 0, 0],
    hanchanCount: 0,
    yonmaCount: 0,
    sanmaCount: 0,
    yonmaRankSum: 0,
    sanmaRankSum: 0,
    yakumanYonma: 0,
    yakumanSanma: 0,
  }));

  let totalYonma = 0;
  let totalSanma = 0;

  viewHanchans.forEach((h) => {
    const mode = h.mode || 'yonma';
    if (mode === 'yonma') totalYonma++;
    else totalSanma++;
    for (let i = 0; i < 4; i++) {
      const isAbsent = mode === 'sanma' && i === h.absentIdx;
      if (isAbsent) continue;
      const pt = h.points[i] ?? 0;
      stats[i].totalPoints += pt;
      if (pt < 0) stats[i].paidPoints += pt; // マイナス成分のみ蓄積
      stats[i].totalScore += (h.scores[i] as number) || 0;
      const r = h.ranks[i];
      if (r) stats[i].rankCounts[r - 1]++;
      stats[i].hanchanCount++;
      if (mode === 'yonma') {
        stats[i].yonmaCount++;
        if (r) stats[i].yonmaRankSum += r;
      } else {
        stats[i].sanmaCount++;
        if (r) stats[i].sanmaRankSum += r;
      }
    }
    (h.events || []).forEach((ev) => {
      if (ev.type === 'yakuman' && typeof ev.winner === 'number') {
        const cnt = ev.count ?? 1;
        if (mode === 'sanma') stats[ev.winner].yakumanSanma += cnt;
        else stats[ev.winner].yakumanYonma += cnt;
      }
    });
  });

  const avgRank = (s: Row) =>
    s.hanchanCount > 0 ? (s.yonmaRankSum + s.sanmaRankSum) / s.hanchanCount : 0;
  const yonmaAvg = (s: Row) => (s.yonmaCount > 0 ? s.yonmaRankSum / s.yonmaCount : 0);
  const sanmaAvg = (s: Row) => (s.sanmaCount > 0 ? s.sanmaRankSum / s.sanmaCount : 0);

  const sorted = [...stats].sort((a, b) => b.totalPoints - a.totalPoints);

  const modeLabel =
    rankingMode === 'yonma' ? '四麻' : rankingMode === 'sanma' ? '三麻' : '全モード';

  return (
    <>
      {/* ===== モード切替 ===== */}
      <div className="card">
        <div className="card-title">集計モード</div>
        <div className="mode-toggle">
          <button
            className={'mode-btn' + (rankingMode === 'all' ? ' active' : '')}
            onClick={() => setRankingMode('all')}
          >
            全部
          </button>
          <button
            className={'mode-btn' + (rankingMode === 'yonma' ? ' active' : '')}
            onClick={() => setRankingMode('yonma')}
          >
            四麻のみ
          </button>
          <button
            className={'mode-btn' + (rankingMode === 'sanma' ? ' active' : '')}
            onClick={() => setRankingMode('sanma')}
          >
            三麻のみ
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          通算ランキング [{modeLabel}] (四麻{totalYonma} / 三麻{totalSanma})
        </div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>順位</th>
              <th>名前</th>
              <th>累計pt</th>
              <th>支払pt</th>
              <th>差分</th>
              <th>平均順位</th>
              <th>半荘数</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, idx) => {
              const cls =
                s.totalPoints > 0 ? 'points-pos' : s.totalPoints < 0 ? 'points-neg' : 'points-zero';
              const sign = s.totalPoints > 0 ? '+' : '';
              // 差分 = 累計 - 支払 = 受け取った分(プラス成分の合計)
              const diff = s.totalPoints - s.paidPoints;
              const diffCls = diff > 0 ? 'points-pos' : diff < 0 ? 'points-neg' : 'points-zero';
              const diffSign = diff > 0 ? '+' : '';
              const paidCls = s.paidPoints < 0 ? 'points-neg' : 'points-zero';
              return (
                <tr key={s.idx} className={idx === 0 ? 'stats-rank-1' : ''}>
                  <td>{idx + 1}</td>
                  <td>{s.name}</td>
                  <td className={cls}>
                    {sign}
                    {s.totalPoints}
                  </td>
                  <td className={paidCls}>{s.paidPoints}</td>
                  <td className={diffCls}>
                    {diffSign}
                    {diff}
                  </td>
                  <td>{avgRank(s).toFixed(2)}</td>
                  <td>{s.hanchanCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-muted mt-2" style={{ fontSize: '0.78rem' }}>
          ※ 累計pt = 全半荘の合計 / 支払pt = マイナスで終わった半荘の合計 / 差分 = 累計 − 支払 (受取分の合計)
        </p>
      </div>

      {totalSanma > 0 && totalYonma > 0 && (
        <div className="card">
          <div className="card-title">モード別 平均順位</div>
          <table className="stats-table">
            <thead>
              <tr>
                <th>名前</th>
                <th>四麻 平均順位</th>
                <th>三麻 平均順位</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.idx}>
                  <td>{s.name}</td>
                  <td>{s.yonmaCount > 0 ? `${yonmaAvg(s).toFixed(2)} (${s.yonmaCount})` : '−'}</td>
                  <td>{s.sanmaCount > 0 ? `${sanmaAvg(s).toFixed(2)} (${s.sanmaCount})` : '−'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-title">順位回数</div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>名前</th>
              <th>1位</th>
              <th>2位</th>
              <th>3位</th>
              <th>4位</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.idx}>
                <td>{s.name}</td>
                <td>{s.rankCounts[0]}</td>
                <td>{s.rankCounts[1]}</td>
                <td>{s.rankCounts[2]}</td>
                <td>{s.rankCounts[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">役満達成数（ご褒美）</div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>名前</th>
              <th>四麻役満</th>
              <th>三麻役満</th>
              <th>ご褒美累計</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => {
              const bonus = s.yakumanYonma * 1000 + s.yakumanSanma * 300;
              const cls = bonus > 0 ? 'points-pos' : 'points-zero';
              return (
                <tr key={s.idx}>
                  <td>{s.name}</td>
                  <td>{s.yakumanYonma}</td>
                  <td>{s.yakumanSanma}</td>
                  <td className={cls}>{bonus > 0 ? `+${bonus}` : '−'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">累計持ち点（参加半荘合計）</div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>名前</th>
              <th>合計持ち点</th>
              <th>1半荘平均</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => {
              const avg = s.hanchanCount > 0 ? Math.round(s.totalScore / s.hanchanCount) : 0;
              return (
                <tr key={s.idx}>
                  <td>{s.name}</td>
                  <td>{s.totalScore.toLocaleString()}</td>
                  <td>{avg.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ============================================================
// 設定モーダル
// ============================================================
function SettingsModal({
  config,
  onClose,
  onSaved,
  onLogout,
  onClearAll,
  onExport,
}: {
  config: AppConfig;
  onClose: () => void;
  onSaved: (c: AppConfig) => Promise<void>;
  onLogout: () => void;
  onClearAll: () => Promise<void>;
  onExport: () => void;
}) {
  const [names, setNames] = useState([...config.players]);
  const [newPw, setNewPw] = useState('');

  async function handleSave() {
    for (let i = 0; i < 4; i++) {
      if (!names[i].trim()) {
        alert(`プレイヤー${i + 1}の名前を入力してください`);
        return;
      }
    }
    const next: AppConfig = {
      passwordHash: newPw ? djb2Hash(newPw) : config.passwordHash,
      players: names.map((s) => s.trim()),
    };
    await onSaved(next);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>設定</h3>
        <div className="card-title">プレイヤー名</div>
        {[0, 1, 2, 3].map((i) => (
          <div className="form-group" key={i}>
            <label>プレイヤー{i + 1}</label>
            <input
              type="text"
              value={names[i]}
              onChange={(e) => {
                const a = [...names];
                a[i] = e.target.value;
                setNames(a);
              }}
            />
          </div>
        ))}
        <div className="card-title mt-4">パスワード変更</div>
        <div className="form-group">
          <label>新しいパスワード（空欄なら変更なし）</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
        </div>
        <div className="card-title mt-4">データ管理</div>
        <button className="btn btn-secondary btn-block mt-2" onClick={onExport}>
          データをエクスポート(JSON)
        </button>
        <button className="btn btn-danger btn-block mt-3" onClick={onClearAll}>
          全データを削除
        </button>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            キャンセル
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            名前/パスワード保存
          </button>
        </div>
        <button className="btn btn-secondary btn-block mt-4" onClick={onLogout}>
          ログアウト
        </button>
      </div>
    </div>
  );
}
