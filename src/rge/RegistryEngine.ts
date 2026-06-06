/**
 * Registry Engine
 * nanobot-design Registry Engine - Register + Lookup + Resolve + Stats
 */

export type ServiceStatus = 'registered' | 'active' | 'deregistered';

export interface Service {
  id: string;
  name: string;
  address: string;
  port: number;
  status: ServiceStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface RgeStats {
  services: number;
  totalRegistered: number;
  totalDeregistered: number;
  registered: number;
  active: number;
  deregistered: number;
  enabled: number;
  disabled: number;
  totalHits: number;
  uniqueNames: number;
  uniqueAddresses: number;
  totalPorts: number;
  avgPort: number;
  maxPort: number;
  minPort: number;
}

export class RegistryEngine {
  private services: Map<string, Service> = new Map();
  private counter = 0;
  private totalRegistered = 0;
  private totalDeregistered = 0;

  register(name: string, address: string, port: number = 80): string {
    const id = `rge-${++this.counter}`;
    this.services.set(id, {
      id,
      name,
      address,
      port,
      status: 'registered',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalRegistered++;
    return id;
  }

  lookup(name: string): Service | undefined {
    for (const s of this.services.values()) {
      if (s.name === name && s.status !== 'deregistered' && s.active) {
        s.hits++;
        s.updated = Date.now();
        return s;
      }
    }
    return undefined;
  }

  resolve(id: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    if (s.status === 'deregistered') return false;
    if (!s.active) return false;
    s.hits++;
    s.updated = Date.now();
    return true;
  }

  deregister(id: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.status = 'deregistered';
    s.updated = Date.now();
    s.hits++;
    this.totalDeregistered++;
    return true;
  }

  remove(id: string): boolean {
    return this.services.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.active = active;
    s.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.name = name;
    s.updated = Date.now();
    return true;
  }

  setAddress(id: string, address: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.address = address;
    s.updated = Date.now();
    return true;
  }

  setPort(id: string, port: number): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.port = port;
    s.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const s of this.services.values()) {
      s.status = 'registered';
      s.active = true;
      s.hits = 0;
    }
    this.totalRegistered = 0;
    this.totalDeregistered = 0;
  }

  getStats(): RgeStats {
    const all = Array.from(this.services.values());
    const ports = all.map(s => s.port);
    return {
      services: all.length,
      totalRegistered: this.totalRegistered,
      totalDeregistered: this.totalDeregistered,
      registered: all.filter(s => s.status === 'registered').length,
      active: all.filter(s => s.status === 'active').length,
      deregistered: all.filter(s => s.status === 'deregistered').length,
      enabled: all.filter(s => s.active).length,
      disabled: all.filter(s => !s.active).length,
      totalHits: all.reduce((s2, x) => s2 + x.hits, 0),
      uniqueNames: new Set(all.map(s => s.name)).size,
      uniqueAddresses: new Set(all.map(s => s.address)).size,
      totalPorts: ports.reduce((s2, v) => s2 + v, 0),
      avgPort: all.length > 0 ? Math.round((ports.reduce((s2, v) => s2 + v, 0) / all.length) * 100) / 100 : 0,
      maxPort: ports.length > 0 ? Math.max(...ports) : 0,
      minPort: ports.length > 0 ? Math.min(...ports) : 0,
    };
  }

  getService(id: string): Service | undefined {
    return this.services.get(id);
  }

  getAllServices(): Service[] {
    return Array.from(this.services.values());
  }

  hasService(id: string): boolean {
    return this.services.has(id);
  }

  getCount(): number {
    return this.services.size;
  }

  getName(id: string): string | undefined {
    return this.services.get(id)?.name;
  }

  getAddress(id: string): string | undefined {
    return this.services.get(id)?.address;
  }

  getPort(id: string): number {
    return this.services.get(id)?.port ?? 0;
  }

  getStatus(id: string): ServiceStatus | undefined {
    return this.services.get(id)?.status;
  }

  getHits(id: string): number {
    return this.services.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.services.get(id)?.active ?? false;
  }

  isRegistered(id: string): boolean {
    return this.services.get(id)?.status === 'registered';
  }

  isDeregistered(id: string): boolean {
    return this.services.get(id)?.status === 'deregistered';
  }

  getByStatus(status: ServiceStatus): Service[] {
    return Array.from(this.services.values()).filter(s => s.status === status);
  }

  getByName(name: string): Service[] {
    return Array.from(this.services.values()).filter(s => s.name === name);
  }

  getByAddress(address: string): Service[] {
    return Array.from(this.services.values()).filter(s => s.address === address);
  }

  getActiveServices(): Service[] {
    return Array.from(this.services.values()).filter(s => s.active);
  }

  getInactiveServices(): Service[] {
    return Array.from(this.services.values()).filter(s => !s.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.services.values()).map(s => s.name))];
  }

  getAllAddresses(): string[] {
    return [...new Set(Array.from(this.services.values()).map(s => s.address))];
  }

  getNewest(): Service | null {
    const all = Array.from(this.services.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.created > max.created ? s : max);
  }

  getOldest(): Service | null {
    const all = Array.from(this.services.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getCreatedAt(id: string): number {
    return this.services.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.services.get(id)?.updated ?? 0;
  }

  getTotalRegistered(): number {
    return this.totalRegistered;
  }

  getTotalDeregistered(): number {
    return this.totalDeregistered;
  }

  clearAll(): void {
    this.services.clear();
    this.counter = 0;
    this.totalRegistered = 0;
    this.totalDeregistered = 0;
  }
}

export default RegistryEngine;