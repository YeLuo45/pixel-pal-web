/**
 * Path Engine
 * claude-code-design Path Engine - Add + Resolve + Normalize + Stats
 */

function normalizePath(path: string): string {
  if (!path.startsWith('/')) path = '/' + path;
  return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

function resolvePath(...parts: string[]): string {
  return parts
    .filter(p => p && p.length > 0)
    .map(normalizePath)
    .join('/')
    .replace(/\/+/g, '/');
}

function joinPath(base: string, ext: string): string {
  return normalizePath(base + '/' + ext);
}

export interface PathEntry {
  id: string;
  path: string;
  resolved: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface PeStats {
  paths: number;
  totalResolves: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniquePaths: number;
  avgPathLength: number;
  maxPathLength: number;
  minPathLength: number;
}

export class PathEngine {
  private paths: Map<string, PathEntry> = new Map();
  private counter = 0;
  private totalResolves = 0;

  add(path: string): string {
    const id = `pe-${++this.counter}`;
    const resolved = normalizePath(path);
    this.paths.set(id, {
      id,
      path,
      resolved,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  resolve(id: string): string | undefined {
    this.totalResolves++;
    const p = this.paths.get(id);
    if (!p) return undefined;
    if (!p.active) return undefined;
    p.hits++;
    p.updated = Date.now();
    return p.resolved;
  }

  resolveWith(id: string, ext: string): string | undefined {
    const p = this.paths.get(id);
    if (!p) return undefined;
    if (!p.active) return undefined;
    p.hits++;
    p.updated = Date.now();
    return joinPath(p.resolved, ext);
  }

  remove(id: string): boolean {
    return this.paths.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const p = this.paths.get(id);
    if (!p) return false;
    p.active = active;
    p.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const p of this.paths.values()) {
      p.hits = 0;
      p.active = true;
    }
    this.totalResolves = 0;
  }

  getStats(): PeStats {
    const all = Array.from(this.paths.values());
    const lengthValues = all.map(p => p.path.length);
    return {
      paths: all.length,
      totalResolves: this.totalResolves,
      active: all.filter(p => p.active).length,
      inactive: all.filter(p => !p.active).length,
      totalHits: all.reduce((s, p) => s + p.hits, 0),
      uniquePaths: new Set(all.map(p => p.path)).size,
      avgPathLength: all.length > 0 ? Math.round((lengthValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxPathLength: lengthValues.length > 0 ? Math.max(...lengthValues) : 0,
      minPathLength: lengthValues.length > 0 ? Math.min(...lengthValues) : 0,
    };
  }

  getPath(id: string): PathEntry | undefined {
    return this.paths.get(id);
  }

  getAllPaths(): PathEntry[] {
    return Array.from(this.paths.values());
  }

  hasPath(id: string): boolean {
    return this.paths.has(id);
  }

  getCount(): number {
    return this.paths.size;
  }

  getOriginalPath(id: string): string | undefined {
    return this.paths.get(id)?.path;
  }

  getResolved(id: string): string | undefined {
    return this.paths.get(id)?.resolved;
  }

  getPathLength(id: string): number {
    return this.paths.get(id)?.path.length ?? 0;
  }

  getHits(id: string): number {
    return this.paths.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.paths.get(id)?.active ?? false;
  }

  getActivePaths(): PathEntry[] {
    return Array.from(this.paths.values()).filter(p => p.active);
  }

  getInactivePaths(): PathEntry[] {
    return Array.from(this.paths.values()).filter(p => !p.active);
  }

  getAllOriginals(): string[] {
    return [...new Set(Array.from(this.paths.values()).map(p => p.path))];
  }

  getByMinLength(min: number): PathEntry[] {
    return Array.from(this.paths.values()).filter(p => p.path.length >= min);
  }

  getNewest(): PathEntry | null {
    const all = Array.from(this.paths.values());
    if (all.length === 0) return null;
    return all.reduce((max, p) => p.created > max.created ? p : max);
  }

  getOldest(): PathEntry | null {
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

  getTotalResolves(): number {
    return this.totalResolves;
  }

  clearAll(): void {
    this.paths.clear();
    this.counter = 0;
    this.totalResolves = 0;
  }
}

export { normalizePath, resolvePath, joinPath };
export default PathEngine;