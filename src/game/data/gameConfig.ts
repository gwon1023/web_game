import type { InputAction, SceneKey } from '../types/GameTypes';

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
  scenes: {
    playDurationMs: 8000,
  },
  colors: {
    background: '#08090d',
    panel: 0x11131c,
    text: '#f5f7fb',
    muted: '#9ca3af',
    accent: '#facc15',
  },
} as const;
