import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import { BestScoreStorage } from '../systems/BestScoreStorage';

export class TitleScene extends Phaser.Scene {
  private readonly bestScoreStorage = new BestScoreStorage();

  constructor() {
    super(gameConfig.sceneKeys.title);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);

    this.add.rectangle(640, 360, 1280, 720, 0x08090d);
    this.add.rectangle(640, 360, 1280, 720, gameConfig.colors.panel, 0.3);

    this.add
      .text(640, 150, 'BEAT BREAKER', {
        fontSize: '82px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 232, 'Rhythm action MVP structure', {
        fontSize: '28px',
        color: '#d1d5db',
      })
      .setOrigin(0.5);

    this.add
      .text(
        640,
        306,
        [
          gameConfig.controls.lightAttack.label,
          gameConfig.controls.heavyAttack.label,
          gameConfig.controls.finisher.label,
        ].join('     '),
        {
          fontSize: '24px',
          color: '#f5f7fb',
        },
      )
      .setOrigin(0.5);

    this.add
      .text(640, 370, `Best Score ${this.bestScoreStorage.load()}`, {
        fontSize: '28px',
        color: gameConfig.colors.accent,
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 430, 'Press Space to start', {
        fontSize: '34px',
        color: gameConfig.colors.accent,
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 542, 'Hit notes on rhythm. Land a finisher for the S rank.', {
        fontSize: '20px',
        color: '#9ca3af',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start(gameConfig.sceneKeys.play);
    });
  }
}
