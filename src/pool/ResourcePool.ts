/**
 * Resource Pool
 * nanobot-design Resource Pool - Acquire + Release + Monitor + Stats
 */

export interface Resource {
  id: string;
  type: string;
  inUse: boolean;
}

export interface PoolStats {
  total: number;
  inUse: number;
  available: number;
  byType: Record<string, { total: number; inUse: number; available: number }>;
}

export class ResourcePool {
  private resources: Map<string, Resource> = new Map();
  private acquireCount = 0;
  private releaseCount = 0;

  addResource(resource: Resource): void {
    this.resources.set(resource.id, { ...resource });
  }

  acquire(type: string): Resource | null {
    const available = Array.from(this.resources.values()).find(r => r.type === type && !r.inUse);
    if (!available) return null;
    available.inUse = true;
    this.acquireCount++;
    return { ...available };
  }

  release(id: string): boolean {
    const resource = this.resources.get(id);
    if (!resource) return false;
    if (!resource.inUse) return false;
    resource.inUse = false;
    this.releaseCount++;
    return true;
  }

  getStats(): PoolStats {
    const all = Array.from(this.resources.values());
    const inUse = all.filter(r => r.inUse).length;
    const byType: Record<string, { total: number; inUse: number; available: number }> = {};

    for (const r of all) {
      if (!byType[r.type]) {
        byType[r.type] = { total: 0, inUse: 0, available: 0 };
      }
      byType[r.type].total++;
      if (r.inUse) byType[r.type].inUse++;
      else byType[r.type].available++;
    }

    return {
      total: all.length,
      inUse,
      available: all.length - inUse,
      byType,
    };
  }

  getUtilization(): number {
    const stats = this.getStats();
    if (stats.total === 0) return 0;
    return Math.round((stats.inUse / stats.total) * 100) / 100;
  }

  getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  getResourcesByType(type: string): Resource[] {
    return Array.from(this.resources.values()).filter(r => r.type === type);
  }

  getAvailableResources(type?: string): Resource[] {
    const all = Array.from(this.resources.values()).filter(r => !r.inUse);
    return type ? all.filter(r => r.type === type) : all;
  }

  getInUseResources(type?: string): Resource[] {
    const all = Array.from(this.resources.values()).filter(r => r.inUse);
    return type ? all.filter(r => r.type === type) : all;
  }

  getResourceCount(): number {
    return this.resources.size;
  }

  hasResource(id: string): boolean {
    return this.resources.has(id);
  }

  removeResource(id: string): boolean {
    return this.resources.delete(id);
  }

  getTypeCount(type: string): number {
    return this.getResourcesByType(type).length;
  }

  getAvailableCount(type: string): number {
    return this.getAvailableResources(type).length;
  }

  getInUseCount(type: string): number {
    return this.getInUseResources(type).length;
  }

  getAllTypes(): string[] {
    return [...new Set(Array.from(this.resources.values()).map(r => r.type))];
  }

  getTypeUtilization(type: string): number {
    const total = this.getTypeCount(type);
    if (total === 0) return 0;
    return Math.round((this.getInUseCount(type) / total) * 100) / 100;
  }

  getAcquireCount(): number {
    return this.acquireCount;
  }

  getReleaseCount(): number {
    return this.releaseCount;
  }

  resetCounters(): void {
    this.acquireCount = 0;
    this.releaseCount = 0;
  }

  isExhausted(type: string): boolean {
    return this.getAvailableCount(type) === 0;
  }

  clearAll(): void {
    this.resources.clear();
    this.acquireCount = 0;
    this.releaseCount = 0;
  }
}

export default ResourcePool;