/**
 * Style Engine
 * claude-code-design Style Engine - Define + Apply + Stats
 */

export interface Style {
  id: string;
  name: string;
  property: string;
  value: string;
  applications: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface SteStats {
  styles: number;
  totalApplications: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueProperties: number;
  avgApplications: number;
  maxApplications: number;
  minApplications: number;
  avgValueLength: number;
}

export class StyleEngine {
  private styles: Map<string, Style> = new Map();
  private counter = 0;
  private totalApplications = 0;

  define(name: string, property: string, value: string): string {
    const id = `ste-${++this.counter}`;
    this.styles.set(id, {
      id,
      name,
      property,
      value,
      applications: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  apply(id: string): boolean {
    const s = this.styles.get(id);
    if (!s) return false;
    if (!s.active) return false;
    s.applications++;
    s.history.push(Date.now());
    s.updated = Date.now();
    s.hits++;
    this.totalApplications++;
    return true;
  }

  reset(id: string): boolean {
    const s = this.styles.get(id);
    if (!s) return false;
    s.applications = 0;
    s.history = [];
    s.updated = Date.now();
    return true;
  }

  getStats(): SteStats {
    const all = Array.from(this.styles.values());
    const appValues = all.map(s => s.applications);
    const valueLengths = all.map(s => s.value.length);
    return {
      styles: all.length,
      totalApplications: this.totalApplications,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      totalHits: all.reduce((s, x) => s + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      uniqueProperties: new Set(all.map(s => s.property)).size,
      avgApplications: all.length > 0 ? Math.round((appValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxApplications: appValues.length > 0 ? Math.max(...appValues) : 0,
      minApplications: appValues.length > 0 ? Math.min(...appValues) : 0,
      avgValueLength: all.length > 0 ? Math.round((valueLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getStyle(id: string): Style | undefined {
    return this.styles.get(id);
  }

  getAllStyles(): Style[] {
    return Array.from(this.styles.values());
  }

  removeStyle(id: string): boolean {
    return this.styles.delete(id);
  }

  hasStyle(id: string): boolean {
    return this.styles.has(id);
  }

  getCount(): number {
    return this.styles.size;
  }

  getName(id: string): string | undefined {
    return this.styles.get(id)?.name;
  }

  getProperty(id: string): string | undefined {
    return this.styles.get(id)?.property;
  }

  getValue(id: string): string | undefined {
    return this.styles.get(id)?.value;
  }

  getValueLength(id: string): number {
    return this.styles.get(id)?.value.length ?? 0;
  }

  getApplications(id: string): number {
    return this.styles.get(id)?.applications ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.styles.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.styles.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.styles.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.styles.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.styles.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setProperty(id: string, property: string): boolean {
    const s = this.styles.get(id);
    if (!s) return false;
    s.property = property;
    s.updated = Date.now();
    return true;
  }

  setValue(id: string, value: string): boolean {
    const s = this.styles.get(id);
    if (!s) return false;
    s.value = value;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.styles.values()) {
      s.applications = 0;
      s.hits = 0;
      s.history = [];
      s.active = true;
    }
    this.totalApplications = 0;
  }

  getByName(name: string): Style[] {
    return Array.from(this.styles.values()).filter(s => s.name === name);
  }

  getByProperty(property: string): Style[] {
    return Array.from(this.styles.values()).filter(s => s.property === property);
  }

  getActiveStyles(): Style[] {
    return Array.from(this.styles.values()).filter(s => s.active);
  }

  getInactiveStyles(): Style[] {
    return Array.from(this.styles.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.styles.values()).map(s => s.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllProperties(): string[] {
    return [...new Set(Array.from(this.styles.values()).map(s => s.property))];
  }

  getPropertyCount(): number {
    return this.getAllProperties().length;
  }

  getByMinApplications(min: number): Style[] {
    return Array.from(this.styles.values()).filter(s => s.applications >= min);
  }

  getMostApplications(): Style | null {
    const all = Array.from(this.styles.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.applications > max.applications ? s : max);
  }

  getNewest(): Style | null {
    const all = Array.from(this.styles.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Style | null {
    const all = Array.from(this.styles.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.styles.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.styles.get(id)?.updated ?? 0;
  }

  getTotalApplications(): number {
    return this.totalApplications;
  }

  clearAll(): void {
    this.styles.clear();
    this.counter = 0;
    this.totalApplications = 0;
  }
}

export default StyleEngine;