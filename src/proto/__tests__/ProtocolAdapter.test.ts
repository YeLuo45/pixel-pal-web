/**
 * ProtocolAdapter Tests
 * nanobot-design Protocol Adapter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProtocolAdapter } from '../ProtocolAdapter';

describe('ProtocolAdapter', () => {
  let adapter: ProtocolAdapter;

  beforeEach(() => {
    adapter = new ProtocolAdapter();
  });

  afterEach(() => {
    adapter.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register', () => {
      expect(adapter.register({ id: 'p1', name: 'json', transform: (d) => d })).toBe(true);
    });

    it('should reject duplicate', () => {
      adapter.register({ id: 'p1', name: 'json', transform: (d) => d });
      expect(adapter.register({ id: 'p1', name: 'json', transform: (d) => d })).toBe(false);
    });
  });

  // ============================================================
  // adapt
  // ============================================================
  describe('adapt', () => {
    it('should adapt', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => `from-a:${d}` });
      adapter.register({ id: 'b', name: 'b', transform: (d) => `from-b:${d}` });
      expect(adapter.adapt('a', 'b', 'x')).toBe('from-b:from-a:x');
    });

    it('should return undefined for unknown', () => {
      expect(adapter.adapt('a', 'b', 'x')).toBeUndefined();
    });

    it('should return undefined for disabled', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d, enabled: false });
      adapter.register({ id: 'b', name: 'b', transform: (d) => d });
      expect(adapter.adapt('a', 'b', 'x')).toBeUndefined();
    });

    it('should catch errors', () => {
      adapter.register({ id: 'a', name: 'a', transform: () => { throw 'err'; } });
      adapter.register({ id: 'b', name: 'b', transform: (d) => d });
      expect(adapter.adapt('a', 'b', 'x')).toBeUndefined();
    });
  });

  // ============================================================
  // transform
  // ============================================================
  describe('transform', () => {
    it('should transform', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => `x${d}` });
      expect(adapter.transform('a', 'y')).toBe('xy');
    });

    it('should return undefined for unknown', () => {
      expect(adapter.transform('unknown', 'x')).toBeUndefined();
    });

    it('should return undefined for disabled', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d, enabled: false });
      expect(adapter.transform('a', 'x')).toBeUndefined();
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      const stats = adapter.getStats();
      expect(stats.protocols).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get protocol', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.getProtocol('a')?.name).toBe('a');
    });

    it('should get all', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.getAllProtocols()).toHaveLength(1);
    });

    it('should remove', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.removeProtocol('a')).toBe(true);
    });

    it('should check existence', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.hasProtocol('a')).toBe(true);
    });

    it('should count', () => {
      expect(adapter.getCount()).toBe(0);
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.getName('a')).toBe('a');
    });

    it('should check isEnabled', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.isEnabled('a')).toBe(true);
    });

    it('should set enabled', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.setEnabled('a', false)).toBe(true);
    });

    it('should return false for unknown setEnabled', () => {
      expect(adapter.setEnabled('unknown', false)).toBe(false);
    });

    it('should get usage count', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      adapter.transform('a', 'x');
      expect(adapter.getUsageCount('a')).toBe(1);
    });
  });

  // ============================================================
  // counts
  // ============================================================
  describe('counts', () => {
    it('should get transform count', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      adapter.transform('a', 'x');
      expect(adapter.getTransformCount()).toBe(1);
    });

    it('should get error count', () => {
      adapter.register({ id: 'a', name: 'a', transform: () => { throw 'err'; } });
      adapter.register({ id: 'b', name: 'b', transform: (d) => d });
      adapter.adapt('a', 'b', 'x');
      expect(adapter.getErrorCount()).toBe(1);
    });

    it('should get route count', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      adapter.register({ id: 'b', name: 'b', transform: (d) => d });
      adapter.adapt('a', 'b', 'x');
      expect(adapter.getRouteCount()).toBe(1);
    });
  });

  // ============================================================
  // timestamps / most
  // ============================================================
  describe('timestamps / most', () => {
    it('should get created at', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.getCreatedAt('a')).toBeGreaterThan(0);
    });

    it('should get most used', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      adapter.transform('a', 'x');
      expect(adapter.getMostUsed()?.id).toBe('a');
    });

    it('should return null for empty most', () => {
      expect(adapter.getMostUsed()).toBeNull();
    });
  });

  // ============================================================
  // by status
  // ============================================================
  describe('by status', () => {
    it('should get enabled', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      expect(adapter.getEnabledProtocols()).toHaveLength(1);
    });

    it('should get disabled', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d, enabled: false });
      expect(adapter.getDisabledProtocols()).toHaveLength(1);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset stats', () => {
      adapter.register({ id: 'a', name: 'a', transform: (d) => d });
      adapter.transform('a', 'x');
      adapter.resetStats();
      expect(adapter.getTransformCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many protocols', () => {
      for (let i = 0; i < 50; i++) {
        adapter.register({ id: `p${i}`, name: `p${i}`, transform: (d) => d });
      }
      expect(adapter.getCount()).toBe(50);
    });
  });
});