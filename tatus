[1mdiff --git a/README.md b/README.md[m
[1mindex b770f89..fc06a8d 100644[m
[1m--- a/README.md[m
[1m+++ b/README.md[m
[36m@@ -121,7 +121,7 @@[m [mgit add .[m
 git commit -m "initial commit: mahjong tracker"[m
 [m
 # GitHubで新規リポジトリを作ってから:[m
[31m-git remote add origin https://github.com/<your-username>/mahjong-tracker.git[m
[32m+[m[32mgit remote add origin https://github.com/<urunosena-bit>/mahjong-tracker.git[m
 git branch -M main[m
 git push -u origin main[m
 ```[m
[1mdiff --git a/app/page.tsx b/app/page.tsx[m
[1mindex dad6d87..4cd718c 100644[m
[1m--- a/app/page.tsx[m
[1m+++ b/app/page.tsx[m
[36m@@ -15,8 +15,12 @@[m [mimport {[m
   AppConfig,[m
   Hanchan,[m
   HanchanEvent,[m
[32m+[m[32m  HanchanChip,[m
   EventType,[m
[32m+[m[32m  ChipType,[m
   EVENT_LABELS,[m
[32m+[m[32m  CHIP_LABELS,[m
[32m+[m[32m  CHIP_VALUES,[m
   Mode,[m
 } from '@/lib/types';[m
 [m
[36m@@ -376,6 +380,7 @@[m [mfunction NewHanchanTab({[m
   const [absentIdx, setAbsentIdx] = useState(3);[m
   const [scores, setScores] = useState<number[]>([25000, 25000, 25000, 25000]);[m
   const [events, setEvents] = useState<HanchanEvent[]>([]);[m
[32m+[m[32m  const [chips, setChips] = useState<HanchanChip[]>([]);[m
   const [date, setDate] = useState(todayStr());[m
   const [saving, setSaving] = useState(false);[m
 [m
[36m@@ -383,11 +388,12 @@[m [mfunction NewHanchanTab({[m
     mode === 'sanma' ? [0, 1, 2, 3].filter((i) => i !== absentIdx) : [0, 1, 2, 3];[m
 [m
   function changeMode(next: Mode) {[m
[31m-    if (events.length > 0 && next !== mode) {[m
[31m-      if (!confirm('モードを変更すると入力済みのイベントがクリアされます。よろしいですか？')) return;[m
[32m+[m[32m    if ((events.length > 0 || chips.length > 0) && next !== mode) {[m
[32m+[m[32m      if (!confirm('モードを変更すると入力済みのイベント・チップがクリアされます。よろしいですか？')) return;[m
     }[m
     setMode(next);[m
     setEvents([]);[m
[32m+[m[32m    setChips([]);[m
     if (next === 'sanma') {[m
       const s = [35000, 35000, 35000, 35000];[m
       s[absentIdx] = 0;[m
[36m@@ -398,9 +404,10 @@[m [mfunction NewHanchanTab({[m
   }[m
 [m
   function changeAbsent(idx: number) {[m
[31m-    if (events.length > 0) {[m
[31m-      if (!confirm('お休みの人を変更すると入力済みのイベントがクリアされます。よろしいですか？')) return;[m
[32m+[m[32m    if (events.length > 0 || chips.length > 0) {[m
[32m+[m[32m      if (!confirm('お休みの人を変更すると入力済みのイベント・チップがクリアされます。よろしいですか？')) return;[m
       setEvents([]);[m
[32m+[m[32m      setChips([]);[m
     }[m
     setAbsentIdx(idx);[m
     const s = [35000, 35000, 35000, 35000];[m
[36m@@ -418,7 +425,7 @@[m [mfunction NewHanchanTab({[m
     const active = activeIndices();[m
     const winner = active[0];[m
     const discarder = active.find((i) => i !== winner);[m
[31m-    setEvents([...events, { type: 'ippatsu', winner, isTsumo: false, discarder }]);[m
[32m+[m[32m    setEvents([...events, { type: 'ippatsu', winner, isTsumo: false, discarder, count: 1 }]);[m
   }[m
 [m
   function removeEvent(idx: number) {[m
[36m@@ -438,8 +445,26 @@[m [mfunction NewHanchanTab({[m
     setEvents(next);[m
   }[m
 [m
[32m+[m[32m  // ===== チップ操作 =====[m
[32m+[m[32m  function addChip() {[m
[32m+[m[32m    const active = activeIndices();[m
[32m+[m[32m    setChips([...chips, { type: 'chombo', target: active[0] }]);[m
[32m+[m[32m  }[m
[32m+[m[32m  function removeChip(idx: number) {[m
[32m+[m[32m    setChips(chips.filter((_, i) => i !== idx));[m
[32m+[m[32m  }[m
[32m+[m[32m  function updateChip(idx: number, patch: Partial<HanchanChip>) {[m
[32m+[m[32m    setChips(chips.map((c, i) => (i === idx ? { ...c, ...patch } : c)));[m
[32m+[m[32m  }[m
[32m+[m
   const ranks = calculateRanks(scores, mode, mode === 'sanma' ? absentIdx : null);[m
[31m-  const { points } = calculatePoints(scores, events, mode, mode === 'sanma' ? absentIdx : null);[m
[32m+[m[32m  const { points } = calculatePoints([m
[32m+[m[32m    scores,[m
[32m+[m[32m    events,[m
[32m+[m[32m    mode,[m
[32m+[m[32m    mode === 'sanma' ? absentIdx : null,[m
[32m+[m[32m    chips[m
[32m+[m[32m  );[m
   const active = activeIndices();[m
   const sumScore = active.reduce((s, i) => s + scores[i], 0);[m
   const expectedSum = mode === 'sanma' ? 105000 : 100000;[m
[36m@@ -458,6 +483,7 @@[m [mfunction NewHanchanTab({[m
       absentIdx: mode === 'sanma' ? absentIdx : null,[m
       scores: savedScores,[m
       events: JSON.parse(JSON.stringify(events)),[m
[32m+[m[32m      chips: JSON.parse(JSON.stringify(chips)),[m
       ranks,[m
       points,[m
     };[m
[36m@@ -470,6 +496,7 @@[m [mfunction NewHanchanTab({[m
       setAbsentIdx(3);[m
       setScores([25000, 25000, 25000, 25000]);[m
       setEvents([]);[m
[32m+[m[32m      setChips([]);[m
       setDate(todayStr());[m
     } finally {[m
       setSaving(false);[m
[36m@@ -535,7 +562,16 @@[m [mfunction NewHanchanTab({[m
                     value={scores[i]}[m
                     step={100}[m
                     inputMode="numeric"[m
[31m-                    onChange={(e) => setScoreAt(i, parseInt(e.target.value) || 0)}[m
[32m+[m[32m                    onChange={(e) => {[m
[32m+[m[32m                      // マイナス値を許可。空欄は0扱い[m
[32m+[m[32m                      const v = e.target.value;[m
[32m+[m[32m                      if (v === '' || v === '-') {[m
[32m+[m[32m                        setScoreAt(i, 0);[m
[32m+[m[32m                      } else {[m
[32m+[m[32m                        const n = parseInt(v, 10);[m
[32m+[m[32m                        setScoreAt(i, Number.isNaN(n) ? 0 : n);[m
[32m+[m[32m                      }[m
[32m+[m[32m                    }}[m
                   />[m
                   <span className={`rank-badge rank-${ranks[i]}`}>{ranks[i]}</span>[m
                 </>[m
[36m@@ -622,11 +658,35 @@[m [mfunction NewHanchanTab({[m
                     </select>[m
                   </div>[m
                 )}[m
[32m+[m[32m                <div>[m
[32m+[m[32m                  <label>個数</label>[m
[32m+[m[32m                  <input[m
[32m+[m[32m                    type="number"[m
[32m+[m[32m                    min={1}[m
[32m+[m[32m                    step={1}[m
[32m+[m[32m                    inputMode="numeric"[m
[32m+[m[32m                    value={ev.count ?? 1}[m
[32m+[m[32m                    onChange={(e) => {[m
[32m+[m[32m                      const n = parseInt(e.target.value, 10);[m
[32m+[m[32m                      updateEvent(idx, { count: Number.isNaN(n) || n < 1 ? 1 : n });[m
[32m+[m[32m                    }}[m
[32m+[m[32m                    style={{ width: '100%' }}[m
[32m+[m[32m                  />[m
[32m+[m[32m                </div>[m
               </div>[m
[31m-              {ev.type === 'yakuman' && ([m
[32m+[m[32m              {ev.type === 'yakuman' ? ([m
                 <div className="yakuman-bonus-note">[m
[31m-                  ご褒美: {config.players[ev.winner]} に +{mode === 'sanma' ? 300 : 1000}pt[m
[32m+[m[32m                  ご褒美: {config.players[ev.winner]} に +[m
[32m+[m[32m                  {(mode === 'sanma' ? 300 : 1000) * (ev.count ?? 1)}pt[m
[32m+[m[32m                  {(ev.count ?? 1) > 1 && ` (×${ev.count})`}[m
                 </div>[m
[32m+[m[32m              ) : ([m
[32m+[m[32m                (ev.count ?? 1) > 1 && ([m
[32m+[m[32m                  <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: 6 }}>[m
[32m+[m[32m                    {EVENT_LABELS[ev.type]} × {ev.count} → {ev.isTsumo ? '他全員' : '放銃者'}が[m
[32m+[m[32m                    -{100 * (ev.count ?? 1)}pt[m
[32m+[m[32m                  </div>[m
[32m+[m[32m                )[m
               )}[m
               <div className="event-actions">[m
                 <button className="btn btn-danger btn-sm" onClick={() => removeEvent(idx)}>[m
[36m@@ -641,6 +701,62 @@[m [mfunction NewHanchanTab({[m
         </button>[m
       </div>[m
 [m
[32m+[m[32m      <div className="card">[m
[32m+[m[32m        <div className="card-title">チップ (罰金)</div>[m
[32m+[m[32m        <p className="text-muted mb-2">[m
[32m+[m[32m          チョンボ -100 / NGワード -100 / 飛び -200[m
[32m+[m[32m        </p>[m
[32m+[m[32m        {chips.length === 0 ? ([m
[32m+[m[32m          <p className="text-muted text-center" style={{ padding: '16px 0' }}>[m
[32m+[m[32m            チップなし[m
[32m+[m[32m          </p>[m
[32m+[m[32m        ) : ([m
[32m+[m[32m          chips.map((c, idx) => ([m
[32m+[m[32m            <div key={idx} className="event-item">[m
[32m+[m[32m              <div className="event-grid">[m
[32m+[m[32m                <div>[m
[32m+[m[32m                  <label>種別</label>[m
[32m+[m[32m                  <select[m
[32m+[m[32m                    value={c.type}[m
[32m+[m[32m                    onChange={(e) => updateChip(idx, { type: e.target.value as ChipType })}[m
[32m+[m[32m                  >[m
[32m+[m[32m                    {(Object.keys(CHIP_LABELS) as ChipType[]).map((k) => ([m
[32m+[m[32m                      <option key={k} value={k}>[m
[32m+[m[32m                        {CHIP_LABELS[k]} ({CHIP_VALUES[k]}pt)[m
[32m+[m[32m                      </option>[m
[32m+[m[32m                    ))}[m
[32m+[m[32m                  </select>[m
[32m+[m[32m                </div>[m
[32m+[m[32m                <div>[m
[32m+[m[32m                  <label>対象</label>[m
[32m+[m[32m                  <select[m
[32m+[m[32m                    value={c.target}[m
[32m+[m[32m                    onChange={(e) => updateChip(idx, { target: parseInt(e.target.value) })}[m
[32m+[m[32m                  >[m
[32m+[m[32m                    {active.map((i) => ([m
[32m+[m[32m                      <option key={i} value={i}>[m
[32m+[m[32m                        {config.players[i]}[m
[32m+[m[32m                      </option>[m
[32m+[m[32m                    ))}[m
[32m+[m[32m                  </select>[m
[32m+[m[32m                </div>[m
[32m+[m[32m              </div>[m
[32m+[m[32m              <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: 6 }}>[m
[32m+[m[32m                {config.players[c.target]} に {CHIP_VALUES[c.type]}pt[m
[32m+[m[32m              </div>[m
[32m+[m[32m              <div className="event-actions">[m
[32m+[m[32m                <button className="btn btn-danger btn-sm" onClick={() => removeChip(idx)}>[m
[32m+[m[32m                  削除[m
[32m+[m[32m                </button>[m
[32m+[m[32m              </div>[m
[32m+[m[32m            </div>[m
[32m+[m[32m          ))[m
[32m+[m[32m        )}[m
[32m+[m[32m        <button className="btn btn-secondary btn-sm mt-3" onClick={addChip}>[m
[32m+[m[32m          ＋ チップ追加[m
[32m+[m[32m        </button>[m
[32m+[m[32m      </div>[m
[32m+[m
       <div className="card">[m
         <div className="card-title">この半荘のポイント</div>[m
         <div className="history-results">[m
[36m@@ -750,17 +866,27 @@[m [mfunction HistoryTab({[m
                 {h.events[m
                   .map((e) => {[m
                     const winner = config.players[e.winner];[m
[32m+[m[32m                    const cnt = e.count ?? 1;[m
[32m+[m[32m                    const cntStr = cnt > 1 ? `×${cnt}` : '';[m
                     if (e.type === 'yakuman') {[m
[31m-                      return `${EVENT_LABELS[e.type]}(${winner}・${e.isTsumo ? 'ツモ' : 'ロン'}) ご褒美`;[m
[32m+[m[32m                      return `${EVENT_LABELS[e.type]}${cntStr}(${winner}・${e.isTsumo ? 'ツモ' : 'ロン'}) ご褒美`;[m
                     }[m
[31m-                    if (e.isTsumo) return `${EVENT_LABELS[e.type]}(${winner}・ツモ)`;[m
[31m-                    return `${EVENT_LABELS[e.type]}(${winner}←${[m
[32m+[m[32m                    if (e.isTsumo) return `${EVENT_LABELS[e.type]}${cntStr}(${winner}・ツモ)`;[m
[32m+[m[32m                    return `${EVENT_LABELS[e.type]}${cntStr}(${winner}←${[m
                       typeof e.discarder === 'number' ? config.players[e.discarder] : '?'[m
                     })`;[m
                   })[m
                   .join(' / ')}[m
               </div>[m
             )}[m
[32m+[m[32m            {h.chips && h.chips.length > 0 && ([m
[32m+[m[32m              <div className="text-muted mt-2" style={{ fontSize: '0.82rem' }}>[m
[32m+[m[32m                チップ:{' '}[m
[32m+[m[32m                {h.chips[m
[32m+[m[32m                  .map((c) => `${CHIP_LABELS[c.type]}(${config.players[c.target]} ${CHIP_VALUES[c.type]}pt)`)[m
[32m+[m[32m                  .join(' / ')}[m
[32m+[m[32m              </div>[m
[32m+[m[32m            )}[m
           </div>[m
         );[m
       })}[m
[36m@@ -772,12 +898,23 @@[m [mfunction HistoryTab({[m
 // 成績タブ[m
 // ============================================================[m
 function StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[] }) {[m
[32m+[m[32m  // ===== 3麻/4麻 切替フィルタ =====[m
[32m+[m[32m  const [rankingMode, setRankingMode] = useState<'all' | 'yonma' | 'sanma'>('all');[m
[32m+[m
   if (hanchans.length === 0) return <div className="empty">まだ記録がありません</div>;[m
 [m
[32m+[m[32m  // モードフィルタ適用[m
[32m+[m[32m  const viewHanchans = hanchans.filter((h) => {[m
[32m+[m[32m    const m = h.mode || 'yonma';[m
[32m+[m[32m    if (rankingMode === 'all') return true;[m
[32m+[m[32m    return m === rankingMode;[m
[32m+[m[32m  });[m
[32m+[m
   type Row = {[m
     name: string;[m
     idx: number;[m
[31m-    totalPoints: number;[m
[32m+[m[32m    totalPoints: number;       // 累計ポイント (プラス・マイナス全部)[m
[32m+[m[32m    paidPoints: number;        // 支払ポイント (マイナス成分の合計、負の値)[m
     totalScore: number;[m
     rankCounts: number[];[m
     hanchanCount: number;[m
[36m@@ -793,6 +930,7 @@[m [mfunction StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[][m
     name,[m
     idx: i,[m
     totalPoints: 0,[m
[32m+[m[32m    paidPoints: 0,[m
     totalScore: 0,[m
     rankCounts: [0, 0, 0, 0],[m
     hanchanCount: 0,[m
[36m@@ -807,14 +945,16 @@[m [mfunction StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[][m
   let totalYonma = 0;[m
   let totalSanma = 0;[m
 [m
[31m-  hanchans.forEach((h) => {[m
[32m+[m[32m  viewHanchans.forEach((h) => {[m
     const mode = h.mode || 'yonma';[m
     if (mode === 'yonma') totalYonma++;[m
     else totalSanma++;[m
     for (let i = 0; i < 4; i++) {[m
       const isAbsent = mode === 'sanma' && i === h.absentIdx;[m
       if (isAbsent) continue;[m
[31m-      stats[i].totalPoints += h.points[i];[m
[32m+[m[32m      const pt = h.points[i] ?? 0;[m
[32m+[m[32m      stats[i].totalPoints += pt;[m
[32m+[m[32m      if (pt < 0) stats[i].paidPoints += pt; // マイナス成分のみ蓄積[m
       stats[i].totalScore += (h.scores[i] as number) || 0;[m
       const r = h.ranks[i];[m
       if (r) stats[i].rankCounts[r - 1]++;[m
[36m@@ -829,8 +969,9 @@[m [mfunction StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[][m
     }[m
     (h.events || []).forEach((ev) => {[m
       if (ev.type === 'yakuman' && typeof ev.winner === 'number') {[m
[31m-        if (mode === 'sanma') stats[ev.winner].yakumanSanma++;[m
[31m-        else stats[ev.winner].yakumanYonma++;[m
[32m+[m[32m        const cnt = ev.count ?? 1;[m
[32m+[m[32m        if (mode === 'sanma') stats[ev.winner].yakumanSanma += cnt;[m
[32m+[m[32m        else stats[ev.winner].yakumanYonma += cnt;[m
       }[m
     });[m
   });[m
[36m@@ -842,11 +983,39 @@[m [mfunction StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[][m
 [m
   const sorted = [...stats].sort((a, b) => b.totalPoints - a.totalPoints);[m
 [m
[32m+[m[32m  const modeLabel =[m
[32m+[m[32m    rankingMode === 'yonma' ? '四麻' : rankingMode === 'sanma' ? '三麻' : '全モード';[m
[32m+[m
   return ([m
     <>[m
[32m+[m[32m      {/* ===== モード切替 ===== */}[m
[32m+[m[32m      <div className="card">[m
[32m+[m[32m        <div className="card-title">集計モード</div>[m
[32m+[m[32m        <div className="mode-toggle">[m
[32m+[m[32m          <button[m
[32m+[m[32m            className={'mode-btn' + (rankingMode === 'all' ? ' active' : '')}[m
[32m+[m[32m            onClick={() => setRankingMode('all')}[m
[32m+[m[32m          >[m
[32m+[m[32m            全部[m
[32m+[m[32m          </button>[m
[32m+[m[32m          <button[m
[32m+[m[32m            className={'mode-btn' + (rankingMode === 'yonma' ? ' active' : '')}[m
[32m+[m[32m            onClick={() => setRankingMode('yonma')}[m
[32m+[m[32m          >[m
[32m+[m[32m            四麻のみ[m
[32m+[m[32m          </button>[m
[32m+[m[32m          <button[m
[32m+[m[32m            className={'mode-btn' + (rankingMode === 'sanma' ? ' active' : '')}[m
[32m+[m[32m            onClick={() => setRankingMode('sanma')}[m
[32m+[m[32m          >[m
[32m+[m[32m            三麻のみ[m
[32m+[m[32m          </button>[m
[32m+[m[32m        </div>[m
[32m+[m[32m      </div>[m
[32m+[m
       <div className="card">[m
         <div className="card-title">[m
[31m-          通算ランキング (四麻{totalYonma} / 三麻{totalSanma})[m
[32m+[m[32m          通算ランキング [{modeLabel}] (四麻{totalYonma} / 三麻{totalSanma})[m
         </div>[m
         <table className="stats-table">[m
           <thead>[m
[36m@@ -854,6 +1023,8 @@[m [mfunction StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[][m
               <th>順位</th>[m
               <th>名前</th>[m
               <th>累計pt</th>[m
[32m+[m[32m              <th>支払pt</th>[m
[32m+[m[32m              <th>差分</th>[m
               <th>平均順位</th>[m
               <th>半荘数</th>[m
             </tr>[m
[36m@@ -863,6 +1034,11 @@[m [mfunction StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[][m
               const cls =[m
                 s.totalPoints > 0 ? 'points-pos' : s.totalPoints < 0 ? 'points-neg' : 'points-zero';[m
               const sign = s.totalPoints > 0 ? '+' : '';[m
[32m+[m[32m              // 差分 = 累計 - 支払 = 受け取った分(プラス成分の合計)[m
[32m+[m[32m              const diff = s.totalPoints - s.paidPoints;[m
[32m+[m[32m              const diffCls = diff > 0 ? 'points-pos' : diff < 0 ? 'points-neg' : 'points-zero';[m
[32m+[m[32m              const diffSign = diff > 0 ? '+' : '';[m
[32m+[m[32m              const paidCls = s.paidPoints < 0 ? 'points-neg' : 'points-zero';[m
               return ([m
                 <tr key={s.idx} className={idx === 0 ? 'stats-rank-1' : ''}>[m
                   <td>{idx + 1}</td>[m
[36m@@ -871,6 +1047,11 @@[m [mfunction StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[][m
                     {sign}[m
                     {s.totalPoints}[m
                   </td>[m
[32m+[m[32m                  <td className={paidCls}>{s.paidPoints}</td>[m
[32m+[m[32m                  <td className={diffCls}>[m
[32m+[m[32m                    {diffSign}[m
[32m+[m[32m                    {diff}[m
[32m+[m[32m                  </td>[m
                   <td>{avgRank(s).toFixed(2)}</td>[m
                   <td>{s.hanchanCount}</td>[m
                 </tr>[m
[36m@@ -878,6 +1059,9 @@[m [mfunction StatsTab({ config, hanchans }: { config: AppConfig; hanchans: Hanchan[][m
             })}[m
           </tbody>[m
         </table>[m
[32m+[m[32m        <p className="text-muted mt-2" style={{ fontSize: '0.78rem' }}>[m
[32m+[m[32m          ※ 累計pt = 全半荘の合計 / 支払pt = マイナスで終わった半荘の合計 / 差分 = 累計 − 支払 (受取分の合計)[m
[32m+[m[32m        </p>[m
       </div>[m
 [m
       {totalSanma > 0 && totalYonma > 0 && ([m
[36m@@ -1066,4 +1250,4 @@[m [mfunction SettingsModal({[m
       </div>[m
     </div>[m
   );[m
[31m-}[m
\ No newline at end of file[m
[32m+[m[32m}[m
[1mdiff --git a/lib/calc.ts b/lib/calc.ts[m
[1mindex f678937..2a7ae17 100644[m
[1m--- a/lib/calc.ts[m
[1m+++ b/lib/calc.ts[m
[36m@@ -13,7 +13,7 @@[m
 //       三麻: あがった人が +300  (同上)[m
 // ============================================================[m
 [m
[31m-import { HanchanEvent, Mode } from './types';[m
[32m+[m[32mimport { HanchanEvent, HanchanChip, CHIP_VALUES, Mode } from './types';[m
 [m
 const NORMAL_EVENT_LOSS = 100;          // -100pt per affected loser[m
 [m
[36m@@ -45,7 +45,8 @@[m [mexport function calculatePoints([m
   scores: (number | null)[],[m
   events: HanchanEvent[],[m
   mode: Mode,[m
[31m-  absentIdx: number | null[m
[32m+[m[32m  absentIdx: number | null,[m
[32m+[m[32m  chips: HanchanChip[] = [][m
 ): { ranks: (number | null)[]; points: number[] } {[m
   const ranks = calculateRanks(scores, mode, absentIdx);[m
   const points = [0, 0, 0, 0];[m
[36m@@ -58,11 +59,12 @@[m [mexport function calculatePoints([m
     if (ranks[i] === lastRank) points[i] -= rankBonus;[m
   }[m
 [m
[31m-  // イベント[m
[32m+[m[32m  // イベント (count倍に対応: 裏ドラ3 → -100 × 3 など)[m
   for (const ev of events) {[m
[32m+[m[32m    const count = Math.max(1, ev.count ?? 1);[m
     if (ev.type === 'yakuman') {[m
[31m-      // 役満は あがった人が ご褒美ボーナス[m
[31m-      const bonus = mode === 'sanma' ? YAKUMAN_BONUS_SANMA : YAKUMAN_BONUS_YONMA;[m
[32m+[m[32m      // 役満は あがった人が ご褒美ボーナス × count (ダブル役満なら2倍)[m
[32m+[m[32m      const bonus = (mode === 'sanma' ? YAKUMAN_BONUS_SANMA : YAKUMAN_BONUS_YONMA) * count;[m
       if (ev.winner >= 0 && ev.winner < 4) {[m
         points[ev.winner] += bonus;[m
       }[m
[36m@@ -70,18 +72,26 @@[m [mexport function calculatePoints([m
     }[m
 [m
     // 通常役[m
[32m+[m[32m    const loss = NORMAL_EVENT_LOSS * count;[m
     if (ev.isTsumo) {[m
       for (let i = 0; i < 4; i++) {[m
         if (mode === 'sanma' && i === absentIdx) continue;[m
[31m-        if (i !== ev.winner) points[i] -= NORMAL_EVENT_LOSS;[m
[32m+[m[32m        if (i !== ev.winner) points[i] -= loss;[m
       }[m
     } else {[m
       if (typeof ev.discarder === 'number' && ev.discarder !== ev.winner) {[m
[31m-        points[ev.discarder] -= NORMAL_EVENT_LOSS;[m
[32m+[m[32m        points[ev.discarder] -= loss;[m
       }[m
     }[m
   }[m
 [m
[32m+[m[32m  // チップ罰金 (チョンボ -100 / NGワード -100 / 飛び -200)[m
[32m+[m[32m  for (const chip of chips) {[m
[32m+[m[32m    if (chip.target < 0 || chip.target > 3) continue;[m
[32m+[m[32m    if (mode === 'sanma' && chip.target === absentIdx) continue;[m
[32m+[m[32m    points[chip.target] += CHIP_VALUES[chip.type];[m
[32m+[m[32m  }[m
[32m+[m
   return { ranks, points };[m
 }[m
 [m
[36m@@ -96,4 +106,4 @@[m [mexport function djb2Hash(str: string): string {[m
 export function todayStr(): string {[m
   const d = new Date();[m
   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;[m
[31m-}[m
\ No newline at end of file[m
[32m+[m[32m}[m
[1mdiff --git a/lib/supabase.ts b/lib/supabase.ts[m
[1mindex 546873f..24a79db 100644[m
[1m--- a/lib/supabase.ts[m
[1m+++ b/lib/supabase.ts[m
[36m@@ -58,6 +58,7 @@[m [mexport async function fetchHanchans(): Promise<Hanchan[]> {[m
     absentIdx: r.absent_idx,[m
     scores: r.scores,[m
     events: r.events,[m
[32m+[m[32m    chips: r.chips ?? [],[m
     ranks: r.ranks,[m
     points: r.points,[m
   }));[m
[36m@@ -72,6 +73,7 @@[m [mexport async function insertHanchan(h: Hanchan): Promise<void> {[m
     absent_idx: h.absentIdx,[m
     scores: h.scores,[m
     events: h.events,[m
[32m+[m[32m    chips: h.chips ?? [],[m
     ranks: h.ranks,[m
     points: h.points,[m
   });[m
[36m@@ -90,4 +92,4 @@[m [mexport async function clearAll(): Promise<void> {[m
   if (e1) throw e1;[m
   const { error: e2 } = await sb.from('config').delete().eq('id', 1);[m
   if (e2) throw e2;[m
[31m-}[m
\ No newline at end of file[m
[32m+[m[32m}[m
[1mdiff --git a/lib/types.ts b/lib/types.ts[m
[1mindex 0a5c861..79bdbcb 100644[m
[1m--- a/lib/types.ts[m
[1m+++ b/lib/types.ts[m
[36m@@ -18,6 +18,28 @@[m [mexport interface HanchanEvent {[m
   winner: number;          // 0..3[m
   isTsumo: boolean;[m
   discarder?: number;      // ロン時のみ。役満では使わない[m
[32m+[m[32m  count?: number;          // 個数 (例: 裏ドラ3 → count: 3)。未指定なら1扱い[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// ===== チップ制度 =====[m
[32m+[m[32mexport type ChipType = 'chombo' | 'ngWord' | 'tobi';[m
[32m+[m
[32m+[m[32mexport const CHIP_LABELS: Record<ChipType, string> = {[m
[32m+[m[32m  chombo: 'チョンボ',[m
[32m+[m[32m  ngWord: 'NGワード',[m
[32m+[m[32m  tobi: '飛び',[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32m// 罰金額(マイナス)[m
[32m+[m[32mexport const CHIP_VALUES: Record<ChipType, number> = {[m
[32m+[m[32m  chombo: -100,[m
[32m+[m[32m  ngWord: -100,[m
[32m+[m[32m  tobi: -200,[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32mexport interface HanchanChip {[m
[32m+[m[32m  type: ChipType;[m
[32m+[m[32m  target: number;          // 罰金を受ける人 0..3[m
 }[m
 [m
 export interface Hanchan {[m
[36m@@ -27,6 +49,7 @@[m [mexport interface Hanchan {[m
   absentIdx: number | null;[m
   scores: (number | null)[];   // 4要素。sanmaの休みは null[m
   events: HanchanEvent[];[m
[32m+[m[32m  chips?: HanchanChip[];       // 旧データ互換のため optional[m
   ranks: (number | null)[];    // 4要素。sanmaの休みは null[m
   points: number[];            // 4要素[m
 }[m
[36m@@ -39,4 +62,4 @@[m [mexport interface AppConfig {[m
 export interface AppData {[m
   config: AppConfig | null;[m
   hanchans: Hanchan[];[m
[31m-}[m
\ No newline at end of file[m
[32m+[m[32m}[m
