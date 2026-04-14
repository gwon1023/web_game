import { gameConfig } from '../data/gameConfig';

export class BestScoreStore {
  load(): number {
    const rawScore = localStorage.getItem(gameConfig.storageBestScoreKey);
    const score = Number(rawScore);
    return Number.isFinite(score) ? score : 0;
  }

  saveIfBest(score: number): { bestScore: number; previousBestScore: number } {
    const previousBestScore = this.load();
    const bestScore = Math.max(previousBestScore, score);
    localStorage.setItem(gameConfig.storageBestScoreKey, String(bestScore));

    return {
      bestScore,
      previousBestScore,
    };
  }
}
