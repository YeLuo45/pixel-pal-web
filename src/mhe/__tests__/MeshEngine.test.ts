/**
 * MeshEngine Tests
 * nanobot-design Mesh Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MeshEngine } from '../MeshEngine';

describe('MeshEngine', () => {
  let mhe: MeshEngine;

  beforeEach(() => {
    mhe = new MeshEngine();
  });

  afterEach(() => {
    mhe.clearAll();
  });

  describe('addNode / connect / disconnect / error / remove', () => {
    it('should add node', () => {
      expect(mhe.addNode('n1')).toMatch(/^mhe-/);
    });

    it('should default state to disconnected', () => {
      mhe.addNode('n1');
      expect(mhe.getState(mhe.getAllNodes()[0].id)).toBe('disconnected');
    });

    it('should mark as active', () => {
      mhe.addNode('n1');
      expect(mhe.isActive(mhe.getAllNodes()[0].id)).toBe(true);
    });

    it('should connect', () => {
      const id = mhe.addNode('n1');
      expect(mhe.connect(id, 3)).toBe(true);
    });

    it('should set connected on connect', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.isConnected(id)).toBe(true);
    });

    it('should set peers on connect', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.getPeers(id)).toBe(3);
    });

    it('should not connect inactive', () => {
      const id = mhe.addNode('n1');
      mhe.setActive(id, false);
      expect(mhe.connect(id, 3)).toBe(false);
    });

    it('should return false for unknown connect', () => {
      expect(mhe.connect('unknown', 3)).toBe(false);
    });

    it('should disconnect', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.disconnect(id)).toBe(true);
    });

    it('should set disconnected', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      mhe.disconnect(id);
      expect(mhe.isDisconnected(id)).toBe(true);
    });

    it('should clear peers on disconnect', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      mhe.disconnect(id);
      expect(mhe.getPeers(id)).toBe(0);
    });

    it('should not disconnect inactive', () => {
      const id = mhe.addNode('n1');
      mhe.setActive(id, false);
      expect(mhe.disconnect(id)).toBe(false);
    });

    it('should return false for unknown disconnect', () => {
      expect(mhe.disconnect('unknown')).toBe(false);
    });

    it('should error', () => {
      const id = mhe.addNode('n1');
      expect(mhe.error(id)).toBe(true);
    });

    it('should set error', () => {
      const id = mhe.addNode('n1');
      mhe.error(id);
      expect(mhe.isError(id)).toBe(true);
    });

    it('should return false for unknown error', () => {
      expect(mhe.error('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = mhe.addNode('n1');
      expect(mhe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      mhe.addNode('n1');
      expect(mhe.getStats().nodes).toBe(1);
    });

    it('should count total added', () => {
      mhe.addNode('n1');
      expect(mhe.getStats().totalAdded).toBe(1);
    });

    it('should count total connected', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.getStats().totalConnected).toBe(1);
    });

    it('should count total disconnected', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      mhe.disconnect(id);
      expect(mhe.getStats().totalDisconnected).toBe(1);
    });

    it('should count connected', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.getStats().connected).toBe(1);
    });

    it('should count disconnected', () => {
      mhe.addNode('n1');
      expect(mhe.getStats().disconnected).toBe(1);
    });

    it('should count error', () => {
      const id = mhe.addNode('n1');
      mhe.error(id);
      expect(mhe.getStats().error).toBe(1);
    });

    it('should count active', () => {
      mhe.addNode('n1');
      expect(mhe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mhe.addNode('n1');
      mhe.setActive(id, false);
      expect(mhe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      mhe.addNode('a');
      mhe.addNode('a');
      expect(mhe.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get node', () => {
      const id = mhe.addNode('n1');
      expect(mhe.getNode(id)?.name).toBe('n1');
    });

    it('should get all', () => {
      mhe.addNode('n1');
      expect(mhe.getAllNodes()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = mhe.addNode('n1');
      expect(mhe.hasNode(id)).toBe(true);
    });

    it('should count', () => {
      expect(mhe.getCount()).toBe(0);
      mhe.addNode('n1');
      expect(mhe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = mhe.addNode('n1');
      expect(mhe.getName(id)).toBe('n1');
    });

    it('should get hits', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.getHits(id)).toBe(1);
    });

    it('should check connected', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.isConnected(id)).toBe(true);
    });

    it('should check disconnected', () => {
      mhe.addNode('n1');
      expect(mhe.isDisconnected(mhe.getAllNodes()[0].id)).toBe(true);
    });

    it('should check error', () => {
      const id = mhe.addNode('n1');
      mhe.error(id);
      expect(mhe.isError(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = mhe.addNode('n1');
      expect(mhe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = mhe.addNode('n1');
      expect(mhe.setName(id, 'n2')).toBe(true);
    });

    it('should set state', () => {
      const id = mhe.addNode('n1');
      expect(mhe.setState(id, 'error')).toBe(true);
    });

    it('should set peers', () => {
      const id = mhe.addNode('n1');
      expect(mhe.setPeers(id, 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mhe.setActive('unknown', false)).toBe(false);
      expect(mhe.setName('unknown', 'n')).toBe(false);
      expect(mhe.setState('unknown', 'connected')).toBe(false);
      expect(mhe.setPeers('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      mhe.setActive(id, false);
      mhe.resetAll();
      expect(mhe.isDisconnected(id)).toBe(true);
      expect(mhe.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      mhe.addNode('n1');
      expect(mhe.getByState('disconnected')).toHaveLength(1);
    });

    it('should get active', () => {
      mhe.addNode('n1');
      expect(mhe.getActiveNodes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = mhe.addNode('n1');
      mhe.setActive(id, false);
      expect(mhe.getInactiveNodes()).toHaveLength(1);
    });

    it('should get all names', () => {
      mhe.addNode('a');
      mhe.addNode('b');
      expect(mhe.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      mhe.addNode('n1');
      expect(mhe.getNewest()?.name).toBe('n1');
    });

    it('should return null for empty newest', () => {
      expect(mhe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mhe.addNode('n1');
      expect(mhe.getOldest()?.name).toBe('n1');
    });

    it('should return null for empty oldest', () => {
      expect(mhe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = mhe.addNode('n1');
      expect(mhe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      mhe.addNode('n1');
      expect(mhe.getTotalAdded()).toBe(1);
    });

    it('should get total connected', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      expect(mhe.getTotalConnected()).toBe(1);
    });

    it('should get total disconnected', () => {
      const id = mhe.addNode('n1');
      mhe.connect(id, 3);
      mhe.disconnect(id);
      expect(mhe.getTotalDisconnected()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        mhe.addNode(`n${i}`);
      }
      expect(mhe.getCount()).toBe(50);
    });
  });
});