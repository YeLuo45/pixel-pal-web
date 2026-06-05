/**
 * Service Registry
 * nanobot-design Service Registry - Register + Find + SetHealth + SetVersion
 */

export interface Service {
  id: string;
  name: string;
  url: string;
  version: string;
  healthy: boolean;
  metadata: Record<string, string>;
  created: number;
  updated: number;
}

export class ServiceRegistry {
  private services: Map<string, Service> = new Map();
  private nameIndex: Map<string, Set<string>> = new Map();
  private counter = 0;

  register(service: Omit<Service, 'id' | 'healthy' | 'created' | 'updated'>): string {
    const id = `svc-${++this.counter}`;
    const now = Date.now();
    this.services.set(id, {
      ...service,
      id,
      metadata: { ...service.metadata },
      healthy: true,
      created: now,
      updated: now,
    });
    if (!this.nameIndex.has(service.name)) this.nameIndex.set(service.name, new Set());
    this.nameIndex.get(service.name)!.add(id);
    return id;
  }

  unregister(id: string): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    this.nameIndex.get(service.name)?.delete(id);
    return this.services.delete(id);
  }

  find(name: string): Service | null {
    const ids = this.nameIndex.get(name);
    if (!ids || ids.size === 0) return null;
    return this.services.get([...ids][0]) ?? null;
  }

  setHealth(id: string, healthy: boolean): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    service.healthy = healthy;
    service.updated = Date.now();
    return true;
  }

  setVersion(id: string, version: string): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    service.version = version;
    service.updated = Date.now();
    return true;
  }

  listByVersion(version: string): Service[] {
    return Array.from(this.services.values()).filter(s => s.version === version);
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

  getUrl(id: string): string | undefined {
    return this.services.get(id)?.url;
  }

  getVersion(id: string): string | undefined {
    return this.services.get(id)?.version;
  }

  isHealthy(id: string): boolean {
    return this.services.get(id)?.healthy ?? false;
  }

  getMetadata(id: string): Record<string, string> {
    return { ...(this.services.get(id)?.metadata ?? {}) };
  }

  setMetadata(id: string, key: string, value: string): boolean {
    const service = this.services.get(id);
    if (!service) return false;
    service.metadata[key] = value;
    service.updated = Date.now();
    return true;
  }

  getMetadataValue(id: string, key: string): string | undefined {
    return this.services.get(id)?.metadata[key];
  }

  getHealthy(): Service[] {
    return Array.from(this.services.values()).filter(s => s.healthy);
  }

  getUnhealthy(): Service[] {
    return Array.from(this.services.values()).filter(s => !s.healthy);
  }

  findAll(name: string): Service[] {
    const ids = this.nameIndex.get(name);
    if (!ids) return [];
    return Array.from(ids).map(id => this.services.get(id)!).filter(Boolean);
  }

  getByVersion(version: string): Service[] {
    return this.listByVersion(version);
  }

  getVersions(): string[] {
    return [...new Set(Array.from(this.services.values()).map(s => s.version))];
  }

  getNameIndex(): string[] {
    return [...this.nameIndex.keys()];
  }

  getNameCount(): string[] {
    return [...this.nameIndex.keys()];
  }

  getNameSet(): string[] {
    return [...this.nameIndex.keys()];
  }

  getCreatedAt(id: string): number {
    return this.services.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.services.get(id)?.updated ?? 0;
  }

  getHealthyCount(): number {
    return this.getHealthy().length;
  }

  getUnhealthyCount(): number {
    return this.getUnhealthy().length;
  }

  getHealthRatio(): number {
    if (this.services.size === 0) return 0;
    return Math.round((this.getHealthyCount() / this.services.size) * 100) / 100;
  }

  clearAll(): void {
    this.services.clear();
    this.nameIndex.clear();
    this.counter = 0;
  }
}

export default ServiceRegistry;