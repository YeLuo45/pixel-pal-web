/**
 * HealthMonitorV2 Tests
 * nanobot-design Health Monitor v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HealthMonitorV2 } from '../HealthMonitorV2';

describe('HealthMonitorV2', () => {
  let monitor: HealthMonitorV2;

  beforeEach(() => {
    monitor = new HealthMonitorV2();
  });

  afterEach(() => {
    monitor.clearAll();
  });

  // ============================================================
  // registerNode
  // ============================================================
  describe('registerNode', () => {
    it('should register node', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.5 });
      expect(monitor.getNodeCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const n = { id: 'n1', status: 'healthy' as const, lastHeartbeat: 1000, cpu: 0.5, memory: 0.5 };
      monitor.registerNode(n);
      n.cpu = 1.0;
      expect(monitor.getNode('n1')?.cpu).toBe(0.5);
    });
  });

  // ============================================================
  // checkHealth
  // ============================================================
  describe('checkHealth', () => {
    it('should return null for unknown', () => {
      expect(monitor.checkHealth('unknown')).toBeNull();
    });

    it('should mark healthy node', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.5 });
      const result = monitor.checkHealth('n1');
      expect(result?.status).toBe('healthy');
    });

    it('should mark degraded on high cpu', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.9, memory: 0.5 });
      const result = monitor.checkHealth('n1');
      expect(result?.status).toBe('degraded');
    });

    it('should mark unhealthy on missed heartbeat', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: 0, cpu: 0.5, memory: 0.5 });
      const result = monitor.checkHealth('n1');
      expect(result?.status).toBe('unhealthy');
    });
  });

  // ============================================================
  // heartbeat
  // ============================================================
  describe('heartbeat', () => {
    it('should update heartbeat', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: 0, cpu: 0.5, memory: 0.5 });
      monitor.heartbeat('n1');
      expect(monitor.getNode('n1')?.lastHeartbeat).toBeGreaterThan(0);
    });

    it('should not affect unknown', () => {
      monitor.heartbeat('unknown');
    });
  });

  // ============================================================
  // getAlerts
  // ============================================================
  describe('alerts', () => {
    it('should create alert on high cpu', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.9, memory: 0.5 });
      monitor.checkHealth('n1');
      expect(monitor.getAlertCount()).toBe(1);
    });

    it('should create alert on missed heartbeat', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: 0, cpu: 0.5, memory: 0.5 });
      monitor.checkHealth('n1');
      expect(monitor.getCriticalAlertCount()).toBe(1);
    });

    it('should filter by severity', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.9, memory: 0.5 });
      monitor.checkHealth('n1');
      expect(monitor.getWarningAlertCount()).toBe(1);
    });

    it('should filter by node', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: 0, cpu: 0.5, memory: 0.5 });
      monitor.checkHealth('n1');
      expect(monitor.getAlertsByNode('n1').length).toBe(1);
    });
  });

  // ============================================================
  // generateReport
  // ============================================================
  describe('generateReport', () => {
    it('should generate report', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.5 });
      const report = monitor.generateReport();
      expect(report).toContain('Health Report');
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get healthy nodes', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.5 });
      monitor.registerNode({ id: 'n2', status: 'unhealthy', lastHeartbeat: 0, cpu: 0.5, memory: 0.5 });
      expect(monitor.getHealthyNodes()).toHaveLength(1);
    });

    it('should get degraded nodes', () => {
      monitor.registerNode({ id: 'n1', status: 'degraded', lastHeartbeat: Date.now(), cpu: 0.9, memory: 0.5 });
      expect(monitor.getDegradedNodes()).toHaveLength(1);
    });

    it('should get unhealthy nodes', () => {
      monitor.registerNode({ id: 'n1', status: 'unhealthy', lastHeartbeat: 0, cpu: 0.5, memory: 0.5 });
      expect(monitor.getUnhealthyNodes()).toHaveLength(1);
    });
  });

  // ============================================================
  // remove / has / count
  // ============================================================
  describe('remove / has / count', () => {
    it('should remove node', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.5 });
      expect(monitor.removeNode('n1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(monitor.removeNode('unknown')).toBe(false);
    });

    it('should check node existence', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.5 });
      expect(monitor.hasNode('n1')).toBe(true);
    });
  });

  // ============================================================
  // clearAlerts / clearAlertsForNode
  // ============================================================
  describe('clearAlerts', () => {
    it('should clear all alerts', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.9, memory: 0.5 });
      monitor.checkHealth('n1');
      monitor.clearAlerts();
      expect(monitor.getAlertCount()).toBe(0);
    });

    it('should clear alerts for specific node', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: 0, cpu: 0.5, memory: 0.5 });
      monitor.checkHealth('n1');
      const cleared = monitor.clearAlertsForNode('n1');
      expect(cleared).toBe(1);
    });
  });

  // ============================================================
  // heartbeat timeout
  // ============================================================
  describe('heartbeat timeout', () => {
    it('should set timeout', () => {
      monitor.setHeartbeatTimeout(5000);
      expect(monitor.getHeartbeatTimeout()).toBe(5000);
    });

    it('should clamp to >= 0', () => {
      monitor.setHeartbeatTimeout(-1);
      expect(monitor.getHeartbeatTimeout()).toBe(0);
    });
  });

  // ============================================================
  // metrics
  // ============================================================
  describe('metrics', () => {
    it('should calculate average cpu', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.4, memory: 0.5 });
      monitor.registerNode({ id: 'n2', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.6, memory: 0.5 });
      expect(monitor.getAverageCpu()).toBe(0.5);
    });

    it('should return 0 for no nodes', () => {
      expect(monitor.getAverageCpu()).toBe(0);
    });

    it('should calculate average memory', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.4 });
      monitor.registerNode({ id: 'n2', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.6 });
      expect(monitor.getAverageMemory()).toBe(0.5);
    });
  });

  // ============================================================
  // isHealthy
  // ============================================================
  describe('isHealthy', () => {
    it('should check healthy', () => {
      monitor.registerNode({ id: 'n1', status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.5 });
      expect(monitor.isHealthy('n1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(monitor.isHealthy('unknown')).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        monitor.registerNode({ id: `n${i}`, status: 'healthy', lastHeartbeat: Date.now(), cpu: 0.5, memory: 0.5 });
      }
      expect(monitor.getNodeCount()).toBe(50);
    });
  });
});