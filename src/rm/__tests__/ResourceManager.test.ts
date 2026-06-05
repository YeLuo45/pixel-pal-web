/**
 * ResourceManager Tests
 * thunderbolt-design Resource Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResourceManager } from '../ResourceManager';

describe('ResourceManager', () => {
  let rm: ResourceManager;

  beforeEach(() => {
    rm = new ResourceManager();
  });

  afterEach(() => {
    rm.clearAll();
  });

  // ============================================================
  // add / allocate / release
  // ============================================================
  describe('add / allocate / release', () => {
    it('should add', () => {
      expect(rm.add('cpu', 100)).toBe('rm-1');
    });

    it('should allocate', () => {
      const id = rm.add('cpu', 100);
      expect(rm.allocate(id, 30)).toBe(true);
    });

    it('should not allocate over capacity', () => {
      const id = rm.add('cpu', 100);
      expect(rm.allocate(id, 150)).toBe(false);
    });

    it('should release', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      expect(rm.release(id, 10)).toBe(true);
    });

    it('should not release more than used', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      expect(rm.release(id, 50)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(rm.allocate('unknown', 10)).toBe(false);
      expect(rm.release('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rm.add('cpu', 100);
      const stats = rm.getStats();
      expect(stats.resources).toBe(1);
    });

    it('should compute total capacity', () => {
      rm.add('cpu', 100);
      rm.add('mem', 200);
      expect(rm.getStats().totalCapacity).toBe(300);
    });

    it('should compute used', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      expect(rm.getStats().used).toBe(30);
    });

    it('should compute available', () => {
      rm.add('cpu', 100);
      expect(rm.getStats().available).toBe(100);
    });

    it('should compute utilization', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 50);
      expect(rm.getStats().utilization).toBe(0.5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get resource', () => {
      rm.add('cpu', 100);
      expect(rm.getResource('rm-1')?.name).toBe('cpu');
    });

    it('should get all', () => {
      rm.add('cpu', 100);
      expect(rm.getAllResources()).toHaveLength(1);
    });

    it('should remove', () => {
      rm.add('cpu', 100);
      expect(rm.removeResource('rm-1')).toBe(true);
    });

    it('should check existence', () => {
      rm.add('cpu', 100);
      expect(rm.hasResource('rm-1')).toBe(true);
    });

    it('should count', () => {
      expect(rm.getCount()).toBe(0);
      rm.add('cpu', 100);
      expect(rm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      rm.add('cpu', 100);
      expect(rm.getName('rm-1')).toBe('cpu');
    });

    it('should get capacity', () => {
      rm.add('cpu', 100);
      expect(rm.getCapacity('rm-1')).toBe(100);
    });

    it('should get used', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      expect(rm.getUsed(id)).toBe(30);
    });

    it('should get available', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      expect(rm.getAvailable(id)).toBe(70);
    });

    it('should get utilization', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 50);
      expect(rm.getUtilization(id)).toBe(0.5);
    });

    it('should return 0 for empty utilization', () => {
      expect(rm.getUtilization('unknown')).toBe(0);
    });

    it('should get total allocated', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      expect(rm.getTotalAllocated(id)).toBe(30);
    });

    it('should get total released', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      rm.release(id, 10);
      expect(rm.getTotalReleased(id)).toBe(10);
    });

    it('should get created at', () => {
      rm.add('cpu', 100);
      expect(rm.getCreatedAt('rm-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set capacity', () => {
      const id = rm.add('cpu', 100);
      expect(rm.setCapacity(id, 200)).toBe(true);
    });

    it('should set name', () => {
      const id = rm.add('cpu', 100);
      expect(rm.setName(id, 'gpu')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rm.setCapacity('unknown', 200)).toBe(false);
      expect(rm.setName('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      rm.resetAll();
      expect(rm.getUsed(id)).toBe(0);
    });
  });

  // ============================================================
  // by name / capacity
  // ============================================================
  describe('by name / capacity', () => {
    it('should get by name', () => {
      rm.add('cpu', 100);
      expect(rm.getByName('cpu')).toHaveLength(1);
    });

    it('should get by min capacity', () => {
      rm.add('cpu', 100);
      rm.add('mem', 200);
      expect(rm.getByMinCapacity(150)).toHaveLength(1);
    });

    it('should get by min utilization', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 50);
      expect(rm.getByMinUtilization(0.3)).toHaveLength(1);
    });

    it('should get all names', () => {
      rm.add('cpu', 100);
      rm.add('mem', 200);
      expect(rm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      rm.add('cpu', 100);
      expect(rm.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most used', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 30);
      expect(rm.getMostUsed()?.id).toBe(id);
    });

    it('should return null for empty most used', () => {
      expect(rm.getMostUsed()).toBeNull();
    });

    it('should get most available', () => {
      rm.add('cpu', 100);
      expect(rm.getMostAvailable()?.name).toBe('cpu');
    });

    it('should return null for empty most available', () => {
      expect(rm.getMostAvailable()).toBeNull();
    });

    it('should get highest utilization', () => {
      const id = rm.add('cpu', 100);
      rm.allocate(id, 50);
      expect(rm.getHighestUtilization()?.id).toBe(id);
    });

    it('should return null for empty highest', () => {
      expect(rm.getHighestUtilization()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many resources', () => {
      for (let i = 0; i < 50; i++) {
        rm.add(`r${i}`, 100);
      }
      expect(rm.getCount()).toBe(50);
    });
  });
});