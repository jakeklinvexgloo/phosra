/**
 * Token-bucket rate limiter for CSM scraping.
 *
 * Sustains 15 requests/minute (one every 4 seconds) with a burst of 3.
 * `acquire()` returns a Promise that resolves when a token is available,
 * so callers can simply `await limiter.acquire()` before each request.
 */

const REFILL_INTERVAL_MS = 4_000; // 1 token every 4 seconds = 15/min
const MAX_TOKENS = 3;

export class CSMRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private waitQueue: Array<() => void> = [];

  constructor() {
    this.tokens = MAX_TOKENS;
    this.lastRefill = Date.now();
  }

  /** Wait until a token is available, then consume it. */
  acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    // No tokens — enqueue and wait for the next refill cycle
    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
      this.scheduleRefill();
    });
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = Math.floor(elapsed / REFILL_INTERVAL_MS);

    if (newTokens > 0) {
      this.tokens = Math.min(MAX_TOKENS, this.tokens + newTokens);
      this.lastRefill += newTokens * REFILL_INTERVAL_MS;
    }
  }

  private refillTimerId: ReturnType<typeof setTimeout> | null = null;

  private scheduleRefill(): void {
    if (this.refillTimerId !== null) return; // already scheduled

    this.refillTimerId = setTimeout(() => {
      this.refillTimerId = null;
      this.refill();

      // Drain waiters that can now proceed
      while (this.tokens >= 1 && this.waitQueue.length > 0) {
        this.tokens -= 1;
        const next = this.waitQueue.shift()!;
        next();
      }

      // If waiters remain, schedule another refill
      if (this.waitQueue.length > 0) {
        this.scheduleRefill();
      }
    }, REFILL_INTERVAL_MS);
  }

  /** Cancel pending waiters and clear timers. */
  destroy(): void {
    if (this.refillTimerId !== null) {
      clearTimeout(this.refillTimerId);
      this.refillTimerId = null;
    }
    this.waitQueue = [];
  }
}
