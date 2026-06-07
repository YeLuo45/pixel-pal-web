/**
 * Block Engine
 * chatdev-design Block Engine - Add + Block + Unblock + Stats
 */

export type BlockReason = 'spam' | 'abuse' | 'inappropriate' | 'other';

export interface BlockEntry {
  id: string;
  blocker: string;
  blocked: string;
  reason: BlockReason;
  hits: number;
  active: boolean;
  created: number;
  updated: number;
}

export interface BkeStats {
  blocks: number;
  totalAdded: number;
  totalBlocked: number;
  totalUnblocked: number;
  spam: number;
  abuse: number;
  inappropriate: number;
  other: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueBlockers: number;
  uniqueBlocked: number;
  avgHits: number;
  maxHits: number;
}

export class BlockEngine {
  private blocks: Map<string, BlockEntry> = new Map();
  private counter = 0;
  private totalAdded = 0;
  private totalBlocked = 0;
  private totalUnblocked = 0;

  add(blocker: string, blocked: string, reason: BlockReason): string {
    const id = `bke-${++this.counter}`;
    this.blocks.set(id, {
      id,
      blocker,
      blocked,
      reason,
      hits: 0,
      active: true,
      created: Date.now(),
      updated: Date.now(),
    });
    this.totalAdded++;
    return id;
  }

  block(id: string): boolean {
    const b = this.blocks.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.hits++;
    b.updated = Date.now();
    this.totalBlocked++;
    return true;
  }

  unblock(id: string): boolean {
    const b = this.blocks.get(id);
    if (!b) return false;
    if (!b.active) return false;
    b.hits++;
    b.updated = Date.now();
    this.totalUnblocked++;
    return true;
  }

  remove(id: string): boolean {
    return this.blocks.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const b = this.blocks.get(id);
    if (!b) return false;
    b.active = active;
    b.updated = Date.now();
    return true;
  }

  setBlocker(id: string, blocker: string): boolean {
    const b = this.blocks.get(id);
    if (!b) return false;
    b.blocker = blocker;
    b.updated = Date.now();
    return true;
  }

  setBlocked(id: string, blocked: string): boolean {
    const b = this.blocks.get(id);
    if (!b) return false;
    b.blocked = blocked;
    b.updated = Date.now();
    return true;
  }

  setReason(id: string, reason: BlockReason): boolean {
    const b = this.blocks.get(id);
    if (!b) return false;
    b.reason = reason;
    b.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const b of this.blocks.values()) {
      b.hits = 0;
      b.active = true;
    }
    this.totalAdded = 0;
    this.totalBlocked = 0;
    this.totalUnblocked = 0;
  }

  getStats(): BkeStats {
    const all = Array.from(this.blocks.values());
    const hArr = all.map(b => b.hits);
    return {
      blocks: all.length,
      totalAdded: this.totalAdded,
      totalBlocked: this.totalBlocked,
      totalUnblocked: this.totalUnblocked,
      spam: all.filter(b => b.reason === 'spam').length,
      abuse: all.filter(b => b.reason === 'abuse').length,
      inappropriate: all.filter(b => b.reason === 'inappropriate').length,
      other: all.filter(b => b.reason === 'other').length,
      active: all.filter(b => b.active).length,
      inactive: all.filter(b => !b.active).length,
      totalHits: all.reduce((s, b) => s + b.hits, 0),
      uniqueBlockers: new Set(all.map(b => b.blocker)).size,
      uniqueBlocked: new Set(all.map(b => b.blocked)).size,
      avgHits: all.length > 0 ? Math.round((hArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxHits: hArr.length > 0 ? Math.max(...hArr) : 0,
    };
  }

  getBlock(id: string): BlockEntry | undefined {
    return this.blocks.get(id);
  }

  getAllBlocks(): BlockEntry[] {
    return Array.from(this.blocks.values());
  }

  hasBlock(id: string): boolean {
    return this.blocks.has(id);
  }

  getCount(): number {
    return this.blocks.size;
  }

  getBlocker(id: string): string | undefined {
    return this.blocks.get(id)?.blocker;
  }

  getBlocked(id: string): string | undefined {
    return this.blocks.get(id)?.blocked;
  }

  getReason(id: string): BlockReason | undefined {
    return this.blocks.get(id)?.reason;
  }

  getHits(id: string): number {
    return this.blocks.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.blocks.get(id)?.active ?? false;
  }

  isSpam(id: string): boolean {
    return this.blocks.get(id)?.reason === 'spam';
  }

  isAbuse(id: string): boolean {
    return this.blocks.get(id)?.reason === 'abuse';
  }

  isInappropriate(id: string): boolean {
    return this.blocks.get(id)?.reason === 'inappropriate';
  }

  isOther(id: string): boolean {
    return this.blocks.get(id)?.reason === 'other';
  }

  getByReason(reason: BlockReason): BlockEntry[] {
    return Array.from(this.blocks.values()).filter(b => b.reason === reason);
  }

  getActiveBlocks(): BlockEntry[] {
    return Array.from(this.blocks.values()).filter(b => b.active);
  }

  getInactiveBlocks(): BlockEntry[] {
    return Array.from(this.blocks.values()).filter(b => !b.active);
  }

  getAllBlockers(): string[] {
    return [...new Set(Array.from(this.blocks.values()).map(b => b.blocker))];
  }

  getAllBlocked(): string[] {
    return [...new Set(Array.from(this.blocks.values()).map(b => b.blocked))];
  }

  getNewest(): BlockEntry | null {
    const all = Array.from(this.blocks.values());
    if (all.length === 0) return null;
    return all.reduce((max, b) => b.created > max.created ? b : max);
  }

  getOldest(): BlockEntry | null {
    const all = Array.from(this.blocks.values());
    if (all.length === 0) return null;
    return all.reduce((min, b) => b.created < min.created ? b : min);
  }

  getCreatedAt(id: string): number {
    return this.blocks.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.blocks.get(id)?.updated ?? 0;
  }

  getTotalAdded(): number {
    return this.totalAdded;
  }

  getTotalBlocked(): number {
    return this.totalBlocked;
  }

  getTotalUnblocked(): number {
    return this.totalUnblocked;
  }

  clearAll(): void {
    this.blocks.clear();
    this.counter = 0;
    this.totalAdded = 0;
    this.totalBlocked = 0;
    this.totalUnblocked = 0;
  }
}

export default BlockEngine;