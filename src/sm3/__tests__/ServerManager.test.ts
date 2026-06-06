/**
 * ServerManager Tests
 * nanobot-design Server Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServerManager } from '../ServerManager';

describe('ServerManager', () => {
  let sm: ServerManager;

  beforeEach(() => {
    sm = new ServerManager();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // register / handle / setHealth / reset
  // ============================================================
  describe('register / handle / setHealth / reset', () => {
    it('should register', () => {
      expect(sm.register('localhost', 3000)).toBe('sm3-1');
    });

    it('should mark as active', () => {
      const id = sm.register('localhost', 3000);
      expect(sm.isActive(id)).toBe(true);
    });

    it('should mark as healthy', () => {
      const id = sm.register('localhost', 3000);
      expect(sm.isHealthy(id)).toBe(true);
    });

    it('should handle', () => {
      const id = sm.register('localhost', 3000);
      expect(sm.handle(id, true)).toBe(true);
    });

    it('should increment requests on handle', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getRequests(id)).toBe(1);
    });

    it('should increment errors on failed handle', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, false);
      expect(sm.getErrors(id)).toBe(1);
    });

    it('should log history on handle', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getHistory(id)).toEqual([true]);
    });

    it('should not handle inactive', () => {
      const id = sm.register('localhost', 3000);
      sm.setActive(id, false);
      expect(sm.handle(id, true)).toBe(false);
    });

    it('should return false for unknown handle', () => {
      expect(sm.handle('unknown', true)).toBe(false);
    });

    it('should set health', () => {
      const id = sm.register('localhost', 3000);
      expect(sm.setHealth(id, false)).toBe(true);
    });

    it('should mark as unhealthy on setHealth', () => {
      const id = sm.register('localhost', 3000);
      sm.setHealth(id, false);
      expect(sm.isHealthy(id)).toBe(false);
    });

    it('should return false for unknown setHealth', () => {
      expect(sm.setHealth('unknown', false)).toBe(false);
    });

    it('should reset', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      sm.reset(id);
      expect(sm.getRequests(id)).toBe(0);
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
      sm.register('localhost', 3000);
      const stats = sm.getStats();
      expect(stats.servers).toBe(1);
    });

    it('should count healthy', () => {
      sm.register('localhost', 3000);
      expect(sm.getStats().healthy).toBe(1);
    });

    it('should count unhealthy', () => {
      const id = sm.register('localhost', 3000);
      sm.setHealth(id, false);
      expect(sm.getStats().unhealthy).toBe(1);
    });

    it('should count total requests', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getStats().totalRequests).toBe(1);
    });

    it('should count total errors', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, false);
      expect(sm.getStats().totalErrors).toBe(1);
    });

    it('should count active', () => {
      sm.register('localhost', 3000);
      expect(sm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sm.register('localhost', 3000);
      sm.setActive(id, false);
      expect(sm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getStats().totalHits).toBe(1);
    });

    it('should count unique hosts', () => {
      sm.register('localhost', 3000);
      sm.register('example.com', 8080);
      expect(sm.getStats().uniqueHosts).toBe(2);
    });

    it('should compute avg requests', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getStats().avgRequests).toBe(1);
    });

    it('should get max requests', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      sm.handle(id, true);
      expect(sm.getStats().maxRequests).toBe(2);
    });

    it('should get min requests', () => {
      sm.register('localhost', 3000);
      expect(sm.getStats().minRequests).toBe(0);
    });

    it('should compute avg port', () => {
      sm.register('localhost', 3000);
      sm.register('example.com', 8080);
      expect(sm.getStats().avgPort).toBe(5540);
    });

    it('should compute error rate', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, false);
      expect(sm.getStats().errorRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get server', () => {
      sm.register('localhost', 3000);
      expect(sm.getServer('sm3-1')?.host).toBe('localhost');
    });

    it('should get all', () => {
      sm.register('localhost', 3000);
      expect(sm.getAllServers()).toHaveLength(1);
    });

    it('should remove', () => {
      sm.register('localhost', 3000);
      expect(sm.removeServer('sm3-1')).toBe(true);
    });

    it('should check existence', () => {
      sm.register('localhost', 3000);
      expect(sm.hasServer('sm3-1')).toBe(true);
    });

    it('should count', () => {
      expect(sm.getCount()).toBe(0);
      sm.register('localhost', 3000);
      expect(sm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get host', () => {
      sm.register('localhost', 3000);
      expect(sm.getHost('sm3-1')).toBe('localhost');
    });

    it('should get port', () => {
      sm.register('localhost', 3000);
      expect(sm.getPort('sm3-1')).toBe(3000);
    });

    it('should get requests', () => {
      sm.register('localhost', 3000);
      expect(sm.getRequests('sm3-1')).toBe(0);
    });

    it('should get errors', () => {
      sm.register('localhost', 3000);
      expect(sm.getErrors('sm3-1')).toBe(0);
    });

    it('should get history', () => {
      sm.register('localhost', 3000);
      expect(sm.getHistory('sm3-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      sm.register('localhost', 3000);
      expect(sm.setActive('sm3-1', false)).toBe(true);
    });

    it('should set host', () => {
      sm.register('localhost', 3000);
      expect(sm.setHost('sm3-1', 'example.com')).toBe(true);
    });

    it('should set port', () => {
      sm.register('localhost', 3000);
      expect(sm.setPort('sm3-1', 8080)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sm.setActive('unknown', false)).toBe(false);
      expect(sm.setHost('unknown', 'h')).toBe(false);
      expect(sm.setPort('unknown', 80)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      sm.setActive(id, false);
      sm.resetAll();
      expect(sm.getRequests(id)).toBe(0);
      expect(sm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by host / state
  // ============================================================
  describe('by host / state', () => {
    it('should get by host', () => {
      sm.register('localhost', 3000);
      expect(sm.getByHost('localhost')).toHaveLength(1);
    });

    it('should get healthy', () => {
      sm.register('localhost', 3000);
      expect(sm.getHealthyServers()).toHaveLength(1);
    });

    it('should get unhealthy', () => {
      const id = sm.register('localhost', 3000);
      sm.setHealth(id, false);
      expect(sm.getUnhealthyServers()).toHaveLength(1);
    });

    it('should get active', () => {
      sm.register('localhost', 3000);
      expect(sm.getActiveServers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sm.register('localhost', 3000);
      sm.setActive('sm3-1', false);
      expect(sm.getInactiveServers()).toHaveLength(1);
    });

    it('should get all hosts', () => {
      sm.register('localhost', 3000);
      sm.register('example.com', 8080);
      expect(sm.getAllHosts()).toHaveLength(2);
    });

    it('should get host count', () => {
      sm.register('localhost', 3000);
      expect(sm.getHostCount()).toBe(1);
    });

    it('should get by min requests', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getByMinRequests(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most requests', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      sm.handle(id, true);
      expect(sm.getMostRequests()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sm.getMostRequests()).toBeNull();
    });

    it('should get newest', () => {
      sm.register('localhost', 3000);
      expect(sm.getNewest()?.id).toBe('sm3-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.register('localhost', 3000);
      expect(sm.getOldest()?.id).toBe('sm3-1');
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
      sm.register('localhost', 3000);
      expect(sm.getCreatedAt('sm3-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total requests', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, true);
      expect(sm.getTotalRequests()).toBe(1);
    });

    it('should get total errors', () => {
      const id = sm.register('localhost', 3000);
      sm.handle(id, false);
      expect(sm.getTotalErrors()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many servers', () => {
      for (let i = 0; i < 50; i++) {
        sm.register(`host${i}`, 3000 + i);
      }
      expect(sm.getCount()).toBe(50);
    });
  });
});