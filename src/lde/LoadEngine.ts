/**
 * Load Engine
 * nanobot-design Load Engine - Record + Balance + Stats
 */

export type LoadStatus = 'low' | 'normal' | 'high' | 'critical';

export interface Load {
  id: string;
  node: string;
  value: number;
  status: LoadStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface LdeStats {
  loads: number;
  totalRecorded: number;
  totalBalanced: number;
  low: number;
  normal: number;
  high: number;
  critical: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNodes: number;
  totalValue: number;
  avgValue: number;
  maxValue: number;
  minValue: number;
}

function statusOf(value: number): LoadStatus {
  if (value < 30) return 'low';
  if (value < 70) return 'normal';
  if (value < 90) return 'high';
  return 'critical';
}

export class LoadEngine {
  private loads: Map<string, Load> = new Map();
  private counter = 0;
  private totalRecorded = 0;
  private totalBalanced = 0;
  private totalValue = 0;

  record(node: string, value: number): string {
    const id = `lde-${++this.counter}`;
    this.loads.set(id, {
      id,
      node,
      value,
      status: statusOf(value),
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalRecorded++;
    this.totalValue += value;
    return id;
  }

  balance(id: string, value: number): boolean {
    const l = this.loads.get(id);
    if (!l) return false;
    if (!l.active) return false;
    l.value = value;
    l.status = statusOf(value);
    l.updated = Date.now();
    l.hits++;
    this.totalBalanced++;
    this.totalValue += value;
    return true;
  }

  remove(id: string): boolean {
    return this.loads.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const l = this.loads.get(id);
    if (!l) return false;
    l.active = active;
    l.updated = Date.now();
    return true;
  }

  setNode(id: string, node: string): boolean {
    const l = this.loads.get(id);
    if (!l) return false;
    l.node = node;
    l.updated = Date.now();
    return true;
  }

  setValue(id: string, value: number): boolean {
    const l = this.loads.get(id);
    if (!l) return false;
    l.value = value;
    l.status = statusOf(value);
    l.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const l of this.loads.values()) {
      l.value = 0;
      l.status = 'low';
      l.active = true;
      l.hits = 0;
    }
    this.totalRecorded = 0;
    this.totalBalanced = 0;
    this.totalValue = 0;
  }

  getStats(): LdeStats {
    const all = Array.from(this.loads.values());
    const vArr = all.map(l => l.value);
    return {
      loads: all.length,
      totalRecorded: this.totalRecorded,
      totalBalanced: this.totalBalanced,
      low: all.filter(l => l.status === 'low').length,
      normal: all.filter(l => l.status === 'normal').length,
      high: all.filter(l => l.status === 'high').length,
      critical: all.filter(l => l.status === 'critical').length,
      active: all.filter(l => l.active).length,
      inactive: all.filter(l => !l.active).length,
      totalHits: all.reduce((s, l) => s + l.hits, 0),
      uniqueNodes: new Set(all.map(l => l.node)).size,
      totalValue: this.totalValue,
      avgValue: all.length > 0 ? Math.round((vArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxValue: vArr.length > 0 ? Math.max(...vArr) : 0,
      minValue: vArr.length > 0 ? Math.min(...vArr) : 0,
    };
  }

  getLoad(id: string): Load | undefined {
    return this.loads.get(id);
  }

  getAllLoads(): Load[] {
    return Array.from(this.loads.values());
  }

  hasLoad(id: string): boolean {
    return this.loads.has(id);
  }

  getCount(): number {
    return this.loads.size;
  }

  getNode(id: string): string | undefined {
    return this.loads.get(id)?.node;
  }

  getValue(id: string): number {
    return this.loads.get(id)?.value ?? 0;
  }

  getStatus(id: string): LoadStatus | undefined {
    return this.loads.get(id)?.status;
  }

  getHits(id: string): number {
    return this.loads.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.loads.get(id)?.active ?? false;
  }

  isLow(id: string): boolean {
    return this.loads.get(id)?.status === 'low';
  }

  isNormal(id: string): boolean {
    return this.loads.get(id)?.status === 'normal';
  }

  isHigh(id: string): boolean {
    return this.loads.get(id)?.status === 'high';
  }

  isCritical(id: string): boolean {
    return this.loads.get(id)?.status === 'critical';
  }

  getByStatus(status: LoadStatus): Load[] {
    return Array.from(this.loads.values()).filter(l => l.status === status);
  }

  getActiveLoads(): Load[] {
    return Array.from(this.loads.values()).filter(l => l.active);
  }

  getInactiveLoads(): Load[] {
    return Array.from(this.loads.values()).filter(l => !l.active);
  }

  getAllNodes(): string[] {
    return [...new Set(Array.from(this.loads.values()).map(l => l.node))];
  }

  getNewest(): Load | null {
    const all = Array.from(this.loads.values());
    if (all.length === 0) return null;
    return all.reduce((max, l) => l.created > max.created ? l : max);
  }

  getOldest(): Load | null {
    const all = Array.from(this.loads.values());
    if (all.length === 0) return null;
    return all.reduce((min, l) => l.created < min.created ? l : min);
  }

  getCreatedAt(id: string): number {
    return this.loads.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.loads.get(id)?.updated ?? 0;
  }

  getTotalRecorded(): number {
    return this.totalRecorded;
  }

  getTotalBalanced(): number {
    return this.totalBalanced;
  }

  clearAll(): void {
    this.loads.clear();
    this.counter = 0;
    this.totalRecorded = 0;
    this.totalBalanced = 0;
    this.totalValue = 0;
  }
}

export default LoadEngine;