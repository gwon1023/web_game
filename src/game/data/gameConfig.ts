import type { InputAction, NoteType, SceneKey } from '../types/GameTypes';

export const gameConfig = {
  width: 1280,
  height: 720,
  sceneKeys: {
    title: 'TitleScene',
    play: 'PlayScene',
    result: 'ResultScene',
  } satisfies Record<string, SceneKey>,
  controls: {
    lightAttack: {
      key: 'J',
      label: 'J - Light Attack',
    },
    heavyAttack: {
      key: 'K',
      label: 'K - Heavy Attack',
    },
    finisher: {
      key: 'SPACE',
      label: 'Space - Finisher',
    },
  } satisfies Record<InputAction, { key: string; label: string }>,
  chart: {
    approachTimeMs: 1800,
    expireAfterMs: 240,
    endDelayMs: 1400,
  },
  judgment: {
    perfectWindowMs: 60,
    goodWindowMs: 120,
  },
  scoring: {
    judgmentScore: {
      Perfect: 100,
      Good: 60,
      Miss: 0,
    },
    comboMultiplier: {
      milestoneSize: 10,
      bonusPerMilestone: 0.05,
      maxBonus: 0.5,
    },
    fever: {
      gaugeMax: 100,
      perfectGain: 8,
      goodGain: 4,
      missPenalty: 15,
      durationMs: 8000,
      multiplierBonus: 0.5,
    },
  },
  playfield: {
    spawnX: 1140,
    judgeLineX: 260,
    laneStartY: 260,
    laneGap: 100,
    noteWidth: 76,
    noteHeight: 48,
    finisherWidth: 112,
    laneWidth: 1020,
  },
  notes: {
    light: {
      label: 'J',
      laneName: 'Light',
      color: 0x34d399,
    },
    heavy: {
      label: 'K',
      laneName: 'Heavy',
      color: 0xf97316,
    },
    finisher: {
      label: 'SPACE',
      laneName: 'Finisher',
      color: 0xef4444,
    },
  } satisfies Record<NoteType, { label: string; laneName: string; color: number }>,
  colors: {
    background: '#08090d',
    panel: 0x11131c,
    text: '#f5f7fb',
    muted: '#9ca3af',
    accent: '#facc15',
  },
} as const;
