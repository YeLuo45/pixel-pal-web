/**
 * Retry Engine
 * thunderbolt-design Retry Engine - Policy + Backoff + Limits + Stats
 */

export type BackoffStrategy = 'fixed' | 'exponential' | 'linear';

export interface RetryConfig {
  maxAttempts: number;
  backoff: BackoffStrategy;
  initialDelayMs: number;
  maxDelayMs?: number;
}

export interface RetryStats {
  total: number;
  successful: number;
  failed: number;
  totalAttempts: number;
}

export class RetryEngine {
  private total = 0;
  private successful = 0;
  private failed = 0;
  private totalAttempts = 0;

  async execute<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T> {
    this.total++;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      this.totalAttempts++;
      try {
        const result = await fn();
        this.successful++;
        return result;
      } catch (err) {
        lastError = err as Error;
        if (attempt < config.maxAttempts) {
          const delay = this.calculateDelay(attempt, config);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    this.failed++;
    throw lastError ?? new Error('Retry failed');
  }

  calculateDelay(attempt: number, config: RetryConfig): number {
    const maxDelay = config.maxDelayMs ?? 30000;
    let delay = config.initialDelayMs;

    if (config.backoff === 'fixed') {
      delay = config.initialDelayMs;
    } else if (config.backoff === 'exponential') {
      delay = config.initialDelayMs * Math.pow(2, attempt - 1);
    } else if (config.backoff === 'linear') {
      delay = config.initialDelayMs * attempt;
    }

    return Math.min(maxDelay, delay);
  }

  getStats(): RetryStats {
    return {
      total: this.total,
      successful: this.successful,
      failed: this.failed,
      totalAttempts: this.totalAttempts,
    };
  }

  reset(): void {
    this.total = 0;
    this.successful = 0;
    this.failed = 0;
    this.totalAttempts = 0;
  }

  getSuccessRate(): number {
    if (this.total === 0) return 0;
    return Math.round((this.successful / this.total) * 100) / 100;
  }

  getFailureRate(): number {
    if (this.total === 0) return 0;
    return Math.round((this.failed / this.total) * 100) / 100;
  }

  getTotal(): number {
    return this.total;
  }

  getSuccessful(): number {
    return this.successful;
  }

  getFailed(): number {
    return this.failed;
  }

  getTotalAttempts(): number {
    return this.totalAttempts;
  }
}

export default RetryEngine;