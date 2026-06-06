/**
 * Path Engine
 * thunderbolt-design Path Engine - Register + Visit + Stats
 */

export interface Path {
  id: string;
  name: string;
  segments: string[];
  currentSegment: number;
  visited: number;
  completed: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface PE6Stats {
  paths: number;
  totalVisits: number;
  totalSegments: number;
  completed: number;
  inProgress: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgSegments: number;
  maxSegments: number;
  minSegments: number;
  completionRate: number;
}

export class PathEngine {
  private paths: Map<string, Path> = new Map();
  private counter = 0;
  private totalVisits = 0;

  register(name: string, segments: string[]): string {
    const id = `pe6-${++this.counter}`;
    this.paths.set(id, {
      id,
      name,
      segments: [...segments],
      currentSegment: 0,
      visited: 0,
      completed: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [0],
    });
    return id;
  }

  visit(id: string, segment: string): boolean {
    const p = this.paths.get(id);
    if (!p) return false;
    if (!p.active) return false;
    if (p.completed) return false;
    if (segment === p.segments[p.currentSegment]) {
      p.visited++;
      p.history.push(p.currentSegment);
      if (p.currentSegment >= p.segments.length - 1) {
        p.completed = true;
      } else {
        p.currentSegment++;
      }
      p.updated = Date.now();
      p.hits++;
      this.totalVisits++;
      return true;
    }
    return false;
  }

  reset(id: string): boolean {
    const p = this.paths.get(id);
    if (!p) return false;
    p.currentSegment = 0;
    p.visited = 0;
    p.completed = false;
    p.history = [0];
    p.updated = Date.now();
    return true;
  }

  getCurrentSegment(id: string): string {
    const p = this.paths.get(id);
    if (!p) return '';
    if (p.completed) return 'done';
    return p.segments[p.currentSegment] ?? '';
  }

  getStats(): PE6Stats {
    const all = Array.from(this.paths.values());
    const segCounts = all.map(p => p.segments.length);
    return {
      paths: all.length,
      totalVisits: this.totalVisits,
      totalSegments: segCounts.reduce((s, v) => s + v, 0),
      completed: all.filter(p => p.completed).length,
      inProgress: all.filter(p => !p.completed).length,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(p => p.name)).size,
      avgSegments: all.length > 0 ? Math.round((segCounts.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxSegments: segCounts.length > 0 ? Math.max(...segCounts) : 0,
      minSegments: segCounts.length > 0 ? Math.min(...segCounts) : 0,
      completionRate: all.length > 0 ? Math.round((all.filter(p => p.completed).length / all.length) * 100) / 100 : 0,
    };
  }

  getPath(id: string): Path | undefined {
    return this.paths.get(id);
  }

  getAllPaths(): Path[] {
    return Array.from(this.paths.values());
  }

  removePath(id: string): boolean {
    return this.paths.delete(id);
  }

  hasPath(id: string): boolean {
    return this.paths.has(id);
  }

  getCount(): number {
    return this.paths.size;
  }

  getName(id: string): string | undefined {
    return this.paths.get(id)?.name;
  }

  getSegments(id: string): string[] {
    return [...(this.paths.get(id)?.segments ?? [])];
  }

  getSegmentCount(id: string): number {
    return this.paths.get(id)?.segments.length ?? 0;
  }

  getCurrentSegmentIndex(id: string): number {
    return this.paths.get(id)?.currentSegment ?? 0;
  }

  getVisited(id: string): number {
    return this.paths.get(id)?.visited ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.paths.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.paths.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.paths.get(id)?.active ?? false;
  }

  isCompleted(id: string): boolean {
    return this.paths.get(id)?.completed ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.paths.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const p = this.paths.get(id);
    if (!p) return false;
    p.name = name;
    p.updated = Date.now();
    return true;
  }

  setSegments(id: string, segments: string[]): boolean {
    const p = this.paths.get(id);
    if (!p) return false;
    p.segments = [...segments];
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.paths.values()) {
      p.currentSegment = 0;
      p.visited = 0;
      p.completed = false;
      p.hits = 0;
      p.history = [0];
      p.active = true;
    }
    this.totalVisits = 0;
  }

  getByName(name: string): Path[] {
    return Array.from(this.paths.values()).filter(p => p.name === name);
  }

  getCompletedPaths(): Path[] {
    return Array.from(this.paths.values()).filter(p => p.completed);
  }

  getInProgressPaths(): Path[] {
    return Array.from(this.paths.values()).filter(p => !p.completed);
  }

  getActivePaths(): Path[] {
    return Array.from(this.paths.values()).filter(p => p.active);
  }

  getInactivePaths(): Path[] {
    return Array.from(this.paths.values()).filter(p => !p.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.paths.values()).map(p => p.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinSegments(min: number): Path[] {
    return Array.from(this.paths.values()).filter(p => p.segments.length >= min);
  }

  getMostSegments(): Path | null {
    const all = Array.from(this.paths.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.segments.length > max.segments.length ? p : max);
  }

  getNewest(): Path | null {
    const all = Array.from(this.paths.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): Path | null {
    const all = Array.from(this.paths.values());
    if (all.length === 0) return null;
    return all.reduce((min, p) => p.created < min.created ? p : min);
  }

  getCreatedAt(id: string): number {
    return this.paths.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.paths.get(id)?.updated ?? 0;
  }

  getTotalVisits(): number {
    return this.totalVisits;
  }

  clearAll(): void {
    this.paths.clear();
    this.counter = 0;
    this.totalVisits = 0;
  }
}

export default PathEngine;