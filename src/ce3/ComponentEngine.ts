/**
 * Component Engine
 * claude-code-design Component Engine - Register + Use + Stats
 */

export interface Component {
  id: string;
  name: string;
  type: string;
  usages: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface CE4Stats {
  components: number;
  totalUsages: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueTypes: number;
  avgUsages: number;
  maxUsages: number;
  minUsages: number;
}

export class ComponentEngine {
  private components: Map<string, Component> = new Map();
  private counter = 0;
  private totalUsages = 0;

  register(name: string, type: string): string {
    const id = `ce3-${++this.counter}`;
    this.components.set(id, {
      id,
      name,
      type,
      usages: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  use(id: string): boolean {
    const c = this.components.get(id);
    if (!c) return false;
    if (!c.active) return false;
    c.usages++;
    c.history.push(Date.now());
    c.updated = Date.now();
    c.hits++;
    this.totalUsages++;
    return true;
  }

  getStats(): CE4Stats {
    const all = Array.from(this.components.values());
    const usageValues = all.map(c => c.usages);
    return {
      components: all.length,
      totalUsages: this.totalUsages,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueNames: new Set(all.map(c => c.name)).size,
      uniqueTypes: new Set(all.map(c => c.type)).size,
      avgUsages: all.length > 0 ? Math.round((usageValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxUsages: usageValues.length > 0 ? Math.max(...usageValues) : 0,
      minUsages: usageValues.length > 0 ? Math.min(...usageValues) : 0,
    };
  }

  getComponent(id: string): Component | undefined {
    return this.components.get(id);
  }

  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  removeComponent(id: string): boolean {
    return this.components.delete(id);
  }

  hasComponent(id: string): boolean {
    return this.components.has(id);
  }

  getCount(): number {
    return this.components.size;
  }

  getName(id: string): string | undefined {
    return this.components.get(id)?.name;
  }

  getType(id: string): string | undefined {
    return this.components.get(id)?.type;
  }

  getUsages(id: string): number {
    return this.components.get(id)?.usages ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.components.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.components.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.components.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.components.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.components.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  setType(id: string, type: string): boolean {
    const c = this.components.get(id);
    if (!c) return false;
    c.type = type;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.components.values()) {
      c.usages = 0;
      c.hits = 0;
      c.history = [];
      c.active = true;
    }
    this.totalUsages = 0;
  }

  getByName(name: string): Component[] {
    return Array.from(this.components.values()).filter(c => c.name === name);
  }

  getByType(type: string): Component[] {
    return Array.from(this.components.values()).filter(c => c.type === type);
  }

  getActiveComponents(): Component[] {
    return Array.from(this.components.values()).filter(c => c.active);
  }

  getInactiveComponents(): Component[] {
    return Array.from(this.components.values()).filter(c => !c.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.components.values()).map(c => c.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllTypes(): string[] {
    return [...new Set(Array.from(this.components.values()).map(c => c.type))];
  }

  getTypeCount(): number {
    return this.getAllTypes().length;
  }

  getByMinUsages(min: number): Component[] {
    return Array.from(this.components.values()).filter(c => c.usages >= min);
  }

  getMostUsages(): Component | null {
    const all = Array.from(this.components.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.usages > max.usages ? c : max);
  }

  getNewest(): Component | null {
    const all = Array.from(this.components.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Component | null {
    const all = Array.from(this.components.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.components.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.components.get(id)?.updated ?? 0;
  }

  getTotalUsages(): number {
    return this.totalUsages;
  }

  clearAll(): void {
    this.components.clear();
    this.counter = 0;
    this.totalUsages = 0;
  }
}

export default ComponentEngine;