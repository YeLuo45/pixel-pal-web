/**
 * API Gateway
 * chatdev-design API Gateway - AddRoute + Handle + Stats
 */

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface Route {
  method: HTTPMethod;
  path: string;
  handler: (...args: unknown[]) => unknown;
  rateLimit?: number;
  enabled: boolean;
  callCount: number;
  created: number;
}

export interface GatewayStats {
  routes: number;
  requests: number;
  cacheHits: number;
  cacheMisses: number;
  rateLimited: number;
}

export class APIGateway {
  private routes: Map<string, Route> = new Map();
  private cache: Map<string, unknown> = new Map();
  private rateLimitCounters: Map<string, number> = new Map();
  private requests = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private rateLimited = 0;

  addRoute(method: HTTPMethod, path: string, handler: Route['handler'], options: { rateLimit?: number; enabled?: boolean } = {}): boolean {
    const key = this.getKey(method, path);
    if (this.routes.has(key)) return false;
    this.routes.set(key, {
      method,
      path,
      handler,
      rateLimit: options.rateLimit,
      enabled: options.enabled ?? true,
      callCount: 0,
      created: Date.now(),
    });
    return true;
  }

  handle(method: HTTPMethod, path: string, useCache: boolean = true, ...args: unknown[]): unknown {
    this.requests++;
    const key = this.getKey(method, path);
    const route = this.routes.get(key);
    if (!route || !route.enabled) return undefined;

    // Rate limit check
    if (route.rateLimit !== undefined) {
      const count = this.rateLimitCounters.get(key) ?? 0;
      if (count >= route.rateLimit) {
        this.rateLimited++;
        return undefined;
      }
      this.rateLimitCounters.set(key, count + 1);
    }

    if (useCache && this.cache.has(key)) {
      this.cacheHits++;
      return this.cache.get(key);
    }

    this.cacheMisses++;
    route.callCount++;
    const result = route.handler(...args);
    this.cache.set(key, result);
    return result;
  }

  getStats(): GatewayStats {
    return {
      routes: this.routes.size,
      requests: this.requests,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      rateLimited: this.rateLimited,
    };
  }

  getRoute(method: HTTPMethod, path: string): Route | undefined {
    return this.routes.get(this.getKey(method, path));
  }

  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  removeRoute(method: HTTPMethod, path: string): boolean {
    return this.routes.delete(this.getKey(method, path));
  }

  hasRoute(method: HTTPMethod, path: string): boolean {
    return this.routes.has(this.getKey(method, path));
  }

  getCount(): number {
    return this.routes.size;
  }

  getPath(method: HTTPMethod, path: string): string | undefined {
    return this.routes.get(this.getKey(method, path))?.path;
  }

  getMethod(method: HTTPMethod, path: string): HTTPMethod | undefined {
    return this.routes.get(this.getKey(method, path))?.method;
  }

  getCallCount(method: HTTPMethod, path: string): number {
    return this.routes.get(this.getKey(method, path))?.callCount ?? 0;
  }

  isEnabled(method: HTTPMethod, path: string): boolean {
    return this.routes.get(this.getKey(method, path))?.enabled ?? false;
  }

  setEnabled(method: HTTPMethod, path: string, enabled: boolean): boolean {
    const route = this.routes.get(this.getKey(method, path));
    if (!route) return false;
    route.enabled = enabled;
    return true;
  }

  setRateLimit(method: HTTPMethod, path: string, limit: number): boolean {
    const route = this.routes.get(this.getKey(method, path));
    if (!route) return false;
    route.rateLimit = limit;
    return true;
  }

  getRateLimit(method: HTTPMethod, path: string): number | undefined {
    return this.routes.get(this.getKey(method, path))?.rateLimit;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForRoute(method: HTTPMethod, path: string): void {
    this.cache.delete(this.getKey(method, path));
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getRateLimitCount(method: HTTPMethod, path: string): number {
    return this.rateLimitCounters.get(this.getKey(method, path)) ?? 0;
  }

  getRoutesByMethod(method: HTTPMethod): Route[] {
    return Array.from(this.routes.values()).filter(r => r.method === method);
  }

  getCreatedAt(method: HTTPMethod, path: string): number {
    return this.routes.get(this.getKey(method, path))?.created ?? 0;
  }

  clearAll(): void {
    this.routes.clear();
    this.cache.clear();
    this.rateLimitCounters.clear();
    this.requests = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.rateLimited = 0;
  }

  private getKey(method: string, path: string): string {
    return `${method.toUpperCase()}:${path}`;
  }
}

export default APIGateway;