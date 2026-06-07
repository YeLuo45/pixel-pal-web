/**
 * Normalizer Engine
 * claude-code-design Normalizer Engine - Add + Normalize + Stats
 */

export type NormalizeOp = 'lowercase' | 'uppercase' | 'trim' | 'collapse' | 'strip' | 'reverse';

export interface Normalize {
  id: string;
  input: string;
  output: string;
  op: NormalizeOp;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface NreStats {
  normalizes: number;
  totalAdded: number;
  totalNormalized: number;
  lowercase: number;
  uppercase: number;
  trim: number;
  collapse: number;
  strip: number;
  reverse: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalInputLen: number;
  totalOutputLen: number;
  avgInputLen: number;
  avgOutputLen: number;
}

function normalize(input: string, op: NormalizeOp): string {
  switch (op) {
    case 'lowercase': return input.toLowerCase();
    case 'uppercase': return input.toUpperCase();
    case 'trim': return input.trim();
    case 'collapse': return input.replace(/\s+/g, ' ').trim();
    case 'strip': return input.replace(/[^\w\s]/g, '');
    case 'reverse': return input.split('').reverse().join('');
  }
}

export class NormalizerEngine {
  private normalizes: Map<string, Normalize> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalNormalized = 0;
  private totalInputLen = 0;
  private totalOutputLen = 0;

  add(input: string, op: NormalizeOp): string {
    const id = `nre-${++this.counter}`;
    const output = normalize(input, op);
    this.normalizes.set(id, {
      id,
      input,
      output,
      op,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    this.totalInputLen += input.length;
    this.totalOutputLen += output.length;
    return id;
  }

  normalize(id: string, input: string): boolean {
    const n = this.normalizes.get(id);
    if (!n) return false;
    if (!n.active) return false;
    n.input = input;
    n.output = normalize(input, n.op);
    n.updated = Date.now();
    n.hits++;
    this.totalNormalized++;
    this.totalInputLen += input.length;
    this.totalOutputLen += n.output.length;
    return true;
  }

  remove(id: string): boolean {
    return this.normalizes.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.normalizes.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setInput(id: string, input: string): boolean {
    const n = this.normalizes.get(id);
    if (!n) return false;
    n.input = input;
    n.output = normalize(input, n.op);
    n.updated = Date.now();
    return true;
  }

  setOp(id: string, op: NormalizeOp): boolean {
    const n = this.normalizes.get(id);
    if (!n) return false;
    n.op = op;
    n.output = normalize(n.input, op);
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.normalizes.values()) {
      n.active = true;
      n.hits = 0;
    }
    this.totalAdded = 0;
    this.totalNormalized = 0;
    this.totalInputLen = 0;
    this.totalOutputLen = 0;
  }

  getStats(): NreStats {
    const all = Array.from(this.normalizes.values());
    const iArr = all.map(n => n.input.length);
    const oArr = all.map(n => n.output.length);
    return {
      normalizes: all.length,
      totalAdded: this.totalAdded,
      totalNormalized: this.totalNormalized,
      lowercase: all.filter(n => n.op === 'lowercase').length,
      uppercase: all.filter(n => n.op === 'uppercase').length,
      trim: all.filter(n => n.op === 'trim').length,
      collapse: all.filter(n => n.op === 'collapse').length,
      strip: all.filter(n => n.op === 'strip').length,
      reverse: all.filter(n => n.op === 'reverse').length,
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      totalInputLen: this.totalInputLen,
      totalOutputLen: this.totalOutputLen,
      avgInputLen: all.length > 0 ? Math.round((iArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgOutputLen: all.length > 0 ? Math.round((oArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getNormalize(id: string): Normalize | undefined {
    return this.normalizes.get(id);
  }

  getAllNormalizes(): Normalize[] {
    return Array.from(this.normalizes.values());
  }

  hasNormalize(id: string): boolean {
    return this.normalizes.has(id);
  }

  getCount(): number {
    return this.normalizes.size;
  }

  getInput(id: string): string | undefined {
    return this.normalizes.get(id)?.input;
  }

  getOutput(id: string): string | undefined {
    return this.normalizes.get(id)?.output;
  }

  getOp(id: string): NormalizeOp | undefined {
    return this.normalizes.get(id)?.op;
  }

  getHits(id: string): number {
    return this.normalizes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.normalizes.get(id)?.active ?? false;
  }

  isLowercase(id: string): boolean {
    return this.normalizes.get(id)?.op === 'lowercase';
  }

  isUppercase(id: string): boolean {
    return this.normalizes.get(id)?.op === 'uppercase';
  }

  isTrim(id: string): boolean {
    return this.normalizes.get(id)?.op === 'trim';
  }

  isCollapse(id: string): boolean {
    return this.normalizes.get(id)?.op === 'collapse';
  }

  isStrip(id: string): boolean {
    return this.normalizes.get(id)?.op === 'strip';
  }

  isReverse(id: string): boolean {
    return this.normalizes.get(id)?.op === 'reverse';
  }

  getByOp(op: NormalizeOp): Normalize[] {
    return Array.from(this.normalizes.values()).filter(n => n.op === op);
  }

  getActiveNormalizes(): Normalize[] {
    return Array.from(this.normalizes.values()).filter(n => n.active);
  }

  getInactiveNormalizes(): Normalize[] {
    return Array.from(this.normalizes.values()).filter(n => !n.active);
  }

  getNewest(): Normalize | null {
    const all = Array.from(this.normalizes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): Normalize | null {
    const all = Array.from(this.normalizes.values());
    if (all.length === 0) return null;
    return all.reduce((min, n) => n.created < min.created ? n : min);
  }

  getCreatedAt(id: string): number {
    return this.normalizes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.normalizes.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalNormalized(): number {
    return this.totalNormalized;
  }

  clearAll(): void {
    this.normalizes.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalNormalized = 0;
    this.totalInputLen = 0;
    this.totalOutputLen = 0;
  }
}

export default NormalizerEngine;