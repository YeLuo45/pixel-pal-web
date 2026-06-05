/**
 * Retry Handler
 * thunderbolt-design Retry Handler - Execute + Backoff + Stats
 */

export type RetryStrategy = 'fixed' | 'exponential' | 'linear';

export interface RetryOptions {
  maxRetries?: number;
  strategy?: RetryStrategy;
  baseDelay?: number;
  maxDelay?: number;
}

export interface RetryStats {
  attempts: number;
  successes: number;
  failures: number;
  totalExecutions: number;
}

export class RetryHandler {
  private attempts = 0;
  private successes = 0;
  private failures = 0;
  private totalExecutions = 0;
  private delays: number[] = [];

  async execute<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    const strategy = options.strategy ?? 'fixed';
    const baseDelay = options.baseDelay ?? 100;
    const maxDelay = options.maxDelay ?? 5000;

    this.totalExecutions++;
    let lastError: unknown = null;

    for (let i = 0; i <= maxRetries; i++) {
      this.attempts++;
      try {
        const result = await fn();
        this.successes++;
        return result;
      } catch (err) {
        lastError = err;
        if (i < maxRetries) {
          const delay = this.calculateDelay(i, strategy, baseDelay, maxDelay);
          this.delays.push(delay);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.failures++;
    throw lastError;
  }

  calculateDelay(attempt: number, strategy: RetryStrategy, baseDelay: number, maxDelay: number): number {
    let delay: number;
    if (strategy === 'fixed') {
      delay = baseDelay;
    } else if (strategy === 'linear') {
      delay = baseDelay * (attempt + 1);
    } else {
      delay = baseDelay * Math.pow(2, attempt);
    }
    return Math.min(delay, maxDelay);
  }

  getStats(): RetryStats {
    return {
      attempts: this.attempts,
      successes: this.successes,
      failures: this.failures,
      totalExecutions: this.totalExecutions,
    };
  }

  getDelays(): number[] {
    return [...this.delays];
  }

  getDelayCount(): number {
    return this.delays.length;
  }

  getTotalDelay(): number {
    return this.delays.reduce((sum, d) => sum + d, 0);
  }

  getAvgDelay(): number {
    if (this.delays.length === 0) return 0;
    return Math.round((this.delays.reduce((s, d) => s + d, 0) / this.delays.length) * 100) / 100;
  }

  getAttempts(): number {
    return this.attempts;
  }

  getSuccesses(): number {
    return this.successes;
  }

  getFailures(): number {
    return this.failures;
  }

  getTotalExecutions(): number {
    return this.totalExecutions;
  }

  getSuccessRate(): number {
    if (this.attempts === 0) return 0;
    return Math.round((this.successes / this.attempts) * 10000) / 10000;
  }

  getFailureRate(): number {
    if (this.attempts === 0) return 0;
    return Math.round((this.failures / this.attempts) * 10000) / 10000;
  }

  reset(): void {
    this.attempts = 0;
    this.successes = 0;
    this.failures = 0;
    this.totalExecutions = 0;
    this.delays = [];
  }

  async executeWithCallback<T>(
    fn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onFailure?: (error: unknown) => void,
    options: RetryOptions = {}
  ): Promise<T> {
    try {
      const result = await this.execute(fn, options);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      if (onFailure) onFailure(err);
      throw err;
    }
  }
}

export default RetryHandler;