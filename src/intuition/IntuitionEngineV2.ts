/**
 * Intuition Engine v2
 * generic-agent-design Intuition Engine v2 - Observe + Trigger + Evaluate + Calibrate
 */

export interface Observation {
  id: string;
  context: string;
  pattern: string;
  confidence: number;
  timestamp: number;
  occurrences: number;
  evaluations: { actual: boolean; timestamp: number }[];
}

export class IntuitionEngineV2 {
  private observations: Map<string, Observation> = new Map();
  private contextIndex: Map<string, Set<string>> = new Map();
  private counter = 0;

  observe(context: string, pattern: string): string {
    const id = `obs-${++this.counter}`;
    const now = Date.now();
    this.observations.set(id, {
      id,
      context,
      pattern,
      confidence: 0.5,
      timestamp: now,
      occurrences: 1,
      evaluations: [],
    });
    if (!this.contextIndex.has(context)) this.contextIndex.set(context, new Set());
    this.contextIndex.get(context)!.add(id);
    return id;
  }

  trigger(context: string): string | null {
    const ids = this.contextIndex.get(context);
    if (!ids || ids.size === 0) return null;
    let best: Observation | null = null;
    for (const id of ids) {
      const obs = this.observations.get(id);
      if (!obs) continue;
      if (!best || obs.confidence > best.confidence) best = obs;
    }
    return best?.id ?? null;
  }

  evaluate(id: string, actual: boolean): boolean {
    const obs = this.observations.get(id);
    if (!obs) return false;
    obs.evaluations.push({ actual, timestamp: Date.now() });
    if (actual) {
      obs.confidence = Math.min(1, obs.confidence + 0.1);
    } else {
      obs.confidence = Math.max(0, obs.confidence - 0.1);
    }
    return true;
  }

  calibrate(id: string, feedback: number): boolean {
    const obs = this.observations.get(id);
    if (!obs) return false;
    obs.confidence = Math.max(0, Math.min(1, feedback));
    return true;
  }

  getObservation(id: string): Observation | undefined {
    return this.observations.get(id);
  }

  getAllObservations(): Observation[] {
    return Array.from(this.observations.values());
  }

  removeObservation(id: string): boolean {
    const obs = this.observations.get(id);
    if (!obs) return false;
    this.contextIndex.get(obs.context)?.delete(id);
    return this.observations.delete(id);
  }

  hasObservation(id: string): boolean {
    return this.observations.has(id);
  }

  getCount(): number {
    return this.observations.size;
  }

  getConfidence(id: string): number {
    return this.observations.get(id)?.confidence ?? 0;
  }

  getOccurrences(id: string): number {
    return this.observations.get(id)?.occurrences ?? 0;
  }

  getContext(id: string): string | undefined {
    return this.observations.get(id)?.context;
  }

  getPattern(id: string): string | undefined {
    return this.observations.get(id)?.pattern;
  }

  getByContext(context: string): Observation[] {
    const ids = this.contextIndex.get(context);
    if (!ids) return [];
    return Array.from(ids).map(id => this.observations.get(id)!).filter(Boolean);
  }

  getByConfidence(min: number, max: number = 1): Observation[] {
    return Array.from(this.observations.values()).filter(o => o.confidence >= min && o.confidence <= max);
  }

  getHighConfidence(min: number = 0.7): Observation[] {
    return this.getByConfidence(min);
  }

  getLowConfidence(max: number = 0.3): Observation[] {
    return Array.from(this.observations.values()).filter(o => o.confidence <= max);
  }

  getContexts(): string[] {
    return [...this.contextIndex.keys()];
  }

  hasContext(context: string): boolean {
    return this.contextIndex.has(context);
  }

  getContextCount(): number {
    return this.contextIndex.size;
  }

  getEvaluations(id: string): { actual: boolean; timestamp: number }[] {
    return [...(this.observations.get(id)?.evaluations ?? [])];
  }

  getEvaluationCount(id: string): number {
    return this.observations.get(id)?.evaluations.length ?? 0;
  }

  getAccuracy(id: string): number {
    const obs = this.observations.get(id);
    if (!obs || obs.evaluations.length === 0) return 0;
    const correct = obs.evaluations.filter(e => e.actual).length;
    return Math.round((correct / obs.evaluations.length) * 100) / 100;
  }

  boostConfidence(id: string, amount: number): boolean {
    const obs = this.observations.get(id);
    if (!obs) return false;
    obs.confidence = Math.max(0, Math.min(1, obs.confidence + amount));
    return true;
  }

  penalizeConfidence(id: string, amount: number): boolean {
    return this.boostConfidence(id, -amount);
  }

  resetConfidence(id: string): boolean {
    return this.calibrate(id, 0.5);
  }

  getMostConfident(): Observation | null {
    const all = Array.from(this.observations.values());
    if (all.length === 0) return null;
    return all.reduce((max, o) => o.confidence > max.confidence ? o : max);
  }

  getLeastConfident(): Observation | null {
    const all = Array.from(this.observations.values());
    if (all.length === 0) return null;
    return all.reduce((min, o) => o.confidence < min.confidence ? o : min);
  }

  getAvgConfidence(): number {
    const all = Array.from(this.observations.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, o) => sum + o.confidence, 0) / all.length) * 100) / 100;
  }

  getTotalOccurrences(): number {
    return Array.from(this.observations.values()).reduce((sum, o) => sum + o.occurrences, 0);
  }

  clearAll(): void {
    this.observations.clear();
    this.contextIndex.clear();
    this.counter = 0;
  }
}

export default IntuitionEngineV2;