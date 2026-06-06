/**
 * Bridge Engine
 * chatdev-design Bridge Engine - Register + Dispatch + Stats
 */

export interface Bridge {
  id: string;
  name: string;
  source: string;
  target: string;
  messages: number;
  messageLog: string[];
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

export interface BE4Stats {
  bridges: number;
  totalMessages: number;
  active: number;
  inactive: number;
  totalHits: number;
  avgMessages: number;
  uniqueSources: number;
  uniqueTargets: number;
  uniqueNames: number;
  uniquePairs: number;
}

export class BridgeEngine {
  private bridges: Map<string, Bridge> = new Map();
  private counter = 0;
  private totalMessages = 0;

  register(name: string, source: string, target: string): string {
    const id = `be2-${++this.counter}`;
    this.bridges.set(id, {
      id,
      name,
      source,
      target,
      messages: 0,
      messageLog: [],
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
    });
    return id;
  }

  dispatch(id: string, message: string): boolean {
    const b = this.bridges.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.messages++;
    b.messageLog.push(message);
    b.updated = Date.now();
    b.hits++;
    this.totalMessages++;
    return true;
  }

  clearMessages(id: string): boolean {
    const b = this.bridges.get(id);
    if (!b) return false;
    b.messages = 0;
    b.messageLog = [];
    b.updated = Date.now();
    return true;
  }

  getStats(): BE4Stats {
    const all = Array.from(this.bridges.values());
    return {
      bridges: all.length,
      totalMessages: this.totalMessages,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      avgMessages: all.length > 0 ? Math.round((all.reduce((s, b) => s + b.messages, 0) / all.length) * 100) / 100 : 0,
      uniqueSources: new Set(all.map(b => b.source)).size,
      uniqueTargets: new Set(all.map(b => b.target)).size,
      uniqueNames: new Set(all.map(b => b.name)).size,
      uniquePairs: new Set(all.map(b => `${b.source}->${b.target}`)).size,
    };
  }

  getBridge(id: string): Bridge | undefined {
    return this.bridges.get(id);
  }

  getAllBridges(): Bridge[] {
    return Array.from(this.bridges.values());
  }

  removeBridge(id: string): boolean {
    return this.bridges.delete(id);
  }

  hasBridge(id: string): boolean {
    return this.bridges.has(id);
  }

  getCount(): number {
    return this.bridges.size;
  }

  getName(id: string): string | undefined {
    return this.bridges.get(id)?.name;
  }

  getSource(id: string): string | undefined {
    return this.bridges.get(id)?.source;
  }

  getTarget(id: string): string | undefined {
    return this.bridges.get(id)?.target;
  }

  getMessages(id: string): number {
    return this.bridges.get(id)?.messages ?? 0;
  }

  getMessageLog(id: string): string[] {
    return [...(this.bridges.get(id)?.messageLog ?? [])];
  }

  getHits(id: string): number {
    return this.bridges.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.bridges.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.bridges.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const b = this.bridges.get(id);
    if (!b) return false;
    b.name = name;
    b.updated = Date.now();
    return true;
  }

  setSource(id: string, source: string): boolean {
    const b = this.bridges.get(id);
    if (!b) return false;
    b.source = source;
    b.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const b = this.bridges.get(id);
    if (!b) return false;
    b.target = target;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.bridges.values()) {
      b.messages = 0;
      b.messageLog = [];
      b.hits = 0;
      b.active = true;
    }
    this.totalMessages = 0;
  }

  getByName(name: string): Bridge[] {
    return Array.from(this.bridges.values()).filter(b => b.name === name);
  }

  getBySource(source: string): Bridge[] {
    return Array.from(this.bridges.values()).filter(b => b.source === source);
  }

  getByTarget(target: string): Bridge[] {
    return Array.from(this.bridges.values()).filter(b => b.target === target);
  }

  getActiveBridges(): Bridge[] {
    return Array.from(this.bridges.values()).filter(b => b.active);
  }

  getInactiveBridges(): Bridge[] {
    return Array.from(this.bridges.values()).filter(b => !b.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.bridges.values()).map(b => b.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getAllSources(): string[] {
    return [...new Set(Array.from(this.bridges.values()).map(b => b.source))];
  }

  getSourceCount(): number {
    return this.getAllSources().length;
  }

  getAllTargets(): string[] {
    return [...new Set(Array.from(this.bridges.values()).map(b => b.target))];
  }

  getTargetCount(): number {
    return this.getAllTargets().length;
  }

  getByMinMessages(min: number): Bridge[] {
    return Array.from(this.bridges.values()).filter(b => b.messages >= min);
  }

  getMostMessages(): Bridge | null {
    const all = Array.from(this.bridges.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.messages > max.messages ? b : max);
  }

  getNewest(): Bridge | null {
    const all = Array.from(this.bridges.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Bridge | null {
    const all = Array.from(this.bridges.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.bridges.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.bridges.get(id)?.updated ?? 0;
  }

  getTotalMessages(): number {
    return this.totalMessages;
  }

  clearAll(): void {
    this.bridges.clear();
    this.counter = 0;
    this.totalMessages = 0;
  }
}

export default BridgeEngine;