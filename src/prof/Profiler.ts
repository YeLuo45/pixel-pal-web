/**
 * Profiler
 * claude-code-design Profiler - Start + Stop + GetReport + Stats
 */

export interface ProfileSample {
  id: string;
  name: string;
  duration: number;
  timestamp: number;
  started: number;
}

export interface ProfileStats {
  samples: number;
  total: number;
  avg: number;
  max: number;
  min: number;
}

export class Profiler {
  private samples: Map<string, ProfileSample> = new Map();
  private activeSamples: Map<string, { name: string; started: number }> = new Map();
  private counter = 0;

  start(name: string): string {
    const id = `prof-${++this.counter}`;
    this.activeSamples.set(id, { name, started: Date.now() });
    return id;
  }

  stop(id: string): number {
    const active = this.activeSamples.get(id);
    if (!active) return 0;
    const now = Date.now();
    const duration = now - active.started;
    this.samples.set(id, {
      id,
      name: active.name,
      duration,
      timestamp: now,
      started: active.started,
    });
    this.activeSamples.delete(id);
    return duration;
  }

  getReport(): ProfileSample[] {
    return Array.from(this.samples.values());
  }

  getStats(): ProfileStats {
    const all = Array.from(this.samples.values());
    const durations = all.map(s => s.duration);
    return {
      samples: all.length,
      total: durations.reduce((s, d) => s + d, 0),
      avg: all.length > 0 ? Math.round((durations.reduce((s, d) => s + d, 0) / all.length) * 100) / 100 : 0,
      max: all.length > 0 ? Math.max(...durations) : 0,
      min: all.length > 0 ? Math.min(...durations) : 0,
    };
  }

  getSample(id: string): ProfileSample | undefined {
    return this.samples.get(id);
  }

  getAllSamples(): ProfileSample[] {
    return Array.from(this.samples.values());
  }

  removeSample(id: string): boolean {
    return this.samples.delete(id);
  }

  hasSample(id: string): boolean {
    return this.samples.has(id);
  }

  getCount(): number {
    return this.samples.size;
  }

  getName(id: string): string | undefined {
    return this.samples.get(id)?.name;
  }

  getDuration(id: string): number {
    return this.samples.get(id)?.duration ?? 0;
  }

  getTimestamp(id: string): number {
    return this.samples.get(id)?.timestamp ?? 0;
  }

  getStartedAt(id: string): number {
    return this.samples.get(id)?.started ?? 0;
  }

  isActive(id: string): boolean {
    return this.activeSamples.has(id);
  }

  getActiveCount(): number {
    return this.activeSamples.size;
  }

  getActiveIds(): string[] {
    return Array.from(this.activeSamples.keys());
  }

  getByName(name: string): ProfileSample[] {
    return Array.from(this.samples.values()).filter(s => s.name === name);
  }

  getNames(): string[] {
    return [...new Set(Array.from(this.samples.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getNames().length;
  }

  getSlowest(): ProfileSample | null {
    const all = Array.from(this.samples.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.duration > max.duration ? s : max);
  }

  getFastest(): ProfileSample | null {
    const all = Array.from(this.samples.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.duration < min.duration ? s : min);
  }

  getBottleneck(threshold: number): ProfileSample[] {
    return Array.from(this.samples.values()).filter(s => s.duration > threshold);
  }

  getNewest(): ProfileSample | null {
    const all = Array.from(this.samples.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.timestamp > max.timestamp ? s : max);
  }

  getOldest(): ProfileSample | null {
    const all = Array.from(this.samples.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.timestamp < min.timestamp ? s : min);
  }

  getAvgByName(name: string): number {
    const samples = this.getByName(name);
    if (samples.length === 0) return 0;
    return Math.round((samples.reduce((s, x) => s + x.duration, 0) / samples.length) * 100) / 100;
  }

  clearAll(): void {
    this.samples.clear();
    this.activeSamples.clear();
    this.counter = 0;
  }
}

export default Profiler;