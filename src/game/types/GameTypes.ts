export type NoteType = 'light' | 'heavy' | 'finisher';

export type JudgmentName = 'Perfect' | 'Good' | 'Miss';

export type SceneKey = 'TitleScene' | 'PlayScene' | 'ResultScene';

export interface ChartNote {
  readonly id: number;
  readonly timeMs: number;
  readonly type: NoteType;
}

export interface SongChart {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
  readonly bpm: number;
  readonly durationMs: number;
  readonly leadInMs: number;
  readonly notes: readonly ChartNote[];
}

export interface JudgmentResult {
  readonly judgment: JudgmentName;
  readonly offsetMs: number;
  readonly scoreDelta: number;
  readonly combo: number;
  readonly fever: number;
  readonly feverActive: boolean;
}

export interface RunResult {
  readonly score: number;
  readonly bestScore: number;
  readonly previousBestScore: number;
  readonly maxCombo: number;
  readonly perfects: number;
  readonly goods: number;
  readonly misses: number;
  readonly feverActivations: number;
  readonly chartTitle: string;
}
