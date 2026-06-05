/**
 * Intuition Engine
 * generic-agent-design Intuition Engine - Accumulate + Trigger + Evaluate + Calibrate
 */

export interface Intuition {
  id: string;
  context: string;
  hypothesis: string;
  confidence: number;
  occurrences: number;
  lastObserved: number;
}

export class IntuitionEngine {
  private intuitions: Map<string, Intuition> = new Map();
  private contextIndex: Map<string, Set<string>> = new Map();
  private counter = 0;

  observe(context: string, outcome: string): string {
    const id = `int-${++this.counter}`;
    this.intuitions.set(id, {
      id,
      context,
      hypothesis: outcome,
      confidence: 0.5,
      occurrences: 1,
      lastObserved: Date.now(),
    });
    if (!this.contextIndex.has(context)) this.contextIndex.set(context, new Set());
    this.contextIndex.get(context)!.add(id);
    return id;
  }

  trigger(context: string): Intuition | null {
    const ids = this.contextIndex.get(context) ?? new Set();
    if (ids.size === 0) return null;
    const intuitions = Array.from(ids)
      .map(id => this.intuitions.get(id)!)
      .filter(Boolean);
    if (intuitions.length === 0) return null;
    return intuitions.reduce((best, i) => i.confidence > best.confidence ? i : best);
  }

  calibrate(id: string, score: number): boolean {
    const intuition = this.intuitions.get(id);
    if (!intuition) return false;
    const clampedScore = Math.max(0, Math.min(1, score));
    intuition.confidence = (intuition.confidence * intuition.occurrences + clampedScore) / (intuition.occurrences + 1);
    intuition.occurrences++;
    intuition.lastObserved = Date.now();
    return true;
  }

  getTopIntuitions(limit: number): Intuition[] {
    return Array.from(this.intuitions.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  reinforce(id: string): boolean {
    const intuition = this.intuitions.get(id);
    if (!intuition) return false;
    intuition.occurrences++;
    intuition.confidence = Math.min(1, intuition.confidence + 0.1);
    intuition.lastObserved = Date.now();
    return true;
  }

  weaken(id: string): boolean {
    const intuition = this.intuitions.get(id);
    if (!intuition) return false;
    intuition.confidence = Math.max(0, intuition.confidence - 0.1);
    intuition.lastObserved = Date.now();
    return true;
  }

  getIntuition(id: string): Intuition | undefined {
    return this.intuitions.get(id);
  }

  getAllIntuitions(): Intuition[] {
    return Array.from(this.intuitions.values());
  }

  removeIntuition(id: string): boolean {
    const intuition = this.intuitions.get(id);
    if (!intuition) return false;
    this.contextIndex.get(intuition.context)?.delete(id);
    return this.intuitions.delete(id);
  }

  hasIntuition(id: string): boolean {
    return this.intuitions.has(id);
  }

  getCount(): number {
    return this.intuitions.size;
  }

  getByContext(context: string): Intuition[] {
    const ids = this.contextIndex.get(context) ?? new Set();
    return Array.from(ids).map(id => this.intuitions.get(id)!).filter(Boolean);
  }

  getAllContexts(): string[] {
    return [...this.contextIndex.keys()];
  }

  getContextCount(): number {
    return this.contextIndex.size;
  }

  getByConfidence(min: number, max: number): Intuition[] {
    return Array.from(this.intuitions.values()).filter(i => i.confidence >= min && i.confidence <= max);
  }

  getMinConfidence(): Intuition | null {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.confidence < min.confidence ? i : min);
  }

  getMaxConfidence(): Intuition | null {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.confidence > max.confidence ? i : max);
  }

  getAvgConfidence(): number {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, i) => sum + i.confidence, 0) / all.length) * 100) / 100;
  }

  getLastObserved(id: string): number {
    return this.intuitions.get(id)?.lastObserved ?? 0;
  }

  getOccurrences(id: string): number {
    return this.intuitions.get(id)?.occurrences ?? 0;
  }

  getConfidence(id: string): number {
    return this.intuitions.get(id)?.confidence ?? 0;
  }

  getHypothesis(id: string): string | undefined {
    return this.intuitions.get(id)?.hypothesis;
  }

  clearAll(): void {
    this.intuitions.clear();
    this.contextIndex.clear();
    this.counter = 0;
  }
}

export default IntuitionEngine;