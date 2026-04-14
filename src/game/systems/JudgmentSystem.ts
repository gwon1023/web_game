import { gameConfig } from '../data/gameConfig';
import type { ChartNote, JudgmentName, JudgmentResult, NoteType } from '../types/GameTypes';
import type { NotePlaybackState } from './ChartPlaybackSystem';

export class JudgmentSystem {
  judge(
    notes: readonly NotePlaybackState[],
    inputType: NoteType,
    songTimeMs: number,
  ): JudgmentResult {
    const closestNote = this.findClosestMatchingNote(notes, inputType, songTimeMs);

    if (!closestNote) {
      return {
        judgment: 'Miss',
        offsetMs: 0,
      };
    }

    const offsetMs = Math.round(songTimeMs - closestNote.timeMs);
    const judgment = this.getJudgment(offsetMs);

    return {
      judgment,
      offsetMs,
      note: judgment === 'Miss' ? undefined : closestNote,
    };
  }

  private findClosestMatchingNote(
    notes: readonly NotePlaybackState[],
    inputType: NoteType,
    songTimeMs: number,
  ): ChartNote | undefined {
    let closestNote: ChartNote | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const item of notes) {
      if (item.note.type !== inputType) {
        continue;
      }

      const distance = Math.abs(songTimeMs - item.note.timeMs);
      if (distance <= gameConfig.judgment.goodWindowMs && distance < closestDistance) {
        closestNote = item.note;
        closestDistance = distance;
      }
    }

    return closestNote;
  }

  private getJudgment(offsetMs: number): JudgmentName {
    const distance = Math.abs(offsetMs);

    if (distance <= gameConfig.judgment.perfectWindowMs) {
      return 'Perfect';
    }

    if (distance <= gameConfig.judgment.goodWindowMs) {
      return 'Good';
    }

    return 'Miss';
  }
}
