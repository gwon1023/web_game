export type SceneKey = 'TitleScene' | 'PlayScene' | 'ResultScene';

export type InputAction = 'lightAttack' | 'heavyAttack' | 'finisher';

export type NoteType = 'light' | 'heavy' | 'finisher';

export type JudgmentName = 'Perfect' | 'Good' | 'Miss';

export type NoteLifecycleState = 'pending' | 'active' | 'judged' | 'missed';

export interface ChartNote {
  readonly id: string;
  readonly timeMs: number;
  readonly type: NoteType;
}

export interface SongChart {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
  readonly durationMs: number;
  readonly notes: readonly ChartNote[];
}

export interface ActiveChartNote {
  readonly note: ChartNote;
  readonly progress: number;
  readonly state: NoteLifecycleState;
}

export interface JudgmentResult {
  readonly judgment: JudgmentName;
  readonly offsetMs: number;
  readonly note?: ChartNote;
}

export interface ScoreSnapshot {
  readonly score: number;
  readonly combo: number;
  readonly maxCombo: number;
  readonly multiplier: number;
  readonly feverGauge: number;
  readonly feverActive: boolean;
  readonly feverRemainingMs: number;
  readonly lastScoreAdded: number;
}

export interface ResultSceneData {
  readonly message: string;
  readonly score?: number;
  readonly maxCombo?: number;
}
