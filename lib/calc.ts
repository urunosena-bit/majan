// ============================================================
// 点数計算ロジック
//
// 【ポイント仕様】(1pt = 100pt スケーリング)
//   ・順位ボーナス
//       四麻: 1位 +200 / 4位 -200
//       三麻: 1位 +100 / 3位 -100 (2位は ±0)
//   ・通常イベント (一発・裏ドラ・面前赤)
//       ロン  → 放銃者が -100
//       ツモ  → あがった人以外 全員 -100ずつ
//   ・役満イベント【ご褒美】
//       四麻: あがった人が +1000 (他のプレイヤーへの加点・減点なし)
//       三麻: あがった人が +300  (同上)
// ============================================================

import { HanchanEvent, HanchanChip, CHIP_VALUES, Mode } from './types';

const NORMAL_EVENT_LOSS = 100;          // -100pt per affected loser

const RANK_BONUS_YONMA = 200;
const RANK_BONUS_SANMA = 100;

const YAKUMAN_BONUS_YONMA = 1000;       // あがった人が +1000
const YAKUMAN_BONUS_SANMA = 300;        // あがった人が +300

export function calculateRanks(
  scores: (number | null)[],
  mode: Mode,
  absentIdx: number | null
): (number | null)[] {
  const ranks: (number | null)[] = [null, null, null, null];
  const active: { score: number; idx: number }[] = [];
  for (let i = 0; i < 4; i++) {
    if (mode === 'sanma' && i === absentIdx) continue;
    active.push({ score: (scores[i] as number) ?? 0, idx: i });
  }
  active.sort((a, b) => b.score - a.score || a.idx - b.idx);
  active.forEach((item, rankIdx) => {
    ranks[item.idx] = rankIdx + 1;
  });
  return ranks;
}

export function calculatePoints(
  scores: (number | null)[],
  events: HanchanEvent[],
  mode: Mode,
  absentIdx: number | null,
  chips: HanchanChip[] = []
): { ranks: (number | null)[]; points: number[] } {
  const ranks = calculateRanks(scores, mode, absentIdx);
  const points = [0, 0, 0, 0];

  // 順位ボーナス
  const lastRank = mode === 'sanma' ? 3 : 4;
  const rankBonus = mode === 'sanma' ? RANK_BONUS_SANMA : RANK_BONUS_YONMA;
  for (let i = 0; i < 4; i++) {
    if (ranks[i] === 1) points[i] += rankBonus;
    if (ranks[i] === lastRank) points[i] -= rankBonus;
  }

  // イベント (count倍に対応: 裏ドラ3 → -100 × 3 など)
  for (const ev of events) {
    const count = Math.max(1, ev.count ?? 1);
    if (ev.type === 'yakuman') {
      // 役満は あがった人が ご褒美ボーナス × count (ダブル役満なら2倍)
      const bonus = (mode === 'sanma' ? YAKUMAN_BONUS_SANMA : YAKUMAN_BONUS_YONMA) * count;
      if (ev.winner >= 0 && ev.winner < 4) {
        points[ev.winner] += bonus;
      }
      continue;
    }

    // 通常役
    const loss = NORMAL_EVENT_LOSS * count;
    if (ev.isTsumo) {
      for (let i = 0; i < 4; i++) {
        if (mode === 'sanma' && i === absentIdx) continue;
        if (i !== ev.winner) points[i] -= loss;
      }
    } else {
      if (typeof ev.discarder === 'number' && ev.discarder !== ev.winner) {
        points[ev.discarder] -= loss;
      }
    }
  }

  // チップ罰金 (チョンボ -100 / NGワード -100 / 飛び -200)
  for (const chip of chips) {
    if (chip.target < 0 || chip.target > 3) continue;
    if (mode === 'sanma' && chip.target === absentIdx) continue;
    points[chip.target] += CHIP_VALUES[chip.type];
  }

  return { ranks, points };
}

export function djb2Hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
