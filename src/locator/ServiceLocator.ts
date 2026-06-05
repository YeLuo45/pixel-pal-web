/**
 * Service Locator
 * chatdev-design Service Locator - Register + Find + Resolve + Stats
 */

export interface Service {
  id: string;
  name: string;
  instance: unknown;
  dependencies: string[];
  created: number;
  resolved: number;
  cached: boolean;
}

export interface LocatorStats {
  services: number;
  resolutions: number;
  cacheHits: number;
  cacheMisses: number;
}

export class ServiceLocator {
  private services: Map<string, Service> = new Map();
  private resolutionCache: Map<string, unknown> = new Map();
  private resolutions = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  register(service: Omit<Service, 'created' | 'resolved' | 'cached'> & { cached?: boolean }): boolean {
    if (this.services.has(service.id)) return false;
    this.services.set(service.id, {
      ...service,
      created: Date.now(),
      resolved: 0,
      cached: service.cached ?? true,
    });
    return true;
  }

  find(id: string): Service | null {
    return this.services.get(id) ?? null;
  }

  resolve(id: string): unknown {
    this.resolutions++;
    const service = this.services.get(id);
    if (!service) {
      this.cacheMisses++;
      return null;
    }
    if (service.cached && this.resolutionCache.has(id)) {
      this.cacheHits++;
      service.resolved++;
      return this.resolutionCache.get(id);
    }
    this.cacheMisses++;
    service.resolved++;
    if (service.cached) this.resolutionCache.set(id, service.instance);
    return service.instance;
  }

  getStats(): LocatorStats {
    return {
      services: this.services.size,
      resolutions: this.resolutions,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
    };
  }

  getService(id: string): Service | undefined {
    return this.services.get(id);
  }

  getAllServices(): Service[] {
    return Array.from(this.services.values());
  }

  removeService(id: string): boolean {
    this.resolutionCache.delete(id);
    return this.services.delete(id);
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

  getInstance(id: string): unknown {
    return this.services.get(id)?.instance;
  }

  getDependencies(id: string): string[] {
    return [...(this.services.get(id)?.dependencies ?? [])];
  }

  hasDependency(id: string, dep: string): boolean {
    return this.services.get(id)?.dependencies.includes(dep) ?? false;
  }

  addDependency(id: string, dep: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    if (!s.dependencies.includes(dep)) s.dependencies.push(dep);
    return true;
  }

  removeDependency(id: string, dep: string): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    const idx = s.dependencies.indexOf(dep);
    if (idx === -1) return false;
    s.dependencies.splice(idx, 1);
    return true;
  }

  getResolvedCount(id: string): number {
    return this.services.get(id)?.resolved ?? 0;
  }

  isCached(id: string): boolean {
    return this.services.get(id)?.cached ?? false;
  }

  setCached(id: string, cached: boolean): boolean {
    const s = this.services.get(id);
    if (!s) return false;
    s.cached = cached;
    if (!cached) this.resolutionCache.delete(id);
    return true;
  }

  clearCache(): void {
    this.resolutionCache.clear();
  }

  getCachedIds(): string[] {
    return Array.from(this.resolutionCache.keys());
  }

  getResolutions(): number {
    return this.resolutions;
  }

  getCacheHits(): number {
    return this.cacheHits;
  }

  getCacheMisses(): number {
    return this.cacheMisses;
  }

  getCreatedAt(id: string): number {
    return this.services.get(id)?.created ?? 0;
  }

  getResolutionCount(): number {
    return this.resolutions;
  }

  getHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? Math.round((this.cacheHits / total) * 10000) / 10000 : 0;
  }

  getByDependency(dep: string): Service[] {
    return Array.from(this.services.values()).filter(s => s.dependencies.includes(dep));
  }

  getMostResolved(): Service | null {
    const all = Array.from(this.services.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.resolved > max.resolved ? s : max);
  }

  resetStats(): void {
    this.resolutions = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  clearAll(): void {
    this.services.clear();
    this.resolutionCache.clear();
    this.resolutions = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

export default ServiceLocator;