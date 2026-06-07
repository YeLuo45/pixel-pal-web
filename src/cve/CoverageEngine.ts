/**
 * Coverage Engine
 * claude-code-design Coverage Engine - Track + Report + Stats
 */

export type CoverageStatus = 'uncovered' | 'partial' | 'full';

export interface Coverage {
  id: string;
  file: string;
  totalLines: number;
  coveredLines: number;
  status: CoverageStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CveStats {
  coverages: number;
  totalAdded: number;
  totalReported: number;
  uncovered: number;
  partial: number;
  full: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueFiles: number;
  totalLines: number;
  totalCovered: number;
  avgCoverage: number;
  maxCoverage: number;
  minCoverage: number;
}

function calcStatus(total: number, covered: number): CoverageStatus {
  if (total === 0) return 'uncovered';
  const ratio = covered / total;
  if (ratio >= 1) return 'full';
  if (ratio >= 0.5) return 'partial';
  return 'uncovered';
}

export class CoverageEngine {
  private coverages: Map<string, Coverage> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalReported = 0;

  track(file: string, totalLines: number, coveredLines: number): string {
    const id = `cve-${++this.counter}`;
    this.coverages.set(id, {
      id,
      file,
      totalLines,
      coveredLines,
      status: calcStatus(totalLines, coveredLines),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  report(id: string): boolean {
    const c = this.coverages.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.updated = Date.now();
    c.hits++;
    this.totalReported++;
    return true;
  }

  updateCoverage(id: string, coveredLines: number): boolean {
    const c = this.coverages.get(id);
    if (!c) return false;
    c.coveredLines = coveredLines;
    c.status = calcStatus(c.totalLines, coveredLines);
    c.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.coverages.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.coverages.get(id);
    if (!c) return false;
    c.active = active;
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

  setTotalLines(id: string, totalLines: number): boolean {
    const c = this.coverages.get(id);
    if (!c) return false;
    c.totalLines = totalLines;
    c.status = calcStatus(totalLines, c.coveredLines);
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.coverages.values()) {
      c.active = true;
      c.hits = 0;
    }
    this.totalAdded = 0;
    this.totalReported = 0;
  }

  getStats(): CveStats {
    const all = Array.from(this.coverages.values());
    const ratios = all.map(c => c.totalLines > 0 ? c.coveredLines / c.totalLines : 0);
    return {
      coverages: all.length,
      totalAdded: this.totalAdded,
      totalReported: this.totalReported,
      uncovered: all.filter(c => c.status === 'uncovered').length,
      partial: all.filter(c => c.status === 'partial').length,
      full: all.filter(c => c.status === 'full').length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueFiles: new Set(all.map(c => c.file)).size,
      totalLines: all.reduce((s, c) => s + c.totalLines, 0),
      totalCovered: all.reduce((s, c) => s + c.coveredLines, 0),
      avgCoverage: all.length > 0 ? Math.round((ratios.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxCoverage: ratios.length > 0 ? Math.max(...ratios) : 0,
      minCoverage: ratios.length > 0 ? Math.min(...ratios) : 0,
    };
  }

  getCoverage(id: string): Coverage | undefined {
    return this.coverages.get(id);
  }

  getAllCoverages(): Coverage[] {
    return Array.from(this.coverages.values());
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

  getTotalLines(id: string): number {
    return this.coverages.get(id)?.totalLines ?? 0;
  }

  getCoveredLines(id: string): number {
    return this.coverages.get(id)?.coveredLines ?? 0;
  }

  getRatio(id: string): number {
    const c = this.coverages.get(id);
    if (!c || c.totalLines === 0) return 0;
    return Math.round((c.coveredLines / c.totalLines) * 100) / 100;
  }

  getHits(id: string): number {
    return this.coverages.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.coverages.get(id)?.active ?? false;
  }

  isFull(id: string): boolean {
    return this.coverages.get(id)?.status === 'full';
  }

  isPartial(id: string): boolean {
    return this.coverages.get(id)?.status === 'partial';
  }

  isUncovered(id: string): boolean {
    return this.coverages.get(id)?.status === 'uncovered';
  }

  getByStatus(status: CoverageStatus): Coverage[] {
    return Array.from(this.coverages.values()).filter(c => c.status === status);
  }

  getActiveCoverages(): Coverage[] {
    return Array.from(this.coverages.values()).filter(c => c.active);
  }

  getInactiveCoverages(): Coverage[] {
    return Array.from(this.coverages.values()).filter(c => !c.active);
  }

  getAllFiles(): string[] {
    return [...new Set(Array.from(this.coverages.values()).map(c => c.file))];
  }

  getNewest(): Coverage | null {
    const all = Array.from(this.coverages.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Coverage | null {
    const all = Array.from(this.coverages.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.coverages.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.coverages.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalReported(): number {
    return this.totalReported;
  }

  clearAll(): void {
    this.coverages.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalReported = 0;
  }
}

export default CoverageEngine;