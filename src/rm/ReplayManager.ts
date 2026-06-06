/**
 * Replay Manager
 * thunderbolt-design Replay Manager - Save + Play + Pause + Stats
 */

export interface Replay {
  id: string;
  name: string;
  steps: number;
  position: number;
  active: boolean;
  playing: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface RMStats {
  replays: number;
  playing: number;
  paused: number;
  totalSteps: number;
  totalPlays: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgSteps: number;
  maxSteps: number;
  minSteps: number;
  avgPosition: number;
}

export class ReplayManager {
  private replays: Map<string, Replay> = new Map();
  private counter = 0;
  private totalPlays = 0;

  save(name: string, steps: number): string {
    const id = `rm-${++this.counter}`;
    this.replays.set(id, {
      id,
      name,
      steps,
      position: 0,
      active: true,
      playing: false,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  play(id: string): boolean {
    const r = this.replays.get(id);
    if (!r) return false;
    if (!r.active) return false;
    if (r.playing) return false;
    r.playing = true;
    r.history.push(r.position);
    r.updated = Date.now();
    r.hits++;
    this.totalPlays++;
    return true;
  }

  pause(id: string): boolean {
    const r = this.replays.get(id);
    if (!r) return false;
    if (!r.playing) return false;
    r.playing = false;
    r.updated = Date.now();
    r.hits++;
    return true;
  }

  step(id: string): boolean {
    const r = this.replays.get(id);
    if (!r) return false;
    if (!r.active) return false;
    if (!r.playing) return false;
    if (r.position < r.steps) {
      r.position++;
      r.updated = Date.now();
      r.hits++;
      return true;
    }
    return false;
  }

  seek(id: string, position: number): boolean {
    const r = this.replays.get(id);
    if (!r) return false;
    if (position < 0 || position > r.steps) return false;
    r.position = position;
    r.updated = Date.now();
    return true;
  }

  getStats(): RMStats {
    const all = Array.from(this.replays.values());
    const stepValues = all.map(r => r.steps);
    const positionValues = all.map(r => r.position);
    return {
      replays: all.length,
      playing: all.filter(r => r.playing).length,
      paused: all.filter(r => !r.playing).length,
      totalSteps: stepValues.reduce((s, v) => s + v, 0),
      totalPlays: this.totalPlays,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      uniqueNames: new Set(all.map(r => r.name)).size,
      avgSteps: all.length > 0 ? Math.round((stepValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSteps: stepValues.length > 0 ? Math.max(...stepValues) : 0,
      minSteps: stepValues.length > 0 ? Math.min(...stepValues) : 0,
      avgPosition: all.length > 0 ? Math.round((positionValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getReplay(id: string): Replay | undefined {
    return this.replays.get(id);
  }

  getAllReplays(): Replay[] {
    return Array.from(this.replays.values());
  }

  removeReplay(id: string): boolean {
    return this.replays.delete(id);
  }

  hasReplay(id: string): boolean {
    return this.replays.has(id);
  }

  getCount(): number {
    return this.replays.size;
  }

  getName(id: string): string | undefined {
    return this.replays.get(id)?.name;
  }

  getSteps(id: string): number {
    return this.replays.get(id)?.steps ?? 0;
  }

  getPosition(id: string): number {
    return this.replays.get(id)?.position ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.replays.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.replays.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.replays.get(id)?.active ?? false;
  }

  isPlaying(id: string): boolean {
    return this.replays.get(id)?.playing ?? false;
  }

  isPaused(id: string): boolean {
    const r = this.replays.get(id);
    return r ? !r.playing : false;
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.replays.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.replays.get(id);
    if (!r) return false;
    r.name = name;
    r.updated = Date.now();
    return true;
  }

  setSteps(id: string, steps: number): boolean {
    const r = this.replays.get(id);
    if (!r) return false;
    r.steps = steps;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.replays.values()) {
      r.position = 0;
      r.playing = false;
      r.hits = 0;
      r.history = [];
      r.active = true;
    }
    this.totalPlays = 0;
  }

  getByName(name: string): Replay[] {
    return Array.from(this.replays.values()).filter(r => r.name === name);
  }

  getPlayingReplays(): Replay[] {
    return Array.from(this.replays.values()).filter(r => r.playing);
  }

  getPausedReplays(): Replay[] {
    return Array.from(this.replays.values()).filter(r => !r.playing);
  }

  getActiveReplays(): Replay[] {
    return Array.from(this.replays.values()).filter(r => r.active);
  }

  getInactiveReplays(): Replay[] {
    return Array.from(this.replays.values()).filter(r => !r.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.replays.values()).map(r => r.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinSteps(min: number): Replay[] {
    return Array.from(this.replays.values()).filter(r => r.steps >= min);
  }

  getMostSteps(): Replay | null {
    const all = Array.from(this.replays.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.steps > max.steps ? r : max);
  }

  getNewest(): Replay | null {
    const all = Array.from(this.replays.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Replay | null {
    const all = Array.from(this.replays.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.replays.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.replays.get(id)?.updated ?? 0;
  }

  getTotalPlays(): number {
    return this.totalPlays;
  }

  clearAll(): void {
    this.replays.clear();
    this.counter = 0;
    this.totalPlays = 0;
  }
}

export default ReplayManager;