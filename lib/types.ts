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
}

export interface Hanchan {
  id: string;
  date: string;            // 'YYYY-MM-DD'
  mode: Mode;
  absentIdx: number | null;
  scores: (number | null)[];   // 4要素。sanmaの休みは null
  events: HanchanEvent[];
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