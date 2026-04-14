import type { JudgmentName, NoteType } from '../types/GameTypes';

export const gameConfig = {
  width: 1280,
  height: 720,
  noteSpawnX: 1220,
  hitLineX: 260,
  laneStartY: 250,
  laneGap: 98,
  noteTravelMs: 1550,
  missWindowMs: 160,
  endDelayMs: 1800,
  storageBestScoreKey: 'beat-breaker.best-score',
  judgments: {
    Perfect: {
      windowMs: 45,
      score: 1000,
      feverGain: 9,
    },
    Good: {
      windowMs: 105,
      score: 550,
      feverGain: 4,
    },
    Miss: {
      windowMs: 160,
      score: 0,
      feverGain: -12,
    },
  } satisfies Record<JudgmentName, { windowMs: number; score: number; feverGain: number }>,
  fever: {
    max: 100,
    threshold: 100,
    durationMs: 7200,
    scoreMultiplier: 1.5,
  },
  lanes: {
    light: {
      label: 'J',
      name: 'Light',
      color: 0x34d399,
      flashColor: 0x9fffd2,
    },
    heavy: {
      label: 'K',
      name: 'Heavy',
      color: 0xf97316,
      flashColor: 0xffc08b,
    },
    finisher: {
      label: 'SPACE',
      name: 'Finisher',
      color: 0xef4444,
      flashColor: 0xff9aa1,
    },
  } satisfies Record<NoteType, { label: string; name: string; color: number; flashColor: number }>,
  colors: {
    background: '#08090d',
    panel: 0x11131c,
    text: '#f5f7fb',
    muted: '#9ca3af',
    lane: 0x202433,
    hitLine: 0xf5f7fb,
    fever: 0x22d3ee,
  },
} as const;
