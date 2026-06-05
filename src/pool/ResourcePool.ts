/**
 * Resource Pool
 * nanobot-design Resource Pool - Add + Acquire + Release + Stats
 */

export interface PoolResource {
  id: string;
  type: string;
  inUse: boolean;
  acquired: number;
  released: number;
  acquiredAt: number;
  created: number;
}

export interface PoolStats {
  total: number;
  available: number;
  inUse: number;
  types: number;
  totalAcquires: number;
  totalReleases: number;
}

export class ResourcePool {
  private resources: Map<string, PoolResource> = new Map();
  private counter = 0;

  add(type: string, count: number): boolean {
    for (let i = 0; i < count; i++) {
      const id = `res-${++this.counter}`;
      this.resources.set(id, {
        id,
        type,
        inUse: false,
        acquired: 0,
        released: 0,
        acquiredAt: 0,
        created: Date.now(),
      });
    }
    return true;
  }

  acquire(type: string): string | null {
    for (const r of this.resources.values()) {
      if (r.type === type && !r.inUse) {
        r.inUse = true;
        r.acquired++;
        r.acquiredAt = Date.now();
        return r.id;
      }
    }
    return null;
  }

  release(id: string): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    if (!r.inUse) return false;
    r.inUse = false;
    r.released++;
    r.acquiredAt = 0;
    return true;
  }

  getStats(): PoolStats {
    const all = Array.from(this.resources.values());
    const types = new Set(all.map(r => r.type));
    return {
      total: all.length,
      available: all.filter(r => !r.inUse).length,
      inUse: all.filter(r => r.inUse).length,
      types: types.size,
      totalAcquires: all.reduce((s, r) => s + r.acquired, 0),
      totalReleases: all.reduce((s, r) => s + r.released, 0),
    };
  }

  getResource(id: string): PoolResource | undefined {
    return this.resources.get(id);
  }

  getAllResources(): PoolResource[] {
    return Array.from(this.resources.values());
  }

  removeResource(id: string): boolean {
    return this.resources.delete(id);
  }

  hasResource(id: string): boolean {
    return this.resources.has(id);
  }

  getCount(): number {
    return this.resources.size;
  }

  getType(id: string): string | undefined {
    return this.resources.get(id)?.type;
  }

  isInUse(id: string): boolean {
    return this.resources.get(id)?.inUse ?? false;
  }

  isAvailable(id: string): boolean {
    const r = this.resources.get(id);
    return r !== undefined && !r.inUse;
  }

  getAcquired(id: string): number {
    return this.resources.get(id)?.acquired ?? 0;
  }

  getReleased(id: string): number {
    return this.resources.get(id)?.released ?? 0;
  }

  getAcquiredAt(id: string): number {
    return this.resources.get(id)?.acquiredAt ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.resources.get(id)?.created ?? 0;
  }

  getByType(type: string): PoolResource[] {
    return Array.from(this.resources.values()).filter(r => r.type === type);
  }

  getByTypeCount(type: string): number {
    return this.getByType(type).length;
  }

  getAvailable(type: string): PoolResource[] {
    return this.getByType(type).filter(r => !r.inUse);
  }

  getInUse(type: string): PoolResource[] {
    return this.getByType(type).filter(r => r.inUse);
  }

  getAvailableCount(type: string): number {
    return this.getAvailable(type).length;
  }

  getInUseCount(type: string): number {
    return this.getInUse(type).length;
  }

  getAllTypes(): string[] {
    return [...new Set(Array.from(this.resources.values()).map(r => r.type))];
  }

  getTypeCount(): number {
    return this.getAllTypes().length;
  }

  getMostUsed(): PoolResource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.acquired > max.acquired ? r : max);
  }

  getMostReleased(): PoolResource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.released > max.released ? r : max);
  }

  getOldest(): PoolResource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  getNewest(): PoolResource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  forceRelease(id: string): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.inUse = false;
    r.released++;
    return true;
  }

  forceReleaseAll(): number {
    let count = 0;
    for (const r of this.resources.values()) {
      if (r.inUse) {
        r.inUse = false;
        r.released++;
        count++;
      }
    }
    return count;
  }

  getUtilization(): number {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return 0;
    const inUse = all.filter(r => r.inUse).length;
    return Math.round((inUse / all.length) * 100) / 100;
  }

  clearAll(): void {
    this.resources.clear();
    this.counter = 0;
  }
}

export default ResourcePool;