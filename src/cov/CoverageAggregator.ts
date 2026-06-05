/**
 * Coverage Aggregator
 * claude-code-design Coverage Aggregator - Add + GetOverall + GetFailing + Stats
 */

export interface Coverage {
  id: string;
  file: string;
  coverage: number;
  threshold: number;
  passing: boolean;
  created: number;
  updated: number;
}

export interface CoverageStats {
  files: number;
  overall: number;
  failing: number;
  passing: number;
  avgCoverage: number;
  defaultThreshold: number;
}

export class CoverageAggregator {
  private coverages: Map<string, Coverage> = new Map();
  private counter = 0;
  private defaultThreshold = 99;

  add(file: string, coverage: number): string {
    const id = `cov-${++this.counter}`;
    this.coverages.set(id, {
      id,
      file,
      coverage,
      threshold: this.defaultThreshold,
      passing: coverage >= this.defaultThreshold,
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  getOverall(): number {
    const all = Array.from(this.coverages.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((s, c) => s + c.coverage, 0) / all.length) * 100) / 100;
  }

  getFailing(): Coverage[] {
    return Array.from(this.coverages.values()).filter(c => !c.passing);
  }

  getStats(): CoverageStats {
    const all = Array.from(this.coverages.values());
    return {
      files: all.length,
      overall: this.getOverall(),
      failing: this.getFailing().length,
      passing: all.filter(c => c.passing).length,
      avgCoverage: this.getOverall(),
      defaultThreshold: this.defaultThreshold,
    };
  }

  getCoverage(id: string): Coverage | undefined {
    return this.coverages.get(id);
  }

  getAllCoverages(): Coverage[] {
    return Array.from(this.coverages.values());
  }

  removeCoverage(id: string): boolean {
    return this.coverages.delete(id);
  }

  hasCoverage(id: string): boolean {
    return this.coverages.has(id);
  }

  getCount(): number {
    return this.coverages.size;
  }

  getFile(id: string): string | undefined {
    return this.coverages.get(id)?.file;
  }

  getCoverageValue(id: string): number {
    return this.coverages.get(id)?.coverage ?? 0;
  }

  getThreshold(id: string): number {
    return this.coverages.get(id)?.threshold ?? 0;
  }

  isPassing(id: string): boolean {
    return this.coverages.get(id)?.passing ?? false;
  }

  setDefaultThreshold(threshold: number): void {
    this.defaultThreshold = threshold;
  }

  getDefaultThreshold(): number {
    return this.defaultThreshold;
  }

  setThreshold(id: string, threshold: number): boolean {
    const c = this.coverages.get(id);
    if (!c) return false;
    c.threshold = threshold;
    c.passing = c.coverage >= threshold;
    c.updated = Date.now();
    return true;
  }

  setCoverage(id: string, coverage: number): boolean {
    const c = this.coverages.get(id);
    if (!c) return false;
    c.coverage = coverage;
    c.passing = coverage >= c.threshold;
    c.updated = Date.now();
    return true;
  }

  setFile(id: string, file: string): boolean {
    const c = this.coverages.get(id);
    if (!c) return false;
    c.file = file;
    c.updated = Date.now();
    return true;
  }

  recheck(): void {
    for (const c of this.coverages.values()) {
      c.passing = c.coverage >= c.threshold;
    }
  }

  getByFile(file: string): Coverage[] {
    return Array.from(this.coverages.values()).filter(c => c.file === file);
  }

  getPassing(): Coverage[] {
    return Array.from(this.coverages.values()).filter(c => c.passing);
  }

  getByMinCoverage(min: number): Coverage[] {
    return Array.from(this.coverages.values()).filter(c => c.coverage >= min);
  }

  getByMaxCoverage(max: number): Coverage[] {
    return Array.from(this.coverages.values()).filter(c => c.coverage <= max);
  }

  getAllFiles(): string[] {
    return [...new Set(Array.from(this.coverages.values()).map(c => c.file))];
  }

  getFileCount(): number {
    return this.getAllFiles().length;
  }

  getMinCoverage(): number {
    const all = Array.from(this.coverages.values());
    if (all.length === 0) return 0;
    return Math.min(...all.map(c => c.coverage));
  }

  getMaxCoverage(): number {
    const all = Array.from(this.coverages.values());
    if (all.length === 0) return 0;
    return Math.max(...all.map(c => c.coverage));
  }

  getCreatedAt(id: string): number {
    return this.coverages.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.coverages.get(id)?.updated ?? 0;
  }

  getLowest(): Coverage | null {
    const all = Array.from(this.coverages.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.coverage < min.coverage ? c : min);
  }

  getHighest(): Coverage | null {
    const all = Array.from(this.coverages.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.coverage > max.coverage ? c : max);
  }

  clearAll(): void {
    this.coverages.clear();
    this.counter = 0;
  }
}

export default CoverageAggregator;