/**
 * NetworkManager Tests
 * nanobot-design Network Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NetworkManager } from '../NetworkManager';

describe('NetworkManager', () => {
  let nm: NetworkManager;

  beforeEach(() => {
    nm = new NetworkManager();
  });

  afterEach(() => {
    nm.clearAll();
  });

  // ============================================================
  // connect / send / disconnect
  // ============================================================
  describe('connect / send / disconnect', () => {
    it('should connect', () => {
      expect(nm.connect('host1', 8080)).toBe('nm2-1');
    });

    it('should mark as connected', () => {
      const id = nm.connect('host1', 8080);
      expect(nm.isConnected(id)).toBe(true);
    });

    it('should mark as active', () => {
      const id = nm.connect('host1', 8080);
      expect(nm.isActive(id)).toBe(true);
    });

    it('should send', () => {
      const id = nm.connect('host1', 8080);
      expect(nm.send(id, 100)).toBe(true);
    });

    it('should increment bytes sent', () => {
      const id = nm.connect('host1', 8080);
      nm.send(id, 100);
      expect(nm.getBytesSent(id)).toBe(100);
    });

    it('should not send inactive', () => {
      const id = nm.connect('host1', 8080);
      nm.setActive(id, false);
      expect(nm.send(id, 100)).toBe(false);
    });

    it('should not send disconnected', () => {
      const id = nm.connect('host1', 8080);
      nm.disconnect(id);
      expect(nm.send(id, 100)).toBe(false);
    });

    it('should return false for unknown send', () => {
      expect(nm.send('unknown', 100)).toBe(false);
    });

    it('should receive', () => {
      const id = nm.connect('host1', 8080);
      expect(nm.receive(id, 100)).toBe(true);
    });

    it('should increment bytes received', () => {
      const id = nm.connect('host1', 8080);
      nm.receive(id, 100);
      expect(nm.getBytesReceived(id)).toBe(100);
    });

    it('should not receive disconnected', () => {
      const id = nm.connect('host1', 8080);
      nm.disconnect(id);
      expect(nm.receive(id, 100)).toBe(false);
    });

    it('should return false for unknown receive', () => {
      expect(nm.receive('unknown', 100)).toBe(false);
    });

    it('should disconnect', () => {
      const id = nm.connect('host1', 8080);
      expect(nm.disconnect(id)).toBe(true);
    });

    it('should mark as disconnected', () => {
      const id = nm.connect('host1', 8080);
      nm.disconnect(id);
      expect(nm.isConnected(id)).toBe(false);
    });

    it('should return false for unknown disconnect', () => {
      expect(nm.disconnect('unknown')).toBe(false);
    });

    it('should reconnect', () => {
      const id = nm.connect('host1', 8080);
      nm.disconnect(id);
      expect(nm.reconnect(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      nm.connect('host1', 8080);
      const stats = nm.getStats();
      expect(stats.nodes).toBe(1);
    });

    it('should count connected', () => {
      nm.connect('host1', 8080);
      expect(nm.getStats().connected).toBe(1);
    });

    it('should count disconnected', () => {
      const id = nm.connect('host1', 8080);
      nm.disconnect(id);
      expect(nm.getStats().disconnected).toBe(1);
    });

    it('should count total sent', () => {
      const id = nm.connect('host1', 8080);
      nm.send(id, 100);
      expect(nm.getStats().totalSent).toBe(100);
    });

    it('should count total received', () => {
      const id = nm.connect('host1', 8080);
      nm.receive(id, 100);
      expect(nm.getStats().totalReceived).toBe(100);
    });

    it('should count total bandwidth', () => {
      nm.connect('host1', 8080, 1000);
      nm.connect('host2', 8081, 2000);
      expect(nm.getStats().totalBandwidth).toBe(3000);
    });

    it('should count total hits', () => {
      const id = nm.connect('host1', 8080);
      nm.send(id, 100);
      expect(nm.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      nm.connect('host1', 8080);
      expect(nm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = nm.connect('host1', 8080);
      nm.setActive(id, false);
      expect(nm.getStats().inactive).toBe(1);
    });

    it('should compute avg bandwidth', () => {
      nm.connect('host1', 8080, 1000);
      expect(nm.getStats().avgBandwidth).toBe(1000);
    });

    it('should count hosts', () => {
      nm.connect('h1', 8080);
      nm.connect('h2', 8081);
      expect(nm.getStats().hosts).toBe(2);
    });

    it('should count ports', () => {
      nm.connect('h1', 8080);
      nm.connect('h1', 8081);
      expect(nm.getStats().ports).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get node', () => {
      nm.connect('h1', 8080);
      expect(nm.getNode('nm2-1')?.host).toBe('h1');
    });

    it('should get all', () => {
      nm.connect('h1', 8080);
      expect(nm.getAllNodes()).toHaveLength(1);
    });

    it('should remove', () => {
      nm.connect('h1', 8080);
      expect(nm.removeNode('nm2-1')).toBe(true);
    });

    it('should check existence', () => {
      nm.connect('h1', 8080);
      expect(nm.hasNode('nm2-1')).toBe(true);
    });

    it('should count', () => {
      expect(nm.getCount()).toBe(0);
      nm.connect('h1', 8080);
      expect(nm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get host', () => {
      nm.connect('h1', 8080);
      expect(nm.getHost('nm2-1')).toBe('h1');
    });

    it('should get port', () => {
      nm.connect('h1', 8080);
      expect(nm.getPort('nm2-1')).toBe(8080);
    });

    it('should get bandwidth', () => {
      nm.connect('h1', 8080, 1000);
      expect(nm.getBandwidth('nm2-1')).toBe(1000);
    });

    it('should get bytes sent', () => {
      nm.connect('h1', 8080);
      expect(nm.getBytesSent('nm2-1')).toBe(0);
    });

    it('should get bytes received', () => {
      nm.connect('h1', 8080);
      expect(nm.getBytesReceived('nm2-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = nm.connect('h1', 8080);
      nm.send(id, 100);
      expect(nm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      nm.connect('h1', 8080);
      expect(nm.setActive('nm2-1', false)).toBe(true);
    });

    it('should set host', () => {
      nm.connect('h1', 8080);
      expect(nm.setHost('nm2-1', 'h2')).toBe(true);
    });

    it('should set port', () => {
      nm.connect('h1', 8080);
      expect(nm.setPort('nm2-1', 9090)).toBe(true);
    });

    it('should set bandwidth', () => {
      nm.connect('h1', 8080, 1000);
      expect(nm.setBandwidth('nm2-1', 2000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(nm.setActive('unknown', false)).toBe(false);
      expect(nm.setHost('unknown', 'h')).toBe(false);
      expect(nm.setPort('unknown', 8080)).toBe(false);
      expect(nm.setBandwidth('unknown', 1000)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = nm.connect('h1', 8080);
      nm.send(id, 100);
      nm.disconnect(id);
      nm.setActive(id, false);
      nm.resetAll();
      expect(nm.getBytesSent(id)).toBe(0);
      expect(nm.isConnected(id)).toBe(true);
      expect(nm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by host / port
  // ============================================================
  describe('by host / port', () => {
    it('should get by host', () => {
      nm.connect('h1', 8080);
      expect(nm.getByHost('h1')).toHaveLength(1);
    });

    it('should get by port', () => {
      nm.connect('h1', 8080);
      expect(nm.getByPort(8080)).toHaveLength(1);
    });

    it('should get connected', () => {
      nm.connect('h1', 8080);
      expect(nm.getConnectedNodes()).toHaveLength(1);
    });

    it('should get disconnected', () => {
      const id = nm.connect('h1', 8080);
      nm.disconnect(id);
      expect(nm.getDisconnectedNodes()).toHaveLength(1);
    });

    it('should get active', () => {
      nm.connect('h1', 8080);
      expect(nm.getActiveNodes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      nm.connect('h1', 8080);
      nm.setActive('nm2-1', false);
      expect(nm.getInactiveNodes()).toHaveLength(1);
    });

    it('should get all hosts', () => {
      nm.connect('h1', 8080);
      nm.connect('h2', 8081);
      expect(nm.getAllHosts()).toHaveLength(2);
    });

    it('should get host count', () => {
      nm.connect('h1', 8080);
      expect(nm.getHostCount()).toBe(1);
    });

    it('should get all ports', () => {
      nm.connect('h1', 8080);
      nm.connect('h1', 8081);
      expect(nm.getAllPorts()).toHaveLength(2);
    });

    it('should get port count', () => {
      nm.connect('h1', 8080);
      expect(nm.getPortCount()).toBe(1);
    });

    it('should get by min bandwidth', () => {
      nm.connect('h1', 8080, 1000);
      nm.connect('h2', 8081, 500);
      expect(nm.getByMinBandwidth(800)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most bandwidth', () => {
      nm.connect('h1', 8080, 1000);
      nm.connect('h2', 8081, 2000);
      expect(nm.getMostBandwidth()?.id).toBe('nm2-2');
    });

    it('should return null for empty most', () => {
      expect(nm.getMostBandwidth()).toBeNull();
    });

    it('should get most sent', () => {
      const id = nm.connect('h1', 8080);
      nm.send(id, 100);
      expect(nm.getMostSent()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(nm.getMostSent()).toBeNull();
    });

    it('should get newest', () => {
      nm.connect('h1', 8080);
      expect(nm.getNewest()?.id).toBe('nm2-1');
    });

    it('should return null for empty newest', () => {
      expect(nm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      nm.connect('h1', 8080);
      expect(nm.getOldest()?.id).toBe('nm2-1');
    });

    it('should return null for empty oldest', () => {
      expect(nm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      nm.connect('h1', 8080);
      expect(nm.getCreatedAt('nm2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = nm.connect('h1', 8080);
      nm.send(id, 100);
      expect(nm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total sent', () => {
      const id = nm.connect('h1', 8080);
      nm.send(id, 100);
      expect(nm.getTotalSent()).toBe(100);
    });

    it('should get total received', () => {
      const id = nm.connect('h1', 8080);
      nm.receive(id, 100);
      expect(nm.getTotalReceived()).toBe(100);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        nm.connect(`h${i}`, 8080 + i);
      }
      expect(nm.getCount()).toBe(50);
    });
  });
});