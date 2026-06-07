/**
 * Generator Engine
 * claude-code-design Generator Engine - Generate + Validate + Stats
 */

export type GenType = 'uuid' | 'token' | 'password' | 'code' | 'slug';

export interface GenResult {
  id: string;
  type: GenType;
  value: string;
  length: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface GreStats {
  results: number;
  totalGenerated: number;
  totalValidated: number;
  uuid: number;
  token: number;
  password: number;
  code: number;
  slug: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalLength: number;
  avgLength: number;
  maxLength: number;
  minLength: number;
}

function generateValue(type: GenType, length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (type === 'uuid') {
    return `${result.substring(0, 8)}-${result.substring(8, 12)}-4${result.substring(13, 16)}-${result.substring(16, 20)}-${result.substring(20, 32)}`;
  }
  return result;
}

export class GeneratorEngine {
  private results: Map<string, GenResult> = new Map();
  private counter = 0;
  private totalGenerated = 0;
  private totalValidated = 0;
  private totalLength = 0;

  generate(type: GenType, length: number = 16): string {
    const id = `gre-${++this.counter}`;
    const value = generateValue(type, length);
    this.results.set(id, {
      id,
      type,
      value,
      length: value.length,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalGenerated++;
    this.totalLength += value.length;
    return id;
  }

  validate(id: string): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    if (!r.active) return false;
    r.updated = Date.now();
    r.hits++;
    this.totalValidated++;
    return true;
  }

  remove(id: string): boolean {
    return this.results.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setType(id: string, type: GenType): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.type = type;
    r.updated = Date.now();
    return true;
  }

  setValue(id: string, value: string): boolean {
    const r = this.results.get(id);
    if (!r) return false;
    r.value = value;
    r.length = value.length;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.results.values()) {
      r.active = true;
      r.hits = 0;
    }
    this.totalGenerated = 0;
    this.totalValidated = 0;
    this.totalLength = 0;
  }

  getStats(): GreStats {
    const all = Array.from(this.results.values());
    const lArr = all.map(r => r.length);
    return {
      results: all.length,
      totalGenerated: this.totalGenerated,
      totalValidated: this.totalValidated,
      uuid: all.filter(r => r.type === 'uuid').length,
      token: all.filter(r => r.type === 'token').length,
      password: all.filter(r => r.type === 'password').length,
      code: all.filter(r => r.type === 'code').length,
      slug: all.filter(r => r.type === 'slug').length,
      active: all.filter(r => r.active).length,
      inactive: all.filter(r => !r.active).length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      totalLength: this.totalLength,
      avgLength: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxLength: lArr.length > 0 ? Math.max(...lArr) : 0,
      minLength: lArr.length > 0 ? Math.min(...lArr) : 0,
    };
  }

  getResult(id: string): GenResult | undefined {
    return this.results.get(id);
  }

  getAllResults(): GenResult[] {
    return Array.from(this.results.values());
  }

  hasResult(id: string): boolean {
    return this.results.has(id);
  }

  getCount(): number {
    return this.results.size;
  }

  getValue(id: string): string | undefined {
    return this.results.get(id)?.value;
  }

  getType(id: string): GenType | undefined {
    return this.results.get(id)?.type;
  }

  getLength(id: string): number {
    return this.results.get(id)?.length ?? 0;
  }

  getHits(id: string): number {
    return this.results.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.results.get(id)?.active ?? false;
  }

  isUUID(id: string): boolean {
    return this.results.get(id)?.type === 'uuid';
  }

  isToken(id: string): boolean {
    return this.results.get(id)?.type === 'token';
  }

  isPassword(id: string): boolean {
    return this.results.get(id)?.type === 'password';
  }

  isCode(id: string): boolean {
    return this.results.get(id)?.type === 'code';
  }

  isSlug(id: string): boolean {
    return this.results.get(id)?.type === 'slug';
  }

  getByType(type: GenType): GenResult[] {
    return Array.from(this.results.values()).filter(r => r.type === type);
  }

  getActiveResults(): GenResult[] {
    return Array.from(this.results.values()).filter(r => r.active);
  }

  getInactiveResults(): GenResult[] {
    return Array.from(this.results.values()).filter(r => !r.active);
  }

  getNewest(): GenResult | null {
    const all = Array.from(this.results.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): GenResult | null {
    const all = Array.from(this.results.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getCreatedAt(id: string): number {
    return this.results.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.results.get(id)?.updated ?? 0;
  }

  getTotalGenerated(): number {
    return this.totalGenerated;
  }

  getTotalValidated(): number {
    return this.totalValidated;
  }

  clearAll(): void {
    this.results.clear();
    this.counter = 0;
    this.totalGenerated = 0;
    this.totalValidated = 0;
    this.totalLength = 0;
  }
}

export default GeneratorEngine;