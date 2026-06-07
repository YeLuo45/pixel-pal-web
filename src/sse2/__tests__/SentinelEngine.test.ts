/**
 * SentinelEngine Tests
 * thunderbolt-design Sentinel Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SentinelEngine } from '../SentinelEngine';

describe('SentinelEngine', () => {
  let sse: SentinelEngine;

  beforeEach(() => {
    sse = new SentinelEngine();
  });

  afterEach(() => {
    sse.clearAll();
  });

  describe('add / guard / inspect / remove', () => {
    it('should add', () => {
      expect(sse.add('s1')).toBe('sse-1');
    });

    it('should default mode to normal', () => {
      sse.add('s1');
      expect(sse.getMode('sse-1')).toBe('normal');
    });

    it('should mark as active', () => {
      sse.add('s1');
      expect(sse.isActive('sse-1')).toBe(true);
    });

    it('should guard allow', () => {
      sse.add('s1');
      expect(sse.guard('sse-1', true)).toBe(true);
    });

    it('should guard block', () => {
      sse.add('s1');
      expect(sse.guard('sse-1', false)).toBe(true);
    });

    it('should increment allows', () => {
      sse.add('s1');
      sse.guard('sse-1', true);
      expect(sse.getAllows('sse-1')).toBe(1);
    });

    it('should increment blocks', () => {
      sse.add('s1');
      sse.guard('sse-1', false);
      expect(sse.getBlocks('sse-1')).toBe(1);
    });

    it('should not guard inactive', () => {
      sse.add('s1');
      sse.setActive('sse-1', false);
      expect(sse.guard('sse-1', true)).toBe(false);
    });

    it('should return false for unknown guard', () => {
      expect(sse.guard('unknown', true)).toBe(false);
    });

    it('should inspect', () => {
      sse.add('s1');
      expect(sse.inspect('sse-1')).toBe(true);
    });

    it('should return false for unknown inspect', () => {
      expect(sse.inspect('unknown')).toBe(false);
    });

    it('should remove', () => {
      sse.add('s1');
      expect(sse.remove('sse-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sse.add('s1');
      expect(sse.getStats().sentinels).toBe(1);
    });

    it('should count total added', () => {
      sse.add('s1');
      expect(sse.getStats().totalAdded).toBe(1);
    });

    it('should count total blocks', () => {
      sse.add('s1');
      sse.guard('sse-1', false);
      expect(sse.getStats().totalBlocks).toBe(1);
    });

    it('should count total allows', () => {
      sse.add('s1');
      sse.guard('sse-1', true);
      expect(sse.getStats().totalAllows).toBe(1);
    });

    it('should count normal', () => {
      sse.add('s1', 'normal');
      expect(sse.getStats().normal).toBe(1);
    });

    it('should count strict', () => {
      sse.add('s1', 'strict');
      expect(sse.getStats().strict).toBe(1);
    });

    it('should count lax', () => {
      sse.add('s1', 'lax');
      expect(sse.getStats().lax).toBe(1);
    });

    it('should count active', () => {
      sse.add('s1');
      expect(sse.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      sse.add('s1');
      sse.setActive('sse-1', false);
      expect(sse.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      sse.add('s1');
      sse.guard('sse-1', true);
      expect(sse.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sse.add('a');
      sse.add('a');
      expect(sse.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get sentinel', () => {
      sse.add('s1');
      expect(sse.getSentinel('sse-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sse.add('s1');
      expect(sse.getAllSentinels()).toHaveLength(1);
    });

    it('should check existence', () => {
      sse.add('s1');
      expect(sse.hasSentinel('sse-1')).toBe(true);
    });

    it('should count', () => {
      expect(sse.getCount()).toBe(0);
      sse.add('s1');
      expect(sse.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      sse.add('s1');
      expect(sse.getName('sse-1')).toBe('s1');
    });

    it('should get mode', () => {
      sse.add('s1', 'strict');
      expect(sse.getMode('sse-1')).toBe('strict');
    });

    it('should get blocks', () => {
      sse.add('s1');
      sse.guard('sse-1', false);
      expect(sse.getBlocks('sse-1')).toBe(1);
    });

    it('should get allows', () => {
      sse.add('s1');
      sse.guard('sse-1', true);
      expect(sse.getAllows('sse-1')).toBe(1);
    });

    it('should get hits', () => {
      sse.add('s1');
      sse.guard('sse-1', true);
      expect(sse.getHits('sse-1')).toBe(1);
    });

    it('should check normal', () => {
      sse.add('s1', 'normal');
      expect(sse.isNormal('sse-1')).toBe(true);
    });

    it('should check strict', () => {
      sse.add('s1', 'strict');
      expect(sse.isStrict('sse-1')).toBe(true);
    });

    it('should check lax', () => {
      sse.add('s1', 'lax');
      expect(sse.isLax('sse-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      sse.add('s1');
      expect(sse.setActive('sse-1', false)).toBe(true);
    });

    it('should set name', () => {
      sse.add('s1');
      expect(sse.setName('sse-1', 's2')).toBe(true);
    });

    it('should set mode', () => {
      sse.add('s1');
      expect(sse.setMode('sse-1', 'strict')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sse.setActive('unknown', false)).toBe(false);
      expect(sse.setName('unknown', 's')).toBe(false);
      expect(sse.setMode('unknown', 'strict')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      sse.add('s1');
      sse.guard('sse-1', true);
      sse.setActive('sse-1', false);
      sse.resetAll();
      expect(sse.getAllows('sse-1')).toBe(0);
      expect(sse.isActive('sse-1')).toBe(true);
    });
  });

  describe('by mode / state', () => {
    it('should get by mode', () => {
      sse.add('s1', 'strict');
      expect(sse.getByMode('strict')).toHaveLength(1);
    });

    it('should get active', () => {
      sse.add('s1');
      expect(sse.getActiveSentinels()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sse.add('s1');
      sse.setActive('sse-1', false);
      expect(sse.getInactiveSentinels()).toHaveLength(1);
    });

    it('should get all names', () => {
      sse.add('a');
      sse.add('b');
      expect(sse.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sse.add('s1');
      expect(sse.getNewest()?.id).toBe('sse-1');
    });

    it('should return null for empty newest', () => {
      expect(sse.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sse.add('s1');
      expect(sse.getOldest()?.id).toBe('sse-1');
    });

    it('should return null for empty oldest', () => {
      expect(sse.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      sse.add('s1');
      expect(sse.getCreatedAt('sse-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      sse.add('s1');
      sse.guard('sse-1', true);
      expect(sse.getUpdatedAt('sse-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      sse.add('s1');
      expect(sse.getTotalAdded()).toBe(1);
    });

    it('should get total blocks', () => {
      sse.add('s1');
      sse.guard('sse-1', false);
      expect(sse.getTotalBlocks()).toBe(1);
    });

    it('should get total allows', () => {
      sse.add('s1');
      sse.guard('sse-1', true);
      expect(sse.getTotalAllows()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many sentinels', () => {
      for (let i = 0; i < 50; i++) {
        sse.add(`s${i}`);
      }
      expect(sse.getCount()).toBe(50);
    });
  });
});