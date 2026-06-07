/**
 * Splitter Engine
 * claude-code-design Splitter Engine - Split + Merge + Stats
 */

export type SplitMode = 'char' | 'word' | 'line' | 'sentence';

export interface Split {
  id: string;
  text: string;
  mode: SplitMode;
  chunks: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface SleStats {
  splits: number;
  totalSplit: number;
  totalMerged: number;
  char: number;
  word: number;
  line: number;
  sentence: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTexts: number;
  totalChunks: number;
  avgChunks: number;
  maxChunks: number;
  minChunks: number;
  totalTextLen: number;
  avgTextLen: number;
}

function splitText(text: string, mode: SplitMode): string[] {
  if (mode === 'char') return text.split('');
  if (mode === 'word') return text.split(/\s+/);
  if (mode === 'line') return text.split('\n');
  if (mode === 'sentence') return text.split(/[.!?]+\s*/);
  return [text];
}

export class SplitterEngine {
  private splits: Map<string, Split> = new Map();
  private counter = 0;
  private totalSplit = 0;
  private totalMerged = 0;
  private totalChunks = 0;
  private totalTextLen = 0;

  split(text: string, mode: SplitMode = 'word'): string {
    const id = `sle-${++this.counter}`;
    const chunks = splitText(text, mode).filter(c => c.length > 0);
    this.splits.set(id, {
      id,
      text,
      mode,
      chunks: chunks.length,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalSplit++;
    this.totalChunks += chunks.length;
    this.totalTextLen += text.length;
    return id;
  }

  merge(id: string): boolean {
    const s = this.splits.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.updated = Date.now();
    s.hits++;
    this.totalMerged++;
    return true;
  }

  remove(id: string): boolean {
    return this.splits.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.splits.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setText(id: string, text: string): boolean {
    const s = this.splits.get(id);
    if (!s) return false;
    const newChunks = splitText(text, s.mode).filter(c => c.length > 0);
    s.text = text;
    s.chunks = newChunks.length;
    this.totalChunks += newChunks.length;
    s.updated = Date.now();
    return true;
  }

  setMode(id: string, mode: SplitMode): boolean {
    const s = this.splits.get(id);
    if (!s) return false;
    s.mode = mode;
    s.chunks = splitText(s.text, mode).filter(c => c.length > 0).length;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.splits.values()) {
      s.chunks = splitText(s.text, s.mode).filter(c => c.length > 0).length;
      s.active = true;
      s.hits = 0;
    }
    this.totalSplit = 0;
    this.totalMerged = 0;
    this.totalChunks = 0;
    this.totalTextLen = 0;
  }

  getStats(): SleStats {
    const all = Array.from(this.splits.values());
    const chArr = all.map(s => s.chunks);
    const lenArr = all.map(s => s.text.length);
    return {
      splits: all.length,
      totalSplit: this.totalSplit,
      totalMerged: this.totalMerged,
      char: all.filter(s => s.mode === 'char').length,
      word: all.filter(s => s.mode === 'word').length,
      line: all.filter(s => s.mode === 'line').length,
      sentence: all.filter(s => s.mode === 'sentence').length,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueTexts: new Set(all.map(s => s.text)).size,
      totalChunks: this.totalChunks,
      avgChunks: all.length > 0 ? Math.round((chArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxChunks: chArr.length > 0 ? Math.max(...chArr) : 0,
      minChunks: chArr.length > 0 ? Math.min(...chArr) : 0,
      totalTextLen: this.totalTextLen,
      avgTextLen: all.length > 0 ? Math.round((lenArr.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getSplit(id: string): Split | undefined {
    return this.splits.get(id);
  }

  getAllSplits(): Split[] {
    return Array.from(this.splits.values());
  }

  hasSplit(id: string): boolean {
    return this.splits.has(id);
  }

  getCount(): number {
    return this.splits.size;
  }

  getText(id: string): string | undefined {
    return this.splits.get(id)?.text;
  }

  getMode(id: string): SplitMode | undefined {
    return this.splits.get(id)?.mode;
  }

  getChunks(id: string): number {
    return this.splits.get(id)?.chunks ?? 0;
  }

  getHits(id: string): number {
    return this.splits.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.splits.get(id)?.active ?? false;
  }

  isChar(id: string): boolean {
    return this.splits.get(id)?.mode === 'char';
  }

  isWord(id: string): boolean {
    return this.splits.get(id)?.mode === 'word';
  }

  isLine(id: string): boolean {
    return this.splits.get(id)?.mode === 'line';
  }

  isSentence(id: string): boolean {
    return this.splits.get(id)?.mode === 'sentence';
  }

  getByMode(mode: SplitMode): Split[] {
    return Array.from(this.splits.values()).filter(s => s.mode === mode);
  }

  getActiveSplits(): Split[] {
    return Array.from(this.splits.values()).filter(s => s.active);
  }

  getInactiveSplits(): Split[] {
    return Array.from(this.splits.values()).filter(s => !s.active);
  }

  getAllTexts(): string[] {
    return [...new Set(Array.from(this.splits.values()).map(s => s.text))];
  }

  getNewest(): Split | null {
    const all = Array.from(this.splits.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Split | null {
    const all = Array.from(this.splits.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.splits.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.splits.get(id)?.updated ?? 0;
  }

  getTotalSplit(): number {
    return this.totalSplit;
  }

  getTotalMerged(): number {
    return this.totalMerged;
  }

  clearAll(): void {
    this.splits.clear();
    this.counter = 0;
    this.totalSplit = 0;
    this.totalMerged = 0;
    this.totalChunks = 0;
    this.totalTextLen = 0;
  }
}

export default SplitterEngine;