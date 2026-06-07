/**
 * Naming Engine
 * chatdev-design Naming Engine - Generate + Allocate + Stats
 */

export type NamingStyle = 'camel' | 'snake' | 'kebab' | 'pascal';

export interface Name {
  id: string;
  word: string;
  style: NamingStyle;
  allocated: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface NaeStats {
  names: number;
  totalGenerated: number;
  totalAllocated: number;
  totalFreed: number;
  camel: number;
  snake: number;
  kebab: number;
  pascal: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueWords: number;
  totalWordLen: number;
  avgWordLen: number;
  maxWordLen: number;
  minWordLen: number;
}

function applyStyle(word: string, style: NamingStyle): string {
  if (style === 'snake') return word.toLowerCase();
  if (style === 'kebab') return word.toLowerCase();
  if (style === 'camel') return word.charAt(0).toLowerCase() + word.slice(1);
  if (style === 'pascal') return word.charAt(0).toUpperCase() + word.slice(1);
  return word;
}

export class NamingEngine {
  private names: Map<string, Name> = new Map();
  private counter = 0;
  private totalGenerated = 0;
  private totalAllocated = 0;
  private totalFreed = 0;
  private totalWordLen = 0;

  generate(word: string, style: NamingStyle = 'camel'): string {
    const id = `nae-${++this.counter}`;
    const formatted = applyStyle(word, style);
    this.names.set(id, {
      id,
      word: formatted,
      style,
      allocated: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalGenerated++;
    this.totalWordLen += formatted.length;
    return id;
  }

  allocate(id: string): boolean {
    const n = this.names.get(id);
    if (!n) return false;
    if (n.allocated) return false;
    if (!n.active) return false;
    n.allocated = true;
    n.updated = Date.now();
    n.hits++;
    this.totalAllocated++;
    return true;
  }

  free(id: string): boolean {
    const n = this.names.get(id);
    if (!n) return false;
    if (!n.allocated) return false;
    n.allocated = false;
    n.updated = Date.now();
    this.totalFreed++;
    return true;
  }

  remove(id: string): boolean {
    return this.names.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.names.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setWord(id: string, word: string): boolean {
    const n = this.names.get(id);
    if (!n) return false;
    n.word = word;
    n.updated = Date.now();
    return true;
  }

  setStyle(id: string, style: NamingStyle): boolean {
    const n = this.names.get(id);
    if (!n) return false;
    n.style = style;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.names.values()) {
      n.allocated = false;
      n.active = true;
      n.hits = 0;
    }
    this.totalGenerated = 0;
    this.totalAllocated = 0;
    this.totalFreed = 0;
    this.totalWordLen = 0;
  }

  getStats(): NaeStats {
    const all = Array.from(this.names.values());
    const lenArr = all.map(n => n.word.length);
    return {
      names: all.length,
      totalGenerated: this.totalGenerated,
      totalAllocated: this.totalAllocated,
      totalFreed: this.totalFreed,
      camel: all.filter(n => n.style === 'camel').length,
      snake: all.filter(n => n.style === 'snake').length,
      kebab: all.filter(n => n.style === 'kebab').length,
      pascal: all.filter(n => n.style === 'pascal').length,
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      uniqueWords: new Set(all.map(n => n.word)).size,
      totalWordLen: this.totalWordLen,
      avgWordLen: all.length > 0 ? Math.round((lenArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxWordLen: lenArr.length > 0 ? Math.max(...lenArr) : 0,
      minWordLen: lenArr.length > 0 ? Math.min(...lenArr) : 0,
    };
  }

  getName2(id: string): Name | undefined {
    return this.names.get(id);
  }

  getAllNames(): Name[] {
    return Array.from(this.names.values());
  }

  hasName(id: string): boolean {
    return this.names.has(id);
  }

  getCount(): number {
    return this.names.size;
  }

  getWord(id: string): string | undefined {
    return this.names.get(id)?.word;
  }

  getStyle(id: string): NamingStyle | undefined {
    return this.names.get(id)?.style;
  }

  getHits(id: string): number {
    return this.names.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.names.get(id)?.active ?? false;
  }

  isAllocated(id: string): boolean {
    return this.names.get(id)?.allocated ?? false;
  }

  isCamel(id: string): boolean {
    return this.names.get(id)?.style === 'camel';
  }

  isSnake(id: string): boolean {
    return this.names.get(id)?.style === 'snake';
  }

  isKebab(id: string): boolean {
    return this.names.get(id)?.style === 'kebab';
  }

  isPascal(id: string): boolean {
    return this.names.get(id)?.style === 'pascal';
  }

  getByStyle(style: NamingStyle): Name[] {
    return Array.from(this.names.values()).filter(n => n.style === style);
  }

  getAllocatedNames(): Name[] {
    return Array.from(this.names.values()).filter(n => n.allocated);
  }

  getFreeNames(): Name[] {
    return Array.from(this.names.values()).filter(n => !n.allocated);
  }

  getActiveNames(): Name[] {
    return Array.from(this.names.values()).filter(n => n.active);
  }

  getInactiveNames(): Name[] {
    return Array.from(this.names.values()).filter(n => !n.active);
  }

  getAllWords(): string[] {
    return [...new Set(Array.from(this.names.values()).map(n => n.word))];
  }

  getNewest(): Name | null {
    const all = Array.from(this.names.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): Name | null {
    const all = Array.from(this.names.values());
    if (all.length === 0) return null;
    return all.reduce((min, n) => n.created < min.created ? n : min);
  }

  getCreatedAt(id: string): number {
    return this.names.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.names.get(id)?.updated ?? 0;
  }

  getTotalGenerated(): number {
    return this.totalGenerated;
  }

  getTotalAllocated(): number {
    return this.totalAllocated;
  }

  getTotalFreed(): number {
    return this.totalFreed;
  }

  clearAll(): void {
    this.names.clear();
    this.counter = 0;
    this.totalGenerated = 0;
    this.totalAllocated = 0;
    this.totalFreed = 0;
    this.totalWordLen = 0;
  }
}

export default NamingEngine;