import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import type { JudgmentResult, NoteType, ScoreSnapshot } from '../types/GameTypes';

type LaneYResolver = (type: NoteType) => number;

export class HitFeedback {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getLaneY: LaneYResolver,
  ) {}

  play(
    result: JudgmentResult,
    previousSnapshot: ScoreSnapshot,
    snapshot: ScoreSnapshot,
  ): void {
    if (result.note && result.judgment !== 'Miss') {
      this.playScreenShake(result.note.type);

      if (result.judgment === 'Perfect') {
        this.showPerfectBurst(result.note.type);
      }
    }

    if (this.isNewComboMilestone(previousSnapshot.combo, snapshot.combo)) {
      this.showComboMilestone(snapshot.combo);
    }

    if (!previousSnapshot.feverActive && snapshot.feverActive) {
      this.showFeverActivation();
    }
  }

  private playScreenShake(noteType: NoteType): void {
    if (noteType === 'heavy') {
      this.scene.cameras.main.shake(
        gameConfig.gameFeel.shake.heavyDurationMs,
        gameConfig.gameFeel.shake.heavyIntensity,
      );
      return;
    }

    if (noteType === 'finisher') {
      this.scene.cameras.main.shake(
        gameConfig.gameFeel.shake.finisherDurationMs,
        gameConfig.gameFeel.shake.finisherIntensity,
      );
    }
  }

  private showPerfectBurst(noteType: NoteType): void {
    const y = this.getLaneY(noteType);

    for (let index = 0; index < gameConfig.gameFeel.perfectBurst.particleCount; index += 1) {
      const angle = (Math.PI * 2 * index) / gameConfig.gameFeel.perfectBurst.particleCount;
      const particle = this.scene.add.circle(
        gameConfig.playfield.judgeLineX,
        y,
        noteType === 'finisher' ? 7 : 5,
        0xfacc15,
        0.95,
      );

      this.scene.tweens.add({
        targets: particle,
        x:
          gameConfig.playfield.judgeLineX +
          Math.cos(angle) * gameConfig.gameFeel.perfectBurst.distance,
        y: y + Math.sin(angle) * gameConfig.gameFeel.perfectBurst.distance,
        alpha: 0,
        scale: 0.2,
        duration: gameConfig.gameFeel.perfectBurst.durationMs,
        ease: 'Quad.Out',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private isNewComboMilestone(previousCombo: number, currentCombo: number): boolean {
    return (
      currentCombo > 0 &&
      currentCombo % gameConfig.gameFeel.comboMilestone.interval === 0 &&
      currentCombo !== previousCombo
    );
  }

  private showComboMilestone(combo: number): void {
    const text = this.scene.add
      .text(640, 548, `${combo} COMBO`, {
        fontSize: '42px',
        color: '#facc15',
        fontStyle: '900',
      })
      .setOrigin(0.5)
      .setScale(0.82);

    this.scene.tweens.add({
      targets: text,
      y: 512,
      alpha: 0,
      scale: 1.18,
      duration: gameConfig.gameFeel.comboMilestone.durationMs,
      ease: 'Back.Out',
      onComplete: () => text.destroy(),
    });
  }

  private showFeverActivation(): void {
    const flash = this.scene.add
      .rectangle(640, 360, 1280, 720, 0xf97316, 0.28)
      .setBlendMode(Phaser.BlendModes.ADD);
    const text = this.scene.add
      .text(640, 214, 'FEVER ON', {
        fontSize: '54px',
        color: '#f97316',
        fontStyle: '900',
      })
      .setOrigin(0.5)
      .setScale(0.78);

    this.scene.cameras.main.shake(
      gameConfig.gameFeel.shake.finisherDurationMs,
      gameConfig.gameFeel.shake.finisherIntensity,
    );

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: gameConfig.gameFeel.feverActivation.flashDurationMs,
      ease: 'Quad.Out',
      onComplete: () => flash.destroy(),
    });
    this.scene.tweens.add({
      targets: text,
      scale: 1.08,
      alpha: 0,
      duration: gameConfig.gameFeel.feverActivation.textDurationMs,
      ease: 'Back.Out',
      onComplete: () => text.destroy(),
    });
  }
}
