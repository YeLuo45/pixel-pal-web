/**
 * Chain Engine
 * thunderbolt-design Chain Engine - AddLink + Execute + Stats
 */

export type ChainStepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ChainLink {
  id: string;
  name: string;
  index: number;
  status: ChainStepStatus;
  result: string;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CheStats {
  links: number;
  totalAdded: number;
  totalExecuted: number;
  totalCompleted: number;
  totalFailed: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
}

export class ChainEngine {
  private links: Map<string, ChainLink> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalExecuted = 0;
  private totalCompleted = 0;
  private totalFailed = 0;

  addLink(name: string, index: number): string {
    const id = `che-${++this.counter}`;
    this.links.set(id, {
      id,
      name,
      index,
      status: 'pending',
      result: '',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalAdded++;
    return id;
  }

  execute(id: string): boolean {
    const l = this.links.get(id);
    if (!l) return false;
    if (!l.active) return false;
    l.status = 'running';
    l.updated = Date.now();
    l.hits++;
    this.totalExecuted++;
    return true;
  }

  complete(id: string, result: string = ''): boolean {
    const l = this.links.get(id);
    if (!l) return false;
    if (l.status !== 'running') return false;
    l.status = 'completed';
    l.result = result;
    l.updated = Date.now();
    l.hits++;
    this.totalCompleted++;
    return true;
  }

  fail(id: string): boolean {
    const l = this.links.get(id);
    if (!l) return false;
    l.status = 'failed';
    l.updated = Date.now();
    l.hits++;
    this.totalFailed++;
    return true;
  }

  remove(id: string): boolean {
    return this.links.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const l = this.links.get(id);
    if (!l) return false;
    l.active = active;
    l.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const l = this.links.get(id);
    if (!l) return false;
    l.name = name;
    l.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const l of this.links.values()) {
      l.status = 'pending';
      l.result = '';
      l.active = true;
      l.hits = 0;
    }
    this.totalAdded = 0;
    this.totalExecuted = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }

  getStats(): CheStats {
    const all = Array.from(this.links.values());
    return {
      links: all.length,
      totalAdded: this.totalAdded,
      totalExecuted: this.totalExecuted,
      totalCompleted: this.totalCompleted,
      totalFailed: this.totalFailed,
      pending: all.filter(l => l.status === 'pending').length,
      running: all.filter(l => l.status === 'running').length,
      completed: all.filter(l => l.status === 'completed').length,
      failed: all.filter(l => l.status === 'failed').length,
      active: all.filter(l => l.active).length,
      inactive: all.filter(l => !l.active).length,
      totalHits: all.reduce((s, l) => s + l.hits, 0),
      uniqueNames: new Set(all.map(l => l.name)).size,
    };
  }

  getLink(id: string): ChainLink | undefined {
    return this.links.get(id);
  }

  getAllLinks(): ChainLink[] {
    return Array.from(this.links.values());
  }

  hasLink(id: string): boolean {
    return this.links.has(id);
  }

  getCount(): number {
    return this.links.size;
  }

  getName(id: string): string | undefined {
    return this.links.get(id)?.name;
  }

  getIndex(id: string): number {
    return this.links.get(id)?.index ?? -1;
  }

  getResult(id: string): string | undefined {
    return this.links.get(id)?.result;
  }

  getStatus(id: string): ChainStepStatus | undefined {
    return this.links.get(id)?.status;
  }

  getHits(id: string): number {
    return this.links.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.links.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.links.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.links.get(id)?.status === 'running';
  }

  isCompleted(id: string): boolean {
    return this.links.get(id)?.status === 'completed';
  }

  isFailed(id: string): boolean {
    return this.links.get(id)?.status === 'failed';
  }

  getByStatus(status: ChainStepStatus): ChainLink[] {
    return Array.from(this.links.values()).filter(l => l.status === status);
  }

  getByName(name: string): ChainLink[] {
    return Array.from(this.links.values()).filter(l => l.name === name);
  }

  getActiveLinks(): ChainLink[] {
    return Array.from(this.links.values()).filter(l => l.active);
  }

  getInactiveLinks(): ChainLink[] {
    return Array.from(this.links.values()).filter(l => !l.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.links.values()).map(l => l.name))];
  }

  getNewest(): ChainLink | null {
    const all = Array.from(this.links.values());
    if (all.length === 0) return null;
    return all.reduce((max, l) => l.created > max.created ? l : max);
  }

  getOldest(): ChainLink | null {
    const all = Array.from(this.links.values());
    if (all.length === 0) return null;
    return all.reduce((min, l) => l.created < min.created ? l : min);
  }

  getCreatedAt(id: string): number {
    return this.links.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.links.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalExecuted(): number {
    return this.totalExecuted;
  }

  getTotalCompleted(): number {
    return this.totalCompleted;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.links.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalExecuted = 0;
    this.totalCompleted = 0;
    this.totalFailed = 0;
  }
}

export default ChainEngine;