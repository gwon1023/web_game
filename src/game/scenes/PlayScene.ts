import Phaser from 'phaser';
import { sampleChart } from '../data/charts/sampleChart';
import { gameConfig } from '../data/gameConfig';
import { ChartPlaybackSystem } from '../systems/ChartPlaybackSystem';
import { JudgmentSystem } from '../systems/JudgmentSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import type {
  ActiveChartNote,
  InputAction,
  JudgmentResult,
  NoteType,
  ScoreSnapshot,
} from '../types/GameTypes';
import { GameplayHud } from '../ui/GameplayHud';

interface NoteView {
  readonly body: Phaser.GameObjects.Rectangle;
  readonly label: Phaser.GameObjects.Text;
}

const laneOrder: readonly NoteType[] = ['light', 'heavy', 'finisher'];

export class PlayScene extends Phaser.Scene {
  private actionText!: Phaser.GameObjects.Text;
  private songTimeText!: Phaser.GameObjects.Text;
  private feverOverlay!: Phaser.GameObjects.Rectangle;
  private hud!: GameplayHud;
  private readonly chartPlayback = new ChartPlaybackSystem(sampleChart);
  private readonly judgmentSystem = new JudgmentSystem();
  private readonly scoreSystem = new ScoreSystem();
  private readonly noteViews = new Map<string, NoteView>();

  constructor() {
    super(gameConfig.sceneKeys.play);
  }

