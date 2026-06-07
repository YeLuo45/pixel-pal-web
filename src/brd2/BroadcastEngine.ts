/**
 * Broadcast Engine
 * nanobot-design Broadcast Engine - Send + Receive + Ack + Stats
 */

export type BroadcastMode = 'all' | 'group' | 'region';

export interface Broadcast {
  id: string;
  message: string;
  sender: string;
  mode: BroadcastMode;
  target: string;
  acks: number;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface Bre2Stats {
  broadcasts: number;
  totalSent: number;
  totalReceived: number;
  totalAcked: number;
  all: number;
  group: number;
  region: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueMessages: number;
  uniqueSenders: number;
  totalAcks: number;
  avgAcks: number;
  maxAcks: number;
  minAcks: number;
  totalMessageLen: number;
  avgMessageLen: number;
}

export class BroadcastEngine {
  private broadcasts: Map<string, Broadcast> = new Map();
  private counter = 0;
  private totalSent = 0;
  private totalReceived = 0;
  private totalAcked = 0;
  private totalAcks = 0;
  private totalMessageLen = 0;

  send(message: string, sender: string, target: string, mode: BroadcastMode = 'all'): string {
    const id = `bre2-${++this.counter}`;
    this.broadcasts.set(id, {
      id,
      message,
      sender,
      target,
      mode,
      acks: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalSent++;
    this.totalMessageLen += message.length;
    return id;
  }

  receive(id: string): boolean {
    const b = this.broadcasts.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.updated = Date.now();
    b.hits++;
    this.totalReceived++;
    return true;
  }

  ack(id: string): boolean {
    const b = this.broadcasts.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.acks++;
    b.updated = Date.now();
    b.hits++;
    this.totalAcked++;
    this.totalAcks++;
    return true;
  }

  remove(id: string): boolean {
    return this.broadcasts.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.broadcasts.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setMessage(id: string, message: string): boolean {
    const b = this.broadcasts.get(id);
    if (!b) return false;
    b.message = message;
    b.updated = Date.now();
    return true;
  }

  setTarget(id: string, target: string): boolean {
    const b = this.broadcasts.get(id);
    if (!b) return false;
    b.target = target;
    b.updated = Date.now();
    return true;
  }

  setMode(id: string, mode: BroadcastMode): boolean {
    const b = this.broadcasts.get(id);
    if (!b) return false;
    b.mode = mode;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.broadcasts.values()) {
      b.acks = 0;
      b.active = true;
      b.hits = 0;
    }
    this.totalSent = 0;
    this.totalReceived = 0;
    this.totalAcked = 0;
    this.totalAcks = 0;
    this.totalMessageLen = 0;
  }

  getStats(): Bre2Stats {
    const all = Array.from(this.broadcasts.values());
    const aArr = all.map(b => b.acks);
    const lArr = all.map(b => b.message.length);
    return {
      broadcasts: all.length,
      totalSent: this.totalSent,
      totalReceived: this.totalReceived,
      totalAcked: this.totalAcked,
      all: all.filter(b => b.mode === 'all').length,
      group: all.filter(b => b.mode === 'group').length,
      region: all.filter(b => b.mode === 'region').length,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueMessages: new Set(all.map(b => b.message)).size,
      uniqueSenders: new Set(all.map(b => b.sender)).size,
      totalAcks: this.totalAcks,
      avgAcks: all.length > 0 ? Math.round((aArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxAcks: aArr.length > 0 ? Math.max(...aArr) : 0,
      minAcks: aArr.length > 0 ? Math.min(...aArr) : 0,
      totalMessageLen: this.totalMessageLen,
      avgMessageLen: all.length > 0 ? Math.round((lArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getBroadcast(id: string): Broadcast | undefined {
    return this.broadcasts.get(id);
  }

  getAllBroadcasts(): Broadcast[] {
    return Array.from(this.broadcasts.values());
  }

  hasBroadcast(id: string): boolean {
    return this.broadcasts.has(id);
  }

  getCount(): number {
    return this.broadcasts.size;
  }

  getMessage(id: string): string | undefined {
    return this.broadcasts.get(id)?.message;
  }

  getSender(id: string): string | undefined {
    return this.broadcasts.get(id)?.sender;
  }

  getTarget(id: string): string | undefined {
    return this.broadcasts.get(id)?.target;
  }

  getMode(id: string): BroadcastMode | undefined {
    return this.broadcasts.get(id)?.mode;
  }

  getAcks(id: string): number {
    return this.broadcasts.get(id)?.acks ?? 0;
  }

  getHits(id: string): number {
    return this.broadcasts.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.broadcasts.get(id)?.active ?? false;
  }

  isAll(id: string): boolean {
    return this.broadcasts.get(id)?.mode === 'all';
  }

  isGroup(id: string): boolean {
    return this.broadcasts.get(id)?.mode === 'group';
  }

  isRegion(id: string): boolean {
    return this.broadcasts.get(id)?.mode === 'region';
  }

  getByMode(mode: BroadcastMode): Broadcast[] {
    return Array.from(this.broadcasts.values()).filter(b => b.mode === mode);
  }

  getActiveBroadcasts(): Broadcast[] {
    return Array.from(this.broadcasts.values()).filter(b => b.active);
  }

  getInactiveBroadcasts(): Broadcast[] {
    return Array.from(this.broadcasts.values()).filter(b => !b.active);
  }

  getAllMessages(): string[] {
    return [...new Set(Array.from(this.broadcasts.values()).map(b => b.message))];
  }

  getAllSenders(): string[] {
    return [...new Set(Array.from(this.broadcasts.values()).map(b => b.sender))];
  }

  getNewest(): Broadcast | null {
    const all = Array.from(this.broadcasts.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): Broadcast | null {
    const all = Array.from(this.broadcasts.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.broadcasts.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.broadcasts.get(id)?.updated ?? 0;
  }

  getTotalSent(): number {
    return this.totalSent;
  }

  getTotalReceived(): number {
    return this.totalReceived;
  }

  getTotalAcked(): number {
    return this.totalAcked;
  }

  clearAll(): void {
    this.broadcasts.clear();
    this.counter = 0;
    this.totalSent = 0;
    this.totalReceived = 0;
    this.totalAcked = 0;
    this.totalAcks = 0;
    this.totalMessageLen = 0;
  }
}

export default BroadcastEngine;