/**
 * V178: BudgetController - AI Call Budget Management
 * 
 * Based on claude-code Budget Mode architecture.
 * Controls AI API usage with daily limits for tokens and calls.
 */

export interface BudgetConfig {
  maxTokensPerDay: number;
  maxCallsPerDay: number;
  tokenUsage: number;
  callUsage: number;
  resetAt: number;  // timestamp
}

/**
 * Budget status for monitoring
 */
export interface BudgetStatus {
  tokensRemaining: number;
  callsRemaining: number;
  tokenUsagePercent: number;
  callUsagePercent: number;
  isExhausted: boolean;
  resetAt: number;
}

/**
 * Default budget configuration
 */
const DEFAULT_BUDGET: Omit<BudgetConfig, 'tokenUsage' | 'callUsage' | 'resetAt'> = {
  maxTokensPerDay: 100000,
  maxCallsPerDay: 100,
};

/**
 * BudgetController manages AI API call budgets
 */
export class BudgetController {
  private config: BudgetConfig;

  constructor(config: Partial<BudgetConfig> = {}) {
    const now = Date.now();
    this.config = {
      ...DEFAULT_BUDGET,
      tokenUsage: config.tokenUsage ?? 0,
      callUsage: config.callUsage ?? 0,
      resetAt: config.resetAt ?? this.getNextResetTime(now),
    };
  }

  /**
   * Get next reset time (midnight UTC)
   */
  private getNextResetTime(timestamp: number): number {
    const now = new Date(timestamp);
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Check if a new API call can be made
   */
  canMakeCall(): boolean {
    this.resetIfNeeded();
    
    return (
      this.config.callUsage < this.config.maxCallsPerDay &&
      this.config.tokenUsage < this.config.maxTokensPerDay
    );
  }

  /**
   * Check if estimated tokens can be used
   */
  canUseTokens(estimated: number): boolean {
    this.resetIfNeeded();
    
    return (this.config.tokenUsage + estimated) <= this.config.maxTokensPerDay;
  }

  /**
   * Record an API call with its token usage
   */
  recordCall(tokens: number): void {
    this.resetIfNeeded();
    
    this.config.callUsage++;
    this.config.tokenUsage += tokens;
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(): { tokens: number; calls: number } {
    this.resetIfNeeded();
    
    return {
      tokens: Math.max(0, this.config.maxTokensPerDay - this.config.tokenUsage),
      calls: Math.max(0, this.config.maxCallsPerDay - this.config.callUsage),
    };
  }

  /**
   * Get full budget status
   */
  getStatus(): BudgetStatus {
    this.resetIfNeeded();
    
    const tokensRemaining = Math.max(0, this.config.maxTokensPerDay - this.config.tokenUsage);
    const callsRemaining = Math.max(0, this.config.maxCallsPerDay - this.config.callUsage);
    
    return {
      tokensRemaining,
      callsRemaining,
      tokenUsagePercent: (this.config.tokenUsage / this.config.maxTokensPerDay) * 100,
      callUsagePercent: (this.config.callUsage / this.config.maxCallsPerDay) * 100,
      isExhausted: tokensRemaining === 0 || callsRemaining === 0,
      resetAt: this.config.resetAt,
    };
  }

  /**
   * Reset budget if day has passed
   */
  resetIfNeeded(): void {
    const now = Date.now();
    
    if (now >= this.config.resetAt) {
      this.config.tokenUsage = 0;
      this.config.callUsage = 0;
      this.config.resetAt = this.getNextResetTime(now);
    }
  }

  /**
   * Manually reset budget
   */
  reset(): void {
    this.config.tokenUsage = 0;
    this.config.callUsage = 0;
    this.config.resetAt = this.getNextResetTime(Date.now());
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<Pick<BudgetConfig, 'maxTokensPerDay' | 'maxCallsPerDay'>>): void {
    this.config.maxTokensPerDay = updates.maxTokensPerDay ?? this.config.maxTokensPerDay;
    this.config.maxCallsPerDay = updates.maxCallsPerDay ?? this.config.maxCallsPerDay;
  }

  /**
   * Get configuration
   */
  getConfig(): Omit<BudgetConfig, 'tokenUsage' | 'callUsage' | 'resetAt'> {
    return {
      maxTokensPerDay: this.config.maxTokensPerDay,
      maxCallsPerDay: this.config.maxCallsPerDay,
    };
  }

  /**
   * Get time until next reset
   */
  getTimeUntilReset(): number {
    const now = Date.now();
    return Math.max(0, this.config.resetAt - now);
  }

  /**
   * Estimate how many more calls can be made
   */
  estimateRemainingCalls(): number {
    this.resetIfNeeded();
    return Math.max(0, this.config.maxCallsPerDay - this.config.callUsage);
  }

  /**
   * Estimate how many more tokens can be used
   */
  estimateRemainingTokens(): number {
    this.resetIfNeeded();
    return Math.max(0, this.config.maxTokensPerDay - this.config.tokenUsage);
  }

  /**
   * Check if approaching limit (warning at 80%)
   */
  isApproachingLimit(): boolean {
    const status = this.getStatus();
    return status.tokenUsagePercent >= 80 || status.callUsagePercent >= 80;
  }

  /**
   * Set custom reset time
   */
  setResetTime(timestamp: number): void {
    this.config.resetAt = timestamp;
  }
}

// Singleton instance
let budgetControllerInstance: BudgetController | null = null;

export function getBudgetController(config?: Partial<BudgetConfig>): BudgetController {
  if (!budgetControllerInstance) {
    budgetControllerInstance = new BudgetController(config);
  }
  return budgetControllerInstance;
}

export default BudgetController;