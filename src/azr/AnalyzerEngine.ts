/**
 * Analyzer Engine
 * claude-code-design Analyzer Engine - Analyze + GetReport + Stats
 */

export interface Analysis {
  id: string;
  input: string;
  type: string;
  result: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface AzrStats {
  analyses: number;
  totalRuns: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTypes: number;
  uniqueInputs: number;
  avgInputLength: number;
  maxInputLength: number;
  minInputLength: number;
  avgResultLength: number;
  maxResultLength: number;
  minResultLength: number;
}

export class AnalyzerEngine {
  private analyses: Map<string, Analysis> = new Map();
  private counter = 0;
  private totalRuns = 0;

  analyze(input: string, type: string = 'text'): string {
    const id = `azr-${++this.counter}`;
    this.analyses.set(id, {
      id,
      input,
      type,
      result: this.computeResult(input, type),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    this.totalRuns++;
    return id;
  }

  private computeResult(input: string, type: string): string {
    switch (type) {
      case 'length':
        return String(input.length);
      case 'word-count':
        return String(input.split(/\s+/).filter(Boolean).length);
      case 'uppercase':
        return input.toUpperCase();
      case 'lowercase':
        return input.toLowerCase();
      case 'reverse':
        return input.split('').reverse().join('');
      case 'hash':
        let h = 0;
        for (let i = 0; i < input.length; i++) {
          h = ((h << 5) - h + input.charCodeAt(i)) | 0;
        }
        return String(h);
      default:
        return input;
    }
  }

  getReport(id: string): Analysis | undefined {
    const a = this.analyses.get(id);
    if (!a) return undefined;
    if (!a.active) return undefined;
    a.hits++;
    a.updated = Date.now();
    return a;
  }

  remove(id: string): boolean {
    return this.analyses.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const a = this.analyses.get(id);
    if (!a) return false;
    a.active = active;
    a.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const a of this.analyses.values()) {
      a.hits = 0;
      a.history = [];
      a.active = true;
    }
    this.totalRuns = 0;
  }

  getStats(): AzrStats {
    const all = Array.from(this.analyses.values());
    const inputLengths = all.map(a => a.input.length);
    const resultLengths = all.map(a => a.result.length);
    return {
      analyses: all.length,
      totalRuns: this.totalRuns,
      active: all.filter(a => a.active).length,
      inactive: all.filter(a => !a.active).length,
      totalHits: all.reduce((s, a) => s + a.hits, 0),
      uniqueTypes: new Set(all.map(a => a.type)).size,
      uniqueInputs: new Set(all.map(a => a.input)).size,
      avgInputLength: all.length > 0 ? Math.round((inputLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxInputLength: inputLengths.length > 0 ? Math.max(...inputLengths) : 0,
      minInputLength: inputLengths.length > 0 ? Math.min(...inputLengths) : 0,
      avgResultLength: all.length > 0 ? Math.round((resultLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxResultLength: resultLengths.length > 0 ? Math.max(...resultLengths) : 0,
      minResultLength: resultLengths.length > 0 ? Math.min(...resultLengths) : 0,
    };
  }

  getAnalysis(id: string): Analysis | undefined {
    return this.analyses.get(id);
  }

  getAllAnalyses(): Analysis[] {
    return Array.from(this.analyses.values());
  }

  hasAnalysis(id: string): boolean {
    return this.analyses.has(id);
  }

  getCount(): number {
    return this.analyses.size;
  }

  getInput(id: string): string | undefined {
    return this.analyses.get(id)?.input;
  }

  getType(id: string): string | undefined {
    return this.analyses.get(id)?.type;
  }

  getResult(id: string): string | undefined {
    return this.analyses.get(id)?.result;
  }

  getInputLength(id: string): number {
    return this.analyses.get(id)?.input.length ?? 0;
  }

  getResultLength(id: string): number {
    return this.analyses.get(id)?.result.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.analyses.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.analyses.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.analyses.get(id)?.active ?? false;
  }

  getByType(type: string): Analysis[] {
    return Array.from(this.analyses.values()).filter(a => a.type === type);
  }

  getActiveAnalyses(): Analysis[] {
    return Array.from(this.analyses.values()).filter(a => a.active);
  }

  getInactiveAnalyses(): Analysis[] {
    return Array.from(this.analyses.values()).filter(a => !a.active);
  }

  getAllTypes(): string[] {
    return [...new Set(Array.from(this.analyses.values()).map(a => a.type))];
  }

  getTypeCount(): number {
    return this.getAllTypes().length;
  }

  getNewest(): Analysis | null {
    const all = Array.from(this.analyses.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  getOldest(): Analysis | null {
    const all = Array.from(this.analyses.values());
    if (all.length === 0) return null;
    return all.reduce((min, a) => a.created < min.created ? a : min);
  }

  getCreatedAt(id: string): number {
    return this.analyses.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.analyses.get(id)?.updated ?? 0;
  }

  getTotalRuns(): number {
    return this.totalRuns;
  }

  clearAll(): void {
    this.analyses.clear();
    this.counter = 0;
    this.totalRuns = 0;
  }
}

export default AnalyzerEngine;