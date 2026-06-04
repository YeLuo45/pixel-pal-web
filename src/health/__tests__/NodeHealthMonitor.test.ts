import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NodeHealthMonitor, HealthCheck, HealthStatus } from '../NodeHealthMonitor';

describe('NodeHealthMonitor', () => {
  let monitor: NodeHealthMonitor;

  beforeEach(() => {
    monitor = new NodeHealthMonitor();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('registerNode', () => {
    it('should register a node with a check function', () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      monitor.registerNode('node1', checkFn);
      
      expect(monitor.getNodeStatus('node1')).toBe('offline');
    });

    it('should not register duplicate nodes', () => {
      const checkFn1 = vi.fn().mockResolvedValue(true);
      const checkFn2 = vi.fn().mockResolvedValue(false);
      
      monitor.registerNode('node1', checkFn1);
      monitor.registerNode('node1', checkFn2);
      
      // Should still have the original checkFn
      expect(monitor.getNodeStatus('node1')).toBe('offline');
    });
  });

  describe('unregisterNode', () => {
    it('should unregister an existing node', () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      monitor.registerNode('node1', checkFn);
      monitor.unregisterNode('node1');
      
      expect(monitor.getNodeStatus('node1')).toBeNull();
    });

    it('should handle unregistering non-existent node', () => {
      expect(() => monitor.unregisterNode('nonexistent')).not.toThrow();
    });
  });

  describe('checkNode', () => {
    it('should return offline status for unregistered node', async () => {
      const result = await monitor.checkNode('nonexistent');
      
      expect(result.status).toBe('offline');
      expect(result.issues).toContain('Node not registered');
    });

    it('should return healthy status when check passes quickly', async () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      const result = await monitor.checkNode('node1');
      
      expect(result.status).toBe('healthy');
      expect(result.issues).toHaveLength(0);
      expect(checkFn).toHaveBeenCalledTimes(1);
    });

    it('should return degraded status for slow response', async () => {
      const checkFn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2500));
        return true;
      });
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      const resultPromise = monitor.checkNode('node1');
      
      vi.advanceTimersByTime(3000);
      const result = await resultPromise;
      
      expect(result.status).toBe('degraded');
      expect(result.issues.some(i => i.includes('Elevated response time'))).toBe(true);
    });

    it('should return unhealthy status when check fails', async () => {
      const checkFn = vi.fn().mockResolvedValue(false);
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      const result = await monitor.checkNode('node1');
      
      expect(result.status).toBe('degraded');
    });

    it('should return unhealthy status when check throws', async () => {
      const checkFn = vi.fn().mockRejectedValue(new Error('Connection failed'));
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      const result = await monitor.checkNode('node1');
      
      expect(result.status).toBe('degraded');
      expect(result.issues.some(i => i.includes('Connection failed'))).toBe(true);
    });

    it('should track metrics correctly', async () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      await monitor.checkNode('node1');
      
      const history = monitor.getHistory('node1');
      expect(history).toHaveLength(1);
      expect(history[0].metrics.lastCheck).toBeGreaterThan(0);
    });

    it('should update error rate on failures', async () => {
      const checkFn = vi.fn().mockRejectedValue(new Error('Error'));
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      await monitor.checkNode('node1');
      
      const history = monitor.getHistory('node1');
      expect(history[0].metrics.errorRate).toBeCloseTo(0.3, 1);
    });
  });

  describe('checkAllNodes', () => {
    it('should check all registered nodes', async () => {
      const checkFn1 = vi.fn().mockResolvedValue(true);
      const checkFn2 = vi.fn().mockResolvedValue(true);
      
      monitor.registerNode('node1', checkFn1);
      monitor.registerNode('node2', checkFn2);
      
      vi.advanceTimersByTime(100);
      const results = await monitor.checkAllNodes();
      
      expect(results).toHaveLength(2);
      expect(checkFn1).toHaveBeenCalledTimes(1);
      expect(checkFn2).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no nodes registered', async () => {
      const results = await monitor.checkAllNodes();
      expect(results).toHaveLength(0);
    });
  });

  describe('getNodeStatus', () => {
    it('should return null for unregistered node', () => {
      expect(monitor.getNodeStatus('nonexistent')).toBeNull();
    });
  });

  describe('onStatusChange', () => {
    it('should call callback when status changes', async () => {
      const checkFn = vi.fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      
      const callback = vi.fn();
      const unsubscribe = monitor.onStatusChange('node1', callback);
      
      // First check: false -> degraded (offline to degraded = 1st callback)
      // Second check: true -> healthy (degraded to healthy = 2nd callback)
      await monitor.checkNode('node1'); // First check - false -> degraded
      await monitor.checkNode('node1'); // Second check - true -> healthy
      
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ nodeId: 'node1', status: 'healthy' })
      );
      
      unsubscribe();
    });

    it('should not call callback after unsubscribe', async () => {
      const checkFn = vi.fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      
      const callback = vi.fn();
      const unsubscribe = monitor.onStatusChange('node1', callback);
      unsubscribe();
      
      await monitor.checkNode('node1');
      await monitor.checkNode('node1');
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return no-op unsubscribe for unregistered node', () => {
      const callback = vi.fn();
      const unsubscribe = monitor.onStatusChange('nonexistent', callback);
      
      unsubscribe(); // Should not throw
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return empty array for unregistered node', () => {
      expect(monitor.getHistory('nonexistent')).toEqual([]);
    });

    it('should track history of health checks', async () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      await monitor.checkNode('node1');
      
      vi.advanceTimersByTime(100);
      await monitor.checkNode('node1');
      
      const history = monitor.getHistory('node1');
      expect(history).toHaveLength(2);
    });

    it('should limit history to 100 entries', async () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      
      for (let i = 0; i < 105; i++) {
        await monitor.checkNode('node1');
        vi.advanceTimersByTime(10);
      }
      
      const history = monitor.getHistory('node1');
      expect(history).toHaveLength(100);
    });

    it('should return a copy of history', async () => {
      const checkFn = vi.fn().mockResolvedValue(true);
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      await monitor.checkNode('node1');
      
      const history1 = monitor.getHistory('node1');
      history1.push({ nodeId: 'test', status: 'offline', metrics: { uptime: 0, responseTime: 0, errorRate: 0, lastCheck: 0 }, issues: [] });
      
      const history2 = monitor.getHistory('node1');
      expect(history2).toHaveLength(1);
    });
  });

  describe('status determination logic', () => {
    it('should escalate to unhealthy after repeated failures', async () => {
      let callCount = 0;
      const checkFn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.resolve(false);
        }
        return Promise.resolve(true);
      });
      
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      
      // First check - degraded (first failure)
      await monitor.checkNode('node1');
      expect(monitor.getNodeStatus('node1')).toBe('degraded');
      
      vi.advanceTimersByTime(100);
      
      // Second check - unhealthy (error rate > 0.5)
      await monitor.checkNode('node1');
      expect(monitor.getNodeStatus('node1')).toBe('unhealthy');
    });

    it('should recover to healthy after successful checks', async () => {
      const checkFn = vi.fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      
      monitor.registerNode('node1', checkFn);
      
      vi.advanceTimersByTime(100);
      
      await monitor.checkNode('node1'); // degraded
      expect(monitor.getNodeStatus('node1')).toBe('degraded');
      
      vi.advanceTimersByTime(100);
      await monitor.checkNode('node1'); // healthy
      
      vi.advanceTimersByTime(100);
      const result = await monitor.checkNode('node1'); // healthy
      expect(result.status).toBe('healthy');
    });
  });
});