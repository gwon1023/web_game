export class RunClock {
  private startedAtMs = 0;
  private running = false;

  start(nowMs: number): void {
    this.startedAtMs = nowMs;
    this.running = true;
  }

  getSongTimeMs(nowMs: number): number {
    if (!this.running) {
      return 0;
    }

    return nowMs - this.startedAtMs;
  }
}
