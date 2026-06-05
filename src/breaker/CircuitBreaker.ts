/**
 * Circuit Breaker
 * nanobot-design Circuit Breaker - recordSuccess + recordFailure + canRequest + reset
 */

export type BreakerState = 'closed' | 'open' | 'half-open';

export interface BreakerStats {
  state: BreakerState;
  failures: number;
  successes: number;
  total: number;
  failureRate: number;
}

export interface BreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  resetTimeout: number;
}

export class CircuitBreaker {
  private state: BreakerState = 'closed';
  private failures = 0;
  private successes = 0;
  private total = 0;
  private lastFailure: number = 0;
  private halfOpenSuccesses = 0;
  private config: BreakerConfig;

  constructor(config: Partial<BreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 2,
      resetTimeout: config.resetTimeout ?? 60000,
    };
  }

  recordSuccess(): void {
    this.successes++;
    this.total++;
    if (this.state === 'half-open') {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.config.successThreshold) {
        this.state = 'closed';
        this.failures = 0;
        this.halfOpenSuccesses = 0;
      }
    } else if (this.state === 'closed') {
      this.failures = 0;
    }
  }

  recordFailure(): void {
    this.failures++;
    this.total++;
    this.lastFailure = Date.now();
    this.halfOpenSuccesses = 0;
    if (this.state === 'half-open') {
      this.state = 'open';
    } else if (this.state === 'closed' && this.failures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }

  canRequest(): boolean {
    if (this.state === 'closed') return true;
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure >= this.config.resetTimeout) {
        this.state = 'half-open';
        this.halfOpenSuccesses = 0;
        return true;
      }
      return false;
    }
    return true; // half-open
  }

  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.total = 0;
    this.halfOpenSuccesses = 0;
    this.lastFailure = 0;
  }

  getStats(): BreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      total: this.total,
      failureRate: this.total > 0 ? Math.round((this.failures / this.total) * 10000) / 10000 : 0,
    };
  }

  getState(): BreakerState {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  getSuccesses(): number {
    return this.successes;
  }

  getTotal(): number {
    return this.total;
  }

  getLastFailureTime(): number {
    return this.lastFailure;
  }

  getHalfOpenSuccesses(): number {
    return this.halfOpenSuccesses;
  }

  getConfig(): BreakerConfig {
    return { ...this.config };
  }

  setFailureThreshold(threshold: number): void {
    this.config.failureThreshold = threshold;
  }

  setSuccessThreshold(threshold: number): void {
    this.config.successThreshold = threshold;
  }

  setResetTimeout(timeout: number): void {
    this.config.resetTimeout = timeout;
  }

  getFailureThreshold(): number {
    return this.config.failureThreshold;
  }

  getSuccessThreshold(): number {
    return this.config.successThreshold;
  }

  getResetTimeout(): number {
    return this.config.resetTimeout;
  }

  isOpen(): boolean {
    return this.state === 'open';
  }

  isClosed(): boolean {
    return this.state === 'closed';
  }

  isHalfOpen(): boolean {
    return this.state === 'half-open';
  }

  forceOpen(): void {
    this.state = 'open';
    this.lastFailure = Date.now();
  }

  forceClosed(): void {
    this.state = 'closed';
    this.failures = 0;
    this.halfOpenSuccesses = 0;
  }

  forceHalfOpen(): void {
    this.state = 'half-open';
    this.halfOpenSuccesses = 0;
  }

  timeSinceLastFailure(): number {
    if (this.lastFailure === 0) return -1;
    return Date.now() - this.lastFailure;
  }

  shouldTrip(): boolean {
    return this.failures >= this.config.failureThreshold;
  }

  timeUntilReset(): number {
    if (this.state !== 'open') return 0;
    const elapsed = Date.now() - this.lastFailure;
    return Math.max(0, this.config.resetTimeout - elapsed);
  }
}

export default CircuitBreaker;