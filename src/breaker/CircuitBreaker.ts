/**
 * Circuit Breaker
 * thunderbolt-design Circuit Breaker - Failure Detection + State Machine + Half-Open + Stats
 */

export type BreakerState = 'closed' | 'open' | 'half_open';

export interface BreakerStats {
  totalRequests: number;
  failedRequests: number;
  rejectedRequests: number;
  stateTransitions: number;
  successRequests: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxAttempts: number;
}

export class CircuitBreaker {
  private state: BreakerState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;
  private stateTransitions = 0;
  private totalRequests = 0;
  private failedRequests = 0;
  private successRequests = 0;
  private rejectedRequests = 0;
  private config: CircuitBreakerConfig;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: config?.failureThreshold ?? 5,
      resetTimeoutMs: config?.resetTimeoutMs ?? 60000,
      halfOpenMaxAttempts: config?.halfOpenMaxAttempts ?? 1,
    };
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs) {
        this.transitionTo('half_open');
        this.halfOpenAttempts = 0;
      } else {
        this.rejectedRequests++;
        throw new Error('Circuit breaker is open');
      }
    }

    if (this.state === 'half_open' && this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
      this.rejectedRequests++;
      throw new Error('Half-open limit reached');
    }

    try {
      if (this.state === 'half_open') this.halfOpenAttempts++;
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  recordSuccess(): void {
    this.successCount++;
    this.successRequests++;
    this.failureCount = 0;

    if (this.state === 'half_open') {
      this.transitionTo('closed');
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.failedRequests++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half_open') {
      this.transitionTo('open');
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo('open');
    }
  }

  getState(): BreakerState {
    return this.state;
  }

  reset(): void {
    this.transitionTo('closed');
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenAttempts = 0;
  }

  getStats(): BreakerStats {
    return {
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests,
      rejectedRequests: this.rejectedRequests,
      successRequests: this.successRequests,
      stateTransitions: this.stateTransitions,
    };
  }

  private transitionTo(state: BreakerState): void {
    if (this.state !== state) {
      this.state = state;
      this.stateTransitions++;
    }
  }

  isOpen(): boolean {
    return this.state === 'open';
  }

  isClosed(): boolean {
    return this.state === 'closed';
  }

  isHalfOpen(): boolean {
    return this.state === 'half_open';
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getSuccessCount(): number {
    return this.successCount;
  }

  getFailureRate(): number {
    if (this.totalRequests === 0) return 0;
    return Math.round((this.failedRequests / this.totalRequests) * 100) / 100;
  }

  setFailureThreshold(n: number): void {
    this.config.failureThreshold = Math.max(1, n);
  }

  setResetTimeout(ms: number): void {
    this.config.resetTimeoutMs = Math.max(0, ms);
  }

  getConfig(): CircuitBreakerConfig {
    return { ...this.config };
  }

  clearStats(): void {
    this.totalRequests = 0;
    this.failedRequests = 0;
    this.successRequests = 0;
    this.rejectedRequests = 0;
    this.stateTransitions = 0;
  }
}

export default CircuitBreaker;