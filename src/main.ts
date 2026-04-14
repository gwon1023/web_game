import Phaser from 'phaser';
import './style.css';
import { gameConfig } from './game/data/gameConfig';
import { PlayScene } from './game/scenes/PlayScene';
import { ResultScene } from './game/scenes/ResultScene';
import { TitleScene } from './game/scenes/TitleScene';

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
      document.getElementById('boot-fallback')?.remove();
    },
  },
};

new Phaser.Game(config);
