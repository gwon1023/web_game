export type SceneKey = 'TitleScene' | 'PlayScene' | 'ResultScene';

export type InputAction = 'lightAttack' | 'heavyAttack' | 'finisher';

export type NoteType = 'light' | 'heavy' | 'finisher';

export type NoteLifecycleState = 'pending' | 'active' | 'expired';

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

export interface ResultSceneData {
  readonly message: string;
}
