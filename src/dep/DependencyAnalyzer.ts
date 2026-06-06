/**
 * Dependency Analyzer
 * claude-code-design Dependency Analyzer - Add + Remove + Detect + Stats
 */

export interface Dependency {
  id: string;
  source: string;
  target: string;
  version: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface DepStats {
  deps: number;
  sources: number;
  targets: number;
  active: number;
  inactive: number;
  totalHits: number;
}

export class DependencyAnalyzer {
  private deps: Map<string, Dependency> = new Map();
  private counter = 0;

  add(source: string, target: string, version: string): string {
    const id = `dep-${++this.counter}`;
    this.deps.set(id, {
      id,
      source,
      target,
      version,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  remove(id: string): boolean {
    const d = this.deps.get(id);
    if (!d) return false;
    d.active = false;
    d.updated = Date.now();
    return true;
  }

  detect(): string[] {
    const all = Array.from(this.deps.values()).filter(d => d.active);
    const targets = new Set(all.map(d => d.target));
    return Array.from(targets);
  }

  getStats(): DepStats {
    const all = Array.from(this.deps.values());
    return {
      deps: all.length,
      sources: new Set(all.map(d => d.source)).size,
      targets: new Set(all.map(d => d.target)).size,
      active: all.filter(d => d.active).length,
      inactive: all.filter(d => !d.active).length,
      totalHits: all.reduce((s, d) => s + d.hits, 0),
    };
  }

  getDependency(id: string): Dependency | undefined {
    return this.deps.get(id);
  }

  getAllDependencies(): Dependency[] {
    return Array.from(this.deps.values());
  }

  removeDependency(id: string): boolean {
    return this.deps.delete(id);
  }

  hasDependency(id: string): boolean {
    return this.deps.has(id);
  }

  getCount(): number {
    return this.deps.size;
  }

  getSource(id: string): string | undefined {
    return this.deps.get(id)?.source;
  }

  getTarget(id: string): string | undefined {
    return this.deps.get(id)?.target;
  }

  getVersion(id: string): string | undefined {
    return this.deps.get(id)?.version;
  }

  getHits(id: string): number {
    return this.deps.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.deps.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const d = this.deps.get(id);
    if (!d) return false;
    d.active = active;
    d.updated = Date.now();
    return true;
  }

  setVersion(id: string, version: string): boolean {
    const d = this.deps.get(id);
    if (!d) return false;
    d.version = version;
    d.updated = Date.now();
    return true;
  }

  setSource(id: string, source: string): boolean {
    const d = this.deps.get(id);
    if (!d) return false;
    d.source = source;
    d.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const d = this.deps.get(id);
    if (!d) return false;
    d.target = target;
    d.updated = Date.now();
    return true;
  }

  incrementHits(id: string): boolean {
    const d = this.deps.get(id);
    if (!d) return false;
    d.hits++;
    return true;
  }

  resetHits(): void {
    for (const d of this.deps.values()) d.hits = 0;
  }

  resetAll(): void {
    for (const d of this.deps.values()) {
      d.hits = 0;
      d.active = true;
    }
  }

  getBySource(source: string): Dependency[] {
    return Array.from(this.deps.values()).filter(d => d.source === source);
  }

  getByTarget(target: string): Dependency[] {
    return Array.from(this.deps.values()).filter(d => d.target === target);
  }

  getActiveDependencies(): Dependency[] {
    return Array.from(this.deps.values()).filter(d => d.active);
  }

  getInactiveDependencies(): Dependency[] {
    return Array.from(this.deps.values()).filter(d => !d.active);
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.deps.values()).map(d => d.source))];
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.deps.values()).map(d => d.target))];
  }

  getAllVersions(): string[] {
    return [...new Set(Array.from(this.deps.values()).map(d => d.version))];
  }

  getSourceCount(): number {
    return this.getAllSources().length;
  }

  getTargetCount(): number {
    return this.getAllTargets().length;
  }

  getVersionCount(): number {
    return this.getAllVersions().length;
  }

  getByVersion(version: string): Dependency[] {
    return Array.from(this.deps.values()).filter(d => d.version === version);
  }

  getMostHit(): Dependency | null {
    const all = Array.from(this.deps.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.hits > max.hits ? d : max);
  }

  getNewest(): Dependency | null {
    const all = Array.from(this.deps.values());
    if (all.length === 0) return null;
    return all.reduce((max, d) => d.created > max.created ? d : max);
  }

  getOldest(): Dependency | null {
    const all = Array.from(this.deps.values());
    if (all.length === 0) return null;
    return all.reduce((min, d) => d.created < min.created ? d : min);
  }

  getCreatedAt(id: string): number {
    return this.deps.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.deps.get(id)?.updated ?? 0;
  }

  getCircular(): string[][] {
    const visited = new Set<string>();
    const cycles: string[][] = [];
    for (const d of this.deps.values()) {
      if (!visited.has(d.source)) {
        const path = [d.source];
        const stack = new Set(path);
        const dfs = (current: string): void => {
          visited.add(current);
          const outgoing = Array.from(this.deps.values()).filter(d => d.source === current);
          for (const o of outgoing) {
            if (stack.has(o.target)) {
              cycles.push([...path, o.target]);
            } else {
              path.push(o.target);
              stack.add(o.target);
              dfs(o.target);
              path.pop();
              stack.delete(o.target);
            }
          }
        };
        dfs(d.source);
      }
    }
    return cycles;
  }

  clearAll(): void {
    this.deps.clear();
    this.counter = 0;
  }
}

export default DependencyAnalyzer;