/**
 * ClusterRegistry Tests
 * nanobot-design Cluster Registry
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClusterRegistry } from '../ClusterRegistry';

describe('ClusterRegistry', () => {
  let cr: ClusterRegistry;

  beforeEach(() => {
    cr = new ClusterRegistry();
  });

  afterEach(() => {
    cr.clearAll();
  });

  // ============================================================
  // register / heartbeat / deregister
  // ============================================================
  describe('register / heartbeat / deregister', () => {
    it('should register', () => {
      expect(cr.register('c1', 'addr1')).toBe('cr-1');
    });

    it('should mark as registered', () => {
      const id = cr.register('c1', 'addr1');
      expect(cr.isRegistered(id)).toBe(true);
    });

    it('should mark as active', () => {
      const id = cr.register('c1', 'addr1');
      expect(cr.isActive(id)).toBe(true);
    });

    it('should heartbeat', () => {
      const id = cr.register('c1', 'addr1');
      expect(cr.heartbeat(id)).toBe(true);
    });

    it('should increment heartbeats', () => {
      const id = cr.register('c1', 'addr1');
      cr.heartbeat(id);
      expect(cr.getHeartbeats(id)).toBe(1);
    });

    it('should not heartbeat inactive', () => {
      const id = cr.register('c1', 'addr1');
      cr.setActive(id, false);
      expect(cr.heartbeat(id)).toBe(false);
    });

    it('should not heartbeat deregistered', () => {
      const id = cr.register('c1', 'addr1');
      cr.deregister(id);
      expect(cr.heartbeat(id)).toBe(false);
    });

    it('should return false for unknown heartbeat', () => {
      expect(cr.heartbeat('unknown')).toBe(false);
    });

    it('should deregister', () => {
      const id = cr.register('c1', 'addr1');
      expect(cr.deregister(id)).toBe(true);
    });

    it('should mark as deregistered', () => {
      const id = cr.register('c1', 'addr1');
      cr.deregister(id);
      expect(cr.isRegistered(id)).toBe(false);
    });

    it('should return false for unknown deregister', () => {
      expect(cr.deregister('unknown')).toBe(false);
    });

    it('should reregister', () => {
      const id = cr.register('c1', 'addr1');
      cr.deregister(id);
      expect(cr.reregister(id)).toBe(true);
    });

    it('should be alive after heartbeat', () => {
      const id = cr.register('c1', 'addr1');
      cr.heartbeat(id);
      expect(cr.isAlive(id)).toBe(true);
    });

    it('should not be alive for unknown', () => {
      expect(cr.isAlive('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cr.register('c1', 'addr1');
      const stats = cr.getStats();
      expect(stats.clusters).toBe(1);
    });

    it('should count alive', () => {
      cr.register('c1', 'addr1');
      expect(cr.getStats().alive).toBe(1);
    });

    it('should count dead', () => {
      cr.register('c1', 'addr1');
      cr.deregister('cr-1');
      expect(cr.getStats().dead).toBe(1);
    });

    it('should count registered', () => {
      cr.register('c1', 'addr1');
      expect(cr.getStats().registered).toBe(1);
    });

    it('should count deregistered', () => {
      const id = cr.register('c1', 'addr1');
      cr.deregister(id);
      expect(cr.getStats().deregistered).toBe(1);
    });

    it('should count active', () => {
      cr.register('c1', 'addr1');
      expect(cr.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cr.register('c1', 'addr1');
      cr.setActive(id, false);
      expect(cr.getStats().inactive).toBe(1);
    });

    it('should count total heartbeats', () => {
      const id = cr.register('c1', 'addr1');
      cr.heartbeat(id);
      expect(cr.getStats().totalHeartbeats).toBe(1);
    });

    it('should compute avg heartbeats', () => {
      const id = cr.register('c1', 'addr1');
      cr.heartbeat(id);
      expect(cr.getStats().avgHeartbeats).toBe(1);
    });

    it('should compute alive rate', () => {
      cr.register('c1', 'addr1');
      expect(cr.getStats().aliveRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get cluster', () => {
      cr.register('c1', 'addr1');
      expect(cr.getCluster('cr-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      cr.register('c1', 'addr1');
      expect(cr.getAllClusters()).toHaveLength(1);
    });

    it('should get alive', () => {
      cr.register('c1', 'addr1');
      expect(cr.getAliveClusters()).toHaveLength(1);
    });

    it('should get dead', () => {
      const id = cr.register('c1', 'addr1');
      cr.deregister(id);
      expect(cr.getDeadClusters()).toHaveLength(1);
    });

    it('should remove', () => {
      cr.register('c1', 'addr1');
      expect(cr.removeCluster('cr-1')).toBe(true);
    });

    it('should check existence', () => {
      cr.register('c1', 'addr1');
      expect(cr.hasCluster('cr-1')).toBe(true);
    });

    it('should count', () => {
      expect(cr.getCount()).toBe(0);
      cr.register('c1', 'addr1');
      expect(cr.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      cr.register('c1', 'addr1');
      expect(cr.getName('cr-1')).toBe('c1');
    });

    it('should get address', () => {
      cr.register('c1', 'addr1');
      expect(cr.getAddress('cr-1')).toBe('addr1');
    });

    it('should get last heartbeat', () => {
      cr.register('c1', 'addr1');
      expect(cr.getLastHeartbeat('cr-1')).toBeGreaterThan(0);
    });

    it('should get heartbeats', () => {
      cr.register('c1', 'addr1');
      expect(cr.getHeartbeats('cr-1')).toBe(0);
    });

    it('should get history', () => {
      cr.register('c1', 'addr1');
      expect(cr.getHistory('cr-1').length).toBeGreaterThan(0);
    });

    it('should get heartbeat age', () => {
      cr.register('c1', 'addr1');
      expect(cr.getHeartbeatAge('cr-1')).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = cr.register('c1', 'addr1');
      expect(cr.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = cr.register('c1', 'addr1');
      expect(cr.setName(id, 'c2')).toBe(true);
    });

    it('should set address', () => {
      const id = cr.register('c1', 'addr1');
      expect(cr.setAddress(id, 'addr2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cr.setActive('unknown', false)).toBe(false);
      expect(cr.setName('unknown', 'c')).toBe(false);
      expect(cr.setAddress('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // timeout
  // ============================================================
  describe('timeout', () => {
    it('should set timeout', () => {
      cr.setTimeout(60000);
      expect(cr.getTimeout()).toBe(60000);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cr.register('c1', 'addr1');
      cr.heartbeat(id);
      cr.deregister(id);
      cr.setActive(id, false);
      cr.resetAll();
      expect(cr.getHeartbeats(id)).toBe(0);
      expect(cr.isRegistered(id)).toBe(true);
      expect(cr.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      cr.register('c1', 'addr1');
      expect(cr.getByName('c1')).toHaveLength(1);
    });

    it('should get registered', () => {
      cr.register('c1', 'addr1');
      expect(cr.getRegisteredClusters()).toHaveLength(1);
    });

    it('should get deregistered', () => {
      const id = cr.register('c1', 'addr1');
      cr.deregister(id);
      expect(cr.getDeregisteredClusters()).toHaveLength(1);
    });

    it('should get active', () => {
      cr.register('c1', 'addr1');
      expect(cr.getActiveClusters()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = cr.register('c1', 'addr1');
      cr.setActive(id, false);
      expect(cr.getInactiveClusters()).toHaveLength(1);
    });

    it('should get all names', () => {
      cr.register('c1', 'addr1');
      cr.register('c2', 'addr2');
      expect(cr.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      cr.register('c1', 'addr1');
      expect(cr.getNameCount()).toBe(1);
    });

    it('should get by min heartbeats', () => {
      const id = cr.register('c1', 'addr1');
      cr.heartbeat(id);
      expect(cr.getByMinHeartbeats(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most heartbeats', () => {
      const id = cr.register('c1', 'addr1');
      cr.heartbeat(id);
      cr.heartbeat(id);
      expect(cr.getMostHeartbeats()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(cr.getMostHeartbeats()).toBeNull();
    });

    it('should get newest', () => {
      cr.register('c1', 'addr1');
      expect(cr.getNewest()?.id).toBe('cr-1');
    });

    it('should return null for empty newest', () => {
      expect(cr.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cr.register('c1', 'addr1');
      expect(cr.getOldest()?.id).toBe('cr-1');
    });

    it('should return null for empty oldest', () => {
      expect(cr.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cr.register('c1', 'addr1');
      expect(cr.getCreatedAt('cr-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cr.register('c1', 'addr1');
      cr.heartbeat(id);
      expect(cr.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many clusters', () => {
      for (let i = 0; i < 50; i++) {
        cr.register(`c${i}`, `addr${i}`);
      }
      expect(cr.getCount()).toBe(50);
    });
  });
});