/**
 * Intuition Engine v3
 * generic-agent-design Intuition Engine v3 - Define + Trigger + Calibrate + Stats
 */

export interface Intuition {
  id: string;
  signal: string;
  confidence: number;
  triggered: number;
  hits: number;
  created: number;
  updated: number;
  active: boolean;
  calibrations: number;
}

export interface I3Stats {
  intuitions: number;
  totalTriggers: number;
  avgConfidence: number;
  active: number;
  inactive: number;
  totalCalibrations: number;
}

export class IntuitionEngineV3 {
  private intuitions: Map<string, Intuition> = new Map();
  private counter = 0;

  define(signal: string, confidence: number): string {
    const id = `ie-${++this.counter}`;
    this.intuitions.set(id, {
      id,
      signal,
      confidence: Math.max(0, Math.min(1, confidence)),
      triggered: 0,
      hits: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      calibrations: 0,
    });
    return id;
  }

  trigger(id: string): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    if (!i.active) return false;
    i.triggered++;
    i.hits++;
    i.updated = Date.now();
    return true;
  }

  calibrate(id: string, adjustment: number): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    i.confidence = Math.max(0, Math.min(1, i.confidence + adjustment));
    i.calibrations++;
    i.updated = Date.now();
    return true;
  }

  getStats(): I3Stats {
    const all = Array.from(this.intuitions.values());
    return {
      intuitions: all.length,
      totalTriggers: all.reduce((s, i) => s + i.triggered, 0),
      avgConfidence: all.length > 0 ? Math.round((all.reduce((s, i) => s + i.confidence, 0) / all.length) * 100) / 100 : 0,
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalCalibrations: all.reduce((s, i) => s + i.calibrations, 0),
    };
  }

  getIntuition(id: string): Intuition | undefined {
    return this.intuitions.get(id);
  }

  getAllIntuitions(): Intuition[] {
    return Array.from(this.intuitions.values());
  }

  removeIntuition(id: string): boolean {
    return this.intuitions.delete(id);
  }

  hasIntuition(id: string): boolean {
    return this.intuitions.has(id);
  }

  getCount(): number {
    return this.intuitions.size;
  }

  getSignal(id: string): string | undefined {
    return this.intuitions.get(id)?.signal;
  }

  getConfidence(id: string): number {
    return this.intuitions.get(id)?.confidence ?? 0;
  }

  getTriggers(id: string): number {
    return this.intuitions.get(id)?.triggered ?? 0;
  }

  getHits(id: string): number {
    return this.intuitions.get(id)?.hits ?? 0;
  }

  getCalibrations(id: string): number {
    return this.intuitions.get(id)?.calibrations ?? 0;
  }

  isActive(id: string): boolean {
    return this.intuitions.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setSignal(id: string, signal: string): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    i.signal = signal;
    i.updated = Date.now();
    return true;
  }

  setConfidence(id: string, confidence: number): boolean {
    const i = this.intuitions.get(id);
    if (!i) return false;
    i.confidence = Math.max(0, Math.min(1, confidence));
    i.updated = Date.now();
    return true;
  }

  resetHits(): void {
    for (const i of this.intuitions.values()) i.hits = 0;
  }

  resetTriggers(): void {
    for (const i of this.intuitions.values()) i.triggered = 0;
  }

  resetCalibrations(): void {
    for (const i of this.intuitions.values()) i.calibrations = 0;
  }

  resetAll(): void {
    for (const i of this.intuitions.values()) {
      i.hits = 0;
      i.triggered = 0;
      i.calibrations = 0;
      i.active = true;
    }
  }

  getBySignal(signal: string): Intuition[] {
    return Array.from(this.intuitions.values()).filter(i => i.signal === signal);
  }

  getActiveIntuitions(): Intuition[] {
    return Array.from(this.intuitions.values()).filter(i => i.active);
  }

  getInactiveIntuitions(): Intuition[] {
    return Array.from(this.intuitions.values()).filter(i => !i.active);
  }

  getByMinConfidence(min: number): Intuition[] {
    return Array.from(this.intuitions.values()).filter(i => i.confidence >= min);
  }

  getAllSignals(): string[] {
    return [...new Set(Array.from(this.intuitions.values()).map(i => i.signal))];
  }

  getSignalCount(): number {
    return this.getAllSignals().length;
  }

  getMostTriggered(): Intuition | null {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.triggered > max.triggered ? i : max);
  }

  getHighestConfidence(): Intuition | null {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.confidence > max.confidence ? i : max);
  }

  getNewest(): Intuition | null {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): Intuition | null {
    const all = Array.from(this.intuitions.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getCreatedAt(id: string): number {
    return this.intuitions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.intuitions.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.intuitions.clear();
    this.counter = 0;
  }
}

export default IntuitionEngineV3;