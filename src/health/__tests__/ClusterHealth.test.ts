/**
 * ClusterHealth Tests
 * nanobot-design Cluster Health
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClusterHealth } from '../ClusterHealth';

describe('ClusterHealth', () => {
  let ch: ClusterHealth;

  beforeEach(() => {
    ch = new ClusterHealth();
  });

  afterEach(() => {
    ch.clearAll();
  });

  // ============================================================
  // inferStatus
  // ============================================================
  describe('inferStatus', () => {
    it('should infer healthy', () => {
      expect(ClusterHealth.inferStatus(90)).toBe('healthy');
    });

    it('should infer degraded', () => {
      expect(ClusterHealth.inferStatus(60)).toBe('degraded');
    });

    it('should infer unhealthy', () => {
      expect(ClusterHealth.inferStatus(30)).toBe('unhealthy');
    });

    it('should infer healthy at 80 boundary', () => {
      expect(ClusterHealth.inferStatus(80)).toBe('healthy');
    });

    it('should infer degraded at 50 boundary', () => {
      expect(ClusterHealth.inferStatus(50)).toBe('degraded');
    });

    it('should infer unhealthy at 49', () => {
      expect(ClusterHealth.inferStatus(49)).toBe('unhealthy');
    });
  });

  // ============================================================
  // check / alert
  // ============================================================
  describe('check / alert', () => {
    it('should check', () => {
      expect(ch.check('node-1', 90)).toBe('ch-1');
    });

    it('should mark as healthy for high score', () => {
      const id = ch.check('node-1', 90);
      expect(ch.getStatus(id)).toBe('healthy');
    });

    it('should mark as degraded for medium score', () => {
      const id = ch.check('node-1', 60);
      expect(ch.getStatus(id)).toBe('degraded');
    });

    it('should mark as unhealthy for low score', () => {
      const id = ch.check('node-1', 30);
      expect(ch.getStatus(id)).toBe('unhealthy');
    });

    it('should alert', () => {
      const id = ch.check('node-1', 90);
      expect(ch.alert(id)).toBe(true);
    });

    it('should not alert unknown', () => {
      expect(ch.alert('unknown')).toBe(false);
    });

    it('should increment alerts on alert', () => {
      const id = ch.check('node-1', 90);
      ch.alert(id);
      expect(ch.getAlerts(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ch.check('node-1', 90);
      const stats = ch.getStats();
      expect(stats.nodes).toBe(1);
    });

    it('should count healthy', () => {
      ch.check('node-1', 90);
      expect(ch.getStats().healthy).toBe(1);
    });

    it('should count degraded', () => {
      ch.check('node-1', 60);
      expect(ch.getStats().degraded).toBe(1);
    });

    it('should count unhealthy', () => {
      ch.check('node-1', 30);
      expect(ch.getStats().unhealthy).toBe(1);
    });

    it('should compute avg score', () => {
      ch.check('node-1', 50);
      ch.check('node-2', 100);
      expect(ch.getStats().avgScore).toBe(75);
    });

    it('should count total alerts', () => {
      const id = ch.check('node-1', 90);
      ch.alert(id);
      expect(ch.getStats().totalAlerts).toBe(1);
    });

    it('should count total checks', () => {
      ch.check('node-1', 90);
      expect(ch.getStats().totalChecks).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get health', () => {
      ch.check('node-1', 90);
      expect(ch.getHealth('ch-1')?.nodeId).toBe('node-1');
    });

    it('should get all', () => {
      ch.check('node-1', 90);
      expect(ch.getAllHealths()).toHaveLength(1);
    });

    it('should remove', () => {
      ch.check('node-1', 90);
      expect(ch.removeHealth('ch-1')).toBe(true);
    });

    it('should check existence', () => {
      ch.check('node-1', 90);
      expect(ch.hasHealth('ch-1')).toBe(true);
    });

    it('should count', () => {
      expect(ch.getCount()).toBe(0);
      ch.check('node-1', 90);
      expect(ch.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get node id', () => {
      ch.check('node-1', 90);
      expect(ch.getNodeId('ch-1')).toBe('node-1');
    });

    it('should get status', () => {
      ch.check('node-1', 90);
      expect(ch.getStatus('ch-1')).toBe('healthy');
    });

    it('should get score', () => {
      ch.check('node-1', 90);
      expect(ch.getScore('ch-1')).toBe(90);
    });

    it('should get alerts', () => {
      const id = ch.check('node-1', 90);
      ch.alert(id);
      expect(ch.getAlerts(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = ch.check('node-1', 90);
      ch.incrementHits(id);
      expect(ch.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isHealthy', () => {
      const id = ch.check('node-1', 90);
      expect(ch.isHealthy(id)).toBe(true);
    });

    it('should check isDegraded', () => {
      const id = ch.check('node-1', 60);
      expect(ch.isDegraded(id)).toBe(true);
    });

    it('should check isUnhealthy', () => {
      const id = ch.check('node-1', 30);
      expect(ch.isUnhealthy(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set status', () => {
      const id = ch.check('node-1', 90);
      expect(ch.setStatus(id, 'unhealthy')).toBe(true);
    });

    it('should set score', () => {
      const id = ch.check('node-1', 90);
      expect(ch.setScore(id, 30)).toBe(true);
    });

    it('should update status on setScore', () => {
      const id = ch.check('node-1', 90);
      ch.setScore(id, 30);
      expect(ch.getStatus(id)).toBe('unhealthy');
    });

    it('should return false for unknown', () => {
      expect(ch.setStatus('unknown', 'healthy')).toBe(false);
      expect(ch.setScore('unknown', 50)).toBe(false);
    });
  });

  // ============================================================
  // recheck
  // ============================================================
  describe('recheck', () => {
    it('should recheck', () => {
      const id = ch.check('node-1', 90);
      ch.setStatus(id, 'unhealthy');
      expect(ch.recheck(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ch.recheck('unknown')).toBe(false);
    });

    it('should recheck all', () => {
      ch.check('node-1', 90);
      ch.check('node-2', 30);
      expect(ch.recheckAll()).toBe(2);
    });
  });

  // ============================================================
  // hits
  // ============================================================
  describe('hits', () => {
    it('should increment hits', () => {
      const id = ch.check('node-1', 90);
      expect(ch.incrementHits(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ch.incrementHits('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = ch.check('node-1', 90);
      ch.incrementHits(id);
      ch.resetHits();
      expect(ch.getHits(id)).toBe(0);
    });

    it('should reset alerts', () => {
      const id = ch.check('node-1', 90);
      ch.alert(id);
      ch.resetAlerts();
      expect(ch.getAlerts(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = ch.check('node-1', 90);
      ch.incrementHits(id);
      ch.alert(id);
      ch.resetAll();
      expect(ch.getHits(id)).toBe(0);
      expect(ch.getAlerts(id)).toBe(0);
    });
  });

  // ============================================================
  // by node / status
  // ============================================================
  describe('by node / status', () => {
    it('should get by node id', () => {
      ch.check('node-1', 90);
      expect(ch.getByNodeId('node-1')).toHaveLength(1);
    });

    it('should get by status', () => {
      ch.check('node-1', 90);
      expect(ch.getByStatus('healthy')).toHaveLength(1);
    });

    it('should get healthy', () => {
      ch.check('node-1', 90);
      expect(ch.getHealthyNodes()).toHaveLength(1);
    });

    it('should get degraded', () => {
      ch.check('node-1', 60);
      expect(ch.getDegradedNodes()).toHaveLength(1);
    });

    it('should get unhealthy', () => {
      ch.check('node-1', 30);
      expect(ch.getUnhealthyNodes()).toHaveLength(1);
    });
  });

  // ============================================================
  // all
  // ============================================================
  describe('all', () => {
    it('should get all node ids', () => {
      ch.check('node-1', 90);
      ch.check('node-2', 60);
      expect(ch.getAllNodeIds()).toHaveLength(2);
    });

    it('should get node id count', () => {
      ch.check('node-1', 90);
      expect(ch.getNodeIdCount()).toBe(1);
    });

    it('should get total checks', () => {
      ch.check('node-1', 90);
      expect(ch.getTotalChecks()).toBe(1);
    });

    it('should reset total checks', () => {
      ch.check('node-1', 90);
      ch.resetTotalChecks();
      expect(ch.getTotalChecks()).toBe(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most alerts', () => {
      const id = ch.check('node-1', 90);
      ch.alert(id);
      ch.alert(id);
      expect(ch.getMostAlerts()?.id).toBe(id);
    });

    it('should return null for empty most alerts', () => {
      expect(ch.getMostAlerts()).toBeNull();
    });

    it('should get highest score', () => {
      ch.check('node-1', 50);
      ch.check('node-2', 100);
      expect(ch.getHighestScore()?.score).toBe(100);
    });

    it('should return null for empty highest', () => {
      expect(ch.getHighestScore()).toBeNull();
    });

    it('should get lowest score', () => {
      ch.check('node-1', 50);
      ch.check('node-2', 100);
      expect(ch.getLowestScore()?.score).toBe(50);
    });

    it('should return null for empty lowest', () => {
      expect(ch.getLowestScore()).toBeNull();
    });

    it('should get newest', () => {
      ch.check('node-1', 90);
      expect(ch.getNewest()?.id).toBe('ch-1');
    });

    it('should return null for empty newest', () => {
      expect(ch.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ch.check('node-1', 90);
      expect(ch.getOldest()?.id).toBe('ch-1');
    });

    it('should return null for empty oldest', () => {
      expect(ch.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ch.check('node-1', 90);
      expect(ch.getCreatedAt('ch-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ch.check('node-1', 90);
      ch.alert(id);
      expect(ch.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        ch.check(`node-${i}`, 90);
      }
      expect(ch.getCount()).toBe(50);
    });
  });
});