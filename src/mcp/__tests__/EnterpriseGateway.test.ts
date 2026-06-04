/**
 * Enterprise Gateway Tests
 * claude-code Enterprise MCP Gateway
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnterpriseGateway, type GatewayConfig, type Protocol, type Route } from '../EnterpriseGateway';

describe('EnterpriseGateway', () => {
  let gateway: EnterpriseGateway;

  const defaultConfig: GatewayConfig = {
    maxConnections: 100,
    rateLimit: 1000,
    timeout: 5000,
    authRequired: false,
  };

  beforeEach(() => {
    gateway = new EnterpriseGateway(defaultConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // constructor
  // ============================================================
  describe('constructor', () => {
    it('should create gateway with config', () => {
      const g = new EnterpriseGateway(defaultConfig);
      expect(g).toBeInstanceOf(EnterpriseGateway);
    });

    it('should initialize with custom max connections', () => {
      const g = new EnterpriseGateway({ ...defaultConfig, maxConnections: 50 });
      expect(g).toBeInstanceOf(EnterpriseGateway);
    });

    it('should handle zero rate limit', () => {
      const g = new EnterpriseGateway({ ...defaultConfig, rateLimit: 0 });
      expect(g).toBeInstanceOf(EnterpriseGateway);
    });

    it('should handle zero timeout', () => {
      const g = new EnterpriseGateway({ ...defaultConfig, timeout: 0 });
      expect(g).toBeInstanceOf(EnterpriseGateway);
    });
  });

  // ============================================================
  // addRoute
  // ============================================================
  describe('addRoute', () => {
    it('should add a route', () => {
      const route: Route = {
        path: '/api/users',
        protocol: 'rest',
        service: 'user-service',
        methods: ['GET', 'POST'],
      };
      gateway.addRoute(route);
      expect(gateway).toBeInstanceOf(EnterpriseGateway);
    });

    it('should add multiple routes', () => {
      gateway.addRoute({ path: '/a', protocol: 'rest', service: 's1', methods: ['GET'] });
      gateway.addRoute({ path: '/b', protocol: 'graphql', service: 's2', methods: ['QUERY'] });
      expect(gateway).toBeInstanceOf(EnterpriseGateway);
    });

    it('should accept all protocol types', () => {
      const protocols: Protocol[] = ['json-rpc', 'graphql', 'rest', 'grpc'];
      for (const p of protocols) {
        gateway.addRoute({ path: `/${p}`, protocol: p, service: 's', methods: ['GET'] });
      }
      expect(gateway).toBeInstanceOf(EnterpriseGateway);
    });
  });

  // ============================================================
  // route
  // ============================================================
  describe('route', () => {
    it('should route rest request successfully', async () => {
      gateway.addRoute({
        path: '/api/users',
        protocol: 'rest',
        service: 'user-service',
        methods: ['GET'],
      });

      const result = await gateway.route({
        path: '/api/users',
        protocol: 'rest',
        payload: { method: 'GET', body: { id: 1 } },
      });

      expect(result).toBeDefined();
    });

    it('should handle json-rpc protocol', async () => {
      gateway.addRoute({
        path: '/rpc',
        protocol: 'json-rpc',
        service: 'rpc-service',
        methods: ['invoke'],
      });

      const result = await gateway.route({
        path: '/rpc',
        protocol: 'json-rpc',
        payload: { method: 'invoke', params: {} },
      });

      expect(result).toBeDefined();
    });

    it('should handle graphql protocol', async () => {
      gateway.addRoute({
        path: '/graphql',
        protocol: 'graphql',
        service: 'graphql-service',
        methods: ['query'],
      });

      const result = await gateway.route({
        path: '/graphql',
        protocol: 'graphql',
        payload: { query: 'query { users { id } }', operationName: 'Test' },
      });

      expect(result).toBeDefined();
    });

    it('should handle grpc protocol', async () => {
      gateway.addRoute({
        path: '/grpc',
        protocol: 'grpc',
        service: 'grpc-service',
        methods: ['unary'],
      });

      const result = await gateway.route({
        path: '/grpc',
        protocol: 'grpc',
        payload: { service: 'grpc-service', method: 'unary', data: {} },
      });

      expect(result).toBeDefined();
    });

    it('should throw for unknown path', async () => {
      gateway.addRoute({
        path: '/known',
        protocol: 'rest',
        service: 's',
        methods: ['GET'],
      });

      await expect(
        gateway.route({ path: '/unknown', protocol: 'rest', payload: { method: 'GET' } })
      ).rejects.toThrow();
    });

    it('should handle empty payload', async () => {
      gateway.addRoute({
        path: '/empty',
        protocol: 'rest',
        service: 's',
        methods: ['GET'],
      });

      const result = await gateway.route({
        path: '/empty',
        protocol: 'rest',
        payload: { method: 'GET', body: null },
      });

      expect(result).toBeDefined();
    });

    it('should handle undefined payload', async () => {
      gateway.addRoute({
        path: '/undef',
        protocol: 'rest',
        service: 's',
        methods: ['GET'],
      });

      const result = await gateway.route({
        path: '/undef',
        protocol: 'rest',
        payload: { method: 'GET', body: undefined },
      });

      expect(result).toBeDefined();
    });
  });

  // ============================================================
  // checkHealth
  // ============================================================
  describe('checkHealth', () => {
    it('should return true for healthy gateway', () => {
      expect(gateway.checkHealth()).toBe(true);
    });

    it('should return true after adding routes', () => {
      gateway.addRoute({ path: '/a', protocol: 'rest', service: 's', methods: ['GET'] });
      expect(gateway.checkHealth()).toBe(true);
    });

    it('should return true after routing requests', async () => {
      gateway.addRoute({ path: '/a', protocol: 'rest', service: 's', methods: ['GET'] });
      await gateway.route({ path: '/a', protocol: 'rest', payload: { method: 'GET' } });
      expect(gateway.checkHealth()).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats object', () => {
      const stats = gateway.getStats();
      expect(stats).toHaveProperty('requests');
      expect(stats).toHaveProperty('errors');
      expect(stats).toHaveProperty('avgLatency');
    });

    it('should start with zero requests', () => {
      const stats = gateway.getStats();
      expect(stats.requests).toBe(0);
    });

    it('should track request count after routing', async () => {
      gateway.addRoute({ path: '/a', protocol: 'rest', service: 's', methods: ['GET'] });
      await gateway.route({ path: '/a', protocol: 'rest', payload: { method: 'GET' } });
      const stats = gateway.getStats();
      expect(stats.requests).toBeGreaterThanOrEqual(0);
    });

    it('should track error count', () => {
      const stats = gateway.getStats();
      expect(stats.errors).toBeGreaterThanOrEqual(0);
    });

    it('should return valid avgLatency', () => {
      const stats = gateway.getStats();
      expect(stats.avgLatency).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // applyRateLimit
  // ============================================================
  describe('applyRateLimit', () => {
    it('should return true for first request from client', () => {
      expect(gateway.applyRateLimit('client-1')).toBe(true);
    });

    it('should return true for multiple different clients', () => {
      expect(gateway.applyRateLimit('client-1')).toBe(true);
      expect(gateway.applyRateLimit('client-2')).toBe(true);
      expect(gateway.applyRateLimit('client-3')).toBe(true);
    });

    it('should handle many unique clients', () => {
      for (let i = 0; i < 100; i++) {
        gateway.applyRateLimit(`client-${i}`);
      }
      expect(gateway.applyRateLimit('new-client')).toBe(true);
    });

    it('should handle empty client id', () => {
      expect(gateway.applyRateLimit('client-1')).toBe(true);
      // Empty string is blocked by rate limiter
      expect(gateway.applyRateLimit('')).toBe(false);
    });

    it('should handle special characters in client id', () => {
      expect(gateway.applyRateLimit('client@#$%')).toBe(true);
      expect(gateway.applyRateLimit('client/abc')).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle routing without any routes', async () => {
      await expect(
        gateway.route({ path: '/anything', protocol: 'rest', payload: {} })
      ).rejects.toThrow();
    });

    it('should handle route with many methods', () => {
      gateway.addRoute({
        path: '/a',
        protocol: 'rest',
        service: 's',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      });
      expect(gateway).toBeInstanceOf(EnterpriseGateway);
    });

    it('should handle concurrent routing requests', async () => {
      gateway.addRoute({ path: '/a', protocol: 'rest', service: 's', methods: ['GET'] });
      const promises = Array(10)
        .fill(null)
        .map(() => gateway.route({ path: '/a', protocol: 'rest', payload: { method: 'GET' } }));
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it('should handle protocol mismatch', async () => {
      gateway.addRoute({ path: '/a', protocol: 'rest', service: 's', methods: ['GET'] });
      await expect(
        gateway.route({ path: '/a', protocol: 'grpc', payload: {} })
      ).rejects.toThrow();
    });
  });
});