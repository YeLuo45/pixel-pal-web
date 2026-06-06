/**
 * ServiceManager Tests
 * nanobot-design Service Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceManager } from '../ServiceManager';

describe('ServiceManager', () => {
  let sm: ServiceManager;

  beforeEach(() => {
    sm = new ServiceManager();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // register / call
  // ============================================================
  describe('register / call', () => {
    it('should register', () => {
      expect(sm.register('s1', '1.0')).toBe('svcm-1');
    });

    it('should mark as active', () => {
      const id = sm.register('s1', '1.0');
      expect(sm.isActive(id)).toBe(true);
    });

    it('should call', () => {
      const id = sm.register('s1', '1.0');
      expect(sm.call(id)).toBe(true);
    });

    it('should increment calls on call', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      expect(sm.getCalls(id)).toBe(1);
    });

    it('should increment total success on success call', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, true);
      expect(sm.getTotalSuccess(id)).toBe(1);
    });

    it('should increment total failed on failed call', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, false);
      expect(sm.getTotalFailed(id)).toBe(1);
    });

    it('should not call inactive', () => {
      const id = sm.register('s1', '1.0');
      sm.setActive(id, false);
      expect(sm.call(id)).toBe(false);
    });

    it('should return false for unknown call', () => {
      expect(sm.call('unknown')).toBe(false);
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

    it('should count total calls', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      expect(sm.getStats().totalCalls).toBe(1);
    });

    it('should count active', () => {
      sm.register('s1', '1.0');
      expect(sm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sm.register('s1', '1.0');
      sm.setActive(id, false);
      expect(sm.getStats().inactive).toBe(1);
    });

    it('should compute avg calls', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      expect(sm.getStats().avgCalls).toBe(1);
    });

    it('should count names', () => {
      sm.register('s1', '1.0');
      sm.register('s2', '1.0');
      expect(sm.getStats().names).toBe(2);
    });

    it('should count versions', () => {
      sm.register('s1', '1.0');
      sm.register('s1', '2.0');
      expect(sm.getStats().versions).toBe(2);
    });

    it('should count total hits', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      expect(sm.getStats().totalHits).toBe(1);
    });

    it('should count total success', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, true);
      expect(sm.getStats().totalSuccess).toBe(1);
    });

    it('should count total failed', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, false);
      expect(sm.getStats().totalFailed).toBe(1);
    });

    it('should compute success rate', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, true);
      expect(sm.getStats().successRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get service', () => {
      sm.register('s1', '1.0');
      expect(sm.getService('svcm-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sm.register('s1', '1.0');
      expect(sm.getAllServices()).toHaveLength(1);
    });

    it('should remove', () => {
      sm.register('s1', '1.0');
      expect(sm.removeService('svcm-1')).toBe(true);
    });

    it('should check existence', () => {
      sm.register('s1', '1.0');
      expect(sm.hasService('svcm-1')).toBe(true);
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
      expect(sm.getName('svcm-1')).toBe('s1');
    });

    it('should get version', () => {
      sm.register('s1', '1.0');
      expect(sm.getVersion('svcm-1')).toBe('1.0');
    });

    it('should get calls', () => {
      sm.register('s1', '1.0');
      expect(sm.getCalls('svcm-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      expect(sm.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      sm.register('s1', '1.0');
      expect(sm.getHistory('svcm-1').length).toBeGreaterThan(0);
    });

    it('should get total success', () => {
      sm.register('s1', '1.0');
      expect(sm.getTotalSuccess('svcm-1')).toBe(0);
    });

    it('should get total failed', () => {
      sm.register('s1', '1.0');
      expect(sm.getTotalFailed('svcm-1')).toBe(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      sm.register('s1', '1.0');
      expect(sm.setActive('svcm-1', false)).toBe(true);
    });

    it('should set name', () => {
      sm.register('s1', '1.0');
      expect(sm.setName('svcm-1', 's2')).toBe(true);
    });

    it('should set version', () => {
      sm.register('s1', '1.0');
      expect(sm.setVersion('svcm-1', '2.0')).toBe(true);
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
      sm.call(id);
      sm.setActive(id, false);
      sm.resetAll();
      expect(sm.getCalls(id)).toBe(0);
      expect(sm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / version
  // ============================================================
  describe('by name / version', () => {
    it('should get by name', () => {
      sm.register('s1', '1.0');
      expect(sm.getByName('s1')).toHaveLength(1);
    });

    it('should get by version', () => {
      sm.register('s1', '1.0');
      expect(sm.getByVersion('1.0')).toHaveLength(1);
    });

    it('should get active', () => {
      sm.register('s1', '1.0');
      expect(sm.getActiveServices()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sm.register('s1', '1.0');
      sm.setActive('svcm-1', false);
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

    it('should get by min calls', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      expect(sm.getByMinCalls(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most calls', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      sm.call(id);
      expect(sm.getMostCalls()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sm.getMostCalls()).toBeNull();
    });

    it('should get newest', () => {
      sm.register('s1', '1.0');
      expect(sm.getNewest()?.id).toBe('svcm-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.register('s1', '1.0');
      expect(sm.getOldest()?.id).toBe('svcm-1');
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
      expect(sm.getCreatedAt('svcm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total calls', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id);
      expect(sm.getTotalCalls()).toBe(1);
    });

    it('should get total success global', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, true);
      expect(sm.getTotalSuccessGlobal()).toBe(1);
    });

    it('should get total failed global', () => {
      const id = sm.register('s1', '1.0');
      sm.call(id, false);
      expect(sm.getTotalFailedGlobal()).toBe(1);
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