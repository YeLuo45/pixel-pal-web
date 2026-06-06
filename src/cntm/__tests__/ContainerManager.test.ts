/**
 * ContainerManager Tests
 * nanobot-design Container Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContainerManager } from '../ContainerManager';

describe('ContainerManager', () => {
  let cntm: ContainerManager;

  beforeEach(() => {
    cntm = new ContainerManager();
  });

  afterEach(() => {
    cntm.clearAll();
  });

  // ============================================================
  // create / start / stop / restart
  // ============================================================
  describe('create / start / stop / restart', () => {
    it('should create', () => {
      expect(cntm.create('c1', 'nginx')).toBe('cntm-1');
    });

    it('should mark as active', () => {
      const id = cntm.create('c1', 'nginx');
      expect(cntm.isActive(id)).toBe(true);
    });

    it('should mark as not running', () => {
      const id = cntm.create('c1', 'nginx');
      expect(cntm.isRunning(id)).toBe(false);
    });

    it('should start', () => {
      const id = cntm.create('c1', 'nginx');
      expect(cntm.start(id)).toBe(true);
    });

    it('should mark as running', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      expect(cntm.isRunning(id)).toBe(true);
    });

    it('should log history on start', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      expect(cntm.getHistory(id)).toEqual([true]);
    });

    it('should not start inactive', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.setActive(id, false);
      expect(cntm.start(id)).toBe(false);
    });

    it('should return false for unknown start', () => {
      expect(cntm.start('unknown')).toBe(false);
    });

    it('should stop', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      expect(cntm.stop(id)).toBe(true);
    });

    it('should mark as not running on stop', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      cntm.stop(id);
      expect(cntm.isRunning(id)).toBe(false);
    });

    it('should not stop inactive', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.setActive(id, false);
      expect(cntm.stop(id)).toBe(false);
    });

    it('should return false for unknown stop', () => {
      expect(cntm.stop('unknown')).toBe(false);
    });

    it('should restart', () => {
      const id = cntm.create('c1', 'nginx');
      expect(cntm.restart(id)).toBe(true);
    });

    it('should increment restarts on restart', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      expect(cntm.getRestarts(id)).toBe(1);
    });

    it('should mark as running on restart', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      expect(cntm.isRunning(id)).toBe(true);
    });

    it('should not restart inactive', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.setActive(id, false);
      expect(cntm.restart(id)).toBe(false);
    });

    it('should return false for unknown restart', () => {
      expect(cntm.restart('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cntm.create('c1', 'nginx');
      const stats = cntm.getStats();
      expect(stats.containers).toBe(1);
    });

    it('should count running', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      expect(cntm.getStats().running).toBe(1);
    });

    it('should count stopped', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getStats().stopped).toBe(1);
    });

    it('should count total restarts', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      expect(cntm.getStats().totalRestarts).toBe(1);
    });

    it('should count active', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.setActive(id, false);
      expect(cntm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      expect(cntm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      cntm.create('c1', 'nginx');
      cntm.create('c2', 'redis');
      expect(cntm.getStats().uniqueNames).toBe(2);
    });

    it('should count unique images', () => {
      cntm.create('c1', 'nginx');
      cntm.create('c2', 'redis');
      expect(cntm.getStats().uniqueImages).toBe(2);
    });

    it('should compute avg restarts', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      expect(cntm.getStats().avgRestarts).toBe(1);
    });

    it('should get max restarts', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      cntm.restart(id);
      expect(cntm.getStats().maxRestarts).toBe(2);
    });

    it('should get min restarts', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getStats().minRestarts).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get container', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getContainer('cntm-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getAllContainers()).toHaveLength(1);
    });

    it('should remove', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.removeContainer('cntm-1')).toBe(true);
    });

    it('should check existence', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.hasContainer('cntm-1')).toBe(true);
    });

    it('should count', () => {
      expect(cntm.getCount()).toBe(0);
      cntm.create('c1', 'nginx');
      expect(cntm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getName('cntm-1')).toBe('c1');
    });

    it('should get image', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getImage('cntm-1')).toBe('nginx');
    });

    it('should get restarts', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getRestarts('cntm-1')).toBe(0);
    });

    it('should get history', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getHistory('cntm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      expect(cntm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.setActive('cntm-1', false)).toBe(true);
    });

    it('should set name', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.setName('cntm-1', 'c2')).toBe(true);
    });

    it('should set image', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.setImage('cntm-1', 'redis')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cntm.setActive('unknown', false)).toBe(false);
      expect(cntm.setName('unknown', 'c')).toBe(false);
      expect(cntm.setImage('unknown', 'i')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      cntm.setActive(id, false);
      cntm.resetAll();
      expect(cntm.getRestarts(id)).toBe(0);
      expect(cntm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / image / state
  // ============================================================
  describe('by name / image / state', () => {
    it('should get by name', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getByName('c1')).toHaveLength(1);
    });

    it('should get by image', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getByImage('nginx')).toHaveLength(1);
    });

    it('should get running', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      expect(cntm.getRunningContainers()).toHaveLength(1);
    });

    it('should get stopped', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getStoppedContainers()).toHaveLength(1);
    });

    it('should get active', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getActiveContainers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cntm.create('c1', 'nginx');
      cntm.setActive('cntm-1', false);
      expect(cntm.getInactiveContainers()).toHaveLength(1);
    });

    it('should get all names', () => {
      cntm.create('c1', 'nginx');
      cntm.create('c2', 'redis');
      expect(cntm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getNameCount()).toBe(1);
    });

    it('should get all images', () => {
      cntm.create('c1', 'nginx');
      cntm.create('c2', 'redis');
      expect(cntm.getAllImages()).toHaveLength(2);
    });

    it('should get image count', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getImageCount()).toBe(1);
    });

    it('should get by min restarts', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      expect(cntm.getByMinRestarts(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most restarts', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      cntm.restart(id);
      expect(cntm.getMostRestarts()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(cntm.getMostRestarts()).toBeNull();
    });

    it('should get newest', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getNewest()?.id).toBe('cntm-1');
    });

    it('should return null for empty newest', () => {
      expect(cntm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getOldest()?.id).toBe('cntm-1');
    });

    it('should return null for empty oldest', () => {
      expect(cntm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cntm.create('c1', 'nginx');
      expect(cntm.getCreatedAt('cntm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.start(id);
      expect(cntm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total restarts', () => {
      const id = cntm.create('c1', 'nginx');
      cntm.restart(id);
      expect(cntm.getTotalRestarts()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many containers', () => {
      for (let i = 0; i < 50; i++) {
        cntm.create(`c${i}`, 'nginx');
      }
      expect(cntm.getCount()).toBe(50);
    });
  });
});