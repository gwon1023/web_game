import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import type { ResultSceneData } from '../types/GameTypes';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super(gameConfig.sceneKeys.result);
  }

  create(data: ResultSceneData = { message: 'Run Complete' }): void {
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);

    this.add
      .text(640, 128, 'RESULT', {
        fontSize: '64px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 250, data.message, {
        fontSize: '34px',
        color: '#d1d5db',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 326, `Score ${data.score ?? 0}     Max Combo ${data.maxCombo ?? 0}`, {
        fontSize: '34px',
        color: gameConfig.colors.accent,
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 430, 'Space - Restart     Esc - Back to Title', {
        fontSize: '30px',
        color: gameConfig.colors.accent,
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 526, 'Chase a cleaner run and a higher fever chain.', {
        fontSize: '20px',
        color: '#9ca3af',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start(gameConfig.sceneKeys.play);
    });

    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.start(gameConfig.sceneKeys.title);
    });
  }
}
