/**
 * Resource Manager
 * thunderbolt-design Resource Manager - Add + Allocate + Release + Stats
 */

export interface Resource {
  id: string;
  name: string;
  capacity: number;
  used: number;
  created: number;
  totalAllocated: number;
  totalReleased: number;
}

export interface RMStats {
  total: number;
  used: number;
  available: number;
  utilization: number;
  resources: number;
  totalCapacity: number;
}

export class ResourceManager {
  private resources: Map<string, Resource> = new Map();
  private counter = 0;

  add(name: string, capacity: number): string {
    const id = `rm-${++this.counter}`;
    this.resources.set(id, {
      id,
      name,
      capacity,
      used: 0,
      created: Date.now(),
      totalAllocated: 0,
      totalReleased: 0,
    });
    return id;
  }

  allocate(id: string, amount: number): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    if (r.used + amount > r.capacity) return false;
    r.used += amount;
    r.totalAllocated += amount;
    return true;
  }

  release(id: string, amount: number): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    if (r.used < amount) return false;
    r.used -= amount;
    r.totalReleased += amount;
    return true;
  }

  getStats(): RMStats {
    const all = Array.from(this.resources.values());
    const total = all.reduce((s, r) => s + r.capacity, 0);
    const used = all.reduce((s, r) => s + r.used, 0);
    return {
      total,
      used,
      available: total - used,
      utilization: total > 0 ? Math.round((used / total) * 100) / 100 : 0,
      resources: all.length,
      totalCapacity: total,
    };
  }

  getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  getAllResources(): Resource[] {
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

  getName(id: string): string | undefined {
    return this.resources.get(id)?.name;
  }

  getCapacity(id: string): number {
    return this.resources.get(id)?.capacity ?? 0;
  }

  getUsed(id: string): number {
    return this.resources.get(id)?.used ?? 0;
  }

  getAvailable(id: string): number {
    const r = this.resources.get(id);
    return r ? r.capacity - r.used : 0;
  }

  getUtilization(id: string): number {
    const r = this.resources.get(id);
    if (!r || r.capacity === 0) return 0;
    return Math.round((r.used / r.capacity) * 100) / 100;
  }

  getTotalAllocated(id: string): number {
    return this.resources.get(id)?.totalAllocated ?? 0;
  }

  getTotalReleased(id: string): number {
    return this.resources.get(id)?.totalReleased ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.resources.get(id)?.created ?? 0;
  }

  setCapacity(id: string, capacity: number): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.capacity = capacity;
    return true;
  }

  setName(id: string, name: string): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.name = name;
    return true;
  }

  resetAll(): void {
    for (const r of this.resources.values()) {
      r.used = 0;
      r.totalAllocated = 0;
      r.totalReleased = 0;
    }
  }

  getByName(name: string): Resource[] {
    return Array.from(this.resources.values()).filter(r => r.name === name);
  }

  getByMinCapacity(min: number): Resource[] {
    return Array.from(this.resources.values()).filter(r => r.capacity >= min);
  }

  getByMinUtilization(min: number): Resource[] {
    return Array.from(this.resources.values()).filter(r => this.getUtilization(r.id) >= min);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.resources.values()).map(r => r.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getMostUsed(): Resource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.used > max.used ? r : max);
  }

  getMostAvailable(): Resource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => (r.capacity - r.used) > (max.capacity - max.used) ? r : max);
  }

  getHighestUtilization(): Resource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => this.getUtilization(r.id) > this.getUtilization(max.id) ? r : max);
  }

  clearAll(): void {
    this.resources.clear();
    this.counter = 0;
  }
}

export default ResourceManager;