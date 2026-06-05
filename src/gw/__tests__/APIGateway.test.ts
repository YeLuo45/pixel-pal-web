/**
 * APIGateway Tests
 * chatdev-design API Gateway
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { APIGateway } from '../APIGateway';

describe('APIGateway', () => {
  let gw: APIGateway;

  beforeEach(() => {
    gw = new APIGateway();
  });

  afterEach(() => {
    gw.clearAll();
  });

  // ============================================================
  // addRoute / handle
  // ============================================================
  describe('addRoute / handle', () => {
    it('should add route', () => {
      expect(gw.addRoute('GET', '/test', () => 'ok')).toBe(true);
    });

    it('should reject duplicate', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.addRoute('GET', '/test', () => 'ok')).toBe(false);
    });

    it('should handle', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.handle('GET', '/test')).toBe('ok');
    });

    it('should return undefined for unknown', () => {
      expect(gw.handle('GET', '/unknown')).toBeUndefined();
    });

    it('should skip cache when useCache is false', () => {
      let count = 0;
      gw.addRoute('GET', '/test', () => ++count);
      gw.handle('GET', '/test', false);
      expect(count).toBe(1);
    });

    it('should call handler with args', () => {
      gw.addRoute('POST', '/add', (a, b) => (a as number) + (b as number));
      expect(gw.handle('POST', '/add', false, 2, 3)).toBe(5);
    });
  });

  // ============================================================
  // rate limiting
  // ============================================================
  describe('rate limiting', () => {
    it('should rate limit', () => {
      gw.addRoute('GET', '/test', () => 'ok', { rateLimit: 2 });
      gw.handle('GET', '/test', false);
      gw.handle('GET', '/test', false);
      expect(gw.handle('GET', '/test', false)).toBeUndefined();
    });
  });

  // ============================================================
  // enable/disable
  // ============================================================
  describe('enable/disable', () => {
    it('should disable', () => {
      gw.addRoute('GET', '/test', () => 'ok', { enabled: false });
      expect(gw.handle('GET', '/test', false)).toBeUndefined();
    });

    it('should re-enable', () => {
      gw.addRoute('GET', '/test', () => 'ok', { enabled: false });
      gw.setEnabled('GET', '/test', true);
      expect(gw.handle('GET', '/test', false)).toBe('ok');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      gw.handle('GET', '/test');
      const stats = gw.getStats();
      expect(stats.requests).toBe(1);
    });

    it('should track cache hits', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      gw.handle('GET', '/test');
      gw.handle('GET', '/test');
      expect(gw.getStats().cacheHits).toBe(1);
    });

    it('should track cache misses', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      gw.handle('GET', '/test', false);
      expect(gw.getStats().cacheMisses).toBe(1);
    });

    it('should track rate limited', () => {
      gw.addRoute('GET', '/test', () => 'ok', { rateLimit: 1 });
      gw.handle('GET', '/test', false);
      gw.handle('GET', '/test', false);
      expect(gw.getStats().rateLimited).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get route', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.getRoute('GET', '/test')?.method).toBe('GET');
    });

    it('should get all routes', () => {
      gw.addRoute('GET', '/a', () => 1);
      gw.addRoute('GET', '/b', () => 2);
      expect(gw.getAllRoutes()).toHaveLength(2);
    });

    it('should remove route', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.removeRoute('GET', '/test')).toBe(true);
    });

    it('should check existence', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.hasRoute('GET', '/test')).toBe(true);
    });

    it('should count', () => {
      expect(gw.getCount()).toBe(0);
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get path', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.getPath('GET', '/test')).toBe('/test');
    });

    it('should get method', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.getMethod('GET', '/test')).toBe('GET');
    });

    it('should get call count', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      gw.handle('GET', '/test', false);
      expect(gw.getCallCount('GET', '/test')).toBe(1);
    });

    it('should check isEnabled', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.isEnabled('GET', '/test')).toBe(true);
    });
  });

  // ============================================================
  // configuration
  // ============================================================
  describe('configuration', () => {
    it('should set rate limit', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.setRateLimit('GET', '/test', 10)).toBe(true);
    });

    it('should get rate limit', () => {
      gw.addRoute('GET', '/test', () => 'ok', { rateLimit: 5 });
      expect(gw.getRateLimit('GET', '/test')).toBe(5);
    });

    it('should return false for unknown setRateLimit', () => {
      expect(gw.setRateLimit('GET', '/unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // cache
  // ============================================================
  describe('cache', () => {
    it('should clear cache', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      gw.handle('GET', '/test');
      gw.clearCache();
      expect(gw.getCacheSize()).toBe(0);
    });

    it('should clear cache for route', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      gw.handle('GET', '/test');
      gw.clearCacheForRoute('GET', '/test');
      expect(gw.getCacheSize()).toBe(0);
    });

    it('should get cache size', () => {
      expect(gw.getCacheSize()).toBe(0);
    });
  });

  // ============================================================
  // rate limit counters
  // ============================================================
  describe('rate limit counters', () => {
    it('should get rate limit count', () => {
      gw.addRoute('GET', '/test', () => 'ok', { rateLimit: 5 });
      gw.handle('GET', '/test', false);
      expect(gw.getRateLimitCount('GET', '/test')).toBe(1);
    });
  });

  // ============================================================
  // by method
  // ============================================================
  describe('by method', () => {
    it('should get routes by method', () => {
      gw.addRoute('GET', '/a', () => 1);
      gw.addRoute('POST', '/a', () => 1);
      expect(gw.getRoutesByMethod('GET')).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      gw.addRoute('GET', '/test', () => 'ok');
      expect(gw.getCreatedAt('GET', '/test')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many routes', () => {
      for (let i = 0; i < 50; i++) {
        gw.addRoute('GET', `/p${i}`, () => i);
      }
      expect(gw.getCount()).toBe(50);
    });
  });
});