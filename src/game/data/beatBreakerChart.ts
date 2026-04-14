import type { ChartNote, NoteType, SongChart } from '../types/GameTypes';

const beatMs = 500;

const pattern: readonly NoteType[] = [
  'light',
  'light',
  'heavy',
  'light',
  'light',
  'heavy',
  'light',
  'finisher',
  'heavy',
  'light',
  'heavy',
  'light',
  'light',
  'heavy',
  'finisher',
  'light',
];

const accents = new Map<number, NoteType>([
  [12, 'heavy'],
  [23, 'finisher'],
  [31, 'heavy'],
  [39, 'finisher'],
  [47, 'heavy'],
  [55, 'finisher'],
  [63, 'heavy'],
  [71, 'finisher'],
  [79, 'finisher'],
  [87, 'finisher'],
]);

function makeNotes(): readonly ChartNote[] {
  const notes: ChartNote[] = [];
  let id = 0;

  for (let beat = 0; beat < 92; beat += 1) {
    if (beat % 8 === 6) {
      notes.push({
        id: id++,
        timeMs: 1200 + beat * beatMs + beatMs / 2,
        type: beat % 16 === 6 ? 'light' : 'heavy',
      });
    }

    notes.push({
      id: id++,
      timeMs: 1200 + beat * beatMs,
      type: accents.get(beat) ?? pattern[beat % pattern.length],
    });
  }

  return notes;
}

export const beatBreakerChart: SongChart = {
  id: 'neon-spar',
  title: 'Neon Spar',
  artist: 'Placeholder Track',
  bpm: 120,
  durationMs: 49000,
  leadInMs: 2200,
  notes: makeNotes(),
};
