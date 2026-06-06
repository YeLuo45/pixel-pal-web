/**
 * ProxyManager Tests
 * nanobot-design Proxy Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProxyManager } from '../ProxyManager';

describe('ProxyManager', () => {
  let pxy: ProxyManager;

  beforeEach(() => {
    pxy = new ProxyManager();
  });

  afterEach(() => {
    pxy.clearAll();
  });

  // ============================================================
  // register / forward / reset
  // ============================================================
  describe('register / forward / reset', () => {
    it('should register', () => {
      expect(pxy.register('p1', 'http://proxy1.com')).toBe('pxy-1');
    });

    it('should mark as active', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      expect(pxy.isActive(id)).toBe(true);
    });

    it('should forward', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      expect(pxy.forward(id)).toBe(true);
    });

    it('should increment forwards on forward', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getForwards(id)).toBe(1);
    });

    it('should log history on forward', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getHistory(id)).toHaveLength(1);
    });

    it('should not forward inactive', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.setActive(id, false);
      expect(pxy.forward(id)).toBe(false);
    });

    it('should return false for unknown forward', () => {
      expect(pxy.forward('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      pxy.reset(id);
      expect(pxy.getForwards(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(pxy.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pxy.register('p1', 'http://proxy1.com');
      const stats = pxy.getStats();
      expect(stats.proxies).toBe(1);
    });

    it('should count total forwards', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getStats().totalForwards).toBe(1);
    });

    it('should count active', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.setActive(id, false);
      expect(pxy.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pxy.register('p1', 'http://proxy1.com');
      pxy.register('p2', 'http://proxy2.com');
      expect(pxy.getStats().uniqueNames).toBe(2);
    });

    it('should count unique urls', () => {
      pxy.register('p1', 'http://proxy1.com');
      pxy.register('p2', 'http://proxy2.com');
      expect(pxy.getStats().uniqueUrls).toBe(2);
    });

    it('should compute avg forwards', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getStats().avgForwards).toBe(1);
    });

    it('should get max forwards', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      pxy.forward(id);
      expect(pxy.getStats().maxForwards).toBe(2);
    });

    it('should get min forwards', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getStats().minForwards).toBe(0);
    });

    it('should compute avg url length', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getStats().avgUrlLength).toBe(17);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get proxy', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getProxy('pxy-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getAllProxies()).toHaveLength(1);
    });

    it('should remove', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.removeProxy('pxy-1')).toBe(true);
    });

    it('should check existence', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.hasProxy('pxy-1')).toBe(true);
    });

    it('should count', () => {
      expect(pxy.getCount()).toBe(0);
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getName('pxy-1')).toBe('p1');
    });

    it('should get url', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getUrl('pxy-1')).toBe('http://proxy1.com');
    });

    it('should get url length', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getUrlLength('pxy-1')).toBe(17);
    });

    it('should get history', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getHistory('pxy-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.setActive('pxy-1', false)).toBe(true);
    });

    it('should set name', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.setName('pxy-1', 'p2')).toBe(true);
    });

    it('should set url', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.setUrl('pxy-1', 'http://new.com')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pxy.setActive('unknown', false)).toBe(false);
      expect(pxy.setName('unknown', 'p')).toBe(false);
      expect(pxy.setUrl('unknown', 'u')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      pxy.setActive(id, false);
      pxy.resetAll();
      expect(pxy.getForwards(id)).toBe(0);
      expect(pxy.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / url / state
  // ============================================================
  describe('by name / url / state', () => {
    it('should get by name', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getByName('p1')).toHaveLength(1);
    });

    it('should get by url', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getByUrl('http://proxy1.com')).toHaveLength(1);
    });

    it('should get active', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getActiveProxies()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pxy.register('p1', 'http://proxy1.com');
      pxy.setActive('pxy-1', false);
      expect(pxy.getInactiveProxies()).toHaveLength(1);
    });

    it('should get all names', () => {
      pxy.register('p1', 'http://proxy1.com');
      pxy.register('p2', 'http://proxy2.com');
      expect(pxy.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getNameCount()).toBe(1);
    });

    it('should get all urls', () => {
      pxy.register('p1', 'http://proxy1.com');
      pxy.register('p2', 'http://proxy2.com');
      expect(pxy.getAllUrls()).toHaveLength(2);
    });

    it('should get url count', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getUrlCount()).toBe(1);
    });

    it('should get by min forwards', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getByMinForwards(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most forwards', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      pxy.forward(id);
      expect(pxy.getMostForwards()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(pxy.getMostForwards()).toBeNull();
    });

    it('should get newest', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getNewest()?.id).toBe('pxy-1');
    });

    it('should return null for empty newest', () => {
      expect(pxy.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getOldest()?.id).toBe('pxy-1');
    });

    it('should return null for empty oldest', () => {
      expect(pxy.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pxy.register('p1', 'http://proxy1.com');
      expect(pxy.getCreatedAt('pxy-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total forwards', () => {
      const id = pxy.register('p1', 'http://proxy1.com');
      pxy.forward(id);
      expect(pxy.getTotalForwards()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many proxies', () => {
      for (let i = 0; i < 50; i++) {
        pxy.register(`p${i}`, `http://proxy${i}.com`);
      }
      expect(pxy.getCount()).toBe(50);
    });
  });
});