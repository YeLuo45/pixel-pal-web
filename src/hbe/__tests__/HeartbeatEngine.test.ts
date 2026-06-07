/**
 * HeartbeatEngine Tests
 * nanobot-design Heartbeat Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HeartbeatEngine } from '../HeartbeatEngine';

describe('HeartbeatEngine', () => {
  let hbe: HeartbeatEngine;

  beforeEach(() => {
    hbe = new HeartbeatEngine();
  });

  afterEach(() => {
    hbe.clearAll();
  });

  describe('addNode / heartbeat / checkMissed / remove', () => {
    it('should add node', () => {
      expect(hbe.addNode('n1', 1000)).toMatch(/^hbe-/);
    });

    it('should default state to alive', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getState(hbe.getAllNodes()[0].id)).toBe('alive');
    });

    it('should mark as active', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.isActive(hbe.getAllNodes()[0].id)).toBe(true);
    });

    it('should heartbeat', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.heartbeat(id)).toBe(true);
    });

    it('should reset missed beats on heartbeat', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.heartbeat(id);
      expect(hbe.getMissedBeats(id)).toBe(0);
    });

    it('should not heartbeat inactive', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.setActive(id, false);
      expect(hbe.heartbeat(id)).toBe(false);
    });

    it('should return false for unknown heartbeat', () => {
      expect(hbe.heartbeat('unknown')).toBe(false);
    });

    it('should check missed', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.heartbeat(id);
      expect(hbe.checkMissed(id, 3)).toBe(false);
    });

    it('should return false for unknown check', () => {
      expect(hbe.checkMissed('unknown', 3)).toBe(false);
    });

    it('should remove', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getStats().nodes).toBe(1);
    });

    it('should count total added', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getStats().totalAdded).toBe(1);
    });

    it('should count total heartbeats', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.heartbeat(id);
      expect(hbe.getStats().totalHeartbeats).toBe(1);
    });

    it('should count alive', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getStats().alive).toBe(1);
    });

    it('should count active', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.setActive(id, false);
      expect(hbe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.heartbeat(id);
      expect(hbe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      hbe.addNode('a', 1000);
      hbe.addNode('a', 1000);
      expect(hbe.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get node', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.getNode(id)?.name).toBe('n1');
    });

    it('should get all', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getAllNodes()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.hasNode(id)).toBe(true);
    });

    it('should count', () => {
      expect(hbe.getCount()).toBe(0);
      hbe.addNode('n1', 1000);
      expect(hbe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.getName(id)).toBe('n1');
    });

    it('should get interval', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.getInterval(id)).toBe(1000);
    });

    it('should get last beat', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.getLastBeat(id)).toBeGreaterThan(0);
    });

    it('should get hits', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.heartbeat(id);
      expect(hbe.getHits(id)).toBe(1);
    });

    it('should check alive', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.isAlive(hbe.getAllNodes()[0].id)).toBe(true);
    });

    it('should check suspect', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.setState(id, 'suspect');
      expect(hbe.isSuspect(id)).toBe(true);
    });

    it('should check dead', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.setState(id, 'dead');
      expect(hbe.isDead(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.setName(id, 'n2')).toBe(true);
    });

    it('should set interval', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.setInterval(id, 2000)).toBe(true);
    });

    it('should set state', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.setState(id, 'suspect')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(hbe.setActive('unknown', false)).toBe(false);
      expect(hbe.setName('unknown', 'n')).toBe(false);
      expect(hbe.setInterval('unknown', 1000)).toBe(false);
      expect(hbe.setState('unknown', 'alive')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.heartbeat(id);
      hbe.setActive(id, false);
      hbe.resetAll();
      expect(hbe.isAlive(id)).toBe(true);
      expect(hbe.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getByState('alive')).toHaveLength(1);
    });

    it('should get alive', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getAliveNodes()).toHaveLength(1);
    });

    it('should get suspect', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.setState(id, 'suspect');
      expect(hbe.getSuspectNodes()).toHaveLength(1);
    });

    it('should get dead', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.setState(id, 'dead');
      expect(hbe.getDeadNodes()).toHaveLength(1);
    });

    it('should get active', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getActiveNodes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.setActive(id, false);
      expect(hbe.getInactiveNodes()).toHaveLength(1);
    });

    it('should get all names', () => {
      hbe.addNode('a', 1000);
      hbe.addNode('b', 1000);
      expect(hbe.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getNewest()?.name).toBe('n1');
    });

    it('should return null for empty newest', () => {
      expect(hbe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getOldest()?.name).toBe('n1');
    });

    it('should return null for empty oldest', () => {
      expect(hbe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = hbe.addNode('n1', 1000);
      expect(hbe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.heartbeat(id);
      expect(hbe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      hbe.addNode('n1', 1000);
      expect(hbe.getTotalAdded()).toBe(1);
    });

    it('should get total heartbeats', () => {
      const id = hbe.addNode('n1', 1000);
      hbe.heartbeat(id);
      expect(hbe.getTotalHeartbeats()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        hbe.addNode(`n${i}`, 1000);
      }
      expect(hbe.getCount()).toBe(50);
    });
  });
});