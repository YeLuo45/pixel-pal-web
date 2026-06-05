/**
 * Discovery Service
 * nanobot-design Discovery Service - Register + Discover + Health + Announce
 */

export interface ServiceEntry {
  id: string;
  name: string;
  url: string;
  healthy: boolean;
  registered: number;
  lastCheck: number;
  metadata: Record<string, string>;
}

export class DiscoveryService {
  private services: Map<string, ServiceEntry> = new Map();
  private nameIndex: Map<string, Set<string>> = new Map();

  register(entry: ServiceEntry): void {
    this.services.set(entry.id, { ...entry, metadata: { ...entry.metadata } });
    if (!this.nameIndex.has(entry.name)) this.nameIndex.set(entry.name, new Set());
    this.nameIndex.get(entry.name)!.add(entry.id);
  }

  discover(name: string): ServiceEntry[] {
    const ids = this.nameIndex.get(name) ?? new Set();
    return Array.from(ids).map(id => this.services.get(id)!).filter(Boolean);
  }

  checkHealth(id: string): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    service.lastCheck = Date.now();
    return service.healthy;
  }

  announce(): ServiceEntry[] {
    return Array.from(this.services.values()).filter(s => s.healthy);
  }

  getService(id: string): ServiceEntry | undefined {
    return this.services.get(id);
  }

  getAllServices(): ServiceEntry[] {
    return Array.from(this.services.values());
  }

  removeService(id: string): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    this.nameIndex.get(service.name)?.delete(id);
    return this.services.delete(id);
  }

  hasService(id: string): boolean {
    return this.services.has(id);
  }

  getCount(): number {
    return this.services.size;
  }

  setHealthy(id: string, healthy: boolean): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    service.healthy = healthy;
    return true;
  }

  getHealthy(): ServiceEntry[] {
    return Array.from(this.services.values()).filter(s => s.healthy);
  }

  getUnhealthy(): ServiceEntry[] {
    return Array.from(this.services.values()).filter(s => !s.healthy);
  }

  getByUrl(url: string): ServiceEntry[] {
    return Array.from(this.services.values()).filter(s => s.url === url);
  }

  getAllNames(): string[] {
    return [...this.nameIndex.keys()];
  }

  getNameCount(): number {
    return this.nameIndex.size;
  }

  setMetadata(id: string, key: string, value: string): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    service.metadata[key] = value;
    return true;
  }

  getMetadata(id: string, key: string): string | undefined {
    return this.services.get(id)?.metadata[key];
  }

  getLastCheck(id: string): number {
    return this.services.get(id)?.lastCheck ?? 0;
  }

  getByRegisteredAfter(timestamp: number): ServiceEntry[] {
    return Array.from(this.services.values()).filter(s => s.registered > timestamp);
  }

  getTotalCount(): number {
    return this.services.size;
  }

  clearAll(): void {
    this.services.clear();
    this.nameIndex.clear();
  }
}

export default DiscoveryService;