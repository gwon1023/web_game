import type { ChartNote, NoteType, SongChart } from '../../types/GameTypes';

const beatMs = 500;
const songStartMs = 1200;

const pattern: readonly NoteType[] = [
  'light',
  'light',
  'heavy',
  'light',
  'heavy',
  'light',
  'finisher',
  'light',
  'heavy',
  'light',
  'light',
  'heavy',
  'finisher',
  'light',
  'heavy',
  'light',
];

function createSampleNotes(): readonly ChartNote[] {
  const notes: ChartNote[] = [];

  for (let beat = 0; beat < 96; beat += 1) {
    notes.push({
      id: `note-${notes.length}`,
      timeMs: songStartMs + beat * beatMs,
      type: pattern[beat % pattern.length],
    });

    if (beat % 8 === 6) {
      notes.push({
        id: `note-${notes.length}`,
        timeMs: songStartMs + beat * beatMs + beatMs / 2,
        type: beat % 16 === 6 ? 'light' : 'heavy',
      });
    }
  }

  return notes;
}

export const sampleChart: SongChart = {
  id: 'sample-45-second-chart',
  title: 'Beat Breaker Sample',
  artist: 'Placeholder',
  durationMs: 52000,
  notes: createSampleNotes(),
};
