/**
 * Index Manager
 * nanobot-design Index Manager - Create + Add + Query + Stats
 */

export interface Index {
  id: string;
  name: string;
  field: string;
  entries: Map<string, string[]>;
  entries_count: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface IxmStats {
  indexes: number;
  totalEntries: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueFields: number;
  avgEntries: number;
  maxEntries: number;
  minEntries: number;
  avgNameLength: number;
  avgFieldLength: number;
  totalQueries: number;
  totalAdds: number;
}

export class IndexManager {
  private indexes: Map<string, Index> = new Map();
  private counter = 0;
  private totalQueries = 0;
  private totalAdds = 0;

  create(name: string, field: string = 'default'): string {
    const id = `ixm-${++this.counter}`;
    this.indexes.set(id, {
      id,
      name,
      field,
      entries: new Map(),
      entries_count: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  add(id: string, key: string, value: string): boolean {
    const i = this.indexes.get(id);
    if (!i) return false;
    if (!i.active) return false;
    if (!i.entries.has(key)) {
      i.entries.set(key, []);
    }
    const arr = i.entries.get(key)!;
    if (!arr.includes(value)) {
      arr.push(value);
    }
    i.entries_count++;
    i.history.push(Date.now());
    i.updated = Date.now();
    i.hits++;
    this.totalAdds++;
    return true;
  }

  query(id: string, key: string): string[] {
    this.totalQueries++;
    const i = this.indexes.get(id);
    if (!i) return [];
    if (!i.active) return [];
    i.hits++;
    i.updated = Date.now();
    return [...(i.entries.get(key) ?? [])];
  }

  remove(id: string): boolean {
    return this.indexes.delete(id);
  }

  clear(id: string): boolean {
    const i = this.indexes.get(id);
    if (!i) return false;
    i.entries.clear();
    i.entries_count = 0;
    i.updated = Date.now();
    return true;
  }

  removeKey(id: string, key: string): boolean {
    const i = this.indexes.get(id);
    if (!i) return false;
    const result = i.entries.delete(key);
    if (result) {
      i.updated = Date.now();
    }
    return result;
  }

  resetAll(): void {
    for (const i of this.indexes.values()) {
      i.entries.clear();
      i.entries_count = 0;
      i.hits = 0;
      i.history = [];
      i.active = true;
    }
    this.totalQueries = 0;
    this.totalAdds = 0;
  }

  getStats(): IxmStats {
    const all = Array.from(this.indexes.values());
    const entriesValues = all.map(i => i.entries_count);
    const nameLengths = all.map(i => i.name.length);
    const fieldLengths = all.map(i => i.field.length);
    return {
      indexes: all.length,
      totalEntries: entriesValues.reduce((s, v) => s + v, 0),
      active: all.filter(i => i.active).length,
      inactive: all.filter(i => !i.active).length,
      totalHits: all.reduce((s, i) => s + i.hits, 0),
      uniqueNames: new Set(all.map(i => i.name)).size,
      uniqueFields: new Set(all.map(i => i.field)).size,
      avgEntries: all.length > 0 ? Math.round((entriesValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxEntries: entriesValues.length > 0 ? Math.max(...entriesValues) : 0,
      minEntries: entriesValues.length > 0 ? Math.min(...entriesValues) : 0,
      avgNameLength: all.length > 0 ? Math.round((nameLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgFieldLength: all.length > 0 ? Math.round((fieldLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      totalQueries: this.totalQueries,
      totalAdds: this.totalAdds,
    };
  }

  getIndex(id: string): Index | undefined {
    return this.indexes.get(id);
  }

  getAllIndexes(): Index[] {
    return Array.from(this.indexes.values());
  }

  hasIndex(id: string): boolean {
    return this.indexes.has(id);
  }

  getCount(): number {
    return this.indexes.size;
  }

  getName(id: string): string | undefined {
    return this.indexes.get(id)?.name;
  }

  getField(id: string): string | undefined {
    return this.indexes.get(id)?.field;
  }

  getNameLength(id: string): number {
    return this.indexes.get(id)?.name.length ?? 0;
  }

  getFieldLength(id: string): number {
    return this.indexes.get(id)?.field.length ?? 0;
  }

  getEntriesCount(id: string): number {
    return this.indexes.get(id)?.entries_count ?? 0;
  }

  getKeys(id: string): string[] {
    return [...(this.indexes.get(id)?.entries.keys() ?? [])];
  }

  getKeyCount(id: string): number {
    return this.getKeys(id).length;
  }

  getValues(id: string, key: string): string[] {
    return [...(this.indexes.get(id)?.entries.get(key) ?? [])];
  }

  getHistory(id: string): number[] {
    return [...(this.indexes.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.indexes.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.indexes.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const i = this.indexes.get(id);
    if (!i) return false;
    i.active = active;
    i.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const i = this.indexes.get(id);
    if (!i) return false;
    i.name = name;
    i.updated = Date.now();
    return true;
  }

  setField(id: string, field: string): boolean {
    const i = this.indexes.get(id);
    if (!i) return false;
    i.field = field;
    i.updated = Date.now();
    return true;
  }

  getByName(name: string): Index[] {
    return Array.from(this.indexes.values()).filter(i => i.name === name);
  }

  getByField(field: string): Index[] {
    return Array.from(this.indexes.values()).filter(i => i.field === field);
  }

  getActiveIndexes(): Index[] {
    return Array.from(this.indexes.values()).filter(i => i.active);
  }

  getInactiveIndexes(): Index[] {
    return Array.from(this.indexes.values()).filter(i => !i.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.indexes.values()).map(i => i.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllFields(): string[] {
    return [...new Set(Array.from(this.indexes.values()).map(i => i.field))];
  }

  getFieldCount(): number {
    return this.getAllFields().length;
  }

  getByMinEntries(min: number): Index[] {
    return Array.from(this.indexes.values()).filter(i => i.entries_count >= min);
  }

  getNewest(): Index | null {
    const all = Array.from(this.indexes.values());
    if (all.length === 0) return null;
    return all.reduce((max, i) => i.created > max.created ? i : max);
  }

  getOldest(): Index | null {
    const all = Array.from(this.indexes.values());
    if (all.length === 0) return null;
    return all.reduce((min, i) => i.created < min.created ? i : min);
  }

  getCreatedAt(id: string): number {
    return this.indexes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.indexes.get(id)?.updated ?? 0;
  }

  getTotalQueries(): number {
    return this.totalQueries;
  }

  getTotalAdds(): number {
    return this.totalAdds;
  }

  clearAll(): void {
    this.indexes.clear();
    this.counter = 0;
    this.totalQueries = 0;
    this.totalAdds = 0;
  }
}

export default IndexManager;