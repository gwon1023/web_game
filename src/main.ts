import Phaser from 'phaser';
import './style.css';
import { gameConfig } from './game/data/gameConfig';
import { PlayScene } from './game/scenes/PlayScene';
import { ResultScene } from './game/scenes/ResultScene';
import { TitleScene } from './game/scenes/TitleScene';

declare global {
  interface Window {
    __BEAT_BREAKER_BOOTED__?: boolean;
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'app',
  width: gameConfig.width,
  height: gameConfig.height,
  backgroundColor: gameConfig.colors.background,
  scene: [TitleScene, PlayScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  callbacks: {
    postBoot: () => {
      window.__BEAT_BREAKER_BOOTED__ = true;
      document.getElementById('boot-fallback')?.remove();
    },
  },
};

try {
  new Phaser.Game(config);
} catch (error) {
  const fallback = document.getElementById('boot-fallback');
  if (fallback) {
    fallback.innerHTML = '<h1>Beat Breaker</h1><p>Game failed to start. Check the browser console.</p>';
  }

  throw error;
}
