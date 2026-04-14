import Phaser from 'phaser';
import { beatBreakerChart } from '../data/beatBreakerChart';
import { gameConfig } from '../data/gameConfig';
import { BestScoreStore } from '../systems/BestScoreStore';
import { FeverSystem } from '../systems/FeverSystem';
import { JudgmentSystem, type PendingNote } from '../systems/JudgmentSystem';
import { RunClock } from '../systems/RunClock';
import { ScoreSystem } from '../systems/ScoreSystem';
import { Hud } from '../ui/Hud';
import type { JudgmentName, NoteType, RunResult } from '../types/GameTypes';

interface NoteView {
  readonly pending: PendingNote;
  readonly body: Phaser.GameObjects.Rectangle;
  readonly label: Phaser.GameObjects.Text;
}

const laneOrder: readonly NoteType[] = ['light', 'heavy', 'finisher'];

export class PlayScene extends Phaser.Scene {
  private readonly clock = new RunClock();
  private readonly judgmentSystem = new JudgmentSystem();
  private readonly scoreSystem = new ScoreSystem();
  private readonly feverSystem = new FeverSystem();
  private readonly bestScoreStore = new BestScoreStore();
  private pendingNotes: PendingNote[] = [];
  private noteViews: NoteView[] = [];
  private hud!: Hud;
  private ended = false;
  private beatPulse!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('PlayScene');
  }

  create(): void {
    this.pendingNotes = beatBreakerChart.notes.map((note) => ({ note, judged: false }));
    this.noteViews = [];
    this.ended = false;
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);

    this.drawArena();
    this.hud = new Hud(this);
    this.clock.start(this.time.now + beatBreakerChart.leadInMs);
    this.registerInput();
    this.createLeadIn();
  }

  update(_time: number, _delta: number): void {
    const songTimeMs = this.clock.getSongTimeMs(this.time.now);
    this.feverSystem.update(songTimeMs);

    this.spawnDueNotes(songTimeMs);
    this.updateNotes(songTimeMs);
    this.applyExpiredMisses(songTimeMs);

    this.hud.updateScore(this.scoreSystem.score, this.scoreSystem.combo);
    this.hud.updateFever(
      this.feverSystem.isActive ? 1 : this.feverSystem.meter / gameConfig.fever.max,
      this.feverSystem.isActive,
    );
    this.hud.updateProgress(songTimeMs, beatBreakerChart.durationMs);
    this.updateBeatPulse(songTimeMs);

    if (!this.ended && songTimeMs >= beatBreakerChart.durationMs + gameConfig.endDelayMs) {
      this.finishRun();
    }
  }

  private drawArena(): void {
    this.add.rectangle(640, 360, 1280, 720, 0x08090d);
    this.add.rectangle(640, 360, 1280, 720, 0x111827, 0.22);
    this.beatPulse = this.add.rectangle(gameConfig.hitLineX, 360, 34, 420, 0xf5f7fb, 0.08);

    laneOrder.forEach((type, index) => {
      const lane = gameConfig.lanes[type];
      const y = this.getLaneY(type);

      this.add.rectangle(640, y, 1120, 64, gameConfig.colors.lane, 0.72);
      this.add.rectangle(gameConfig.hitLineX, y, 18, 84, gameConfig.colors.hitLine, 0.94);
      this.add.rectangle(118, y, 118, 56, lane.color, 0.16);
      this.add
        .text(118, y, `${lane.label}  ${lane.name}`, {
          fontSize: index === 2 ? '20px' : '24px',
          color: '#f5f7fb',
          fontStyle: '800',
        })
        .setOrigin(0.5);
    });
  }

  private registerInput(): void {
    const bindings: readonly [string, NoteType][] = [
      ['keydown-J', 'light'],
      ['keydown-K', 'heavy'],
      ['keydown-SPACE', 'finisher'],
    ];

    bindings.forEach(([eventName, type]) => {
      this.input.keyboard?.on(eventName, () => {
        this.handleAttack(type);
      });
    });
  }

  private createLeadIn(): void {
    const leadInText = this.add
      .text(640, 360, 'Ready', {
        fontSize: '64px',
        color: '#facc15',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: leadInText,
      alpha: 0,
      scale: 1.4,
      duration: beatBreakerChart.leadInMs,
      ease: 'Quad.In',
      onComplete: () => leadInText.destroy(),
    });
  }

  private handleAttack(type: NoteType): void {
    const songTimeMs = this.clock.getSongTimeMs(this.time.now);
    const hit = this.judgmentSystem.findHit(this.pendingNotes, type, songTimeMs);
    this.flashLane(type);

    if (!hit) {
      this.applyJudgment('Miss', 0);
      return;
    }

    hit.note.judged = true;
    this.destroyNoteView(hit.note);
    this.applyJudgment(hit.judgment, hit.offsetMs);
    this.spawnHitEffect(type, hit.judgment);
  }

  private applyJudgment(judgment: JudgmentName, offsetMs: number): void {
    const songTimeMs = this.clock.getSongTimeMs(this.time.now);
    this.feverSystem.applyJudgment(judgment, songTimeMs);
    this.scoreSystem.applyJudgment(judgment, this.feverSystem.isActive);
    this.hud.showJudgment(judgment, offsetMs);

    if (judgment === 'Miss') {
      this.cameras.main.shake(80, 0.004);
      return;
    }

    this.cameras.main.flash(70, 245, 247, 251, false);
  }

  private spawnDueNotes(songTimeMs: number): void {
    for (const pending of this.pendingNotes) {
      if (pending.judged || this.noteViews.some((view) => view.pending === pending)) {
        continue;
      }

      if (pending.note.timeMs - songTimeMs <= gameConfig.noteTravelMs) {
        this.noteViews.push(this.createNoteView(pending));
      }
    }
  }

  private createNoteView(pending: PendingNote): NoteView {
    const lane = gameConfig.lanes[pending.note.type];
    const y = this.getLaneY(pending.note.type);
    const width = pending.note.type === 'finisher' ? 102 : 72;
    const height = pending.note.type === 'heavy' ? 58 : 46;
    const body = this.add.rectangle(gameConfig.noteSpawnX, y, width, height, lane.color, 0.96);
    const label = this.add
      .text(gameConfig.noteSpawnX, y, lane.label, {
        fontSize: pending.note.type === 'finisher' ? '18px' : '24px',
        color: '#08090d',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    return {
      pending,
      body,
      label,
    };
  }

  private updateNotes(songTimeMs: number): void {
    for (const view of this.noteViews) {
      const timeUntilHit = view.pending.note.timeMs - songTimeMs;
      const travelRatio = 1 - timeUntilHit / gameConfig.noteTravelMs;
      const x = Phaser.Math.Linear(gameConfig.noteSpawnX, gameConfig.hitLineX, travelRatio);
      view.body.x = x;
      view.label.x = x;
    }
  }

  private applyExpiredMisses(songTimeMs: number): void {
    const misses = this.judgmentSystem.getExpiredMisses(this.pendingNotes, songTimeMs);

    for (const miss of misses) {
      miss.judged = true;
      this.destroyNoteView(miss);
      this.applyJudgment('Miss', 0);
    }
  }

  private destroyNoteView(pending: PendingNote): void {
    const view = this.noteViews.find((candidate) => candidate.pending === pending);
    if (!view) {
      return;
    }

    view.body.destroy();
    view.label.destroy();
    this.noteViews = this.noteViews.filter((candidate) => candidate !== view);
  }

  private spawnHitEffect(type: NoteType, judgment: JudgmentName): void {
    const lane = gameConfig.lanes[type];
    const y = this.getLaneY(type);
    const radius = judgment === 'Perfect' ? 74 : 52;
    const ring = this.add.circle(gameConfig.hitLineX, y, radius, lane.flashColor, 0);
    ring.setStrokeStyle(6, lane.flashColor, 0.96);

    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.7,
      duration: 180,
      ease: 'Quad.Out',
      onComplete: () => ring.destroy(),
    });
  }

  private flashLane(type: NoteType): void {
    const lane = gameConfig.lanes[type];
    const y = this.getLaneY(type);
    const flash = this.add.rectangle(640, y, 1120, 64, lane.flashColor, 0.18);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 95,
      ease: 'Quad.Out',
      onComplete: () => flash.destroy(),
    });
  }

  private updateBeatPulse(songTimeMs: number): void {
    const beatLengthMs = 60000 / beatBreakerChart.bpm;
    const beatPhase = (songTimeMs % beatLengthMs) / beatLengthMs;
    const pulse = 1 - beatPhase;
    this.beatPulse.alpha = 0.04 + pulse * 0.12;
    this.beatPulse.scaleY = 0.92 + pulse * 0.18;
  }

  private finishRun(): void {
    this.ended = true;
    const savedScore = this.bestScoreStore.saveIfBest(this.scoreSystem.score);
    const result: RunResult = {
      score: this.scoreSystem.score,
      bestScore: savedScore.bestScore,
      previousBestScore: savedScore.previousBestScore,
      maxCombo: this.scoreSystem.maxCombo,
      perfects: this.scoreSystem.perfects,
      goods: this.scoreSystem.goods,
      misses: this.scoreSystem.misses,
      feverActivations: this.feverSystem.activations,
      chartTitle: beatBreakerChart.title,
    };

    this.scene.start('ResultScene', result);
  }

  private getLaneY(type: NoteType): number {
    const laneIndex = laneOrder.indexOf(type);
    return gameConfig.laneStartY + laneIndex * gameConfig.laneGap;
  }
}
