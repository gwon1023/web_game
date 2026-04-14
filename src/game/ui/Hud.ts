import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import type { JudgmentName } from '../types/GameTypes';

export class Hud {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly comboText: Phaser.GameObjects.Text;
  private readonly judgmentText: Phaser.GameObjects.Text;
  private readonly feverFill: Phaser.GameObjects.Rectangle;
  private readonly feverLabel: Phaser.GameObjects.Text;
  private readonly progressFill: Phaser.GameObjects.Rectangle;

  constructor(private readonly scene: Phaser.Scene) {
    this.scoreText = scene.add.text(56, 42, 'Score 0', {
      fontSize: '28px',
      color: gameConfig.colors.text,
      fontStyle: '700',
    });

    this.comboText = scene.add.text(56, 82, 'Combo 0', {
      fontSize: '22px',
      color: gameConfig.colors.muted,
    });

    this.judgmentText = scene.add
      .text(640, 128, 'Hit on rhythm', {
        fontSize: '40px',
        color: gameConfig.colors.text,
        fontStyle: '800',
      })
      .setOrigin(0.5);

    scene.add.rectangle(1040, 48, 260, 18, 0x252a38).setOrigin(0, 0.5);
    this.feverFill = scene.add.rectangle(1040, 48, 0, 18, gameConfig.colors.fever).setOrigin(0, 0.5);
    this.feverLabel = scene.add.text(1040, 70, 'Fever', {
      fontSize: '16px',
      color: gameConfig.colors.muted,
    });

    scene.add.rectangle(0, 704, gameConfig.width, 10, 0x1b1e29).setOrigin(0, 0.5);
    this.progressFill = scene.add.rectangle(0, 704, 0, 10, 0xf5f7fb).setOrigin(0, 0.5);
  }

  updateScore(score: number, combo: number): void {
    this.scoreText.setText(`Score ${score.toLocaleString()}`);
    this.comboText.setText(combo > 0 ? `Combo ${combo}` : 'Combo 0');
  }

  updateFever(meterRatio: number, active: boolean): void {
    this.feverFill.width = 260 * Phaser.Math.Clamp(meterRatio, 0, 1);
    this.feverFill.fillColor = active ? 0xfacc15 : gameConfig.colors.fever;
    this.feverLabel.setText(active ? 'Fever x1.5' : 'Fever');
  }

  updateProgress(songTimeMs: number, durationMs: number): void {
    this.progressFill.width =
      gameConfig.width * Phaser.Math.Clamp(songTimeMs / Math.max(durationMs, 1), 0, 1);
  }

  showJudgment(judgment: JudgmentName, offsetMs: number): void {
    const colors: Record<JudgmentName, string> = {
      Perfect: '#facc15',
      Good: '#7dd3fc',
      Miss: '#f87171',
    };

    const offsetText = judgment === 'Miss' ? '' : ` ${offsetMs > 0 ? '+' : ''}${offsetMs}ms`;
    this.judgmentText.setText(`${judgment}${offsetText}`);
    this.judgmentText.setColor(colors[judgment]);
    this.judgmentText.setScale(1.18);

    this.scene.tweens.add({
      targets: this.judgmentText,
      scale: 1,
      duration: 120,
      ease: 'Quad.Out',
    });
  }
}
