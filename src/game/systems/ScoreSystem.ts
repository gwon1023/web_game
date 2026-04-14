import { gameConfig } from '../data/gameConfig';
import type { JudgmentName, ScoreSnapshot } from '../types/GameTypes';

export class ScoreSystem {
  private score = 0;
  private combo = 0;
  private maxCombo = 0;
  private feverGauge = 0;
  private feverRemainingMs = 0;
  private lastScoreAdded = 0;

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.feverGauge = 0;
    this.feverRemainingMs = 0;
    this.lastScoreAdded = 0;
  }

  update(deltaMs: number): void {
    if (!this.isFeverActive()) {
      return;
    }

    this.feverRemainingMs = Math.max(0, this.feverRemainingMs - deltaMs);
  }

  applyJudgment(judgment: JudgmentName): ScoreSnapshot {
    if (judgment === 'Miss') {
      this.combo = 0;
      this.feverGauge = Math.max(0, this.feverGauge - gameConfig.scoring.fever.missPenalty);
      this.lastScoreAdded = 0;
      return this.getSnapshot();
    }

    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.addFeverGauge(judgment);

    const baseScore = gameConfig.scoring.judgmentScore[judgment];
    this.lastScoreAdded = Math.round(baseScore * this.getMultiplier());
    this.score += this.lastScoreAdded;

    return this.getSnapshot();
  }

  getSnapshot(): ScoreSnapshot {
    return {
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      multiplier: this.getMultiplier(),
      feverGauge: this.feverGauge,
      feverActive: this.isFeverActive(),
      feverRemainingMs: this.feverRemainingMs,
      lastScoreAdded: this.lastScoreAdded,
    };
  }

  private addFeverGauge(judgment: Exclude<JudgmentName, 'Miss'>): void {
    const gain =
      judgment === 'Perfect'
        ? gameConfig.scoring.fever.perfectGain
        : gameConfig.scoring.fever.goodGain;

    this.feverGauge = Math.min(gameConfig.scoring.fever.gaugeMax, this.feverGauge + gain);

    if (this.feverGauge >= gameConfig.scoring.fever.gaugeMax) {
      this.feverGauge = 0;
      this.feverRemainingMs = gameConfig.scoring.fever.durationMs;
    }
  }

  private getMultiplier(): number {
    const comboBonus = Math.min(
      gameConfig.scoring.comboMultiplier.maxBonus,
      Math.floor(this.combo / gameConfig.scoring.comboMultiplier.milestoneSize) *
        gameConfig.scoring.comboMultiplier.bonusPerMilestone,
    );
    const feverBonus = this.isFeverActive() ? gameConfig.scoring.fever.multiplierBonus : 0;

    return 1 + comboBonus + feverBonus;
  }

  private isFeverActive(): boolean {
    return this.feverRemainingMs > 0;
  }
}
