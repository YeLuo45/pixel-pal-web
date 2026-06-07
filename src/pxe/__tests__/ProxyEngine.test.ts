/**
 * ProxyEngine Tests
 * thunderbolt-design Proxy Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProxyEngine } from '../ProxyEngine';

describe('ProxyEngine', () => {
  let pxe: ProxyEngine;

  beforeEach(() => {
    pxe = new ProxyEngine();
  });

  afterEach(() => {
    pxe.clearAll();
  });

  describe('add / forward / reject / close / reset / remove', () => {
    it('should add', () => {
      expect(pxe.add('p1', 'src1', 'tgt1')).toMatch(/^pxe-/);
    });

    it('should default status to idle', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getStatus(pxe.getAllProxies()[0].id)).toBe('idle');
    });

    it('should mark as active', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.isActive(pxe.getAllProxies()[0].id)).toBe(true);
    });

    it('should forward', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.forward(id)).toBe(true);
    });

    it('should set forwarding on forward', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.isForwarding(id)).toBe(true);
    });

    it('should increment forwarded', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.getForwarded(id)).toBe(1);
    });

    it('should not forward inactive', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.setActive(id, false);
      expect(pxe.forward(id)).toBe(false);
    });

    it('should not forward closed', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.close(id);
      expect(pxe.forward(id)).toBe(false);
    });

    it('should return false for unknown forward', () => {
      expect(pxe.forward('unknown')).toBe(false);
    });

    it('should reject', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.reject(id)).toBe(true);
    });

    it('should set rejected on reject', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.reject(id);
      expect(pxe.isRejected(id)).toBe(true);
    });

    it('should increment rejected', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.reject(id);
      expect(pxe.getRejected(id)).toBe(1);
    });

    it('should not reject inactive', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.setActive(id, false);
      expect(pxe.reject(id)).toBe(false);
    });

    it('should not reject closed', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.close(id);
      expect(pxe.reject(id)).toBe(false);
    });

    it('should return false for unknown reject', () => {
      expect(pxe.reject('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.close(id)).toBe(true);
    });

    it('should set closed', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.close(id);
      expect(pxe.isClosed(id)).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(pxe.close('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.close(id);
      expect(pxe.reset(id)).toBe(true);
    });

    it('should set idle on reset', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.close(id);
      pxe.reset(id);
      expect(pxe.isIdle(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(pxe.reset('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getStats().proxies).toBe(1);
    });

    it('should count total added', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getStats().totalAdded).toBe(1);
    });

    it('should count total forwarded', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.getStats().totalForwarded).toBe(1);
    });

    it('should count total rejected', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.reject(id);
      expect(pxe.getStats().totalRejected).toBe(1);
    });

    it('should count idle', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getStats().idle).toBe(1);
    });

    it('should count forwarding', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.getStats().forwarding).toBe(1);
    });

    it('should count rejected', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.reject(id);
      expect(pxe.getStats().rejected).toBe(1);
    });

    it('should count closed', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.close(id);
      expect(pxe.getStats().closed).toBe(1);
    });

    it('should count active', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.setActive(id, false);
      expect(pxe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pxe.add('a', 'src1', 'tgt1');
      pxe.add('a', 'src2', 'tgt2');
      expect(pxe.getStats().uniqueNames).toBe(1);
    });

    it('should count unique sources', () => {
      pxe.add('p1', 'a', 'tgt1');
      pxe.add('p2', 'b', 'tgt2');
      expect(pxe.getStats().uniqueSources).toBe(2);
    });

    it('should count unique targets', () => {
      pxe.add('p1', 'src1', 'a');
      pxe.add('p2', 'src2', 'b');
      expect(pxe.getStats().uniqueTargets).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get proxy', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getProxy(id)?.name).toBe('p1');
    });

    it('should get all', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getAllProxies()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.hasProxy(id)).toBe(true);
    });

    it('should count', () => {
      expect(pxe.getCount()).toBe(0);
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getName(id)).toBe('p1');
    });

    it('should get source', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getSource(id)).toBe('src1');
    });

    it('should get target', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getTarget(id)).toBe('tgt1');
    });

    it('should get hits', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.getHits(id)).toBe(1);
    });

    it('should check idle', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.isIdle(pxe.getAllProxies()[0].id)).toBe(true);
    });

    it('should check forwarding', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.isForwarding(id)).toBe(true);
    });

    it('should check rejected', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.reject(id);
      expect(pxe.isRejected(id)).toBe(true);
    });

    it('should check closed', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.close(id);
      expect(pxe.isClosed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.setName(id, 'p2')).toBe(true);
    });

    it('should set source', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.setSource(id, 'src2')).toBe(true);
    });

    it('should set target', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.setTarget(id, 'tgt2')).toBe(true);
    });

    it('should set status', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.setStatus(id, 'forwarding')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pxe.setActive('unknown', false)).toBe(false);
      expect(pxe.setName('unknown', 'p')).toBe(false);
      expect(pxe.setSource('unknown', 's')).toBe(false);
      expect(pxe.setTarget('unknown', 't')).toBe(false);
      expect(pxe.setStatus('unknown', 'idle')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      pxe.setActive(id, false);
      pxe.resetAll();
      expect(pxe.isIdle(id)).toBe(true);
      expect(pxe.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getByStatus('idle')).toHaveLength(1);
    });

    it('should get active', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getActiveProxies()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.setActive(id, false);
      expect(pxe.getInactiveProxies()).toHaveLength(1);
    });

    it('should get all names', () => {
      pxe.add('a', 'src1', 'tgt1');
      pxe.add('b', 'src2', 'tgt2');
      expect(pxe.getAllNames()).toHaveLength(2);
    });

    it('should get all sources', () => {
      pxe.add('p1', 'a', 'tgt1');
      pxe.add('p2', 'b', 'tgt2');
      expect(pxe.getAllSources()).toHaveLength(2);
    });

    it('should get all targets', () => {
      pxe.add('p1', 'src1', 'a');
      pxe.add('p2', 'src2', 'b');
      expect(pxe.getAllTargets()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getNewest()?.name).toBe('p1');
    });

    it('should return null for empty newest', () => {
      expect(pxe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getOldest()?.name).toBe('p1');
    });

    it('should return null for empty oldest', () => {
      expect(pxe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      pxe.add('p1', 'src1', 'tgt1');
      expect(pxe.getTotalAdded()).toBe(1);
    });

    it('should get total forwarded', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.forward(id);
      expect(pxe.getTotalForwarded()).toBe(1);
    });

    it('should get total rejected', () => {
      const id = pxe.add('p1', 'src1', 'tgt1');
      pxe.reject(id);
      expect(pxe.getTotalRejected()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many proxies', () => {
      for (let i = 0; i < 50; i++) {
        pxe.add(`p${i}`, `src${i}`, `tgt${i}`);
      }
      expect(pxe.getCount()).toBe(50);
    });
  });
});