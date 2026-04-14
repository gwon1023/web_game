import Phaser from 'phaser';
import { gameConfig } from '../data/gameConfig';
import type { InputAction } from '../types/GameTypes';

export class PlayScene extends Phaser.Scene {
  private actionText!: Phaser.GameObjects.Text;
  private finishTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super(gameConfig.sceneKeys.play);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);
    this.drawPlaceholderUi();
    this.registerInput();

    this.finishTimer = this.time.delayedCall(gameConfig.scenes.playDurationMs, () => {
      this.scene.start(gameConfig.sceneKeys.result, {
        message: 'Placeholder run complete',
      });
    });
  }

  private drawPlaceholderUi(): void {
    this.add.rectangle(640, 360, 1280, 720, 0x08090d);
    this.add.rectangle(640, 360, 1040, 420, gameConfig.colors.panel, 0.72);

    this.add
      .text(640, 126, 'PLAY', {
        fontSize: '64px',
        color: '#f5f7fb',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 218, 'Keyboard input is wired. Gameplay will be implemented next.', {
        fontSize: '26px',
        color: '#d1d5db',
      })
      .setOrigin(0.5);

    this.add
      .text(
        640,
        308,
        [
          gameConfig.controls.lightAttack.label,
          gameConfig.controls.heavyAttack.label,
          gameConfig.controls.finisher.label,
        ].join('     '),
        {
          fontSize: '24px',
          color: '#f5f7fb',
          fontStyle: '800',
        },
      )
      .setOrigin(0.5);

    this.actionText = this.add
      .text(640, 404, 'Press J, K, or Space', {
        fontSize: '36px',
        color: gameConfig.colors.accent,
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 548, 'Auto-advances to ResultScene after a short placeholder run.', {
        fontSize: '20px',
        color: '#9ca3af',
      })
      .setOrigin(0.5);
  }

  private registerInput(): void {
    this.input.keyboard?.on('keydown-J', () => this.handleAction('lightAttack'));
    this.input.keyboard?.on('keydown-K', () => this.handleAction('heavyAttack'));
    this.input.keyboard?.on('keydown-SPACE', () => this.handleAction('finisher'));

    this.input.keyboard?.once('keydown-ESC', () => {
      this.finishTimer?.remove(false);
      this.scene.start(gameConfig.sceneKeys.result, {
        message: 'Placeholder run skipped',
      });
    });
  }

  private handleAction(action: InputAction): void {
    this.actionText.setText(`${gameConfig.controls[action].label} pressed`);
  }
}
