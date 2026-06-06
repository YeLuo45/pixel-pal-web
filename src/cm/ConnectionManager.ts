/**
 * Connection Manager
 * thunderbolt-design Connection Manager - Create + Exchange + Close + Stats
 */

export interface Connection {
  id: string;
  from: string;
  to: string;
  open: boolean;
  messages: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface CMStats {
  connections: number;
  open: number;
  closed: number;
  totalMessages: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueFrom: number;
  uniqueTo: number;
  uniquePairs: number;
  avgMessages: number;
  maxMessages: number;
  minMessages: number;
}

export class ConnectionManager {
  private connections: Map<string, Connection> = new Map();
  private counter = 0;
  private totalMessages = 0;

  create(from: string, to: string): string {
    const id = `cm-${++this.counter}`;
    this.connections.set(id, {
      id,
      from,
      to,
      open: true,
      messages: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  exchange(id: string): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    if (!c.active) return false;
    if (!c.open) return false;
    c.messages++;
    c.history.push(Date.now());
    c.updated = Date.now();
    c.hits++;
    this.totalMessages++;
    return true;
  }

  close(id: string): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    if (!c.open) return false;
    c.open = false;
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  reopen(id: string): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    if (c.open) return false;
    c.open = true;
    c.updated = Date.now();
    return true;
  }

  getStats(): CMStats {
    const all = Array.from(this.connections.values());
    const msgValues = all.map(c => c.messages);
    return {
      connections: all.length,
      open: all.filter(c => c.open).length,
      closed: all.filter(c => !c.open).length,
      totalMessages: this.totalMessages,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueFrom: new Set(all.map(c => c.from)).size,
      uniqueTo: new Set(all.map(c => c.to)).size,
      uniquePairs: new Set(all.map(c => `${c.from}->${c.to}`)).size,
      avgMessages: all.length > 0 ? Math.round((msgValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxMessages: msgValues.length > 0 ? Math.max(...msgValues) : 0,
      minMessages: msgValues.length > 0 ? Math.min(...msgValues) : 0,
    };
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  removeConnection(id: string): boolean {
    return this.connections.delete(id);
  }

  hasConnection(id: string): boolean {
    return this.connections.has(id);
  }

  getCount(): number {
    return this.connections.size;
  }

  getFrom(id: string): string | undefined {
    return this.connections.get(id)?.from;
  }

  getTo(id: string): string | undefined {
    return this.connections.get(id)?.to;
  }

  getMessages(id: string): number {
    return this.connections.get(id)?.messages ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.connections.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.connections.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.connections.get(id)?.active ?? false;
  }

  isOpen(id: string): boolean {
    return this.connections.get(id)?.open ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setFrom(id: string, from: string): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    c.from = from;
    c.updated = Date.now();
    return true;
  }

  setTo(id: string, to: string): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    c.to = to;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.connections.values()) {
      c.messages = 0;
      c.hits = 0;
      c.history = [];
      c.active = true;
      c.open = true;
    }
    this.totalMessages = 0;
  }

  getByFrom(from: string): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.from === from);
  }

  getByTo(to: string): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.to === to);
  }

  getOpenConnections(): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.open);
  }

  getClosedConnections(): Connection[] {
    return Array.from(this.connections.values()).filter(c => !c.open);
  }

  getActiveConnections(): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.active);
  }

  getInactiveConnections(): Connection[] {
    return Array.from(this.connections.values()).filter(c => !c.active);
  }

  getByMinMessages(min: number): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.messages >= min);
  }

  getMostMessages(): Connection | null {
    const all = Array.from(this.connections.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.messages > max.messages ? c : max);
  }

  getNewest(): Connection | null {
    const all = Array.from(this.connections.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Connection | null {
    const all = Array.from(this.connections.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.connections.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.connections.get(id)?.updated ?? 0;
  }

  getTotalMessages(): number {
    return this.totalMessages;
  }

  clearAll(): void {
    this.connections.clear();
    this.counter = 0;
    this.totalMessages = 0;
  }
}

export default ConnectionManager;