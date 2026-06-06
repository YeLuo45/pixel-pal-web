/**
 * ServiceManagerV2 Tests
 * nanobot-design Service Manager v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceManagerV2 } from '../ServiceManagerV2';

describe('ServiceManagerV2', () => {
  let sm: ServiceManagerV2;

  beforeEach(() => {
    sm = new ServiceManagerV2();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // register / setStatus / call
  // ============================================================
  describe('register / setStatus / call', () => {
    it('should register', () => {
      expect(sm.register('s1', '1.0')).toBe('svcm2-1');
    });

    it('should mark as active', () => {
      const id = sm.register('s1', '1.0');
      expect(sm.isActive(id)).toBe(true);
    });

    it('should mark as status active', () => {
      const id = sm.register('s1', '1.0');
      expect(sm.isActive2(id)).toBe(true);
    });

    it('should set status', () => {
      const id = sm.register('s1', '1.0');
      expect(sm.setStatus(id, 'draining')).toBe(true);
    });

    it('should mark as draining', () => {
      const id = sm.register('s1', '1.0');
      sm.setStatus(id, 'draining');
      expect(sm.isDraining(id)).toBe(true);
    });

    it('should mark as stopped', () => {
      const id = sm.register('s1', '1.0');
      sm.setStatus(id, 'stopped');
      expect(sm.isStopped(id)).toBe(true);
    });

    it('should not set status inactive', () => {
      const id = sm.register('s1', '1.0');
      sm.setActive(id, false);
      expect(sm.setStatus(id, 'draining')).toBe(false);
    });

    it('should return false for unknown setStatus', () => {
      expect(sm.setStatus('unknown', 'draining')).toBe(false);
    });

    it('should call', () => {
      const id = sm.register('s1', '1.0');
      expect(sm.call(id, 10)).toBe(true);
    });

    it('should increment calls on call', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      expect(sm.getCalls(id)).toBe(1);
    });

    it('should accumulate load on call', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      sm.call(id, 20);
      expect(sm.getLoad(id)).toBe(30);
    });

    it('should not call non-active', () => {
      const id = sm.register('s1', '1.0');
      sm.setStatus(id, 'draining');
      expect(sm.call(id, 10)).toBe(false);
    });

    it('should not call inactive', () => {
      const id = sm.register('s1', '1.0');
      sm.setActive(id, false);
      expect(sm.call(id, 10)).toBe(false);
    });

    it('should return false for unknown call', () => {
      expect(sm.call('unknown', 10)).toBe(false);
    });

    it('should set load', () => {
      const id = sm.register('s1', '1.0');
      expect(sm.setLoad(id, 100)).toBe(true);
    });

    it('should return false for unknown setLoad', () => {
      expect(sm.setLoad('unknown', 100)).toBe(false);
    });

    it('should reset', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      expect(sm.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      sm.reset(id);
      expect(sm.getLoad(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(sm.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sm.register('s1', '1.0');
      const stats = sm.getStats();
      expect(stats.services).toBe(1);
    });

    it('should count active', () => {
      sm.register('s1', '1.0');
      expect(sm.getStats().active).toBe(1);
    });

    it('should count draining', () => {
      const id = sm.register('s1', '1.0');
      sm.setStatus(id, 'draining');
      expect(sm.getStats().draining).toBe(1);
    });

    it('should count stopped', () => {
      const id = sm.register('s1', '1.0');
      sm.setStatus(id, 'stopped');
      expect(sm.getStats().stopped).toBe(1);
    });

    it('should count total hits', () => {
      const id = sm.register('s1', '1.0');
      sm.setStatus(id, 'draining');
      expect(sm.getStats().totalHits).toBe(1);
    });

    it('should count total calls', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      expect(sm.getStats().totalCalls).toBe(1);
    });

    it('should count total load', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      expect(sm.getStats().totalLoad).toBe(10);
    });

    it('should count unique names', () => {
      sm.register('s1', '1.0');
      sm.register('s2', '1.0');
      expect(sm.getStats().uniqueNames).toBe(2);
    });

    it('should count unique versions', () => {
      sm.register('s1', '1.0');
      sm.register('s1', '2.0');
      expect(sm.getStats().uniqueVersions).toBe(2);
    });

    it('should compute avg load', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      expect(sm.getStats().avgLoad).toBe(10);
    });

    it('should get max load', () => {
      sm.register('s1', '1.0');
      sm.register('s2', '1.0');
      sm.setLoad('svcm2-1', 100);
      expect(sm.getStats().maxLoad).toBe(100);
    });

    it('should get min load', () => {
      sm.register('s1', '1.0');
      sm.register('s2', '1.0');
      sm.setLoad('svcm2-1', 100);
      expect(sm.getStats().minLoad).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get service', () => {
      sm.register('s1', '1.0');
      expect(sm.getService('svcm2-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sm.register('s1', '1.0');
      expect(sm.getAllServices()).toHaveLength(1);
    });

    it('should remove', () => {
      sm.register('s1', '1.0');
      expect(sm.removeService('svcm2-1')).toBe(true);
    });

    it('should check existence', () => {
      sm.register('s1', '1.0');
      expect(sm.hasService('svcm2-1')).toBe(true);
    });

    it('should count', () => {
      expect(sm.getCount()).toBe(0);
      sm.register('s1', '1.0');
      expect(sm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      sm.register('s1', '1.0');
      expect(sm.getName('svcm2-1')).toBe('s1');
    });

    it('should get version', () => {
      sm.register('s1', '1.0');
      expect(sm.getVersion('svcm2-1')).toBe('1.0');
    });

    it('should get status', () => {
      sm.register('s1', '1.0');
      expect(sm.getStatus('svcm2-1')).toBe('active');
    });

    it('should get load', () => {
      sm.register('s1', '1.0');
      expect(sm.getLoad('svcm2-1')).toBe(0);
    });

    it('should get calls', () => {
      sm.register('s1', '1.0');
      expect(sm.getCalls('svcm2-1')).toBe(0);
    });

    it('should get history', () => {
      sm.register('s1', '1.0');
      expect(sm.getHistory('svcm2-1')).toEqual(['active']);
    });

    it('should get hits', () => {
      const id = sm.register('s1', '1.0');
      sm.setStatus(id, 'draining');
      expect(sm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      sm.register('s1', '1.0');
      expect(sm.setActive('svcm2-1', false)).toBe(true);
    });

    it('should set name', () => {
      sm.register('s1', '1.0');
      expect(sm.setName('svcm2-1', 's2')).toBe(true);
    });

    it('should set version', () => {
      sm.register('s1', '1.0');
      expect(sm.setVersion('svcm2-1', '2.0')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sm.setActive('unknown', false)).toBe(false);
      expect(sm.setName('unknown', 's')).toBe(false);
      expect(sm.setVersion('unknown', '1.0')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      sm.setActive(id, false);
      sm.resetAll();
      expect(sm.getLoad(id)).toBe(0);
      expect(sm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / version / status
  // ============================================================
  describe('by name / version / status', () => {
    it('should get by name', () => {
      sm.register('s1', '1.0');
      expect(sm.getByName('s1')).toHaveLength(1);
    });

    it('should get by version', () => {
      sm.register('s1', '1.0');
      expect(sm.getByVersion('1.0')).toHaveLength(1);
    });

    it('should get by status', () => {
      sm.register('s1', '1.0');
      expect(sm.getByStatus('active')).toHaveLength(1);
    });

    it('should get active services', () => {
      sm.register('s1', '1.0');
      expect(sm.getActiveServices()).toHaveLength(1);
    });

    it('should get inactive services', () => {
      sm.register('s1', '1.0');
      sm.setActive('svcm2-1', false);
      expect(sm.getInactiveServices()).toHaveLength(1);
    });

    it('should get all names', () => {
      sm.register('s1', '1.0');
      sm.register('s2', '1.0');
      expect(sm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      sm.register('s1', '1.0');
      expect(sm.getNameCount()).toBe(1);
    });

    it('should get all versions', () => {
      sm.register('s1', '1.0');
      sm.register('s1', '2.0');
      expect(sm.getAllVersions()).toHaveLength(2);
    });

    it('should get version count', () => {
      sm.register('s1', '1.0');
      expect(sm.getVersionCount()).toBe(1);
    });

    it('should get by min load', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 100);
      expect(sm.getByMinLoad(50)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most load', () => {
      const id = sm.register('s1', '1.0');
      sm.setLoad(id, 100);
      sm.register('s2', '1.0');
      expect(sm.getMostLoad()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sm.getMostLoad()).toBeNull();
    });

    it('should get newest', () => {
      sm.register('s1', '1.0');
      expect(sm.getNewest()?.id).toBe('svcm2-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.register('s1', '1.0');
      expect(sm.getOldest()?.id).toBe('svcm2-1');
    });

    it('should return null for empty oldest', () => {
      expect(sm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sm.register('s1', '1.0');
      expect(sm.getCreatedAt('svcm2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total calls', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      expect(sm.getTotalCalls()).toBe(1);
    });

    it('should get total load', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, 10);
      expect(sm.getTotalLoad()).toBe(10);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many services', () => {
      for (let i = 0; i < 50; i++) {
        sm.register(`s${i}`, '1.0');
      }
      expect(sm.getCount()).toBe(50);
    });
  });
});