import Phaser from 'phaser';
import { sampleChart } from '../data/charts/sampleChart';
import { gameConfig } from '../data/gameConfig';
import { ChartPlaybackSystem } from '../systems/ChartPlaybackSystem';
import type { InputAction } from '../types/GameTypes';
import type { ActiveChartNote, NoteType } from '../types/GameTypes';

interface NoteView {
  readonly body: Phaser.GameObjects.Rectangle;
  readonly label: Phaser.GameObjects.Text;
}

const laneOrder: readonly NoteType[] = ['light', 'heavy', 'finisher'];

export class PlayScene extends Phaser.Scene {
  private actionText!: Phaser.GameObjects.Text;
  private songTimeText!: Phaser.GameObjects.Text;
  private readonly chartPlayback = new ChartPlaybackSystem(sampleChart);
  private readonly noteViews = new Map<string, NoteView>();

  constructor() {
    super(gameConfig.sceneKeys.play);
  }

  create(): void {
    this.noteViews.clear();
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);
    this.drawPlaceholderUi();
    this.chartPlayback.start(this.time.now);
    this.registerInput();
  }

  update(_time: number, _delta: number): void {
    const songTimeMs = this.chartPlayback.getSongTime(this.time.now);
    const activeNotes = this.chartPlayback.update(songTimeMs);
    this.syncNoteViews(activeNotes);
    this.songTimeText.setText(`${sampleChart.title}  ${Math.floor(songTimeMs / 1000)}s`);

    if (this.chartPlayback.isComplete(songTimeMs)) {
      this.scene.start(gameConfig.sceneKeys.result, {
        message: 'Chart playback complete',
      });
    }
  }

  private drawPlaceholderUi(): void {
    this.add.rectangle(640, 360, 1280, 720, 0x08090d);
    this.add.rectangle(640, 360, 1120, 470, gameConfig.colors.panel, 0.68);

    this.add
      .text(640, 76, 'PLAY', {
        fontSize: '48px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.songTimeText = this.add
      .text(640, 126, sampleChart.title, {
        fontSize: '22px',
        color: '#d1d5db',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 166, 'Notes move toward the judge line. Scoring and judgments come later.', {
        fontSize: '20px',
        color: '#9ca3af',
      })
      .setOrigin(0.5);

    this.drawLanes();

    this.actionText = this.add
      .text(640, 624, 'Press J, K, or Space', {
        fontSize: '28px',
        color: gameConfig.colors.accent,
        fontStyle: '800',
      })
      .setOrigin(0.5);
  }

  private drawLanes(): void {
    laneOrder.forEach((type) => {
      const y = this.getLaneY(type);
      const noteConfig = gameConfig.notes[type];

      this.add.rectangle(640, y, gameConfig.playfield.laneWidth, 62, 0x202433, 0.82);
      this.add.rectangle(gameConfig.playfield.judgeLineX, y, 16, 86, 0xf5f7fb, 0.95);
      this.add.rectangle(130, y, 126, 50, noteConfig.color, 0.2);
      this.add
        .text(130, y, `${noteConfig.label}  ${noteConfig.laneName}`, {
          fontSize: type === 'finisher' ? '18px' : '22px',
          color: '#f5f7fb',
          fontStyle: '800',
        })
        .setOrigin(0.5);
    });
  }

  private syncNoteViews(activeNotes: readonly ActiveChartNote[]): void {
    const activeIds = new Set(activeNotes.map((activeNote) => activeNote.note.id));

    for (const activeNote of activeNotes) {
      const view = this.noteViews.get(activeNote.note.id) ?? this.createNoteView(activeNote);
      const x = Phaser.Math.Linear(
        gameConfig.playfield.spawnX,
        gameConfig.playfield.judgeLineX,
        activeNote.progress,
      );

      view.body.x = x;
      view.label.x = x;
    }

    for (const [noteId, view] of this.noteViews) {
      if (activeIds.has(noteId)) {
        continue;
      }

      view.body.destroy();
      view.label.destroy();
      this.noteViews.delete(noteId);
    }
  }

  private createNoteView(activeNote: ActiveChartNote): NoteView {
    const noteConfig = gameConfig.notes[activeNote.note.type];
    const y = this.getLaneY(activeNote.note.type);
    const width =
      activeNote.note.type === 'finisher'
        ? gameConfig.playfield.finisherWidth
        : gameConfig.playfield.noteWidth;
    const body = this.add.rectangle(
      gameConfig.playfield.spawnX,
      y,
      width,
      gameConfig.playfield.noteHeight,
      noteConfig.color,
      0.96,
    );
    const label = this.add
      .text(gameConfig.playfield.spawnX, y, noteConfig.label, {
        fontSize: activeNote.note.type === 'finisher' ? '17px' : '24px',
        color: '#08090d',
        fontStyle: '900',
      })
      .setOrigin(0.5);
    const view = { body, label };

    this.noteViews.set(activeNote.note.id, view);
    return view;
  }

  private registerInput(): void {
    this.input.keyboard?.on('keydown-J', () => this.handleAction('lightAttack'));
    this.input.keyboard?.on('keydown-K', () => this.handleAction('heavyAttack'));
    this.input.keyboard?.on('keydown-SPACE', () => this.handleAction('finisher'));

    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.start(gameConfig.sceneKeys.result, {
        message: 'Chart playback skipped',
      });
    });
  }

  private handleAction(action: InputAction): void {
    this.actionText.setText(`${gameConfig.controls[action].label} pressed`);
  }

  private getLaneY(type: NoteType): number {
    return gameConfig.playfield.laneStartY + laneOrder.indexOf(type) * gameConfig.playfield.laneGap;
  }
}
