import { gameConfig } from '../data/gameConfig';
import type { JudgmentName, JudgmentResult, ResultRank, ScoreSnapshot } from '../types/GameTypes';

export class ScoreSystem {
  private score = 0;
  private combo = 0;
  private maxCombo = 0;
  private feverGauge = 0;
  private feverRemainingMs = 0;
  private lastScoreAdded = 0;
  private accuracyPoints = 0;
  private judgedNoteCount = 0;
  private finisherSuccess = false;

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.feverGauge = 0;
    this.feverRemainingMs = 0;
    this.lastScoreAdded = 0;
    this.accuracyPoints = 0;
    this.judgedNoteCount = 0;
    this.finisherSuccess = false;
  }

  update(deltaMs: number): void {
    if (!this.isFeverActive()) {
      return;
    }

    this.feverRemainingMs = Math.max(0, this.feverRemainingMs - deltaMs);
  }

  applyJudgment(result: JudgmentResult): ScoreSnapshot {
    const { judgment } = result;

    if (judgment === 'Miss') {
      this.combo = 0;
      this.feverGauge = Math.max(0, this.feverGauge - gameConfig.scoring.fever.missPenalty);
      this.lastScoreAdded = 0;
      this.trackAccuracy(result);
      return this.getSnapshot();
    }

    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.finisherSuccess = this.finisherSuccess || result.note?.type === 'finisher';
    this.addFeverGauge(judgment);
    this.trackAccuracy(result);

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
      accuracy: this.getAccuracy(),
      rank: this.getRank(),
      finisherSuccess: this.finisherSuccess,
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

  private trackAccuracy(result: JudgmentResult): void {
    if (!result.note) {
      return;
    }

    this.judgedNoteCount += 1;
    this.accuracyPoints += gameConfig.scoring.judgmentScore[result.judgment];
  }

  private getAccuracy(): number {
    if (this.judgedNoteCount === 0) {
      return 0;
    }

    const maxAccuracyPoints = this.judgedNoteCount * gameConfig.scoring.judgmentScore.Perfect;

    return (this.accuracyPoints / maxAccuracyPoints) * 100;
  }

  private getRank(): ResultRank {
    const accuracy = this.getAccuracy();

    if (accuracy >= gameConfig.scoring.rank.sAccuracy && this.finisherSuccess) {
      return 'S';
    }

    if (accuracy >= gameConfig.scoring.rank.aAccuracy) {
      return 'A';
    }

    if (accuracy >= gameConfig.scoring.rank.bAccuracy) {
      return 'B';
    }

    if (accuracy >= gameConfig.scoring.rank.cAccuracy) {
      return 'C';
    }

    return 'D';
  }

  private isFeverActive(): boolean {
    return this.feverRemainingMs > 0;
  }
}
