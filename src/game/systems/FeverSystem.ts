import { gameConfig } from '../data/gameConfig';
import type { JudgmentName } from '../types/GameTypes';

export class FeverSystem {
  meter = 0;
  activeUntilMs = 0;
  activations = 0;

  get isActive(): boolean {
    return this.activeUntilMs > 0;
  }

  update(songTimeMs: number): void {
    if (this.activeUntilMs > 0 && songTimeMs >= this.activeUntilMs) {
      this.activeUntilMs = 0;
    }
  }

  applyJudgment(judgment: JudgmentName, songTimeMs: number): void {
    if (this.isActive) {
      return;
    }

    this.meter = Phaser.Math.Clamp(
      this.meter + gameConfig.judgments[judgment].feverGain,
      0,
      gameConfig.fever.max,
    );

    if (this.meter >= gameConfig.fever.threshold) {
      this.meter = 0;
      this.activeUntilMs = songTimeMs + gameConfig.fever.durationMs;
      this.activations += 1;
    }
  }
}
