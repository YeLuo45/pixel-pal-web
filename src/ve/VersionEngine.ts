/**
 * Version Engine
 * claude-code-design Version Engine - Create + SetCurrent + Compare + Rollback + Stats
 */

export interface Version {
  id: string;
  name: string;
  semver: string;
  current: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: string[];
}

export interface VEStats {
  versions: number;
  current: string | null;
  totalHits: number;
  active: number;
  inactive: number;
  avgSemver: number;
  mostRecent: number;
  oldest: number;
}

export class VersionEngine {
  private versions: Map<string, Version> = new Map();
  private counter = 0;
  private currentId: string | null = null;
  private previousIds: string[] = [];

  create(name: string, semver: string): string {
    const id = `ve-${++this.counter}`;
    this.versions.set(id, {
      id,
      name,
      semver,
      current: false,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [semver],
    });
    if (this.currentId === null) {
      this.currentId = id;
      this.versions.get(id)!.current = true;
    }
    return id;
  }

  setCurrent(id: string): boolean {
    const v = this.versions.get(id);
    if (!v) return false;
    if (!v.active) return false;
    if (this.currentId && this.currentId !== id) {
      const prev = this.versions.get(this.currentId);
      if (prev) prev.current = false;
      this.previousIds.push(this.currentId);
    }
    v.current = true;
    v.updated = Date.now();
    this.currentId = id;
    return true;
  }

  compare(id1: string, id2: string): number {
    const v1 = this.versions.get(id1);
    const v2 = this.versions.get(id2);
    if (!v1 || !v2) return 0;
    const sem1 = this.parseSemver(v1.semver);
    const sem2 = this.parseSemver(v2.semver);
    if (sem1.major !== sem2.major) return sem1.major - sem2.major;
    if (sem1.minor !== sem2.minor) return sem1.minor - sem2.minor;
    return sem1.patch - sem2.patch;
  }

  rollback(): string | null {
    if (this.previousIds.length === 0) return null;
    const prevId = this.previousIds.pop()!;
    const v = this.versions.get(prevId);
    if (!v || !v.active) {
      this.currentId = null;
      return null;
    }
    if (this.currentId && this.currentId !== prevId) {
      const cur = this.versions.get(this.currentId);
      if (cur) cur.current = false;
    }
    v.current = true;
    v.updated = Date.now();
    this.currentId = prevId;
    return prevId;
  }

  parseSemver(semver: string): { major: number; minor: number; patch: number } {
    const parts = semver.split('.').map(p => parseInt(p, 10) || 0);
    return {
      major: parts[0] ?? 0,
      minor: parts[1] ?? 0,
      patch: parts[2] ?? 0,
    };
  }

  getStats(): VEStats {
    const all = Array.from(this.versions.values());
    return {
      versions: all.length,
      current: this.currentId,
      totalHits: all.reduce((s, v) => s + v.hits, 0),
      active: all.filter(v => v.active).length,
      inactive: all.filter(v => !v.active).length,
      avgSemver: all.length > 0 ? Math.round((all.reduce((s, v) => {
        const sem = this.parseSemver(v.semver);
        return s + sem.major * 100 + sem.minor * 10 + sem.patch;
      }, 0) / all.length) * 100) / 100 : 0,
      mostRecent: all.length > 0 ? Math.max(...all.map(v => v.created)) : 0,
      oldest: all.length > 0 ? Math.min(...all.map(v => v.created)) : 0,
    };
  }

  getVersion(id: string): Version | undefined {
    return this.versions.get(id);
  }

  getAllVersions(): Version[] {
    return Array.from(this.versions.values());
  }

  removeVersion(id: string): boolean {
    if (this.currentId === id) this.currentId = null;
    this.previousIds = this.previousIds.filter(pid => pid !== id);
    return this.versions.delete(id);
  }

  hasVersion(id: string): boolean {
    return this.versions.has(id);
  }

  getCount(): number {
    return this.versions.size;
  }

  getName(id: string): string | undefined {
    return this.versions.get(id)?.name;
  }

  getSemver(id: string): string | undefined {
    return this.versions.get(id)?.semver;
  }

  getHits(id: string): number {
    return this.versions.get(id)?.hits ?? 0;
  }

  getHistory(id: string): string[] {
    return [...(this.versions.get(id)?.history ?? [])];
  }

  isCurrent(id: string): boolean {
    return this.versions.get(id)?.current ?? false;
  }

  isActive(id: string): boolean {
    return this.versions.get(id)?.active ?? false;
  }

  getCurrentId(): string | null {
    return this.currentId;
  }

  getCurrent(): Version | undefined {
    return this.currentId ? this.versions.get(this.currentId) : undefined;
  }

  getPreviousIds(): string[] {
    return [...this.previousIds];
  }

  setActive(id: string, active: boolean): boolean {
    const v = this.versions.get(id);
    if (!v) return false;
    v.active = active;
    v.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const v = this.versions.get(id);
    if (!v) return false;
    v.name = name;
    v.updated = Date.now();
    return true;
  }

  setSemver(id: string, semver: string): boolean {
    const v = this.versions.get(id);
    if (!v) return false;
    v.semver = semver;
    v.history.push(semver);
    v.updated = Date.now();
    return true;
  }

  touch(id: string): boolean {
    const v = this.versions.get(id);
    if (!v) return false;
    v.hits++;
    v.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const v of this.versions.values()) {
      v.hits = 0;
      v.active = true;
      v.history = [v.semver];
    }
    this.currentId = null;
    this.previousIds = [];
  }

  getByName(name: string): Version[] {
    return Array.from(this.versions.values()).filter(v => v.name === name);
  }

  getActiveVersions(): Version[] {
    return Array.from(this.versions.values()).filter(v => v.active);
  }

  getInactiveVersions(): Version[] {
    return Array.from(this.versions.values()).filter(v => !v.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.versions.values()).map(v => v.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMajor(major: number): Version[] {
    return Array.from(this.versions.values()).filter(v => this.parseSemver(v.semver).major === major);
  }

  getByMinor(minor: number): Version[] {
    return Array.from(this.versions.values()).filter(v => this.parseSemver(v.semver).minor === minor);
  }

  getNewest(): Version | null {
    const all = Array.from(this.versions.values());
    if (all.length === 0) return null;
    return all.reduce((max, v) => v.created > max.created ? v : max);
  }

  getOldest(): Version | null {
    const all = Array.from(this.versions.values());
    if (all.length === 0) return null;
    return all.reduce((min, v) => v.created < min.created ? v : min);
  }

  getCreatedAt(id: string): number {
    return this.versions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.versions.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.versions.clear();
    this.counter = 0;
    this.currentId = null;
    this.previousIds = [];
  }
}

export default VersionEngine;