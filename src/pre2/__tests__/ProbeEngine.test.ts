/**
 * ProbeEngine Tests
 * nanobot-design Probe Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProbeEngine } from '../ProbeEngine';

describe('ProbeEngine', () => {
  let pre2: ProbeEngine;

  beforeEach(() => {
    pre2 = new ProbeEngine();
  });

  afterEach(() => {
    pre2.clearAll();
  });

  describe('add / probe / log / remove', () => {
    it('should add', () => {
      expect(pre2.add('target1')).toMatch(/^pre2-/);
    });

    it('should default status to ok', () => {
      pre2.add('t1');
      expect(pre2.getStatus(pre2.getAllProbes()[0].id)).toBe('ok');
    });

    it('should mark as active', () => {
      pre2.add('t1');
      expect(pre2.isActive(pre2.getAllProbes()[0].id)).toBe(true);
    });

    it('should probe', () => {
      const id = pre2.add('t1');
      expect(pre2.probe(id, 50)).toBe(true);
    });

    it('should set latency', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getLatency(id)).toBe(50);
    });

    it('should set status', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50, 'warn');
      expect(pre2.getStatus(id)).toBe('warn');
    });

    it('should not probe inactive', () => {
      const id = pre2.add('t1');
      pre2.setActive(id, false);
      expect(pre2.probe(id, 50)).toBe(false);
    });

    it('should return false for unknown probe', () => {
      expect(pre2.probe('unknown', 50)).toBe(false);
    });

    it('should log', () => {
      const id = pre2.add('t1');
      expect(pre2.log(id)).toBe(true);
    });

    it('should return false for unknown log', () => {
      expect(pre2.log('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = pre2.add('t1');
      expect(pre2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      pre2.add('t1');
      expect(pre2.getStats().probes).toBe(1);
    });

    it('should count total added', () => {
      pre2.add('t1');
      expect(pre2.getStats().totalAdded).toBe(1);
    });

    it('should count total probed', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getStats().totalProbed).toBe(1);
    });

    it('should count ok', () => {
      pre2.add('t1');
      expect(pre2.getStats().ok).toBe(1);
    });

    it('should count warn', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50, 'warn');
      expect(pre2.getStats().warn).toBe(1);
    });

    it('should count fail', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50, 'fail');
      expect(pre2.getStats().fail).toBe(1);
    });

    it('should count active', () => {
      pre2.add('t1');
      expect(pre2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pre2.add('t1');
      pre2.setActive(id, false);
      expect(pre2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getStats().totalHits).toBe(1);
    });

    it('should count unique targets', () => {
      pre2.add('t1');
      pre2.add('t1');
      expect(pre2.getStats().uniqueTargets).toBe(1);
    });

    it('should count total latency', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getStats().totalLatency).toBe(50);
    });

    it('should count total attempts', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getStats().totalAttempts).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get probe', () => {
      const id = pre2.add('t1');
      expect(pre2.getProbe(id)?.target).toBe('t1');
    });

    it('should get all', () => {
      pre2.add('t1');
      expect(pre2.getAllProbes()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = pre2.add('t1');
      expect(pre2.hasProbe(id)).toBe(true);
    });

    it('should count', () => {
      expect(pre2.getCount()).toBe(0);
      pre2.add('t1');
      expect(pre2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get target', () => {
      const id = pre2.add('t1');
      expect(pre2.getTarget(id)).toBe('t1');
    });

    it('should get attempts', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getAttempts(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getHits(id)).toBe(1);
    });

    it('should check ok', () => {
      pre2.add('t1');
      expect(pre2.isOk(pre2.getAllProbes()[0].id)).toBe(true);
    });

    it('should check warn', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50, 'warn');
      expect(pre2.isWarn(id)).toBe(true);
    });

    it('should check fail', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50, 'fail');
      expect(pre2.isFail(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = pre2.add('t1');
      expect(pre2.setActive(id, false)).toBe(true);
    });

    it('should set target', () => {
      const id = pre2.add('t1');
      expect(pre2.setTarget(id, 't2')).toBe(true);
    });

    it('should set status', () => {
      const id = pre2.add('t1');
      expect(pre2.setStatus(id, 'warn')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pre2.setActive('unknown', false)).toBe(false);
      expect(pre2.setTarget('unknown', 't')).toBe(false);
      expect(pre2.setStatus('unknown', 'ok')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50, 'warn');
      pre2.setActive(id, false);
      pre2.resetAll();
      expect(pre2.getStatus(id)).toBe('ok');
      expect(pre2.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      pre2.add('t1');
      expect(pre2.getByStatus('ok')).toHaveLength(1);
    });

    it('should get active', () => {
      pre2.add('t1');
      expect(pre2.getActiveProbes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = pre2.add('t1');
      pre2.setActive(id, false);
      expect(pre2.getInactiveProbes()).toHaveLength(1);
    });

    it('should get all targets', () => {
      pre2.add('a');
      pre2.add('b');
      expect(pre2.getAllTargets()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      pre2.add('t1');
      expect(pre2.getNewest()?.target).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(pre2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pre2.add('t1');
      expect(pre2.getOldest()?.target).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(pre2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = pre2.add('t1');
      expect(pre2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      pre2.add('t1');
      expect(pre2.getTotalAdded()).toBe(1);
    });

    it('should get total probed', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getTotalProbed()).toBe(1);
    });

    it('should get total latency', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getTotalLatency()).toBe(50);
    });

    it('should get total attempts', () => {
      const id = pre2.add('t1');
      pre2.probe(id, 50);
      expect(pre2.getTotalAttempts()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many probes', () => {
      for (let i = 0; i < 50; i++) {
        pre2.add(`t${i}`);
      }
      expect(pre2.getCount()).toBe(50);
    });
  });
});