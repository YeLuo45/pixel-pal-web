/**
 * Shard Manager
 * nanobot-design Shard Manager - CreateShard + Assign + Query + Migrate
 */

export interface Shard {
  id: string;
  name: string;
  size: number;
  keys: string[];
  active: boolean;
  created: number;
}

export interface ShardStats {
  shards: number;
  totalKeys: number;
  active: number;
  inactive: number;
  avgKeys: number;
}

export class ShardManager {
  private shards: Map<string, Shard> = new Map();
  private keyIndex: Map<string, string> = new Map();
  private counter = 0;

  createShard(name: string): string {
    const id = `shard-${++this.counter}`;
    this.shards.set(id, {
      id,
      name,
      size: 0,
      keys: [],
      active: true,
      created: Date.now(),
    });
    return id;
  }

  assign(shardId: string, key: string): boolean {
    const shard = this.shards.get(shardId);
    if (!shard) return false;
    if (!shard.keys.includes(key)) {
      shard.keys.push(key);
      shard.size = shard.keys.length;
    }
    this.keyIndex.set(key, shardId);
    return true;
  }

  query(key: string): Shard | null {
    const shardId = this.keyIndex.get(key);
    if (!shardId) return null;
    return this.shards.get(shardId) ?? null;
  }

  migrate(fromShard: string, toShard: string, key: string): boolean {
    const from = this.shards.get(fromShard);
    const to = this.shards.get(toShard);
    if (!from || !to) return false;
    const idx = from.keys.indexOf(key);
    if (idx === -1) return false;
    from.keys.splice(idx, 1);
    from.size = from.keys.length;
    to.keys.push(key);
    to.size = to.keys.length;
    this.keyIndex.set(key, toShard);
    return true;
  }

  getStats(): ShardStats {
    const all = Array.from(this.shards.values());
    const totalKeys = all.reduce((sum, s) => sum + s.keys.length, 0);
    return {
      shards: all.length,
      totalKeys,
      active: all.filter(s => s.active).length,
      inactive: all.filter(s => !s.active).length,
      avgKeys: all.length > 0 ? Math.round((totalKeys / all.length) * 100) / 100 : 0,
    };
  }

  getShard(id: string): Shard | undefined {
    return this.shards.get(id);
  }

  getAllShards(): Shard[] {
    return Array.from(this.shards.values());
  }

  removeShard(id: string): boolean {
    const shard = this.shards.get(id);
    if (!shard) return false;
    for (const key of shard.keys) {
      this.keyIndex.delete(key);
    }
    return this.shards.delete(id);
  }

  hasShard(id: string): boolean {
    return this.shards.has(id);
  }

  getCount(): number {
    return this.shards.size;
  }

  getName(id: string): string | undefined {
    return this.shards.get(id)?.name;
  }

  getKeys(shardId: string): string[] {
    return [...(this.shards.get(shardId)?.keys ?? [])];
  }

  getKeyCount(shardId: string): number {
    return this.shards.get(shardId)?.keys.length ?? 0;
  }

  getSize(shardId: string): number {
    return this.shards.get(shardId)?.size ?? 0;
  }

  isActive(id: string): boolean {
    return this.shards.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const shard = this.shards.get(id);
    if (!shard) return false;
    shard.active = active;
    return true;
  }

  removeKey(shardId: string, key: string): boolean {
    const shard = this.shards.get(shardId);
    if (!shard) return false;
    const idx = shard.keys.indexOf(key);
    if (idx === -1) return false;
    shard.keys.splice(idx, 1);
    shard.size = shard.keys.length;
    this.keyIndex.delete(key);
    return true;
  }

  hasKey(key: string): boolean {
    return this.keyIndex.has(key);
  }

  getShardForKey(key: string): string | null {
    return this.keyIndex.get(key) ?? null;
  }

  getActive(): Shard[] {
    return Array.from(this.shards.values()).filter(s => s.active);
  }

  getInactive(): Shard[] {
    return Array.from(this.shards.values()).filter(s => !s.active);
  }

  getCreatedAt(id: string): number {
    return this.shards.get(id)?.created ?? 0;
  }

  getLargestShard(): Shard | null {
    const all = Array.from(this.shards.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.keys.length > max.keys.length ? s : max);
  }

  getSmallestShard(): Shard | null {
    const all = Array.from(this.shards.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.keys.length < min.keys.length ? s : min);
  }

  clearAll(): void {
    this.shards.clear();
    this.keyIndex.clear();
    this.counter = 0;
  }
}

export default ShardManager;