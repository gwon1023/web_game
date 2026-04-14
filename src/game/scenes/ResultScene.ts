import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import type { RunResult } from '../types/GameTypes';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create(result: RunResult): void {
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);

    const isNewBest = result.score > result.previousBestScore;

    this.add
      .text(640, 92, isNewBest ? 'NEW BEST' : 'RESULT', {
        fontSize: '58px',
        color: isNewBest ? '#facc15' : '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 170, result.chartTitle, {
        fontSize: '24px',
        color: '#9ca3af',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 260, result.score.toLocaleString(), {
        fontSize: '86px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    const rows = [
      `Best ${result.bestScore.toLocaleString()}`,
      `Max Combo ${result.maxCombo}`,
      `Perfect ${result.perfects}`,
      `Good ${result.goods}`,
      `Miss ${result.misses}`,
      `Fever ${result.feverActivations}`,
    ];

    this.add
      .text(640, 394, rows.join('     '), {
        fontSize: '22px',
        color: '#d1d5db',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 522, 'Space Restart     Esc Title', {
        fontSize: '30px',
        color: '#facc15',
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('PlayScene');
    });

    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });
  }
}
