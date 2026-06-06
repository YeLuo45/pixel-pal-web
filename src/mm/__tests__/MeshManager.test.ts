/**
 * MeshManager Tests
 * nanobot-design Mesh Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MeshManager } from '../MeshManager';

describe('MeshManager', () => {
  let mm: MeshManager;

  beforeEach(() => {
    mm = new MeshManager();
  });

  afterEach(() => {
    mm.clearAll();
  });

  // ============================================================
  // register / connect / discover
  // ============================================================
  describe('register / connect / discover', () => {
    it('should register', () => {
      expect(mm.register('n1', 'addr1')).toBe('mm-1');
    });

    it('should mark as active', () => {
      const id = mm.register('n1', 'addr1');
      expect(mm.isActive(id)).toBe(true);
    });

    it('should connect', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      expect(mm.connect(id1, id2)).toBe(true);
    });

    it('should add to connections', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.getConnections(id1)).toContain(id2);
    });

    it('should be bidirectional', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.getConnections(id2)).toContain(id1);
    });

    it('should not connect inactive', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.setActive(id1, false);
      expect(mm.connect(id1, id2)).toBe(false);
    });

    it('should not connect self', () => {
      const id = mm.register('n1', 'addr1');
      expect(mm.connect(id, id)).toBe(false);
    });

    it('should not duplicate connections', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      mm.connect(id1, id2);
      expect(mm.getConnectionCount(id1)).toBe(1);
    });

    it('should return false for unknown connect', () => {
      expect(mm.connect('unknown', 'other')).toBe(false);
    });

    it('should disconnect', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.disconnect(id1, id2)).toBe(true);
    });

    it('should remove from connections', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      mm.disconnect(id1, id2);
      expect(mm.getConnectionCount(id1)).toBe(0);
    });

    it('should return false for unknown disconnect', () => {
      expect(mm.disconnect('unknown', 'other')).toBe(false);
    });

    it('should discover', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.discover(id1)).toContain(id2);
    });

    it('should not discover unknown', () => {
      expect(mm.discover('unknown')).toEqual([]);
    });

    it('should not discover inactive', () => {
      const id = mm.register('n1', 'addr1');
      mm.setActive(id, false);
      expect(mm.discover(id)).toEqual([]);
    });

    it('should check areConnected', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.areConnected(id1, id2)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      mm.register('n1', 'addr1');
      const stats = mm.getStats();
      expect(stats.nodes).toBe(1);
    });

    it('should count connections', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.getStats().connections).toBe(2);
    });

    it('should count total hits', () => {
      const id = mm.register('n1', 'addr1');
      mm.discover(id);
      expect(mm.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      mm.register('n1', 'addr1');
      expect(mm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mm.register('n1', 'addr1');
      mm.setActive(id, false);
      expect(mm.getStats().inactive).toBe(1);
    });

    it('should compute avg connections', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.getStats().avgConnections).toBe(1);
    });

    it('should count addresses', () => {
      mm.register('n1', 'addr1');
      mm.register('n2', 'addr2');
      expect(mm.getStats().addresses).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get node', () => {
      mm.register('n1', 'addr1');
      expect(mm.getNode('mm-1')?.name).toBe('n1');
    });

    it('should get all', () => {
      mm.register('n1', 'addr1');
      expect(mm.getAllNodes()).toHaveLength(1);
    });

    it('should remove', () => {
      mm.register('n1', 'addr1');
      expect(mm.removeNode('mm-1')).toBe(true);
    });

    it('should check existence', () => {
      mm.register('n1', 'addr1');
      expect(mm.hasNode('mm-1')).toBe(true);
    });

    it('should count', () => {
      expect(mm.getCount()).toBe(0);
      mm.register('n1', 'addr1');
      expect(mm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      mm.register('n1', 'addr1');
      expect(mm.getName('mm-1')).toBe('n1');
    });

    it('should get address', () => {
      mm.register('n1', 'addr1');
      expect(mm.getAddress('mm-1')).toBe('addr1');
    });

    it('should get connections', () => {
      mm.register('n1', 'addr1');
      expect(mm.getConnections('mm-1')).toEqual([]);
    });

    it('should get connection count', () => {
      mm.register('n1', 'addr1');
      expect(mm.getConnectionCount('mm-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = mm.register('n1', 'addr1');
      mm.discover(id);
      expect(mm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = mm.register('n1', 'addr1');
      expect(mm.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = mm.register('n1', 'addr1');
      expect(mm.setName(id, 'n2')).toBe(true);
    });

    it('should set address', () => {
      const id = mm.register('n1', 'addr1');
      expect(mm.setAddress(id, 'addr2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mm.setActive('unknown', false)).toBe(false);
      expect(mm.setName('unknown', 'n')).toBe(false);
      expect(mm.setAddress('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      mm.setActive(id1, false);
      mm.resetAll();
      expect(mm.getConnectionCount(id1)).toBe(0);
      expect(mm.isActive(id1)).toBe(true);
    });
  });

  // ============================================================
  // by name / address
  // ============================================================
  describe('by name / address', () => {
    it('should get by name', () => {
      mm.register('n1', 'addr1');
      expect(mm.getByName('n1')).toHaveLength(1);
    });

    it('should get by address', () => {
      mm.register('n1', 'addr1');
      expect(mm.getByAddress('addr1')).toHaveLength(1);
    });

    it('should get active', () => {
      mm.register('n1', 'addr1');
      expect(mm.getActiveNodes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = mm.register('n1', 'addr1');
      mm.setActive(id, false);
      expect(mm.getInactiveNodes()).toHaveLength(1);
    });

    it('should get all names', () => {
      mm.register('n1', 'addr1');
      mm.register('n2', 'addr2');
      expect(mm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      mm.register('n1', 'addr1');
      expect(mm.getNameCount()).toBe(1);
    });

    it('should get all addresses', () => {
      mm.register('n1', 'addr1');
      mm.register('n2', 'addr2');
      expect(mm.getAllAddresses()).toHaveLength(2);
    });

    it('should get address count', () => {
      mm.register('n1', 'addr1');
      expect(mm.getAddressCount()).toBe(1);
    });

    it('should get by min connections', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.getByMinConnections(1)).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most connected', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      const id3 = mm.register('n3', 'addr3');
      mm.connect(id1, id2);
      mm.connect(id1, id3);
      expect(mm.getMostConnected()?.id).toBe(id1);
    });

    it('should return null for empty most', () => {
      expect(mm.getMostConnected()).toBeNull();
    });

    it('should get newest', () => {
      mm.register('n1', 'addr1');
      expect(mm.getNewest()?.id).toBe('mm-1');
    });

    it('should return null for empty newest', () => {
      expect(mm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mm.register('n1', 'addr1');
      expect(mm.getOldest()?.id).toBe('mm-1');
    });

    it('should return null for empty oldest', () => {
      expect(mm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      mm.register('n1', 'addr1');
      expect(mm.getCreatedAt('mm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mm.register('n1', 'addr1');
      mm.discover(id);
      expect(mm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total connections', () => {
      const id1 = mm.register('n1', 'addr1');
      const id2 = mm.register('n2', 'addr2');
      mm.connect(id1, id2);
      expect(mm.getTotalConnections()).toBe(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        mm.register(`n${i}`, `addr${i}`);
      }
      expect(mm.getCount()).toBe(50);
    });
  });
});