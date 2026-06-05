/**
 * Coverage Reporter
 * claude-code-design Coverage Reporter - Add + Get + Overall + Threshold
 */

export interface CoverageReport {
  id: string;
  file: string;
  linesCovered: number;
  linesTotal: number;
  branchesCovered: number;
  branchesTotal: number;
  functionsCovered: number;
  functionsTotal: number;
  percent: number;
  created: number;
}

export interface OverallCoverage {
  lines: number;
  branches: number;
  functions: number;
}

export class CoverageReporter {
  private reports: Map<string, CoverageReport> = new Map();
  private counter = 0;

  addReport(report: Omit<CoverageReport, 'id' | 'percent' | 'created'>): string {
    const id = `cov-${++this.counter}`;
    const percent = this.calcPercent(
      report.linesCovered,
      report.linesTotal,
      report.branchesCovered,
      report.branchesTotal,
      report.functionsCovered,
      report.functionsTotal
    );
    this.reports.set(id, { ...report, id, percent, created: Date.now() });
    return id;
  }

  getReport(id: string): CoverageReport | undefined {
    return this.reports.get(id);
  }

  getOverallCoverage(): OverallCoverage {
    const all = Array.from(this.reports.values());
    if (all.length === 0) return { lines: 0, branches: 0, functions: 0 };
    const totalLines = all.reduce((sum, r) => sum + r.linesTotal, 0);
    const coveredLines = all.reduce((sum, r) => sum + r.linesCovered, 0);
    const totalBranches = all.reduce((sum, r) => sum + r.branchesTotal, 0);
    const coveredBranches = all.reduce((sum, r) => sum + r.branchesCovered, 0);
    const totalFunctions = all.reduce((sum, r) => sum + r.functionsTotal, 0);
    const coveredFunctions = all.reduce((sum, r) => sum + r.functionsCovered, 0);
    return {
      lines: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) / 100 : 0,
      branches: totalBranches > 0 ? Math.round((coveredBranches / totalBranches) * 100) / 100 : 0,
      functions: totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) / 100 : 0,
    };
  }

  getThreshold(threshold: number): CoverageReport[] {
    return Array.from(this.reports.values()).filter(r => r.percent >= threshold);
  }

  getByFile(file: string): CoverageReport[] {
    return Array.from(this.reports.values()).filter(r => r.file === file);
  }

  getBelowThreshold(threshold: number): CoverageReport[] {
    return Array.from(this.reports.values()).filter(r => r.percent < threshold);
  }

  getAllReports(): CoverageReport[] {
    return Array.from(this.reports.values());
  }

  removeReport(id: string): boolean {
    return this.reports.delete(id);
  }

  hasReport(id: string): boolean {
    return this.reports.has(id);
  }

  getCount(): number {
    return this.reports.size;
  }

  getPercent(id: string): number {
    return this.reports.get(id)?.percent ?? 0;
  }

  getFile(id: string): string | undefined {
    return this.reports.get(id)?.file;
  }

  getLines(id: string): { covered: number; total: number; percent: number } | undefined {
    const r = this.reports.get(id);
    if (!r) return undefined;
    return { covered: r.linesCovered, total: r.linesTotal, percent: r.linesTotal > 0 ? Math.round((r.linesCovered / r.linesTotal) * 100) / 100 : 0 };
  }

  getBranches(id: string): { covered: number; total: number; percent: number } | undefined {
    const r = this.reports.get(id);
    if (!r) return undefined;
    return { covered: r.branchesCovered, total: r.branchesTotal, percent: r.branchesTotal > 0 ? Math.round((r.branchesCovered / r.branchesTotal) * 100) / 100 : 0 };
  }

  getFunctions(id: string): { covered: number; total: number; percent: number } | undefined {
    const r = this.reports.get(id);
    if (!r) return undefined;
    return { covered: r.functionsCovered, total: r.functionsTotal, percent: r.functionsTotal > 0 ? Math.round((r.functionsCovered / r.functionsTotal) * 100) / 100 : 0 };
  }

  getAvgPercent(): number {
    const all = Array.from(this.reports.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, r) => sum + r.percent, 0) / all.length) * 100) / 100;
  }

  getMaxPercent(): number {
    const all = Array.from(this.reports.values());
    if (all.length === 0) return 0;
    return Math.max(...all.map(r => r.percent));
  }

  getMinPercent(): number {
    const all = Array.from(this.reports.values());
    if (all.length === 0) return 0;
    return Math.min(...all.map(r => r.percent));
  }

  getPassing(threshold: number = 80): CoverageReport[] {
    return this.getThreshold(threshold);
  }

  getFailing(threshold: number = 80): CoverageReport[] {
    return this.getBelowThreshold(threshold);
  }

  getPassRate(threshold: number = 80): number {
    const all = Array.from(this.reports.values());
    if (all.length === 0) return 0;
    const passing = all.filter(r => r.percent >= threshold).length;
    return Math.round((passing / all.length) * 100) / 100;
  }

  getAllFiles(): string[] {
    return [...new Set(Array.from(this.reports.values()).map(r => r.file))];
  }

  getFileCount(): number {
    return this.getAllFiles().length;
  }

  getCreatedAt(id: string): number {
    return this.reports.get(id)?.created ?? 0;
  }

  private calcPercent(lc: number, lt: number, bc: number, bt: number, fc: number, ft: number): number {
    const total = lt + bt + ft;
    const covered = lc + bc + fc;
    return total > 0 ? Math.round((covered / total) * 100) / 100 : 0;
  }

  clearAll(): void {
    this.reports.clear();
    this.counter = 0;
  }
}

export default CoverageReporter;