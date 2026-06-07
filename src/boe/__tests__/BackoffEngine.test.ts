/**
 * BackoffEngine Tests
 * thunderbolt-design Backoff Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BackoffEngine } from '../BackoffEngine';

describe('BackoffEngine', () => {
  let boe: BackoffEngine;

  beforeEach(() => {
    boe = new BackoffEngine();
  });

  afterEach(() => {
    boe.clearAll();
  });

  describe('schedule / retry / reset / remove', () => {
    it('should schedule', () => {
      expect(boe.schedule('fixed')).toBe('boe-1');
    });

    it('should default baseMs to 100', () => {
      boe.schedule('fixed');
      expect(boe.getBaseMs('boe-1')).toBe(100);
    });

    it('should mark as active', () => {
      boe.schedule('fixed');
      expect(boe.isActive('boe-1')).toBe(true);
    });

    it('should retry fixed', () => {
      boe.schedule('fixed', 100, 30000);
      expect(boe.retry('boe-1')).toBe(100);
    });

    it('should retry linear', () => {
      boe.schedule('linear', 100, 30000);
      expect(boe.retry('boe-1')).toBe(100);
    });

    it('should retry exponential', () => {
      boe.schedule('exponential', 100, 30000);
      expect(boe.retry('boe-1')).toBe(100);
    });

    it('should increment attempts on retry', () => {
      boe.schedule('fixed', 100, 30000);
      boe.retry('boe-1');
      expect(boe.getAttempts('boe-1')).toBe(1);
    });

    it('should clamp delay on overflow', () => {
      boe.schedule('exponential', 100, 200);
      boe.retry('boe-1');
      boe.retry('boe-1');
      boe.retry('boe-1');
      expect(boe.getNextDelay('boe-1')).toBe(200);
    });

    it('should not retry inactive', () => {
      boe.schedule('fixed');
      boe.setActive('boe-1', false);
      expect(boe.retry('boe-1')).toBe(-1);
    });

    it('should return -1 for unknown retry', () => {
      expect(boe.retry('unknown')).toBe(-1);
    });

    it('should reset', () => {
      boe.schedule('fixed');
      boe.retry('boe-1');
      expect(boe.reset('boe-1')).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(boe.reset('unknown')).toBe(false);
    });

    it('should remove', () => {
      boe.schedule('fixed');
      expect(boe.remove('boe-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      boe.schedule('fixed');
      expect(boe.getStats().backoffs).toBe(1);
    });

    it('should count total retries', () => {
      boe.schedule('fixed');
      boe.retry('boe-1');
      expect(boe.getStats().totalRetries).toBe(1);
    });

    it('should count total resets', () => {
      boe.schedule('fixed');
      boe.reset('boe-1');
      expect(boe.getStats().totalResets).toBe(1);
    });

    it('should count active', () => {
      boe.schedule('fixed');
      expect(boe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      boe.schedule('fixed');
      boe.setActive('boe-1', false);
      expect(boe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      boe.schedule('fixed');
      boe.retry('boe-1');
      expect(boe.getStats().totalHits).toBe(1);
    });

    it('should count fixed', () => {
      boe.schedule('fixed');
      expect(boe.getStats().fixed).toBe(1);
    });

    it('should count linear', () => {
      boe.schedule('linear');
      expect(boe.getStats().linear).toBe(1);
    });

    it('should count exponential', () => {
      boe.schedule('exponential');
      expect(boe.getStats().exponential).toBe(1);
    });

    it('should count total attempts', () => {
      boe.schedule('fixed');
      boe.retry('boe-1');
      boe.retry('boe-1');
      expect(boe.getStats().totalAttempts).toBe(2);
    });

    it('should compute avg next delay', () => {
      boe.schedule('fixed', 100, 30000);
      expect(boe.getStats().avgNextDelay).toBe(100);
    });

    it('should get max next delay', () => {
      boe.schedule('fixed', 100, 30000);
      expect(boe.getStats().maxNextDelay).toBe(100);
    });

    it('should get min next delay', () => {
      boe.schedule('fixed', 100, 30000);
      expect(boe.getStats().minNextDelay).toBe(100);
    });
  });

  describe('queries', () => {
    it('should get backoff', () => {
      boe.schedule('fixed');
      expect(boe.getBackoff('boe-1')?.strategy).toBe('fixed');
    });

    it('should get all', () => {
      boe.schedule('fixed');
      expect(boe.getAllBackoffs()).toHaveLength(1);
    });

    it('should check existence', () => {
      boe.schedule('fixed');
      expect(boe.hasBackoff('boe-1')).toBe(true);
    });

    it('should count', () => {
      expect(boe.getCount()).toBe(0);
      boe.schedule('fixed');
      expect(boe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get strategy', () => {
      boe.schedule('fixed');
      expect(boe.getStrategy('boe-1')).toBe('fixed');
    });

    it('should get max ms', () => {
      boe.schedule('fixed', 100, 5000);
      expect(boe.getMaxMs('boe-1')).toBe(5000);
    });

    it('should get hits', () => {
      boe.schedule('fixed');
      boe.retry('boe-1');
      expect(boe.getHits('boe-1')).toBe(1);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      boe.schedule('fixed');
      expect(boe.setActive('boe-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(boe.setActive('unknown', false)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      boe.schedule('fixed');
      boe.retry('boe-1');
      boe.setActive('boe-1', false);
      boe.resetAll();
      expect(boe.getAttempts('boe-1')).toBe(0);
      expect(boe.isActive('boe-1')).toBe(true);
    });
  });

  describe('by strategy / state', () => {
    it('should get by strategy', () => {
      boe.schedule('fixed');
      expect(boe.getByStrategy('fixed')).toHaveLength(1);
    });

    it('should get active', () => {
      boe.schedule('fixed');
      expect(boe.getActiveBackoffs()).toHaveLength(1);
    });

    it('should get inactive', () => {
      boe.schedule('fixed');
      boe.setActive('boe-1', false);
      expect(boe.getInactiveBackoffs()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      boe.schedule('fixed');
      expect(boe.getNewest()?.id).toBe('boe-1');
    });

    it('should return null for empty newest', () => {
      expect(boe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      boe.schedule('fixed');
      expect(boe.getOldest()?.id).toBe('boe-1');
    });

    it('should return null for empty oldest', () => {
      expect(boe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      boe.schedule('fixed');
      expect(boe.getCreatedAt('boe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      boe.schedule('fixed');
      boe.retry('boe-1');
      expect(boe.getUpdatedAt('boe-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total retries', () => {
      boe.schedule('fixed');
      boe.retry('boe-1');
      expect(boe.getTotalRetries()).toBe(1);
    });

    it('should get total resets', () => {
      boe.schedule('fixed');
      boe.reset('boe-1');
      expect(boe.getTotalResets()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many backoffs', () => {
      for (let i = 0; i < 50; i++) {
        boe.schedule('fixed');
      }
      expect(boe.getCount()).toBe(50);
    });
  });
});