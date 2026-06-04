/**
 * API Gateway v2
 * thunderbolt-design API Gateway v2 - Route + Rate + Auth + Aggregate
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface Route {
  path: string;
  method: HttpMethod;
  handler: string;
  authRequired: boolean;
  rateLimit: number;
}

export interface RequestResult {
  status: number;
  body: string;
}

export interface GatewayMetrics {
  total: number;
  allowed: number;
  blocked: number;
  rateLimited: number;
  unauthorized: number;
  notFound: number;
}

export class ApiGatewayV2 {
  private routes: Route[] = [];
  private tokens: Set<string> = new Set();
  private requestCounts: Map<string, number> = new Map();
  private metrics: GatewayMetrics = {
    total: 0,
    allowed: 0,
    blocked: 0,
    rateLimited: 0,
    unauthorized: 0,
    notFound: 0,
  };

  registerRoute(route: Route): void {
    this.routes.push({ ...route });
  }

  request(method: string, path: string, token?: string): RequestResult {
    this.metrics.total++;
    const route = this.findRoute(method, path);

    if (!route) {
      this.metrics.notFound++;
      this.metrics.blocked++;
      return { status: 404, body: 'Not Found' };
    }

    // Auth check
    if (route.authRequired && !this.tokens.has(token ?? '')) {
      this.metrics.unauthorized++;
      this.metrics.blocked++;
      return { status: 401, body: 'Unauthorized' };
    }

    // Rate limit check
    const key = `${method}:${path}:${token ?? ''}`;
    const count = (this.requestCounts.get(key) ?? 0) + 1;
    this.requestCounts.set(key, count);

    if (count > route.rateLimit) {
      this.metrics.rateLimited++;
      this.metrics.blocked++;
      return { status: 429, body: 'Rate Limited' };
    }

    this.metrics.allowed++;
    return { status: 200, body: `Handled by ${route.handler}` };
  }

  getRoutes(): Route[] {
    return [...this.routes];
  }

  getMetrics(): GatewayMetrics {
    return { ...this.metrics };
  }

  addToken(token: string): void {
    this.tokens.add(token);
  }

  removeToken(token: string): boolean {
    return this.tokens.delete(token);
  }

  hasToken(token: string): boolean {
    return this.tokens.has(token);
  }

  findRoute(method: string, path: string): Route | undefined {
    return this.routes.find(r => r.method === method && r.path === path);
  }

  removeRoute(method: string, path: string): boolean {
    const idx = this.routes.findIndex(r => r.method === method && r.path === path);
    if (idx === -1) return false;
    this.routes.splice(idx, 1);
    return true;
  }

  getRouteCount(): number {
    return this.routes.length;
  }

  resetRequestCounts(): void {
    this.requestCounts.clear();
  }

  getRequestCount(method: string, path: string, token?: string): number {
    const key = `${method}:${path}:${token ?? ''}`;
    return this.requestCounts.get(key) ?? 0;
  }

  resetMetrics(): void {
    this.metrics = {
      total: 0,
      allowed: 0,
      blocked: 0,
      rateLimited: 0,
      unauthorized: 0,
      notFound: 0,
    };
  }

  getRoutesByMethod(method: HttpMethod): Route[] {
    return this.routes.filter(r => r.method === method);
  }

  getAuthRequiredRoutes(): Route[] {
    return this.routes.filter(r => r.authRequired);
  }

  getPublicRoutes(): Route[] {
    return this.routes.filter(r => !r.authRequired);
  }

  getSuccessRate(): number {
    if (this.metrics.total === 0) return 0;
    return Math.round((this.metrics.allowed / this.metrics.total) * 100) / 100;
  }

  getBlockRate(): number {
    if (this.metrics.total === 0) return 0;
    return Math.round((this.metrics.blocked / this.metrics.total) * 100) / 100;
  }

  clearAll(): void {
    this.routes = [];
    this.tokens.clear();
    this.requestCounts.clear();
    this.resetMetrics();
  }
}

export default ApiGatewayV2;