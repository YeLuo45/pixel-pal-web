/**
 * Feedback Loop Engine v2
 * thunderbolt-design Feedback Loop Engine v2 - Multi-layer feedback + stability
 */

export type FeedbackType = 'positive' | 'negative' | 'neutral';

export interface Feedback {
  source: string;
  type: FeedbackType;
  value: number;
  timestamp: number;
}

export interface LoopState {
  stable: boolean;
  oscillationCount: number;
  averageValue: number;
}

export class FeedbackLoopEngine {
  private feedbackHistory: Feedback[] = [];
  private values: number[] = [];
  private oscillationThreshold = 0.5;
  private lastValue: number | null = null;

  /**
   * Add feedback to the loop
   */
  addFeedback(feedback: Feedback): void {
    this.feedbackHistory.push({ ...feedback });
    this.values.push(feedback.value);
    this.lastValue = feedback.value;
  }

  /**
   * Analyze feedback and calculate adjustment
   */
  analyze(): { adjustment: number; state: LoopState } {
    const state = this.getState();
    let adjustment = 0;

    if (this.feedbackHistory.length > 0) {
      const latest = this.feedbackHistory[this.feedbackHistory.length - 1];
      switch (latest.type) {
        case 'positive':
          adjustment = latest.value * 0.2;
          break;
        case 'negative':
          adjustment = -latest.value * 0.2;
          break;
        case 'neutral':
          adjustment = 0;
          break;
      }
    }

    return { adjustment, state };
  }

  /**
   * Get stability score (0-100)
   */
  getStability(): number {
    if (this.values.length < 2) return 100;

    const mean = this.values.reduce((a, b) => a + b, 0) / this.values.length;
    const variance = this.values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.values.length;
    const stdDev = Math.sqrt(variance);

    // Lower std dev = higher stability
    const stability = Math.max(0, Math.min(100, 100 - stdDev * 50));
    return Math.round(stability);
  }

  /**
   * Get feedback history
   */
  getHistory(): Feedback[] {
    return [...this.feedbackHistory];
  }

  /**
   * Reset the engine
   */
  reset(): void {
    this.feedbackHistory = [];
    this.values = [];
    this.lastValue = null;
  }

  /**
   * Get current loop state
   */
  private getState(): LoopState {
    if (this.values.length === 0) {
      return { stable: true, oscillationCount: 0, averageValue: 0 };
    }

    const avg = this.values.reduce((a, b) => a + b, 0) / this.values.length;
    let oscillations = 0;

    // Count oscillations (sign changes in deviation from mean)
    if (this.values.length >= 3) {
      let lastDev = this.values[0] - avg;
      for (let i = 1; i < this.values.length; i++) {
        const dev = this.values[i] - avg;
        if (lastDev * dev < 0) {
          oscillations++;
        }
        lastDev = dev;
      }
    }

    const stable = oscillations < this.oscillationThreshold * this.values.length;

    return {
      stable,
      oscillationCount: oscillations,
      averageValue: Math.round(avg * 100) / 100,
    };
  }

  /**
   * Get oscillation count
   */
  getOscillationCount(): number {
    return this.getState().oscillationCount;
  }

  /**
   * Get average value
   */
  getAverageValue(): number {
    return this.getState().averageValue;
  }

  /**
   * Check if loop is stable
   */
  isStable(): boolean {
    return this.getState().stable;
  }

  /**
   * Get latest feedback
   */
  getLatest(): Feedback | null {
    return this.feedbackHistory.length > 0
      ? this.feedbackHistory[this.feedbackHistory.length - 1]
      : null;
  }

  /**
   * Get feedback by source
   */
  getFeedbackBySource(source: string): Feedback[] {
    return this.feedbackHistory.filter(f => f.source === source);
  }

  /**
   * Get feedback by type
   */
  getFeedbackByType(type: FeedbackType): Feedback[] {
    return this.feedbackHistory.filter(f => f.type === type);
  }

  /**
   * Get positive feedback count
   */
  getPositiveCount(): number {
    return this.feedbackHistory.filter(f => f.type === 'positive').length;
  }

  /**
   * Get negative feedback count
   */
  getNegativeCount(): number {
    return this.feedbackHistory.filter(f => f.type === 'negative').length;
  }

  /**
   * Clear old feedback (keep last n)
   */
  pruneFeedback(keepLast: number): void {
    if (this.feedbackHistory.length > keepLast) {
      this.feedbackHistory = this.feedbackHistory.slice(-keepLast);
      this.values = this.values.slice(-keepLast);
    }
  }

  /**
   * Get feedback count
   */
  getFeedbackCount(): number {
    return this.feedbackHistory.length;
  }
}

export default FeedbackLoopEngine;