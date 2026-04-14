import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import type { ScoreSnapshot } from '../types/GameTypes';

const feverGaugeColor = 0xfacc15;
const feverActiveColor = 0xf97316;

export class GameplayHud {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly comboText: Phaser.GameObjects.Text;
  private readonly multiplierText: Phaser.GameObjects.Text;
  private readonly feverLabel: Phaser.GameObjects.Text;
  private readonly feverBack: Phaser.GameObjects.Rectangle;
  private readonly feverFill: Phaser.GameObjects.Rectangle;

  constructor(private readonly scene: Phaser.Scene) {
    this.scoreText = scene.add.text(72, 34, 'Score 0', {
      fontSize: '28px',
      color: '#f5f7fb',
      fontStyle: '900',
    });
    this.comboText = scene.add.text(72, 72, 'Combo 0', {
      fontSize: '22px',
      color: '#d1d5db',
      fontStyle: '800',
    });
    this.multiplierText = scene.add.text(72, 102, 'x1.00', {
      fontSize: '20px',
      color: gameConfig.colors.accent,
      fontStyle: '800',
    });

    this.feverLabel = scene.add.text(930, 42, 'FEVER', {
      fontSize: '20px',
      color: '#f5f7fb',
      fontStyle: '900',
    });
    this.feverBack = scene.add.rectangle(1056, 54, 256, 18, 0x202433, 1).setOrigin(0, 0.5);
    this.feverFill = scene.add
      .rectangle(1056, 54, 1, 18, feverGaugeColor, 1)
      .setOrigin(0, 0.5);
  }

  update(snapshot: ScoreSnapshot): void {
    this.scoreText.setText(`Score ${snapshot.score}`);
    this.comboText.setText(`Combo ${snapshot.combo}  Max ${snapshot.maxCombo}`);
    this.multiplierText.setText(`x${snapshot.multiplier.toFixed(2)}`);

    const ratio = snapshot.feverActive
      ? snapshot.feverRemainingMs / gameConfig.scoring.fever.durationMs
      : snapshot.feverGauge / gameConfig.scoring.fever.gaugeMax;
    const width = this.feverBack.width * Phaser.Math.Clamp(ratio, 0, 1);

    this.feverFill.setSize(Math.max(1, width), 18);
    this.feverFill.fillColor = snapshot.feverActive ? feverActiveColor : feverGaugeColor;
    this.feverLabel.setText(snapshot.feverActive ? 'FEVER ON' : 'FEVER');
  }
}
