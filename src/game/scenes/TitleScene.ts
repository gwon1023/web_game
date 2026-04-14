import Phaser from 'phaser';
import { beatBreakerChart } from '../data/beatBreakerChart';
import { gameConfig } from '../data/gameConfig';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);

    this.add.rectangle(640, 360, 1280, 720, 0x08090d);
    this.add.rectangle(640, 360, 1280, 720, 0x111827, 0.32);

    this.add
      .text(640, 150, 'BEAT BREAKER', {
        fontSize: '82px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 230, 'J Light  |  K Heavy  |  Space Finisher', {
        fontSize: '28px',
        color: '#d1d5db',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 292, `${beatBreakerChart.title} - ${beatBreakerChart.bpm} BPM - 49 seconds`, {
        fontSize: '22px',
        color: '#9ca3af',
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(640, 456, 'Press Space to Start', {
        fontSize: '34px',
        color: '#facc15',
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.35,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.add
      .text(640, 540, 'Hit notes as they cross the white strike line. Misses break combo. Fever boosts score.', {
        fontSize: '20px',
        color: '#d1d5db',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('PlayScene');
    });
  }
}
