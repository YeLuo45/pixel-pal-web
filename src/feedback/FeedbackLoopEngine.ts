/**
 * Feedback Loop Engine - V189 Iteration 1/9
 * Implements the feedback loop architecture: 感知 → 决策 → 执行 → 评估 → 调整 → 感知 (循环)
 */

export type FeedbackSignalType = 'positive' | 'negative' | 'neutral';
export type LoopState = 'expanding' | 'contracting' | 'stable';

export interface FeedbackSignal {
  type: FeedbackSignalType;
  metric: string;
  value: number;
  timestamp: number;
  source: string;
}

export interface FeedbackLoop {
  id: string;
  name: string;
  signals: FeedbackSignal[];
  state: LoopState;
  threshold: number;
  adjustmentRate: number;
}

/**
 * FeedbackLoopEngine manages feedback loops for real-time adjustment.
 * 
 * thunderbolt Feedback Loops mapping:
 * - Pipeline feedback → 循环状态评估
 * - Threshold → 阈值自动调节
 * - Adjustment rate → 调整速率
 */
export class FeedbackLoopEngine {
  private loops: Map<string, FeedbackLoop> = new Map();

  /**
   * Record a feedback signal to the appropriate loop.
   * Creates loop if it doesn't exist.
   */
  record(signal: Omit<FeedbackSignal, 'timestamp'>): void {
    const fullSignal: FeedbackSignal = {
      ...signal,
      timestamp: Date.now(),
    };

    // Find or create loop for this signal's metric
    let loop = this.loops.get(signal.metric);
    if (!loop) {
      loop = this.createLoop(signal.metric);
    }

    loop.signals.push(fullSignal);

    // Keep only recent signals (last 100)
    if (loop.signals.length > 100) {
      loop.signals = loop.signals.slice(-100);
    }

    // Update loop state based on signal
    this.updateLoopState(loop);
  }

  /**
   * Evaluate the current state of a feedback loop.
   */
  evaluate(loopId: string): FeedbackLoop | null {
    const loop = this.loops.get(loopId);
    if (!loop) return null;

    // Re-evaluate state based on recent signals
    this.updateLoopState(loop);
    return loop;
  }

  /**
   * Automatically adjust the threshold of a feedback loop.
   */
  adjustThreshold(loopId: string, delta: number): void {
    const loop = this.loops.get(loopId);
    if (!loop) return;

    loop.threshold = Math.max(0.01, loop.threshold + delta);
  }

  /**
   * Get all active feedback loops.
   */
  getActiveLoops(): FeedbackLoop[] {
    return Array.from(this.loops.values());
  }

  /**
   * Get a specific loop by ID.
   */
  getLoop(loopId: string): FeedbackLoop | undefined {
    return this.loops.get(loopId);
  }

  /**
   * Create a new feedback loop.
   */
  private createLoop(metric: string): FeedbackLoop {
    const loop: FeedbackLoop = {
      id: `loop-${metric}-${Date.now()}`,
      name: `Feedback Loop: ${metric}`,
      signals: [],
      state: 'stable',
      threshold: 0.5,
      adjustmentRate: 0.1,
    };
    this.loops.set(metric, loop);
    return loop;
  }

  /**
   * Update loop state based on signal history.
   */
  private updateLoopState(loop: FeedbackLoop): void {
    if (loop.signals.length === 0) {
      loop.state = 'stable';
      return;
    }

    // Calculate weighted average of recent signals
    const recentSignals = loop.signals.slice(-10);
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    for (const signal of recentSignals) {
      switch (signal.type) {
        case 'positive':
          positiveCount++;
          break;
        case 'negative':
          negativeCount++;
          break;
        case 'neutral':
          neutralCount++;
          break;
      }
    }

    const total = recentSignals.length;
    const positiveRatio = positiveCount / total;
    const negativeRatio = negativeCount / total;

    // Determine state based on signal distribution
    if (positiveRatio > loop.threshold) {
      loop.state = 'expanding';
    } else if (negativeRatio > loop.threshold) {
      loop.state = 'contracting';
    } else {
      loop.state = 'stable';
    }
  }

  /**
   * Clear all loops (mainly for testing).
   */
  clear(): void {
    this.loops.clear();
  }

  /**
   * Get loop count (for testing).
   */
  getLoopCount(): number {
    return this.loops.size;
  }
}