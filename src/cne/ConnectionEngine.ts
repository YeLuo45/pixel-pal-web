/**
 * Connection Engine
 * nanobot-design Connection Engine - Connect + Send + Receive + Stats
 */

export type ConnStatus = 'open' | 'closed' | 'half-open';

export interface Connection {
  id: string;
  from: string;
  to: string;
  status: ConnStatus;
  bytes: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface CneStats {
  connections: number;
  totalOpened: number;
  totalClosed: number;
  totalBytes: number;
  open: number;
  closed: number;
  halfOpen: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueFroms: number;
  uniqueTos: number;
  avgBytes: number;
  maxBytes: number;
  minBytes: number;
}

export class ConnectionEngine {
  private connections: Map<string, Connection> = new Map();
  private counter = 0;
  private totalOpened = 0;
  private totalClosed = 0;
  private totalBytes = 0;

  connect(from: string, to: string): string {
    const id = `cne-${++this.counter}`;
    this.connections.set(id, {
      id,
      from,
      to,
      status: 'open',
      bytes: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalOpened++;
    return id;
  }

  send(id: string, bytes: number): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    if (c.status === 'closed') return false;
    if (!c.active) return false;
    c.bytes += bytes;
    c.updated = Date.now();
    c.hits++;
    this.totalBytes += bytes;
    return true;
  }

  close(id: string): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    c.status = 'closed';
    c.updated = Date.now();
    c.hits++;
    this.totalClosed++;
    return true;
  }

  halfOpen(id: string): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    c.status = 'half-open';
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.connections.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.connections.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const c of this.connections.values()) {
      c.status = 'open';
      c.bytes = 0;
      c.active = true;
      c.hits = 0;
    }
    this.totalOpened = 0;
    this.totalClosed = 0;
    this.totalBytes = 0;
  }

  getStats(): CneStats {
    const all = Array.from(this.connections.values());
    const bytesArr = all.map(c => c.bytes);
    return {
      connections: all.length,
      totalOpened: this.totalOpened,
      totalClosed: this.totalClosed,
      totalBytes: this.totalBytes,
      open: all.filter(c => c.status === 'open').length,
      closed: all.filter(c => c.status === 'closed').length,
      halfOpen: all.filter(c => c.status === 'half-open').length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueFroms: new Set(all.map(c => c.from)).size,
      uniqueTos: new Set(all.map(c => c.to)).size,
      avgBytes: all.length > 0 ? Math.round((bytesArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxBytes: bytesArr.length > 0 ? Math.max(...bytesArr) : 0,
      minBytes: bytesArr.length > 0 ? Math.min(...bytesArr) : 0,
    };
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): Connection[] {
    return Array.from(this.connections.values());
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

  getStatus(id: string): ConnStatus | undefined {
    return this.connections.get(id)?.status;
  }

  getBytes(id: string): number {
    return this.connections.get(id)?.bytes ?? 0;
  }

  getHits(id: string): number {
    return this.connections.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.connections.get(id)?.active ?? false;
  }

  isOpen(id: string): boolean {
    return this.connections.get(id)?.status === 'open';
  }

  isClosed(id: string): boolean {
    return this.connections.get(id)?.status === 'closed';
  }

  isHalfOpen(id: string): boolean {
    return this.connections.get(id)?.status === 'half-open';
  }

  getByStatus(status: ConnStatus): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.status === status);
  }

  getByFrom(from: string): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.from === from);
  }

  getByTo(to: string): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.to === to);
  }

  getActiveConnections(): Connection[] {
    return Array.from(this.connections.values()).filter(c => c.active);
  }

  getInactiveConnections(): Connection[] {
    return Array.from(this.connections.values()).filter(c => !c.active);
  }

  getAllFroms(): string[] {
    return [...new Set(Array.from(this.connections.values()).map(c => c.from))];
  }

  getAllTos(): string[] {
    return [...new Set(Array.from(this.connections.values()).map(c => c.to))];
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

  getTotalOpened(): number {
    return this.totalOpened;
  }

  getTotalClosed(): number {
    return this.totalClosed;
  }

  getTotalBytes(): number {
    return this.totalBytes;
  }

  clearAll(): void {
    this.connections.clear();
    this.counter = 0;
    this.totalOpened = 0;
    this.totalClosed = 0;
    this.totalBytes = 0;
  }
}

export default ConnectionEngine;