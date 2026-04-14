import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import type { ActiveChartNote, ChartNote, NoteLifecycleState, SongChart } from '../types/GameTypes';

interface NotePlaybackState {
  readonly note: ChartNote;
  state: NoteLifecycleState;
}

export class ChartPlaybackSystem {
  private readonly notes: NotePlaybackState[];
  private startTimeMs = 0;

  constructor(private readonly chart: SongChart) {
    this.notes = chart.notes.map((note) => ({
      note,
      state: 'pending',
    }));
  }

  start(nowMs: number): void {
    this.startTimeMs = nowMs;
    this.notes.forEach((item) => {
      item.state = 'pending';
    });
  }

  getSongTime(nowMs: number): number {
    return Math.max(0, nowMs - this.startTimeMs);
  }

  update(songTimeMs: number): readonly ActiveChartNote[] {
    for (const item of this.notes) {
      if (item.state === 'expired') {
        continue;
      }

      if (songTimeMs >= item.note.timeMs + gameConfig.chart.expireAfterMs) {
        item.state = 'expired';
        continue;
      }

      if (songTimeMs >= item.note.timeMs - gameConfig.chart.approachTimeMs) {
        item.state = 'active';
      }
    }

    return this.notes
      .filter((item) => item.state === 'active')
      .map((item) => ({
        note: item.note,
        state: item.state,
        progress: this.getApproachProgress(item.note, songTimeMs),
      }));
  }

  isComplete(songTimeMs: number): boolean {
    return songTimeMs >= this.chart.durationMs + gameConfig.chart.endDelayMs;
  }

  private getApproachProgress(note: ChartNote, songTimeMs: number): number {
    const spawnTimeMs = note.timeMs - gameConfig.chart.approachTimeMs;
    const rawProgress = (songTimeMs - spawnTimeMs) / gameConfig.chart.approachTimeMs;
    return Phaser.Math.Clamp(rawProgress, 0, 1.16);
  }
}