  create(): void {
    this.noteViews.clear();
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);
    this.drawPlaceholderUi();
    this.scoreSystem.reset();
    this.hud = new GameplayHud(this);
    this.hud.update(this.scoreSystem.getSnapshot());
    this.chartPlayback.start(this.time.now);
    this.registerInput();
  }

  update(_time: number, delta: number): void {
    const songTimeMs = this.chartPlayback.getSongTime(this.time.now);
    this.scoreSystem.update(delta);

    const lateMisses = this.chartPlayback.collectLateMisses(
      songTimeMs,
      gameConfig.judgment.goodWindowMs,
    );

    lateMisses.forEach((miss) => {
      this.destroyNoteView(miss.note?.id);
      this.applyJudgmentResult(miss);
    });

    const activeNotes = this.chartPlayback.update(songTimeMs);
    this.syncNoteViews(activeNotes);
    this.songTimeText.setText(`${sampleChart.title}  ${Math.floor(songTimeMs / 1000)}s`);
    this.updateFeverIntensity();
    this.hud.update(this.scoreSystem.getSnapshot());

    if (this.chartPlayback.isComplete(songTimeMs)) {
      this.startResult('Chart playback complete');
    }
  }

  private drawPlaceholderUi(): void {
    this.add.rectangle(640, 360, 1280, 720, 0x08090d);
    this.add.rectangle(640, 360, 1120, 470, gameConfig.colors.panel, 0.68);
    this.feverOverlay = this.add
      .rectangle(640, 360, 1280, 720, 0xf97316, 0)
      .setBlendMode(Phaser.BlendModes.ADD);

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
      .text(640, 166, 'Hit J, K, or Space as matching notes reach the judge line.', {
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
    this.input.keyboard?.removeAllListeners('keydown-J');
    this.input.keyboard?.removeAllListeners('keydown-K');
    this.input.keyboard?.removeAllListeners('keydown-SPACE');
    this.input.keyboard?.removeAllListeners('keydown-ESC');

    this.input.keyboard?.on('keydown-J', () => this.handleAction('lightAttack'));
    this.input.keyboard?.on('keydown-K', () => this.handleAction('heavyAttack'));
    this.input.keyboard?.on('keydown-SPACE', () => this.handleAction('finisher'));

    this.input.keyboard?.once('keydown-ESC', () => {
      this.startResult('Chart playback skipped');
    });
  }

  private handleAction(action: InputAction): void {
    const songTimeMs = this.chartPlayback.getSongTime(this.time.now);
    const judgment = this.judgmentSystem.judge(
      this.chartPlayback.getJudgeableNotes(),
      this.getNoteTypeForAction(action),
      songTimeMs,
    );

    if (judgment.note) {
      this.chartPlayback.markJudged(judgment.note.id);
      this.destroyNoteView(judgment.note.id);
    }

    this.actionText.setText(`${gameConfig.controls[action].label} pressed`);
    this.applyJudgmentResult(judgment);
  }

  private applyJudgmentResult(result: JudgmentResult): void {
    const previousSnapshot = this.scoreSystem.getSnapshot();
    const snapshot = this.scoreSystem.applyJudgment(result);

    this.showJudgmentText(result);
    this.playHitFeel(result, previousSnapshot, snapshot);
    this.hud.update(snapshot);
  }

  private showJudgmentText(result: JudgmentResult): void {
    const colorByJudgment = {
      Perfect: '#facc15',
      Good: '#7dd3fc',
      Miss: '#f87171',
    };
    const offsetText =
      result.judgment === 'Miss' || !result.note
        ? ''
        : ` ${result.offsetMs > 0 ? '+' : ''}${result.offsetMs}ms`;
    const noteLabel = result.note ? ` ${gameConfig.notes[result.note.type].label}` : '';
    const y = result.note ? this.getLaneY(result.note.type) - 48 : 210;
    const text = this.add
      .text(gameConfig.playfield.judgeLineX, y, `${result.judgment}${noteLabel}${offsetText}`, {
        fontSize: '28px',
        color: colorByJudgment[result.judgment],
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 42,
      alpha: 0,
      duration: 520,
      ease: 'Quad.Out',
      onComplete: () => text.destroy(),
    });
  }

  private destroyNoteView(noteId: string | undefined): void {
    if (!noteId) {
      return;
    }

    const view = this.noteViews.get(noteId);
    if (!view) {
      return;
    }

    view.body.destroy();
    view.label.destroy();
    this.noteViews.delete(noteId);
  }

  private playHitFeel(
    result: JudgmentResult,
    previousSnapshot: ScoreSnapshot,
    snapshot: ScoreSnapshot,
  ): void {
    if (result.note && result.judgment !== 'Miss') {
      this.playScreenShake(result.note.type);

      if (result.judgment === 'Perfect') {
        this.showPerfectBurst(result.note.type);
      }
    }

    if (this.isNewComboMilestone(previousSnapshot.combo, snapshot.combo)) {
      this.showComboMilestone(snapshot.combo);
    }

    if (!previousSnapshot.feverActive && snapshot.feverActive) {
      this.showFeverActivation();
    }
  }

  private playScreenShake(noteType: NoteType): void {
    if (noteType === 'heavy') {
      this.cameras.main.shake(
        gameConfig.gameFeel.shake.heavyDurationMs,
        gameConfig.gameFeel.shake.heavyIntensity,
      );
      return;
    }

    if (noteType === 'finisher') {
      this.cameras.main.shake(
        gameConfig.gameFeel.shake.finisherDurationMs,
        gameConfig.gameFeel.shake.finisherIntensity,
      );
    }
  }

  private showPerfectBurst(noteType: NoteType): void {
    const y = this.getLaneY(noteType);

    for (let index = 0; index < gameConfig.gameFeel.perfectBurst.particleCount; index += 1) {
      const angle = (Math.PI * 2 * index) / gameConfig.gameFeel.perfectBurst.particleCount;
      const particle = this.add.circle(
        gameConfig.playfield.judgeLineX,
        y,
        noteType === 'finisher' ? 7 : 5,
        0xfacc15,
        0.95,
      );

      this.tweens.add({
        targets: particle,
        x:
          gameConfig.playfield.judgeLineX +
          Math.cos(angle) * gameConfig.gameFeel.perfectBurst.distance,
        y: y + Math.sin(angle) * gameConfig.gameFeel.perfectBurst.distance,
        alpha: 0,
        scale: 0.2,
        duration: gameConfig.gameFeel.perfectBurst.durationMs,
        ease: 'Quad.Out',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private isNewComboMilestone(previousCombo: number, currentCombo: number): boolean {
    return (
      currentCombo > 0 &&
      currentCombo % gameConfig.gameFeel.comboMilestone.interval === 0 &&
      currentCombo !== previousCombo
    );
  }

  private showComboMilestone(combo: number): void {
    const text = this.add
      .text(640, 548, `${combo} COMBO`, {
        fontSize: '42px',
        color: '#facc15',
        fontStyle: '900',
      })
      .setOrigin(0.5)
      .setScale(0.82);

    this.tweens.add({
      targets: text,
      y: 512,
      alpha: 0,
      scale: 1.18,
      duration: gameConfig.gameFeel.comboMilestone.durationMs,
      ease: 'Back.Out',
      onComplete: () => text.destroy(),
    });
  }

  private showFeverActivation(): void {
    const flash = this.add
      .rectangle(640, 360, 1280, 720, 0xf97316, 0.28)
      .setBlendMode(Phaser.BlendModes.ADD);
    const text = this.add
      .text(640, 214, 'FEVER ON', {
        fontSize: '54px',
        color: '#f97316',
        fontStyle: '900',
      })
      .setOrigin(0.5)
      .setScale(0.78);

    this.cameras.main.shake(
      gameConfig.gameFeel.shake.finisherDurationMs,
      gameConfig.gameFeel.shake.finisherIntensity,
    );

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: gameConfig.gameFeel.feverActivation.flashDurationMs,
      ease: 'Quad.Out',
      onComplete: () => flash.destroy(),
    });
    this.tweens.add({
      targets: text,
      scale: 1.08,
      alpha: 0,
      duration: gameConfig.gameFeel.feverActivation.textDurationMs,
      ease: 'Back.Out',
      onComplete: () => text.destroy(),
    });
  }

  private updateFeverIntensity(): void {
    const snapshot = this.scoreSystem.getSnapshot();
    const pulse = 0.04 * Math.sin(this.time.now / 90);
    this.feverOverlay.setAlpha(snapshot.feverActive ? 0.12 + pulse : 0);
  }

  private startResult(message: string): void {
    const snapshot = this.scoreSystem.getSnapshot();

    this.scene.start(gameConfig.sceneKeys.result, {
      message,
      score: snapshot.score,
      maxCombo: snapshot.maxCombo,
      accuracy: snapshot.accuracy,
      rank: snapshot.rank,
      finisherSuccess: snapshot.finisherSuccess,
    });
  }

  private getNoteTypeForAction(action: InputAction): NoteType {
    if (action === 'lightAttack') {
      return 'light';
    }

    if (action === 'heavyAttack') {
      return 'heavy';
    }

    return 'finisher';
  }

  private getLaneY(type: NoteType): number {
    return gameConfig.playfield.laneStartY + laneOrder.indexOf(type) * gameConfig.playfield.laneGap;
  }
}
