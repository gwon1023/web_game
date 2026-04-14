import { gameConfig } from '../data/gameConfig';

export class BestScoreStorage {
  load(): number {
    try {
      const rawValue = this.getStorage()?.getItem(gameConfig.persistence.bestScoreKey);
      const parsedValue = Number(rawValue);

      return Number.isFinite(parsedValue) ? parsedValue : 0;
    } catch {
      return 0;
    }
  }

  save(score: number): number {
    const bestScore = Math.max(this.load(), score);

    try {
      this.getStorage()?.setItem(gameConfig.persistence.bestScoreKey, String(bestScore));
    } catch {
      return bestScore;
    }

    return bestScore;
  }

  private getStorage(): Storage | undefined {
    try {
      return globalThis.localStorage;
    } catch {
      return undefined;
    }
  }
}
