/**
 * ApiGatewayV2 Tests
 * thunderbolt-design API Gateway v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ApiGatewayV2 } from '../ApiGatewayV2';

describe('ApiGatewayV2', () => {
  let gateway: ApiGatewayV2;

  beforeEach(() => {
    gateway = new ApiGatewayV2();
  });

  afterEach(() => {
    gateway.clearAll();
  });

  // ============================================================
  // registerRoute
  // ============================================================
  describe('registerRoute', () => {
    it('should register route', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      expect(gateway.getRouteCount()).toBe(1);
    });
  });

  // ============================================================
  // request
  // ============================================================
  describe('request', () => {
    it('should handle valid request', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      const result = gateway.request('GET', '/api');
      expect(result.status).toBe(200);
    });

    it('should return 404 for unknown route', () => {
      const result = gateway.request('GET', '/unknown');
      expect(result.status).toBe(404);
    });

    it('should return 401 for unauth', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: true, rateLimit: 100 });
      const result = gateway.request('GET', '/api');
      expect(result.status).toBe(401);
    });

    it('should allow with valid token', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: true, rateLimit: 100 });
      gateway.addToken('token1');
      const result = gateway.request('GET', '/api', 'token1');
      expect(result.status).toBe(200);
    });

    it('should return 429 when rate limit exceeded', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 2 });
      gateway.request('GET', '/api');
      gateway.request('GET', '/api');
      const result = gateway.request('GET', '/api');
      expect(result.status).toBe(429);
    });

    it('should match correct method', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      const result = gateway.request('POST', '/api');
      expect(result.status).toBe(404);
    });
  });

  // ============================================================
  // getRoutes / getMetrics
  // ============================================================
  describe('getRoutes / getMetrics', () => {
    it('should get routes', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      expect(gateway.getRoutes()).toHaveLength(1);
    });

    it('should track metrics', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      gateway.request('GET', '/api');
      const m = gateway.getMetrics();
      expect(m.total).toBe(1);
      expect(m.allowed).toBe(1);
    });
  });

  // ============================================================
  // tokens
  // ============================================================
  describe('tokens', () => {
    it('should add token', () => {
      gateway.addToken('t1');
      expect(gateway.hasToken('t1')).toBe(true);
    });

    it('should remove token', () => {
      gateway.addToken('t1');
      expect(gateway.removeToken('t1')).toBe(true);
      expect(gateway.hasToken('t1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(gateway.removeToken('unknown')).toBe(false);
    });
  });

  // ============================================================
  // findRoute / removeRoute
  // ============================================================
  describe('findRoute / removeRoute', () => {
    it('should find route', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      const route = gateway.findRoute('GET', '/api');
      expect(route?.handler).toBe('h1');
    });

    it('should return undefined for unknown', () => {
      expect(gateway.findRoute('GET', '/unknown')).toBeUndefined();
    });

    it('should remove route', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      expect(gateway.removeRoute('GET', '/api')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(gateway.removeRoute('GET', '/unknown')).toBe(false);
    });
  });

  // ============================================================
  // request counts
  // ============================================================
  describe('request counts', () => {
    it('should track request count', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      gateway.request('GET', '/api');
      expect(gateway.getRequestCount('GET', '/api')).toBe(1);
    });

    it('should reset request counts', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      gateway.request('GET', '/api');
      gateway.resetRequestCounts();
      expect(gateway.getRequestCount('GET', '/api')).toBe(0);
    });

    it('should return 0 for unknown', () => {
      expect(gateway.getRequestCount('GET', '/unknown')).toBe(0);
    });
  });

  // ============================================================
  // metrics
  // ============================================================
  describe('metrics', () => {
    it('should reset metrics', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      gateway.request('GET', '/api');
      gateway.resetMetrics();
      const m = gateway.getMetrics();
      expect(m.total).toBe(0);
    });

    it('should track notFound', () => {
      gateway.request('GET', '/unknown');
      const m = gateway.getMetrics();
      expect(m.notFound).toBe(1);
    });

    it('should track unauthorized', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: true, rateLimit: 100 });
      gateway.request('GET', '/api');
      const m = gateway.getMetrics();
      expect(m.unauthorized).toBe(1);
    });

    it('should track rateLimited', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 1 });
      gateway.request('GET', '/api');
      gateway.request('GET', '/api');
      const m = gateway.getMetrics();
      expect(m.rateLimited).toBe(1);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get by method', () => {
      gateway.registerRoute({ path: '/a', method: 'GET', handler: 'h', authRequired: false, rateLimit: 100 });
      gateway.registerRoute({ path: '/b', method: 'POST', handler: 'h', authRequired: false, rateLimit: 100 });
      expect(gateway.getRoutesByMethod('GET')).toHaveLength(1);
    });

    it('should get auth required', () => {
      gateway.registerRoute({ path: '/a', method: 'GET', handler: 'h', authRequired: true, rateLimit: 100 });
      expect(gateway.getAuthRequiredRoutes()).toHaveLength(1);
    });

    it('should get public', () => {
      gateway.registerRoute({ path: '/a', method: 'GET', handler: 'h', authRequired: false, rateLimit: 100 });
      expect(gateway.getPublicRoutes()).toHaveLength(1);
    });
  });

  // ============================================================
  // rates
  // ============================================================
  describe('rates', () => {
    it('should return 0 for empty success rate', () => {
      expect(gateway.getSuccessRate()).toBe(0);
    });

    it('should return 0 for empty block rate', () => {
      expect(gateway.getBlockRate()).toBe(0);
    });

    it('should calculate success rate', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 100 });
      gateway.request('GET', '/api');
      gateway.request('GET', '/unknown');
      expect(gateway.getSuccessRate()).toBe(0.5);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many requests', () => {
      gateway.registerRoute({ path: '/api', method: 'GET', handler: 'h1', authRequired: false, rateLimit: 1000 });
      for (let i = 0; i < 100; i++) {
        gateway.request('GET', '/api');
      }
      const m = gateway.getMetrics();
      expect(m.allowed).toBe(100);
    });
  });
});