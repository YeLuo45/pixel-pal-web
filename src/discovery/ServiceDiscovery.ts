/**
 * Service Discovery
 * nanobot-design Service Discovery - Registration + Health + Discovery + Load Balancing
 */

export interface ServiceInstance {
  id: string;
  name: string;
  url: string;
  healthy: boolean;
  load: number;
  lastHeartbeat: number;
}

export class ServiceDiscovery {
  private services: Map<string, ServiceInstance[]> = new Map();
  private instanceById: Map<string, ServiceInstance> = new Map();

  register(instance: ServiceInstance): void {
    if (!this.services.has(instance.name)) {
      this.services.set(instance.name, []);
    }
    this.services.get(instance.name)!.push({ ...instance });
    this.instanceById.set(instance.id, { ...instance });
  }

  deregister(id: string): boolean {
    const instance = this.instanceById.get(id);
    if (!instance) return false;

    const list = this.services.get(instance.name);
    if (list) {
      const idx = list.findIndex(i => i.id === id);
      if (idx !== -1) list.splice(idx, 1);
      if (list.length === 0) this.services.delete(instance.name);
    }
    return this.instanceById.delete(id);
  }

  discover(name: string): ServiceInstance[] {
    return [...(this.services.get(name) ?? [])];
  }

  heartbeat(id: string): boolean {
    const instance = this.instanceById.get(id);
    if (!instance) return false;
    instance.lastHeartbeat = Date.now();
    instance.healthy = true;
    return true;
  }

  select(name: string): ServiceInstance | null {
    const instances = this.discover(name);
    const healthy = instances.filter(i => i.healthy);
    if (healthy.length === 0) return null;
    // Round-robin-ish: pick least loaded
    return healthy.reduce((best, curr) => curr.load < best.load ? curr : best);
  }

  cleanup(maxAge: number): number {
    const now = Date.now();
    let removed = 0;
    const toRemove: string[] = [];

    for (const [id, inst] of this.instanceById.entries()) {
      if (now - inst.lastHeartbeat > maxAge) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      if (this.deregister(id)) removed++;
    }
    return removed;
  }

  getServiceCount(): number {
    return this.services.size;
  }

  getInstanceCount(): number {
    return this.instanceById.size;
  }

  getAllNames(): string[] {
    return [...this.services.keys()];
  }

  getById(id: string): ServiceInstance | undefined {
    return this.instanceById.get(id);
  }

  isHealthy(id: string): boolean {
    const inst = this.instanceById.get(id);
    return inst?.healthy ?? false;
  }

  markUnhealthy(id: string): boolean {
    const inst = this.instanceById.get(id);
    if (!inst) return false;
    inst.healthy = false;
    // Sync with services list
    const list = this.services.get(inst.name);
    if (list) {
      const item = list.find(i => i.id === id);
      if (item) item.healthy = false;
    }
    return true;
  }

  updateLoad(id: string, load: number): boolean {
    const inst = this.instanceById.get(id);
    if (!inst) return false;
    inst.load = Math.max(0, Math.min(1, load));
    return true;
  }

  getHealthyInstances(name: string): ServiceInstance[] {
    return this.discover(name).filter(i => i.healthy);
  }

  getAverageLoad(name: string): number {
    const list = this.discover(name);
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, i) => acc + i.load, 0);
    return Math.round(sum / list.length * 100) / 100;
  }

  hasService(name: string): boolean {
    return this.services.has(name) && (this.services.get(name)?.length ?? 0) > 0;
  }

  clearAll(): void {
    this.services.clear();
    this.instanceById.clear();
  }
}

export default ServiceDiscovery;