/**
 * Label Engine
 * chatdev-design Label Engine - Add + Tag + Untag + Stats
 */

export type LabelColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface LabelEntry {
  id: string;
  name: string;
  color: LabelColor;
  tagged: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface LbeStats {
  labels: number;
  totalAdded: number;
  totalTagged: number;
  totalUntagged: number;
  red: number;
  blue: number;
  green: number;
  yellow: number;
  purple: number;
  orange: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  totalTagCount: number;
  avgTagCount: number;
  maxTagCount: number;
  minTagCount: number;
}

export class LabelEngine {
  private labels: Map<string, LabelEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalTagged = 0;
  private totalUntagged = 0;

  add(name: string, color: LabelColor): string {
    const id = `lbe-${++this.counter}`;
    this.labels.set(id, {
      id,
      name,
      color,
      tagged: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  tag(id: string): boolean {
    const l = this.labels.get(id);
    if (!l) return false;
    if (!l.active) return false;
    l.tagged++;
    l.updated = Date.now();
    l.hits++;
    this.totalTagged++;
    return true;
  }

  untag(id: string): boolean {
    const l = this.labels.get(id);
    if (!l) return false;
    if (l.tagged <= 0) return false;
    l.tagged--;
    l.updated = Date.now();
    l.hits++;
    this.totalUntagged++;
    return true;
  }

  remove(id: string): boolean {
    return this.labels.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const l = this.labels.get(id);
    if (!l) return false;
    l.active = active;
    l.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const l = this.labels.get(id);
    if (!l) return false;
    l.name = name;
    l.updated = Date.now();
    return true;
  }

  setColor(id: string, color: LabelColor): boolean {
    const l = this.labels.get(id);
    if (!l) return false;
    l.color = color;
    l.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const l of this.labels.values()) {
      l.tagged = 0;
      l.active = true;
      l.hits = 0;
    }
    this.totalAdded = 0;
    this.totalTagged = 0;
    this.totalUntagged = 0;
  }

  getStats(): LbeStats {
    const all = Array.from(this.labels.values());
    const tArr = all.map(l => l.tagged);
    return {
      labels: all.length,
      totalAdded: this.totalAdded,
      totalTagged: this.totalTagged,
      totalUntagged: this.totalUntagged,
      red: all.filter(l => l.color === 'red').length,
      blue: all.filter(l => l.color === 'blue').length,
      green: all.filter(l => l.color === 'green').length,
      yellow: all.filter(l => l.color === 'yellow').length,
      purple: all.filter(l => l.color === 'purple').length,
      orange: all.filter(l => l.color === 'orange').length,
      active: all.filter(l => l.active).length,
      inactive: all.filter(l => !l.active).length,
      totalHits: all.reduce((s, l) => s + l.hits, 0),
      uniqueNames: new Set(all.map(l => l.name)).size,
      totalTagCount: all.reduce((s, l) => s + l.tagged, 0),
      avgTagCount: all.length > 0 ? Math.round((tArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxTagCount: tArr.length > 0 ? Math.max(...tArr) : 0,
      minTagCount: tArr.length > 0 ? Math.min(...tArr) : 0,
    };
  }

  getLabel(id: string): LabelEntry | undefined {
    return this.labels.get(id);
  }

  getAllLabels(): LabelEntry[] {
    return Array.from(this.labels.values());
  }

  hasLabel(id: string): boolean {
    return this.labels.has(id);
  }

  getCount(): number {
    return this.labels.size;
  }

  getName(id: string): string | undefined {
    return this.labels.get(id)?.name;
  }

  getColor(id: string): LabelColor | undefined {
    return this.labels.get(id)?.color;
  }

  getTagged(id: string): number {
    return this.labels.get(id)?.tagged ?? 0;
  }

  getHits(id: string): number {
    return this.labels.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.labels.get(id)?.active ?? false;
  }

  isRed(id: string): boolean {
    return this.labels.get(id)?.color === 'red';
  }

  isBlue(id: string): boolean {
    return this.labels.get(id)?.color === 'blue';
  }

  isGreen(id: string): boolean {
    return this.labels.get(id)?.color === 'green';
  }

  isYellow(id: string): boolean {
    return this.labels.get(id)?.color === 'yellow';
  }

  isPurple(id: string): boolean {
    return this.labels.get(id)?.color === 'purple';
  }

  isOrange(id: string): boolean {
    return this.labels.get(id)?.color === 'orange';
  }

  getByColor(color: LabelColor): LabelEntry[] {
    return Array.from(this.labels.values()).filter(l => l.color === color);
  }

  getActiveLabels(): LabelEntry[] {
    return Array.from(this.labels.values()).filter(l => l.active);
  }

  getInactiveLabels(): LabelEntry[] {
    return Array.from(this.labels.values()).filter(l => !l.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.labels.values()).map(l => l.name))];
  }

  getNewest(): LabelEntry | null {
    const all = Array.from(this.labels.values());
    if (all.length === 0) return null;
    return all.reduce((max, l) => l.created > max.created ? l : max);
  }

  getOldest(): LabelEntry | null {
    const all = Array.from(this.labels.values());
    if (all.length === 0) return null;
    return all.reduce((min, l) => l.created < min.created ? l : min);
  }

  getCreatedAt(id: string): number {
    return this.labels.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.labels.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalTagged(): number {
    return this.totalTagged;
  }

  getTotalUntagged(): number {
    return this.totalUntagged;
  }

  clearAll(): void {
    this.labels.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalTagged = 0;
    this.totalUntagged = 0;
  }
}

export default LabelEngine;