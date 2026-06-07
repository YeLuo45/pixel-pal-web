/**
 * Hash Engine
 * claude-code-design Hash Engine - Hash + Verify + Stats
 */

export type HashAlgo = 'md5' | 'sha1' | 'sha256' | 'sha512';

export interface HashResult {
  id: string;
  input: string;
  algo: HashAlgo;
  hash: string;
  length: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface HseStats {
  hashes: number;
  totalHashed: number;
  totalVerified: number;
  md5: number;
  sha1: number;
  sha256: number;
  sha512: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueInputs: number;
  uniqueHashes: number;
  totalLength: number;
  avgLength: number;
  maxLength: number;
  minLength: number;
}

function simpleHash(s: string, length: number): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(length, '0').slice(0, length);
}

function md5(s: string): string {
  return simpleHash(s, 32);
}

function sha1(s: string): string {
  return simpleHash(s, 40);
}

function sha256(s: string): string {
  return simpleHash(s, 64);
}

function sha512(s: string): string {
  return simpleHash(s, 128);
}

function hashFn(s: string, algo: HashAlgo): string {
  if (algo === 'md5') return md5(s);
  if (algo === 'sha1') return sha1(s);
  if (algo === 'sha256') return sha256(s);
  return sha512(s);
}

export class HashEngine {
  private hashes: Map<string, HashResult> = new Map();
  private counter = 0;
  private totalHashed = 0;
  private totalVerified = 0;

  hash(input: string, algo: HashAlgo = 'sha256'): string {
    const id = `hse-${++this.counter}`;
    this.hashes.set(id, {
      id,
      input,
      algo,
      hash: hashFn(input, algo),
      length: input.length,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalHashed++;
    return id;
  }

  verify(id: string, input: string): boolean {
    const h = this.hashes.get(id);
    if (!h) return false;
    if (!h.active) return false;
    h.updated = Date.now();
    h.hits++;
    this.totalVerified++;
    return h.hash === hashFn(input, h.algo);
  }

  recompute(id: string, input: string): boolean {
    const h = this.hashes.get(id);
    if (!h) return false;
    h.input = input;
    h.hash = hashFn(input, h.algo);
    h.length = input.length;
    h.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.hashes.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const h = this.hashes.get(id);
    if (!h) return false;
    h.active = active;
    h.updated = Date.now();
    return true;
  }

  setAlgo(id: string, algo: HashAlgo): boolean {
    const h = this.hashes.get(id);
    if (!h) return false;
    h.algo = algo;
    h.hash = hashFn(h.input, algo);
    h.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const h of this.hashes.values()) {
      h.active = true;
      h.hits = 0;
    }
    this.totalHashed = 0;
    this.totalVerified = 0;
  }

  getStats(): HseStats {
    const all = Array.from(this.hashes.values());
    const lenArr = all.map(h => h.length);
    return {
      hashes: all.length,
      totalHashed: this.totalHashed,
      totalVerified: this.totalVerified,
      md5: all.filter(h => h.algo === 'md5').length,
      sha1: all.filter(h => h.algo === 'sha1').length,
      sha256: all.filter(h => h.algo === 'sha256').length,
      sha512: all.filter(h => h.algo === 'sha512').length,
      active: all.filter(h => h.active).length,
      inactive: all.filter(h => !h.active).length,
      totalHits: all.reduce((s, h) => s + h.hits, 0),
      uniqueInputs: new Set(all.map(h => h.input)).size,
      uniqueHashes: new Set(all.map(h => h.hash)).size,
      totalLength: all.reduce((s, h) => s + h.length, 0),
      avgLength: all.length > 0 ? Math.round((lenArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLength: lenArr.length > 0 ? Math.max(...lenArr) : 0,
      minLength: lenArr.length > 0 ? Math.min(...lenArr) : 0,
    };
  }

  getHash(id: string): HashResult | undefined {
    return this.hashes.get(id);
  }

  getAllHashes(): HashResult[] {
    return Array.from(this.hashes.values());
  }

  hasHash(id: string): boolean {
    return this.hashes.has(id);
  }

  getCount(): number {
    return this.hashes.size;
  }

  getInput(id: string): string | undefined {
    return this.hashes.get(id)?.input;
  }

  getHash2(id: string): string | undefined {
    return this.hashes.get(id)?.hash;
  }

  getAlgo(id: string): HashAlgo | undefined {
    return this.hashes.get(id)?.algo;
  }

  getLength(id: string): number {
    return this.hashes.get(id)?.length ?? 0;
  }

  getHits(id: string): number {
    return this.hashes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.hashes.get(id)?.active ?? false;
  }

  isMd5(id: string): boolean {
    return this.hashes.get(id)?.algo === 'md5';
  }

  isSha1(id: string): boolean {
    return this.hashes.get(id)?.algo === 'sha1';
  }

  isSha256(id: string): boolean {
    return this.hashes.get(id)?.algo === 'sha256';
  }

  isSha512(id: string): boolean {
    return this.hashes.get(id)?.algo === 'sha512';
  }

  getByAlgo(algo: HashAlgo): HashResult[] {
    return Array.from(this.hashes.values()).filter(h => h.algo === algo);
  }

  getActiveHashes(): HashResult[] {
    return Array.from(this.hashes.values()).filter(h => h.active);
  }

  getInactiveHashes(): HashResult[] {
    return Array.from(this.hashes.values()).filter(h => !h.active);
  }

  getAllInputs(): string[] {
    return [...new Set(Array.from(this.hashes.values()).map(h => h.input))];
  }

  getAllHashStrings(): string[] {
    return [...new Set(Array.from(this.hashes.values()).map(h => h.hash))];
  }

  getNewest(): HashResult | null {
    const all = Array.from(this.hashes.values());
    if (all.length === 0) return null;
    return all.reduce((max, h) => h.created > max.created ? h : max);
  }

  getOldest(): HashResult | null {
    const all = Array.from(this.hashes.values());
    if (all.length === 0) return null;
    return all.reduce((min, h) => h.created < min.created ? h : min);
  }

  getCreatedAt(id: string): number {
    return this.hashes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.hashes.get(id)?.updated ?? 0;
  }

  getTotalHashed(): number {
    return this.totalHashed;
  }

  getTotalVerified(): number {
    return this.totalVerified;
  }

  clearAll(): void {
    this.hashes.clear();
    this.counter = 0;
    this.totalHashed = 0;
    this.totalVerified = 0;
  }
}

export default HashEngine;