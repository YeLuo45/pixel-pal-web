/**
 * Profiler Engine
 * claude-code-design Profiler Engine - Start + Stop + Profile + Stats
 */

export type ProfileType = 'cpu' | 'memory' | 'network' | 'disk';

export interface Profile {
  id: string;
  name: string;
  type: ProfileType;
  duration: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Pre2Stats {
  profiles: number;
  totalStarted: number;
  totalStopped: number;
  totalProfiled: number;
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalDuration: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}

export class ProfilerEngine {
  private profiles: Map<string, Profile> = new Map();
  private counter = 0;
  private totalStarted = 0;
  private totalStopped = 0;
  private totalProfiled = 0;
  private totalDuration = 0;

  start(name: string, type: ProfileType = 'cpu'): string {
    const id = `pre2-${++this.counter}`;
    this.profiles.set(id, {
      id,
      name,
      type,
      duration: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalStarted++;
    return id;
  }

  stop(id: string, duration: number): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.duration = duration;
    p.updated = Date.now();
    p.hits++;
    this.totalStopped++;
    this.totalDuration += duration;
    return true;
  }

  profile(id: string): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    if (!p.active) return false;
    p.updated = Date.now();
    p.hits++;
    this.totalProfiled++;
    return true;
  }

  remove(id: string): boolean {
    return this.profiles.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setType(id: string, type: ProfileType): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    p.type = type;
    p.updated = Date.now();
    return true;
  }

  setDuration(id: string, duration: number): boolean {
    const p = this.profiles.get(id);
    if (!p) return false;
    p.duration = duration;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.profiles.values()) {
      p.duration = 0;
      p.active = true;
      p.hits = 0;
    }
    this.totalStarted = 0;
    this.totalStopped = 0;
    this.totalProfiled = 0;
    this.totalDuration = 0;
  }

  getStats(): Pre2Stats {
    const all = Array.from(this.profiles.values());
    const dArr = all.map(p => p.duration);
    return {
      profiles: all.length,
      totalStarted: this.totalStarted,
      totalStopped: this.totalStopped,
      totalProfiled: this.totalProfiled,
      cpu: all.filter(p => p.type === 'cpu').length,
      memory: all.filter(p => p.type === 'memory').length,
      network: all.filter(p => p.type === 'network').length,
      disk: all.filter(p => p.type === 'disk').length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      totalDuration: this.totalDuration,
      avgDuration: all.length > 0 ? Math.round((dArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxDuration: dArr.length > 0 ? Math.max(...dArr) : 0,
      minDuration: dArr.length > 0 ? Math.min(...dArr) : 0,
    };
  }

  getProfile(id: string): Profile | undefined {
    return this.profiles.get(id);
  }

  getAllProfiles(): Profile[] {
    return Array.from(this.profiles.values());
  }

  hasProfile(id: string): boolean {
    return this.profiles.has(id);
  }

  getCount(): number {
    return this.profiles.size;
  }

  getName(id: string): string | undefined {
    return this.profiles.get(id)?.name;
  }

  getType(id: string): ProfileType | undefined {
    return this.profiles.get(id)?.type;
  }

  getDuration(id: string): number {
    return this.profiles.get(id)?.duration ?? 0;
  }

  getHits(id: string): number {
    return this.profiles.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.profiles.get(id)?.active ?? false;
  }

  isCPU(id: string): boolean {
    return this.profiles.get(id)?.type === 'cpu';
  }

  isMemory(id: string): boolean {
    return this.profiles.get(id)?.type === 'memory';
  }

  isNetwork(id: string): boolean {
    return this.profiles.get(id)?.type === 'network';
  }

  isDisk(id: string): boolean {
    return this.profiles.get(id)?.type === 'disk';
  }

  getByType(type: ProfileType): Profile[] {
    return Array.from(this.profiles.values()).filter(p => p.type === type);
  }

  getActiveProfiles(): Profile[] {
    return Array.from(this.profiles.values()).filter(p => p.active);
  }

  getInactiveProfiles(): Profile[] {
    return Array.from(this.profiles.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.profiles.values()).map(p => p.name))];
  }

  getNewest(): Profile | null {
    const all = Array.from(this.profiles.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Profile | null {
    const all = Array.from(this.profiles.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.profiles.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.profiles.get(id)?.updated ?? 0;
  }

  getTotalStarted(): number {
    return this.totalStarted;
  }

  getTotalStopped(): number {
    return this.totalStopped;
  }

  getTotalProfiled(): number {
    return this.totalProfiled;
  }

  clearAll(): void {
    this.profiles.clear();
    this.counter = 0;
    this.totalStarted = 0;
    this.totalStopped = 0;
    this.totalProfiled = 0;
    this.totalDuration = 0;
  }
}

export default ProfilerEngine;