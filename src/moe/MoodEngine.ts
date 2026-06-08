/**
 * Mood Engine
 * generic-agent-design Mood Engine - Add + Shift + Stats
 */

export type MoodState = 'happy' | 'sad' | 'angry' | 'calm' | 'excited' | 'neutral' | 'tired' | 'curious';

export interface MoodEntry {
  id: string;
  name: string;
  state: MoodState;
  intensity: number;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface MoeStats {
  entries: number;
  totalAdded: number;
  totalShifted: number;
  happy: number;
  sad: number;
  angry: number;
  calm: number;
  excited: number;
  neutral: number;
  tired: number;
  curious: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalIntensity: number;
  avgIntensity: number;
  maxIntensity: number;
}

export class MoodEngine {
  private entries: Map<string, MoodEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalShifted = 0;
  private totalIntensity = 0;

  add(name: string, state: MoodState = 'neutral', intensity: number = 5): string {
    const id = `moe-${++this.counter}`;
    this.entries.set(id, {
      id,
      name,
      state,
      intensity,
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    this.totalIntensity += intensity;
    return id;
  }

  shift(id: string, state: MoodState, intensity: number = 5): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    if (!e.active) return false;
    e.state = state;
    e.intensity = Math.max(0, intensity);
    e.updated = Date.now();
    e.hits++;
    this.totalShifted++;
    this.totalIntensity += Math.max(0, intensity);
    return true;
  }

  remove(id: string): boolean {
    return this.entries.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.name = name;
    e.updated = Date.now();
    return true;
  }

  setState(id: string, state: MoodState): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.state = state;
    e.updated = Date.now();
    return true;
  }

  setIntensity(id: string, intensity: number): boolean {
    const e = this.entries.get(id);
    if (!e) return false;
    e.intensity = Math.max(0, intensity);
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.entries.values()) {
      e.intensity = 5;
      e.state = 'neutral';
      e.active = true;
      e.hits = 0;
    }
    this.totalAdded = 0;
    this.totalShifted = 0;
    this.totalIntensity = 0;
  }

  getStats(): MoeStats {
    const all = Array.from(this.entries.values());
    const iArr = all.map(e => e.intensity);
    return {
      entries: all.length,
      totalAdded: this.totalAdded,
      totalShifted: this.totalShifted,
      happy: all.filter(e => e.state === 'happy').length,
      sad: all.filter(e => e.state === 'sad').length,
      angry: all.filter(e => e.state === 'angry').length,
      calm: all.filter(e => e.state === 'calm').length,
      excited: all.filter(e => e.state === 'excited').length,
      neutral: all.filter(e => e.state === 'neutral').length,
      tired: all.filter(e => e.state === 'tired').length,
      curious: all.filter(e => e.state === 'curious').length,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueNames: new Set(all.map(e => e.name)).size,
      totalIntensity: all.reduce((s, e) => s + e.intensity, 0),
      avgIntensity: all.length > 0 ? Math.round((iArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxIntensity: iArr.length > 0 ? Math.max(...iArr) : 0,
    };
  }

  getEntry(id: string): MoodEntry | undefined {
    return this.entries.get(id);
  }

  getAllEntries(): MoodEntry[] {
    return Array.from(this.entries.values());
  }

  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  getCount(): number {
    return this.entries.size;
  }

  getName(id: string): string | undefined {
    return this.entries.get(id)?.name;
  }

  getState(id: string): MoodState | undefined {
    return this.entries.get(id)?.state;
  }

  getIntensity(id: string): number {
    return this.entries.get(id)?.intensity ?? 0;
  }

  getHits(id: string): number {
    return this.entries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.entries.get(id)?.active ?? false;
  }

  isHappy(id: string): boolean {
    return this.entries.get(id)?.state === 'happy';
  }

  isSad(id: string): boolean {
    return this.entries.get(id)?.state === 'sad';
  }

  isAngry(id: string): boolean {
    return this.entries.get(id)?.state === 'angry';
  }

  isCalm(id: string): boolean {
    return this.entries.get(id)?.state === 'calm';
  }

  isExcited(id: string): boolean {
    return this.entries.get(id)?.state === 'excited';
  }

  isNeutral(id: string): boolean {
    return this.entries.get(id)?.state === 'neutral';
  }

  isTired(id: string): boolean {
    return this.entries.get(id)?.state === 'tired';
  }

  isCurious(id: string): boolean {
    return this.entries.get(id)?.state === 'curious';
  }

  getByState(state: MoodState): MoodEntry[] {
    return Array.from(this.entries.values()).filter(e => e.state === state);
  }

  getActiveEntries(): MoodEntry[] {
    return Array.from(this.entries.values()).filter(e => e.active);
  }

  getInactiveEntries(): MoodEntry[] {
    return Array.from(this.entries.values()).filter(e => !e.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.entries.values()).map(e => e.name))];
  }

  getNewest(): MoodEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): MoodEntry | null {
    const all = Array.from(this.entries.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.entries.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.entries.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalShifted(): number {
    return this.totalShifted;
  }

  clearAll(): void {
    this.entries.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalShifted = 0;
    this.totalIntensity = 0;
  }
}

export default MoodEngine;