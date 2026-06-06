/**
 * Schema Engine
 * claude-code-design Schema Engine - Define + Validate + Stats
 */

export interface Schema {
  id: string;
  name: string;
  fields: string[];
  valid: number;
  invalid: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface SE3Stats {
  schemas: number;
  totalValid: number;
  totalInvalid: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgValid: number;
  avgInvalid: number;
  uniqueNames: number;
  totalFields: number;
  validRate: number;
}

export class SchemaEngine {
  private schemas: Map<string, Schema> = new Map();
  private counter = 0;
  private totalValid = 0;
  private totalInvalid = 0;

  define(name: string, fields: string[]): string {
    const id = `se2-${++this.counter}`;
    this.schemas.set(id, {
      id,
      name,
      fields: [...fields],
      valid: 0,
      invalid: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  validate(id: string, valid: boolean): boolean {
    const s = this.schemas.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (valid) {
      s.valid++;
      this.totalValid++;
    } else {
      s.invalid++;
      this.totalInvalid++;
    }
    s.updated = Date.now();
    s.hits++;
    return true;
  }

  addField(id: string, field: string): boolean {
    const s = this.schemas.get(id);
    if (!s) return false;
    if (!s.active) return false;
    if (s.fields.includes(field)) return false;
    s.fields.push(field);
    s.updated = Date.now();
    return true;
  }

  removeField(id: string, field: string): boolean {
    const s = this.schemas.get(id);
    if (!s) return false;
    if (!s.fields.includes(field)) return false;
    s.fields = s.fields.filter(f => f !== field);
    s.updated = Date.now();
    return true;
  }

  getStats(): SE3Stats {
    const all = Array.from(this.schemas.values());
    const total = this.totalValid + this.totalInvalid;
    return {
      schemas: all.length,
      totalValid: this.totalValid,
      totalInvalid: this.totalInvalid,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      avgValid: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.valid, 0) / all.length) * 100) / 100 : 0,
      avgInvalid: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.invalid, 0) / all.length) * 100) / 100 : 0,
      uniqueNames: new Set(all.map(s => s.name)).size,
      totalFields: all.reduce((s, x) => s + x.fields.length, 0),
      validRate: total > 0 ? Math.round((this.totalValid / total) * 100) / 100 : 0,
    };
  }

  getSchema(id: string): Schema | undefined {
    return this.schemas.get(id);
  }

  getAllSchemas(): Schema[] {
    return Array.from(this.schemas.values());
  }

  removeSchema(id: string): boolean {
    return this.schemas.delete(id);
  }

  hasSchema(id: string): boolean {
    return this.schemas.has(id);
  }

  getCount(): number {
    return this.schemas.size;
  }

  getName(id: string): string | undefined {
    return this.schemas.get(id)?.name;
  }

  getFields(id: string): string[] {
    return [...(this.schemas.get(id)?.fields ?? [])];
  }

  getFieldCount(id: string): number {
    return this.schemas.get(id)?.fields.length ?? 0;
  }

  getValid(id: string): number {
    return this.schemas.get(id)?.valid ?? 0;
  }

  getInvalid(id: string): number {
    return this.schemas.get(id)?.invalid ?? 0;
  }

  getHits(id: string): number {
    return this.schemas.get(id)?.hits ?? 0;
  }

  hasField(id: string, field: string): boolean {
    return this.schemas.get(id)?.fields.includes(field) ?? false;
  }

  isActive(id: string): boolean {
    return this.schemas.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.schemas.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.schemas.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setFields(id: string, fields: string[]): boolean {
    const s = this.schemas.get(id);
    if (!s) return false;
    s.fields = [...fields];
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.schemas.values()) {
      s.valid = 0;
      s.invalid = 0;
      s.hits = 0;
      s.active = true;
    }
    this.totalValid = 0;
    this.totalInvalid = 0;
  }

  getByName(name: string): Schema[] {
    return Array.from(this.schemas.values()).filter(s => s.name === name);
  }

  getActiveSchemas(): Schema[] {
    return Array.from(this.schemas.values()).filter(s => s.active);
  }

  getInactiveSchemas(): Schema[] {
    return Array.from(this.schemas.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.schemas.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllFields(): string[] {
    return [...new Set(Array.from(this.schemas.values()).flatMap(s => s.fields))];
  }

  getUniqueFieldCount(): number {
    return this.getAllFields().length;
  }

  getByMinFields(min: number): Schema[] {
    return Array.from(this.schemas.values()).filter(s => s.fields.length >= min);
  }

  getMostFields(): Schema | null {
    const all = Array.from(this.schemas.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.fields.length > max.fields.length ? s : max);
  }

  getNewest(): Schema | null {
    const all = Array.from(this.schemas.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Schema | null {
    const all = Array.from(this.schemas.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.schemas.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.schemas.get(id)?.updated ?? 0;
  }

  getTotalValidGlobal(): number {
    return this.totalValid;
  }

  getTotalInvalidGlobal(): number {
    return this.totalInvalid;
  }

  clearAll(): void {
    this.schemas.clear();
    this.counter = 0;
    this.totalValid = 0;
    this.totalInvalid = 0;
  }
}

export default SchemaEngine;