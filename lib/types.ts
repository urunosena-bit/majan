// ============================================================
// 型定義
// ============================================================

export type Mode = 'yonma' | 'sanma';

export type EventType = 'ippatsu' | 'uradora' | 'menzen_aka' | 'yakuman';

export const EVENT_LABELS: Record<EventType, string> = {
  ippatsu: '一発',
  uradora: '裏ドラ',
  menzen_aka: '面前赤',
  yakuman: '役満',
};

export interface HanchanEvent {
  type: EventType;
  winner: number;          // 0..3
  isTsumo: boolean;
  discarder?: number;      // ロン時のみ。役満では使わない
  count?: number;          // 個数 (例: 裏ドラ3 → count: 3)。未指定なら1扱い
}

// ===== チップ制度 =====
export type ChipType = 'chombo' | 'ngWord' | 'tobi';

export const CHIP_LABELS: Record<ChipType, string> = {
  chombo: 'チョンボ',
  ngWord: 'NGワード',
  tobi: '飛び',
};

// 罰金額(マイナス)
export const CHIP_VALUES: Record<ChipType, number> = {
  chombo: -100,
  ngWord: -100,
  tobi: -200,
};

export interface HanchanChip {
  type: ChipType;
  target: number;          // 罰金を受ける人 0..3
}

export interface Hanchan {
  id: string;
  date: string;            // 'YYYY-MM-DD'
  mode: Mode;
  absentIdx: number | null;
  scores: (number | null)[];   // 4要素。sanmaの休みは null
  events: HanchanEvent[];
  chips?: HanchanChip[];       // 旧データ互換のため optional
  ranks: (number | null)[];    // 4要素。sanmaの休みは null
  points: number[];            // 4要素
}

export interface AppConfig {
  passwordHash: string;
  players: string[];           // 4要素
}

export interface AppData {
  config: AppConfig | null;
  hanchans: Hanchan[];
}
