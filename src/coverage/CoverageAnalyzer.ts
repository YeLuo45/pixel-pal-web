/**
 * Coverage Analyzer
 * claude-code-design Coverage Analyzer - Line + Branch + Function + Report
 */

export interface CoverageData {
  file: string;
  totalLines: number;
  coveredLines: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
}

export interface CoverageReport {
  overall: number;
  files: CoverageData[];
  gaps: string[];
}

export class CoverageAnalyzer {
  private data: Map<string, CoverageData> = new Map();
  private threshold = 80;

  addCoverage(data: CoverageData): void {
    this.data.set(data.file, { ...data });
  }

  calculateOverall(): number {
    const all = Array.from(this.data.values());
    if (all.length === 0) return 0;
    const totalLines = all.reduce((sum, d) => sum + d.totalLines, 0);
    const coveredLines = all.reduce((sum, d) => sum + d.coveredLines, 0);
    if (totalLines === 0) return 0;
    return Math.round((coveredLines / totalLines) * 100);
  }

  generateReport(): CoverageReport {
    const all = Array.from(this.data.values());
    return {
      overall: this.calculateOverall(),
      files: [...all],
      gaps: this.findGaps(),
    };
  }

  findGaps(): string[] {
    const gaps: string[] = [];
    for (const data of this.data.values()) {
      if (data.totalLines > 0) {
        const lineRatio = data.coveredLines / data.totalLines;
        if (lineRatio * 100 < this.threshold) {
          gaps.push(data.file);
        }
      }
    }
    return gaps;
  }

  getFileCoverage(file: string): CoverageData | undefined {
    return this.data.get(file);
  }

  getAllCoverage(): CoverageData[] {
    return Array.from(this.data.values());
  }

  getFileCount(): number {
    return this.data.size;
  }

  hasFile(file: string): boolean {
    return this.data.has(file);
  }

  removeFile(file: string): boolean {
    return this.data.delete(file);
  }

  setThreshold(threshold: number): void {
    this.threshold = Math.max(0, Math.min(100, threshold));
  }

  getThreshold(): number {
    return this.threshold;
  }

  meetsThreshold(): boolean {
    return this.calculateOverall() >= this.threshold;
  }

  getLineCoverage(file: string): number {
    const data = this.data.get(file);
    if (!data || data.totalLines === 0) return 0;
    return Math.round((data.coveredLines / data.totalLines) * 100) / 100;
  }

  getBranchCoverage(file: string): number {
    const data = this.data.get(file);
    if (!data || data.totalBranches === 0) return 0;
    return Math.round((data.coveredBranches / data.totalBranches) * 100) / 100;
  }

  getFunctionCoverage(file: string): number {
    const data = this.data.get(file);
    if (!data || data.totalFunctions === 0) return 0;
    return Math.round((data.coveredFunctions / data.totalFunctions) * 100) / 100;
  }

  getAverageLineCoverage(): number {
    const all = Array.from(this.data.values());
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, d) => acc + this.getLineCoverage(d.file), 0);
    return Math.round((sum / all.length) * 100) / 100;
  }

  getAverageBranchCoverage(): number {
    const all = Array.from(this.data.values());
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, d) => acc + this.getBranchCoverage(d.file), 0);
    return Math.round((sum / all.length) * 100) / 100;
  }

  getAverageFunctionCoverage(): number {
    const all = Array.from(this.data.values());
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, d) => acc + this.getFunctionCoverage(d.file), 0);
    return Math.round((sum / all.length) * 100) / 100;
  }

  getFullyCoveredFiles(): string[] {
    return Array.from(this.data.values())
      .filter(d => d.totalLines > 0 && d.coveredLines === d.totalLines)
      .map(d => d.file);
  }

  getPartiallyCoveredFiles(): string[] {
    return Array.from(this.data.values())
      .filter(d => d.totalLines > 0 && d.coveredLines > 0 && d.coveredLines < d.totalLines)
      .map(d => d.file);
  }

  getUncoveredFiles(): string[] {
    return Array.from(this.data.values())
      .filter(d => d.totalLines > 0 && d.coveredLines === 0)
      .map(d => d.file);
  }

  getTotalLines(): number {
    return Array.from(this.data.values()).reduce((sum, d) => sum + d.totalLines, 0);
  }

  getTotalCoveredLines(): number {
    return Array.from(this.data.values()).reduce((sum, d) => sum + d.coveredLines, 0);
  }

  clearAll(): void {
    this.data.clear();
  }
}

export default CoverageAnalyzer;