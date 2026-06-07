/**
 * ReplicaEngine Tests
 * thunderbolt-design Replica Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReplicaEngine } from '../ReplicaEngine';

describe('ReplicaEngine', () => {
  let rpe: ReplicaEngine;

  beforeEach(() => {
    rpe = new ReplicaEngine();
  });

  afterEach(() => {
    rpe.clearAll();
  });

  describe('add / sync / failover / fail / remove', () => {
    it('should add', () => {
      expect(rpe.add('r1')).toMatch(/^rpe2-/);
    });

    it('should default state to passive', () => {
      rpe.add('r1');
      expect(rpe.getState(rpe.getAllReplicas()[0].id)).toBe('passive');
    });

    it('should set active on primary', () => {
      rpe.add('r1', true);
      expect(rpe.getState(rpe.getAllReplicas()[0].id)).toBe('active');
    });

    it('should mark as active', () => {
      rpe.add('r1');
      expect(rpe.isActive(rpe.getAllReplicas()[0].id)).toBe(true);
    });

    it('should sync', () => {
      const id = rpe.add('r1');
      expect(rpe.sync(id, 5)).toBe(true);
    });

    it('should set syncing on sync', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.isSyncing(id)).toBe(true);
    });

    it('should set lag on sync', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.getLag(id)).toBe(5);
    });

    it('should not sync inactive', () => {
      const id = rpe.add('r1');
      rpe.setActive(id, false);
      expect(rpe.sync(id, 5)).toBe(false);
    });

    it('should return false for unknown sync', () => {
      expect(rpe.sync('unknown', 5)).toBe(false);
    });

    it('should failover', () => {
      const id = rpe.add('r1');
      expect(rpe.failover(id)).toBe(true);
    });

    it('should toggle primary on failover', () => {
      const id = rpe.add('r1');
      expect(rpe.isPrimary(id)).toBe(false);
      rpe.failover(id);
      expect(rpe.isPrimary(id)).toBe(true);
    });

    it('should not failover inactive', () => {
      const id = rpe.add('r1');
      rpe.setActive(id, false);
      expect(rpe.failover(id)).toBe(false);
    });

    it('should return false for unknown failover', () => {
      expect(rpe.failover('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = rpe.add('r1');
      expect(rpe.fail(id)).toBe(true);
    });

    it('should set failed', () => {
      const id = rpe.add('r1');
      rpe.fail(id);
      expect(rpe.isFailed(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(rpe.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = rpe.add('r1');
      expect(rpe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      rpe.add('r1');
      expect(rpe.getStats().replicas).toBe(1);
    });

    it('should count total added', () => {
      rpe.add('r1');
      expect(rpe.getStats().totalAdded).toBe(1);
    });

    it('should count total synced', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.getStats().totalSynced).toBe(1);
    });

    it('should count total failovers', () => {
      const id = rpe.add('r1');
      rpe.failover(id);
      expect(rpe.getStats().totalFailovers).toBe(1);
    });

    it('should count active', () => {
      rpe.add('r1', true);
      expect(rpe.getStats().active).toBe(1);
    });

    it('should count passive', () => {
      rpe.add('r1');
      expect(rpe.getStats().passive).toBe(1);
    });

    it('should count syncing', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.getStats().syncing).toBe(1);
    });

    it('should count failed', () => {
      const id = rpe.add('r1');
      rpe.fail(id);
      expect(rpe.getStats().failed).toBe(1);
    });

    it('should count primary', () => {
      rpe.add('r1', true);
      expect(rpe.getStats().primary).toBe(1);
    });

    it('should count non-primary', () => {
      rpe.add('r1');
      expect(rpe.getStats().nonPrimary).toBe(1);
    });

    it('should count active2', () => {
      rpe.add('r1');
      expect(rpe.getStats().active2).toBe(1);
    });

    it('should count inactive', () => {
      const id = rpe.add('r1');
      rpe.setActive(id, false);
      expect(rpe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      rpe.add('a');
      rpe.add('a');
      expect(rpe.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get replica', () => {
      const id = rpe.add('r1');
      expect(rpe.getReplica(id)?.name).toBe('r1');
    });

    it('should get all', () => {
      rpe.add('r1');
      expect(rpe.getAllReplicas()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = rpe.add('r1');
      expect(rpe.hasReplica(id)).toBe(true);
    });

    it('should count', () => {
      expect(rpe.getCount()).toBe(0);
      rpe.add('r1');
      expect(rpe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = rpe.add('r1');
      expect(rpe.getName(id)).toBe('r1');
    });

    it('should get hits', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.getHits(id)).toBe(1);
    });

    it('should check active state', () => {
      rpe.add('r1', true);
      expect(rpe.isActiveState(rpe.getAllReplicas()[0].id)).toBe(true);
    });

    it('should check passive', () => {
      rpe.add('r1');
      expect(rpe.isPassive(rpe.getAllReplicas()[0].id)).toBe(true);
    });

    it('should check syncing', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.isSyncing(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = rpe.add('r1');
      rpe.fail(id);
      expect(rpe.isFailed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = rpe.add('r1');
      expect(rpe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = rpe.add('r1');
      expect(rpe.setName(id, 'r2')).toBe(true);
    });

    it('should set state', () => {
      const id = rpe.add('r1');
      expect(rpe.setState(id, 'syncing')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rpe.setActive('unknown', false)).toBe(false);
      expect(rpe.setName('unknown', 'r')).toBe(false);
      expect(rpe.setState('unknown', 'active')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      rpe.setActive(id, false);
      rpe.resetAll();
      expect(rpe.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      rpe.add('r1');
      expect(rpe.getByState('passive')).toHaveLength(1);
    });

    it('should get active', () => {
      rpe.add('r1');
      expect(rpe.getActiveReplicas()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = rpe.add('r1');
      rpe.setActive(id, false);
      expect(rpe.getInactiveReplicas()).toHaveLength(1);
    });

    it('should get primary', () => {
      rpe.add('r1', true);
      expect(rpe.getPrimaryReplicas()).toHaveLength(1);
    });

    it('should get non-primary', () => {
      rpe.add('r1');
      expect(rpe.getNonPrimaryReplicas()).toHaveLength(1);
    });

    it('should get all names', () => {
      rpe.add('a');
      rpe.add('b');
      expect(rpe.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      rpe.add('r1');
      expect(rpe.getNewest()?.name).toBe('r1');
    });

    it('should return null for empty newest', () => {
      expect(rpe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rpe.add('r1');
      expect(rpe.getOldest()?.name).toBe('r1');
    });

    it('should return null for empty oldest', () => {
      expect(rpe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = rpe.add('r1');
      expect(rpe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      rpe.add('r1');
      expect(rpe.getTotalAdded()).toBe(1);
    });

    it('should get total synced', () => {
      const id = rpe.add('r1');
      rpe.sync(id, 5);
      expect(rpe.getTotalSynced()).toBe(1);
    });

    it('should get total failovers', () => {
      const id = rpe.add('r1');
      rpe.failover(id);
      expect(rpe.getTotalFailovers()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many replicas', () => {
      for (let i = 0; i < 50; i++) {
        rpe.add(`r${i}`);
      }
      expect(rpe.getCount()).toBe(50);
    });
  });
});