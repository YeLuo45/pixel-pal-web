/**
 * Dependency Analyzer
 * claude-code-design Dependency Analyzer - Detect + Cycle + Version + Report
 */

export interface Dependency {
  name: string;
  version: string;
  dependencies: string[];
}

export interface DependencyReport {
  total: number;
  cycles: string[][];
  outdated: string[];
  duplicates: string[];
}

export class DependencyAnalyzer {
  private dependencies: Map<string, Dependency> = new Map();
  private versionOrder: string[] = ['0.0.1', '0.0.2', '0.1.0', '1.0.0', '1.0.1', '2.0.0'];

  addDependency(dep: Dependency): void {
    this.dependencies.set(dep.name, { ...dep, dependencies: [...dep.dependencies] });
  }

  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (name: string, path: string[]): void => {
      if (stack.has(name)) {
        const cycleStart = path.indexOf(name);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), name]);
        }
        return;
      }
      if (visited.has(name)) return;

      visited.add(name);
      stack.add(name);
      const dep = this.dependencies.get(name);
      if (dep) {
        for (const child of dep.dependencies) {
          dfs(child, [...path, name]);
        }
      }
      stack.delete(name);
    };

    for (const name of this.dependencies.keys()) {
      dfs(name, []);
    }
    return cycles;
  }

  checkOutdated(current: Record<string, string>): string[] {
    const outdated: string[] = [];
    for (const [name, dep] of this.dependencies.entries()) {
      const currentVer = current[name];
      if (!currentVer) {
        outdated.push(name);
        continue;
      }
      if (this.compareVersions(currentVer, dep.version) < 0) {
        outdated.push(name);
      }
    }
    return outdated;
  }

  generateReport(): DependencyReport {
    return {
      total: this.dependencies.size,
      cycles: this.detectCycles(),
      outdated: this.checkOutdated({}),
      duplicates: this.findDuplicates(),
    };
  }

  findDuplicates(): string[] {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const dep of this.dependencies.values()) {
      const dupes = dep.dependencies.filter(d => seen.has(d));
      for (const d of dupes) {
        if (!duplicates.includes(d)) duplicates.push(d);
      }
      for (const d of dep.dependencies) seen.add(d);
    }
    return duplicates;
  }

  getDependency(name: string): Dependency | undefined {
    return this.dependencies.get(name);
  }

  getAllDependencies(): Dependency[] {
    return Array.from(this.dependencies.values());
  }

  getDependencyCount(): number {
    return this.dependencies.size;
  }

  hasDependency(name: string): boolean {
    return this.dependencies.has(name);
  }

  removeDependency(name: string): boolean {
    return this.dependencies.delete(name);
  }

  getTransitiveDependencies(name: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    const queue = [name];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const dep = this.dependencies.get(current);
      if (dep) {
        for (const child of dep.dependencies) {
          if (!visited.has(child)) {
            result.push(child);
            queue.push(child);
          }
        }
      }
    }
    return result;
  }

  getDirectDependencies(name: string): string[] {
    return [...(this.dependencies.get(name)?.dependencies ?? [])];
  }

  getRoots(): Dependency[] {
    // Roots are deps that aren't depended on by anyone else
    const dependedOnBy = new Set<string>();
    for (const dep of this.dependencies.values()) {
      for (const child of dep.dependencies) {
        dependedOnBy.add(child);
      }
    }
    return Array.from(this.dependencies.values()).filter(d => !dependedOnBy.has(d.name));
  }

  getLeaves(): Dependency[] {
    return Array.from(this.dependencies.values()).filter(d => d.dependencies.length === 0);
  }

  hasCycle(): boolean {
    return this.detectCycles().length > 0;
  }

  getOutdatedNames(current: Record<string, string>): string[] {
    return this.checkOutdated(current);
  }

  getMaxDepth(): number {
    let maxDepth = 0;
    const visited = new Set<string>();

    const dfs = (name: string, depth: number): void => {
      if (depth > maxDepth) maxDepth = depth;
      if (visited.has(name)) return;
      visited.add(name);
      const dep = this.dependencies.get(name);
      if (dep) {
        for (const child of dep.dependencies) {
          dfs(child, depth + 1);
        }
      }
    };

    for (const name of this.dependencies.keys()) {
      dfs(name, 1);
    }
    return maxDepth;
  }

  private compareVersions(a: string, b: string): number {
    const aIdx = this.versionOrder.indexOf(a);
    const bIdx = this.versionOrder.indexOf(b);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return -1;
    if (bIdx === -1) return 1;
    return aIdx - bIdx;
  }

  clearAll(): void {
    this.dependencies.clear();
  }
}

export default DependencyAnalyzer;