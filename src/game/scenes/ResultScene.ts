import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import { BestScoreStorage } from '../systems/BestScoreStorage';
import type { ResultSceneData } from '../types/GameTypes';

export class ResultScene extends Phaser.Scene {
  private readonly bestScoreStorage = new BestScoreStorage();

  constructor() {
    super(gameConfig.sceneKeys.result);
  }

  create(
    data: ResultSceneData = {
      message: 'Run Complete',
      score: 0,
      maxCombo: 0,
      accuracy: 0,
      rank: 'D',
      finisherSuccess: false,
    },
  ): void {
    const previousBestScore = this.bestScoreStorage.load();
    const bestScore = this.bestScoreStorage.save(data.score);
    const bestLabel = data.score > previousBestScore ? 'New Best' : 'Best Score';

    this.cameras.main.setBackgroundColor(gameConfig.colors.background);

    this.add
      .text(640, 104, 'RESULT', {
        fontSize: '64px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 184, `Rank ${data.rank}`, {
        fontSize: '56px',
        color: this.getRankColor(data.rank),
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 250, `Score ${data.score}     ${bestLabel} ${bestScore}`, {
        fontSize: '30px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 300, `Max Combo ${data.maxCombo}     Accuracy ${data.accuracy.toFixed(1)}%`, {
        fontSize: '26px',
        color: '#d1d5db',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 346, `Finisher ${data.finisherSuccess ? 'Success' : 'Missed'}`, {
        fontSize: '24px',
        color: data.finisherSuccess ? '#34d399' : '#f87171',
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 394, data.message, {
        fontSize: '20px',
        color: '#9ca3af',
      })
      .setOrigin(0.5);

    this.createButton(500, 480, 'Restart', () => this.scene.start(gameConfig.sceneKeys.play));
    this.createButton(780, 480, 'Back to Title', () =>
      this.scene.start(gameConfig.sceneKeys.title),
    );

    this.add
      .text(640, 574, 'Space - Restart     Esc - Back to Title', {
        fontSize: '20px',
        color: gameConfig.colors.accent,
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start(gameConfig.sceneKeys.play);
    });

    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.start(gameConfig.sceneKeys.title);
    });
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    this.add
      .rectangle(x, y, 210, 56, 0x202433, 1)
      .setStrokeStyle(2, 0xfacc15)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick);

    this.add
      .text(x, y, label, {
        fontSize: '24px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick);
  }

  private getRankColor(rank: ResultSceneData['rank']): string {
    if (rank === 'S') {
      return '#facc15';
    }

    if (rank === 'A') {
      return '#34d399';
    }

    if (rank === 'B') {
      return '#7dd3fc';
    }

    if (rank === 'C') {
      return '#d1d5db';
    }

    return '#f87171';
  }
}
