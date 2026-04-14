import { gameConfig } from '../data/gameConfig';
import type { JudgmentName } from '../types/GameTypes';

export class ScoreSystem {
  score = 0;
  combo = 0;
  maxCombo = 0;
  perfects = 0;
  goods = 0;
  misses = 0;

  applyJudgment(judgment: JudgmentName, feverActive: boolean): number {
    if (judgment === 'Miss') {
      this.combo = 0;
      this.misses += 1;
      return 0;
    }

    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    if (judgment === 'Perfect') {
      this.perfects += 1;
    } else {
      this.goods += 1;
    }

    const comboBonus = Math.min(this.combo * 12, 720);
    const baseScore = gameConfig.judgments[judgment].score + comboBonus;
    const scoreDelta = Math.round(baseScore * (feverActive ? gameConfig.fever.scoreMultiplier : 1));
    this.score += scoreDelta;

    return scoreDelta;
  }
}
