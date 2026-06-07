/**
 * SyncEngine Tests
 * nanobot-design Sync Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SyncEngine } from '../SyncEngine';

describe('SyncEngine', () => {
  let ste: SyncEngine;

  beforeEach(() => {
    ste = new SyncEngine();
  });

  afterEach(() => {
    ste.clearAll();
  });

  describe('register / sync / resolve / remove', () => {
    it('should register', () => {
      expect(ste.register('a', 'b', 'pull')).toBe('ste-1');
    });

    it('should mark as active', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.isActive('ste-1')).toBe(true);
    });

    it('should sync', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.sync('ste-1')).toBe(true);
    });

    it('should not sync inactive', () => {
      ste.register('a', 'b', 'pull');
      ste.setActive('ste-1', false);
      expect(ste.sync('ste-1')).toBe(false);
    });

    it('should return false for unknown sync', () => {
      expect(ste.sync('unknown')).toBe(false);
    });

    it('should resolve', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 1, 1);
      expect(ste.resolve('ste-1')).toBe(true);
    });

    it('should return false for unknown resolve', () => {
      expect(ste.resolve('unknown')).toBe(false);
    });

    it('should remove', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.remove('ste-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getStats().tasks).toBe(1);
    });

    it('should count total synced', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1');
      expect(ste.getStats().totalSynced).toBe(1);
    });

    it('should count total conflicts', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 1, 1);
      expect(ste.getStats().totalConflicts).toBe(1);
    });

    it('should count pull', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getStats().pull).toBe(1);
    });

    it('should count push', () => {
      ste.register('a', 'b', 'push');
      expect(ste.getStats().push).toBe(1);
    });

    it('should count bidirectional', () => {
      ste.register('a', 'b', 'bi-directional');
      expect(ste.getStats().bidirectional).toBe(1);
    });

    it('should count active', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      ste.register('a', 'b', 'pull');
      ste.setActive('ste-1', false);
      expect(ste.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1');
      expect(ste.getStats().totalHits).toBe(1);
    });

    it('should count unique sources', () => {
      ste.register('a', 'b', 'pull');
      ste.register('a', 'c', 'pull');
      expect(ste.getStats().uniqueSources).toBe(1);
    });

    it('should count unique targets', () => {
      ste.register('a', 'b', 'pull');
      ste.register('c', 'b', 'pull');
      expect(ste.getStats().uniqueTargets).toBe(1);
    });

    it('should count total records', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 5);
      expect(ste.getStats().totalRecords).toBe(5);
    });

    it('should compute avg records', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 5);
      expect(ste.getStats().avgRecords).toBe(5);
    });

    it('should get max records', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 5);
      expect(ste.getStats().maxRecords).toBe(5);
    });

    it('should get min records', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getStats().minRecords).toBe(0);
    });
  });

  describe('queries', () => {
    it('should get task', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getTask('ste-1')?.source).toBe('a');
    });

    it('should get all', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getAllTasks()).toHaveLength(1);
    });

    it('should check existence', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.hasTask('ste-1')).toBe(true);
    });

    it('should count', () => {
      expect(ste.getCount()).toBe(0);
      ste.register('a', 'b', 'pull');
      expect(ste.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get source', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getSource('ste-1')).toBe('a');
    });

    it('should get target', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getTarget('ste-1')).toBe('b');
    });

    it('should get direction', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getDirection('ste-1')).toBe('pull');
    });

    it('should get records', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 5);
      expect(ste.getRecords('ste-1')).toBe(5);
    });

    it('should get conflicts', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 1, 1);
      expect(ste.getConflicts('ste-1')).toBe(1);
    });

    it('should get hits', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1');
      expect(ste.getHits('ste-1')).toBe(1);
    });

    it('should check pull', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.isPull('ste-1')).toBe(true);
    });

    it('should check push', () => {
      ste.register('a', 'b', 'push');
      expect(ste.isPush('ste-1')).toBe(true);
    });

    it('should check bidirectional', () => {
      ste.register('a', 'b', 'bi-directional');
      expect(ste.isBidirectional('ste-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.setActive('ste-1', false)).toBe(true);
    });

    it('should set source', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.setSource('ste-1', 'c')).toBe(true);
    });

    it('should set target', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.setTarget('ste-1', 'd')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ste.setActive('unknown', false)).toBe(false);
      expect(ste.setSource('unknown', 'c')).toBe(false);
      expect(ste.setTarget('unknown', 'd')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 5, 1);
      ste.setActive('ste-1', false);
      ste.resetAll();
      expect(ste.getRecords('ste-1')).toBe(0);
      expect(ste.isActive('ste-1')).toBe(true);
    });
  });

  describe('by direction / state', () => {
    it('should get by direction', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getByDirection('pull')).toHaveLength(1);
    });

    it('should get active', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getActiveTasks()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ste.register('a', 'b', 'pull');
      ste.setActive('ste-1', false);
      expect(ste.getInactiveTasks()).toHaveLength(1);
    });

    it('should get all sources', () => {
      ste.register('a', 'b', 'pull');
      ste.register('c', 'd', 'pull');
      expect(ste.getAllSources()).toHaveLength(2);
    });

    it('should get all targets', () => {
      ste.register('a', 'b', 'pull');
      ste.register('c', 'd', 'pull');
      expect(ste.getAllTargets()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getNewest()?.id).toBe('ste-1');
    });

    it('should return null for empty newest', () => {
      expect(ste.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getOldest()?.id).toBe('ste-1');
    });

    it('should return null for empty oldest', () => {
      expect(ste.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      ste.register('a', 'b', 'pull');
      expect(ste.getCreatedAt('ste-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1');
      expect(ste.getUpdatedAt('ste-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total synced', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1');
      expect(ste.getTotalSynced()).toBe(1);
    });

    it('should get total conflicts', () => {
      ste.register('a', 'b', 'pull');
      ste.sync('ste-1', 1, 1);
      expect(ste.getTotalConflicts()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        ste.register(`s${i}`, `t${i}`, 'pull');
      }
      expect(ste.getCount()).toBe(50);
    });
  });
});