import { gameConfig } from '../data/gameConfig';
import type { ChartNote, JudgmentName, NoteType } from '../types/GameTypes';

export interface PendingNote {
  readonly note: ChartNote;
  judged: boolean;
}

export interface TimingJudgment {
  readonly note: PendingNote;
  readonly judgment: JudgmentName;
  readonly offsetMs: number;
}

export class JudgmentSystem {
  findHit(
    pendingNotes: readonly PendingNote[],
    inputType: NoteType,
    songTimeMs: number,
  ): TimingJudgment | undefined {
    let closest: PendingNote | undefined;
    let closestOffset = Number.POSITIVE_INFINITY;

    for (const pending of pendingNotes) {
      if (pending.judged || pending.note.type !== inputType) {
        continue;
      }

      const offset = songTimeMs - pending.note.timeMs;
      const distance = Math.abs(offset);
      if (distance <= gameConfig.missWindowMs && distance < Math.abs(closestOffset)) {
        closest = pending;
        closestOffset = offset;
      }
    }

    if (!closest) {
      return undefined;
    }

    return {
      note: closest,
      judgment: this.getJudgmentName(closestOffset),
      offsetMs: Math.round(closestOffset),
    };
  }

  getExpiredMisses(pendingNotes: readonly PendingNote[], songTimeMs: number): PendingNote[] {
    return pendingNotes.filter(
      (pending) =>
        !pending.judged && songTimeMs - pending.note.timeMs > gameConfig.judgments.Miss.windowMs,
    );
  }

  private getJudgmentName(offsetMs: number): JudgmentName {
    const distance = Math.abs(offsetMs);

    if (distance <= gameConfig.judgments.Perfect.windowMs) {
      return 'Perfect';
    }

    if (distance <= gameConfig.judgments.Good.windowMs) {
      return 'Good';
    }

    return 'Miss';
  }
}
