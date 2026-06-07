/**
 * ChainEngine Tests
 * thunderbolt-design Chain Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChainEngine } from '../ChainEngine';

describe('ChainEngine', () => {
  let che: ChainEngine;

  beforeEach(() => {
    che = new ChainEngine();
  });

  afterEach(() => {
    che.clearAll();
  });

  describe('addLink / execute / complete / fail / remove', () => {
    it('should addLink', () => {
      expect(che.addLink('l1', 0)).toBe('che-1');
    });

    it('should default status to pending', () => {
      che.addLink('l1', 0);
      expect(che.getStatus('che-1')).toBe('pending');
    });

    it('should mark as active', () => {
      che.addLink('l1', 0);
      expect(che.isActive('che-1')).toBe(true);
    });

    it('should execute', () => {
      che.addLink('l1', 0);
      expect(che.execute('che-1')).toBe(true);
    });

    it('should not execute inactive', () => {
      che.addLink('l1', 0);
      che.setActive('che-1', false);
      expect(che.execute('che-1')).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(che.execute('unknown')).toBe(false);
    });

    it('should complete after execute', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      expect(che.complete('che-1', 'result')).toBe(true);
    });

    it('should not complete without execute', () => {
      che.addLink('l1', 0);
      expect(che.complete('che-1', 'result')).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(che.complete('unknown', 'r')).toBe(false);
    });

    it('should fail', () => {
      che.addLink('l1', 0);
      expect(che.fail('che-1')).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(che.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      che.addLink('l1', 0);
      expect(che.remove('che-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      che.addLink('l1', 0);
      expect(che.getStats().links).toBe(1);
    });

    it('should count total added', () => {
      che.addLink('l1', 0);
      expect(che.getStats().totalAdded).toBe(1);
    });

    it('should count total executed', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      expect(che.getStats().totalExecuted).toBe(1);
    });

    it('should count total completed', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      che.complete('che-1');
      expect(che.getStats().totalCompleted).toBe(1);
    });

    it('should count total failed', () => {
      che.addLink('l1', 0);
      che.fail('che-1');
      expect(che.getStats().totalFailed).toBe(1);
    });

    it('should count pending', () => {
      che.addLink('l1', 0);
      expect(che.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      expect(che.getStats().running).toBe(1);
    });

    it('should count completed', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      che.complete('che-1');
      expect(che.getStats().completed).toBe(1);
    });

    it('should count failed', () => {
      che.addLink('l1', 0);
      che.fail('che-1');
      expect(che.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      che.addLink('l1', 0);
      expect(che.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      che.addLink('l1', 0);
      che.setActive('che-1', false);
      expect(che.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      expect(che.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      che.addLink('a', 0);
      che.addLink('a', 1);
      expect(che.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get link', () => {
      che.addLink('l1', 0);
      expect(che.getLink('che-1')?.name).toBe('l1');
    });

    it('should get all', () => {
      che.addLink('l1', 0);
      expect(che.getAllLinks()).toHaveLength(1);
    });

    it('should check existence', () => {
      che.addLink('l1', 0);
      expect(che.hasLink('che-1')).toBe(true);
    });

    it('should count', () => {
      expect(che.getCount()).toBe(0);
      che.addLink('l1', 0);
      expect(che.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      che.addLink('l1', 0);
      expect(che.getName('che-1')).toBe('l1');
    });

    it('should get index', () => {
      che.addLink('l1', 5);
      expect(che.getIndex('che-1')).toBe(5);
    });

    it('should get result', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      che.complete('che-1', 'res');
      expect(che.getResult('che-1')).toBe('res');
    });

    it('should get hits', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      expect(che.getHits('che-1')).toBe(1);
    });

    it('should check pending', () => {
      che.addLink('l1', 0);
      expect(che.isPending('che-1')).toBe(true);
    });

    it('should check running', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      expect(che.isRunning('che-1')).toBe(true);
    });

    it('should check completed', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      che.complete('che-1');
      expect(che.isCompleted('che-1')).toBe(true);
    });

    it('should check failed', () => {
      che.addLink('l1', 0);
      che.fail('che-1');
      expect(che.isFailed('che-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      che.addLink('l1', 0);
      expect(che.setActive('che-1', false)).toBe(true);
    });

    it('should set name', () => {
      che.addLink('l1', 0);
      expect(che.setName('che-1', 'l2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(che.setActive('unknown', false)).toBe(false);
      expect(che.setName('unknown', 'l')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      che.setActive('che-1', false);
      che.resetAll();
      expect(che.getStatus('che-1')).toBe('pending');
      expect(che.isActive('che-1')).toBe(true);
    });
  });

  describe('by status / name / state', () => {
    it('should get by status', () => {
      che.addLink('l1', 0);
      expect(che.getByStatus('pending')).toHaveLength(1);
    });

    it('should get by name', () => {
      che.addLink('l1', 0);
      expect(che.getByName('l1')).toHaveLength(1);
    });

    it('should get active', () => {
      che.addLink('l1', 0);
      expect(che.getActiveLinks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      che.addLink('l1', 0);
      che.setActive('che-1', false);
      expect(che.getInactiveLinks()).toHaveLength(1);
    });

    it('should get all names', () => {
      che.addLink('a', 0);
      che.addLink('b', 1);
      expect(che.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      che.addLink('l1', 0);
      expect(che.getNewest()?.id).toBe('che-1');
    });

    it('should return null for empty newest', () => {
      expect(che.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      che.addLink('l1', 0);
      expect(che.getOldest()?.id).toBe('che-1');
    });

    it('should return null for empty oldest', () => {
      expect(che.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      che.addLink('l1', 0);
      expect(che.getCreatedAt('che-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      expect(che.getUpdatedAt('che-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      che.addLink('l1', 0);
      expect(che.getTotalAdded()).toBe(1);
    });

    it('should get total executed', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      expect(che.getTotalExecuted()).toBe(1);
    });

    it('should get total completed', () => {
      che.addLink('l1', 0);
      che.execute('che-1');
      che.complete('che-1');
      expect(che.getTotalCompleted()).toBe(1);
    });

    it('should get total failed', () => {
      che.addLink('l1', 0);
      che.fail('che-1');
      expect(che.getTotalFailed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many links', () => {
      for (let i = 0; i < 50; i++) {
        che.addLink(`l${i}`, i);
      }
      expect(che.getCount()).toBe(50);
    });
  });
});