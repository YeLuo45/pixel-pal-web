/**
 * Enterprise MCP Gateway
 * Unified API gateway with multi-protocol support, traffic control, and enterprise-grade security.
 */

export interface GatewayConfig {
  maxConnections: number;
  rateLimit: number;
  timeout: number;
  authRequired: boolean;
}

export type Protocol = 'json-rpc' | 'graphql' | 'rest' | 'grpc';

export interface Route {
  path: string;
  protocol: Protocol;
  service: string;
  methods: string[];
}

interface Request {
  path: string;
  protocol: Protocol;
  payload: unknown;
}

interface Stats {
  requests: number;
  errors: number;
  avgLatency: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Enterprise-grade MCP gateway with unified routing, protocol adaptation,
 * rate limiting, and comprehensive traffic management.
 */
export class EnterpriseGateway {
  private config: GatewayConfig;
  private routes: Map<string, Route> = new Map();
  private connections: number = 0;
  private rateLimitStore: Map<string, RateLimitEntry> = new Map();
  private stats: Stats = { requests: 0, errors: 0, avgLatency: 0 };
  private latencySum: number = 0;
  private latencyCount: number = 0;
  private isHealthy: boolean = true;
  private protocolAdapters: Map<Protocol, ProtocolAdapter> = new Map();

  constructor(config: GatewayConfig) {
    this.config = config;
    this.initializeProtocolAdapters();
  }

  private initializeProtocolAdapters(): void {
    this.protocolAdapters.set('json-rpc', new JsonRpcAdapter());
    this.protocolAdapters.set('graphql', new GraphQLAdapter());
    this.protocolAdapters.set('rest', new RestAdapter());
    this.protocolAdapters.set('grpc', new GrpcAdapter());
  }

  addRoute(route: Route): void {
    if (!route.path || !route.protocol || !route.service) {
      throw new Error('Invalid route: path, protocol, and service are required');
    }
    if (!route.methods || route.methods.length === 0) {
      throw new Error('Invalid route: at least one method is required');
    }
    this.routes.set(route.path, route);
  }

  async route(request: Request): Promise<unknown> {
    const startTime = Date.now();
    this.stats.requests++;
    this.connections++;

    try {
      if (this.connections > this.config.maxConnections) {
        throw new Error('Connection limit exceeded');
      }

      const route = this.routes.get(request.path);
      if (!route) {
        throw new Error(`No route found for path: ${request.path}`);
      }

      if (route.protocol !== request.protocol) {
        throw new Error(`Protocol mismatch: expected ${route.protocol}, got ${request.protocol}`);
      }

      const adapter = this.protocolAdapters.get(request.protocol);
      if (!adapter) {
        throw new Error(`Unsupported protocol: ${request.protocol}`);
      }

      const response = await this.processWithTimeout(
        adapter.handle(request.payload, route),
        this.config.timeout
      );

      this.recordLatency(Date.now() - startTime);
      return response;
    } catch (error) {
      this.stats.errors++;
      this.recordLatency(Date.now() - startTime);
      throw error;
    } finally {
      this.connections--;
    }
  }

  private async processWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), ms);
    });
    return Promise.race([promise, timeoutPromise]);
  }

  private recordLatency(latency: number): void {
    this.latencySum += latency;
    this.latencyCount++;
    this.stats.avgLatency = Math.round(this.latencySum / this.latencyCount);
  }

  checkHealth(): boolean {
    this.isHealthy = this.connections < this.config.maxConnections && this.stats.errors < 100;
    return this.isHealthy;
  }

  getStats(): Stats {
    return { ...this.stats };
  }

  applyRateLimit(clientId: string): boolean {
    if (!clientId) {
      return false;
    }

    const now = Date.now();
    const entry = this.rateLimitStore.get(clientId);

    if (!entry) {
      this.rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + 60000, // Reset every minute
      });
      return true;
    }

    if (now > entry.resetTime) {
      this.rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + 60000,
      });
      return true;
    }

    if (entry.count >= this.config.rateLimit) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRoutes(): Map<string, Route> {
    return new Map(this.routes);
  }

  getConnectionCount(): number {
    return this.connections;
  }

  clearRateLimitStore(): void {
    this.rateLimitStore.clear();
  }
}

/**
 * Protocol adapter interface for handling different protocol formats
 */
interface ProtocolAdapter {
  handle(payload: unknown, route: Route): Promise<unknown>;
}

/**
 * JSON-RPC protocol adapter
 */
class JsonRpcAdapter implements ProtocolAdapter {
  async handle(payload: unknown, route: Route): Promise<unknown> {
    const rpcPayload = payload as { method?: string; params?: unknown };
    
    if (!route.methods.includes(rpcPayload.method || '')) {
      throw new Error(`Method ${rpcPayload.method} not allowed for this route`);
    }

    return {
      jsonrpc: '2.0',
      result: {
        service: route.service,
        method: rpcPayload.method,
        data: rpcPayload.params,
        timestamp: Date.now(),
      },
      id: Date.now(),
    };
  }
}

/**
 * GraphQL protocol adapter
 */
class GraphQLAdapter implements ProtocolAdapter {
  async handle(payload: unknown, route: Route): Promise<unknown> {
    const gqlPayload = payload as { query?: string; variables?: unknown };

    if (!gqlPayload.query) {
      throw new Error('GraphQL query is required');
    }

    // Basic validation: check if query contains allowed operations
    const queryLower = gqlPayload.query.toLowerCase();
    const hasValidOperation = route.methods.some(method => 
      queryLower.includes(method.toLowerCase())
    );

    if (!hasValidOperation) {
      throw new Error('Query contains disallowed operations');
    }

    return {
      data: {
        service: route.service,
        query: gqlPayload.query,
        variables: gqlPayload.variables,
        timestamp: Date.now(),
      },
    };
  }
}

/**
 * REST protocol adapter
 */
class RestAdapter implements ProtocolAdapter {
  async handle(payload: unknown, route: Route): Promise<unknown> {
    const restPayload = payload as { method?: string; body?: unknown };

    if (!route.methods.includes(restPayload.method || '')) {
      throw new Error(`HTTP method ${restPayload.method} not allowed for this route`);
    }

    return {
      status: 200,
      service: route.service,
      data: restPayload.body,
      timestamp: Date.now(),
    };
  }
}

/**
 * gRPC protocol adapter
 */
class GrpcAdapter implements ProtocolAdapter {
  async handle(payload: unknown, route: Route): Promise<unknown> {
    const grpcPayload = payload as { service?: string; method?: string; message?: unknown };

    if (grpcPayload.service !== route.service) {
      throw new Error(`Service mismatch: expected ${route.service}, got ${grpcPayload.service}`);
    }

    if (!route.methods.includes(grpcPayload.method || '')) {
      throw new Error(`gRPC method ${grpcPayload.method} not allowed`);
    }

    return {
      result: {
        service: grpcPayload.service,
        method: grpcPayload.method,
        data: grpcPayload.message,
        timestamp: Date.now(),
      },
    };
  }
}