/**
 * Resource Allocator
 * thunderbolt-design Resource Allocator - Add + Request + Execute + Stats
 */

export interface Resource {
  id: string;
  name: string;
  capacity: number;
  used: number;
  created: number;
  updated: number;
  active: boolean;
}

export type AllocStatus = 'pending' | 'allocated' | 'denied';

export interface Allocation {
  id: string;
  resourceId: string;
  resource: string;
  requester: string;
  amount: number;
  status: AllocStatus;
  created: number;
  updated: number;
  attempts: number;
  active: boolean;
}

export interface RAStats {
  resources: number;
  allocations: number;
  pending: number;
  allocated: number;
  denied: number;
  totalAmount: number;
  totalCapacity: number;
  utilizationRate: number;
  active: number;
  inactive: number;
}

export class ResourceAllocator {
  private resources: Map<string, Resource> = new Map();
  private allocations: Map<string, Allocation> = new Map();
  private resCounter = 0;
  private allocCounter = 0;

  add(resource: string, capacity: number): string {
    const id = `ra-r-${++this.resCounter}`;
    this.resources.set(id, {
      id,
      name: resource,
      capacity,
      used: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
    });
    return id;
  }

  request(resourceId: string, requester: string, amount: number): string {
    const id = `ra-a-${++this.allocCounter}`;
    const res = this.resources.get(resourceId);
    this.allocations.set(id, {
      id,
      resourceId,
      resource: res?.name ?? 'unknown',
      requester,
      amount,
      status: 'pending',
      created: Date.now(),
      updated: Date.now(),
      attempts: 0,
      active: true,
    });
    return id;
  }

  execute(id: string): boolean {
    const a = this.allocations.get(id);
    if (!a) return false;
    if (!a.active) return false;
    if (a.status !== 'pending') return false;
    const r = this.resources.get(a.resourceId);
    if (!r) {
      a.status = 'denied';
      a.attempts++;
      a.updated = Date.now();
      return false;
    }
    if (r.used + a.amount > r.capacity) {
      a.status = 'denied';
      a.attempts++;
      a.updated = Date.now();
      return false;
    }
    r.used += a.amount;
    r.updated = Date.now();
    a.status = 'allocated';
    a.attempts++;
    a.updated = Date.now();
    return true;
  }

  release(allocationId: string): boolean {
    const a = this.allocations.get(allocationId);
    if (!a) return false;
    if (a.status !== 'allocated') return false;
    const r = this.resources.get(a.resourceId);
    if (r) {
      r.used -= a.amount;
      r.updated = Date.now();
    }
    a.status = 'pending';
    a.updated = Date.now();
    return true;
  }

  getStats(): RAStats {
    const allRes = Array.from(this.resources.values());
    const allAlloc = Array.from(this.allocations.values());
    const totalCapacity = allRes.reduce((s, r) => s + r.capacity, 0);
    const totalUsed = allRes.reduce((s, r) => s + r.used, 0);
    return {
      resources: allRes.length,
      allocations: allAlloc.length,
      pending: allAlloc.filter(a => a.status === 'pending').length,
      allocated: allAlloc.filter(a => a.status === 'allocated').length,
      denied: allAlloc.filter(a => a.status === 'denied').length,
      totalAmount: allAlloc.reduce((s, a) => s + a.amount, 0),
      totalCapacity,
      utilizationRate: totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) / 100 : 0,
      active: allRes.filter(r => r.active).length,
      inactive: allRes.filter(r => !r.active).length,
    };
  }

  getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  getAllocation(id: string): Allocation | undefined {
    return this.allocations.get(id);
  }

  getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  getAllAllocations(): Allocation[] {
    return Array.from(this.allocations.values());
  }

  removeResource(id: string): boolean {
    return this.resources.delete(id);
  }

  removeAllocation(id: string): boolean {
    return this.allocations.delete(id);
  }

  hasResource(id: string): boolean {
    return this.resources.has(id);
  }

  hasAllocation(id: string): boolean {
    return this.allocations.has(id);
  }

  getResourceCount(): number {
    return this.resources.size;
  }

  getAllocationCount(): number {
    return this.allocations.size;
  }

  getResourceName(id: string): string | undefined {
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

  getRequester(id: string): string | undefined {
    return this.allocations.get(id)?.requester;
  }

  getAmount(id: string): number {
    return this.allocations.get(id)?.amount ?? 0;
  }

  getStatus(id: string): AllocStatus | undefined {
    return this.allocations.get(id)?.status;
  }

  getAttempts(id: string): number {
    return this.allocations.get(id)?.attempts ?? 0;
  }

  isResourceActive(id: string): boolean {
    return this.resources.get(id)?.active ?? false;
  }

  isAllocActive(id: string): boolean {
    return this.allocations.get(id)?.active ?? false;
  }

  isPending(id: string): boolean {
    return this.allocations.get(id)?.status === 'pending';
  }

  isAllocated(id: string): boolean {
    return this.allocations.get(id)?.status === 'allocated';
  }

  isDenied(id: string): boolean {
    return this.allocations.get(id)?.status === 'denied';
  }

  setResourceActive(id: string, active: boolean): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.active = active;
    r.updated = Date.now();
    return true;
  }

  setAllocActive(id: string, active: boolean): boolean {
    const a = this.allocations.get(id);
    if (!a) return false;
    a.active = active;
    a.updated = Date.now();
    return true;
  }

  setCapacity(id: string, capacity: number): boolean {
    const r = this.resources.get(id);
    if (!r) return false;
    r.capacity = capacity;
    r.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const r of this.resources.values()) {
      r.used = 0;
      r.active = true;
    }
    for (const a of this.allocations.values()) {
      a.status = 'pending';
      a.attempts = 0;
      a.active = true;
    }
  }

  getByRequester(requester: string): Allocation[] {
    return Array.from(this.allocations.values()).filter(a => a.requester === requester);
  }

  getByStatus(status: AllocStatus): Allocation[] {
    return Array.from(this.allocations.values()).filter(a => a.status === status);
  }

  getByResource(resourceId: string): Allocation[] {
    return Array.from(this.allocations.values()).filter(a => a.resourceId === resourceId);
  }

  getActiveResources(): Resource[] {
    return Array.from(this.resources.values()).filter(r => r.active);
  }

  getInactiveResources(): Resource[] {
    return Array.from(this.resources.values()).filter(r => !r.active);
  }

  getAllResourceNames(): string[] {
    return [...new Set(Array.from(this.resources.values()).map(r => r.name))];
  }

  getResourceNameCount(): number {
    return this.getAllResourceNames().length;
  }

  getAllRequesters(): string[] {
    return [...new Set(Array.from(this.allocations.values()).map(a => a.requester))];
  }

  getRequesterCount(): number {
    return this.getAllRequesters().length;
  }

  getNewestResource(): Resource | null {
    const all = Array.from(this.resources.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getNewestAllocation(): Allocation | null {
    const all = Array.from(this.allocations.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  clearAll(): void {
    this.resources.clear();
    this.allocations.clear();
    this.resCounter = 0;
    this.allocCounter = 0;
  }
}

export default ResourceAllocator;