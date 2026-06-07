/**
 * ThrottleEngine Tests
 * thunderbolt-design Throttle Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThrottleEngine } from '../ThrottleEngine';

describe('ThrottleEngine', () => {
  let tte: ThrottleEngine;

  beforeEach(() => {
    tte = new ThrottleEngine();
  });

  afterEach(() => {
    tte.clearAll();
  });

  describe('add / throttle / check / remove', () => {
    it('should add', () => {
      expect(tte.add('t1', 'fixed', 10)).toBe('tte-1');
    });

    it('should mark as active', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.isActive('tte-1')).toBe(true);
    });

    it('should throttle allow', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.throttle('tte-1')).toBe(true);
    });

    it('should throttle block when rate 0', () => {
      tte.add('t1', 'fixed', 0);
      expect(tte.throttle('tte-1')).toBe(false);
    });

    it('should not throttle inactive', () => {
      tte.add('t1', 'fixed', 10);
      tte.setActive('tte-1', false);
      expect(tte.throttle('tte-1')).toBe(false);
    });

    it('should return false for unknown throttle', () => {
      expect(tte.throttle('unknown')).toBe(false);
    });

    it('should check', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.check('tte-1')).toBe(true);
    });

    it('should check false for rate 0', () => {
      tte.add('t1', 'fixed', 0);
      expect(tte.check('tte-1')).toBe(false);
    });

    it('should return false for unknown check', () => {
      expect(tte.check('unknown')).toBe(false);
    });

    it('should remove', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.remove('tte-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getStats().throttles).toBe(1);
    });

    it('should count total added', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getStats().totalAdded).toBe(1);
    });

    it('should count total allowed', () => {
      tte.add('t1', 'fixed', 10);
      tte.throttle('tte-1');
      expect(tte.getStats().totalAllowed).toBe(1);
    });

    it('should count total blocked', () => {
      tte.add('t1', 'fixed', 0);
      tte.throttle('tte-1');
      expect(tte.getStats().totalBlocked).toBe(1);
    });

    it('should count fixed', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getStats().fixed).toBe(1);
    });

    it('should count sliding', () => {
      tte.add('t1', 'sliding', 10);
      expect(tte.getStats().sliding).toBe(1);
    });

    it('should count token', () => {
      tte.add('t1', 'token', 10);
      expect(tte.getStats().token).toBe(1);
    });

    it('should count active', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      tte.add('t1', 'fixed', 10);
      tte.setActive('tte-1', false);
      expect(tte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      tte.add('t1', 'fixed', 10);
      tte.throttle('tte-1');
      expect(tte.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      tte.add('a', 'fixed', 10);
      tte.add('a', 'fixed', 10);
      expect(tte.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get throttle', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getThrottle('tte-1')?.name).toBe('t1');
    });

    it('should get all', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getAllThrottles()).toHaveLength(1);
    });

    it('should check existence', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.hasThrottle('tte-1')).toBe(true);
    });

    it('should count', () => {
      expect(tte.getCount()).toBe(0);
      tte.add('t1', 'fixed', 10);
      expect(tte.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getName('tte-1')).toBe('t1');
    });

    it('should get strategy', () => {
      tte.add('t1', 'sliding', 10);
      expect(tte.getStrategy('tte-1')).toBe('sliding');
    });

    it('should get rate', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getRate('tte-1')).toBe(10);
    });

    it('should get allowed', () => {
      tte.add('t1', 'fixed', 10);
      tte.throttle('tte-1');
      expect(tte.getAllowed('tte-1')).toBe(1);
    });

    it('should get blocked', () => {
      tte.add('t1', 'fixed', 0);
      tte.throttle('tte-1');
      expect(tte.getBlocked('tte-1')).toBe(1);
    });

    it('should get hits', () => {
      tte.add('t1', 'fixed', 10);
      tte.throttle('tte-1');
      expect(tte.getHits('tte-1')).toBe(1);
    });

    it('should check fixed', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.isFixed('tte-1')).toBe(true);
    });

    it('should check sliding', () => {
      tte.add('t1', 'sliding', 10);
      expect(tte.isSliding('tte-1')).toBe(true);
    });

    it('should check token', () => {
      tte.add('t1', 'token', 10);
      expect(tte.isToken('tte-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.setActive('tte-1', false)).toBe(true);
    });

    it('should set rate', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.setRate('tte-1', 5)).toBe(true);
    });

    it('should set name', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.setName('tte-1', 't2')).toBe(true);
    });

    it('should set strategy', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.setStrategy('tte-1', 'sliding')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tte.setActive('unknown', false)).toBe(false);
      expect(tte.setRate('unknown', 1)).toBe(false);
      expect(tte.setName('unknown', 't')).toBe(false);
      expect(tte.setStrategy('unknown', 'fixed')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      tte.add('t1', 'fixed', 10);
      tte.throttle('tte-1');
      tte.setActive('tte-1', false);
      tte.resetAll();
      expect(tte.getAllowed('tte-1')).toBe(0);
      expect(tte.isActive('tte-1')).toBe(true);
    });
  });

  describe('by strategy / state', () => {
    it('should get by strategy', () => {
      tte.add('t1', 'sliding', 10);
      expect(tte.getByStrategy('sliding')).toHaveLength(1);
    });

    it('should get active', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getActiveThrottles()).toHaveLength(1);
    });

    it('should get inactive', () => {
      tte.add('t1', 'fixed', 10);
      tte.setActive('tte-1', false);
      expect(tte.getInactiveThrottles()).toHaveLength(1);
    });

    it('should get all names', () => {
      tte.add('a', 'fixed', 10);
      tte.add('b', 'fixed', 10);
      expect(tte.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getNewest()?.id).toBe('tte-1');
    });

    it('should return null for empty newest', () => {
      expect(tte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getOldest()?.id).toBe('tte-1');
    });

    it('should return null for empty oldest', () => {
      expect(tte.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getCreatedAt('tte-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      tte.add('t1', 'fixed', 10);
      tte.throttle('tte-1');
      expect(tte.getUpdatedAt('tte-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      tte.add('t1', 'fixed', 10);
      expect(tte.getTotalAdded()).toBe(1);
    });

    it('should get total allowed', () => {
      tte.add('t1', 'fixed', 10);
      tte.throttle('tte-1');
      expect(tte.getTotalAllowed()).toBe(1);
    });

    it('should get total blocked', () => {
      tte.add('t1', 'fixed', 0);
      tte.throttle('tte-1');
      expect(tte.getTotalBlocked()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many throttles', () => {
      for (let i = 0; i < 50; i++) {
        tte.add(`t${i}`, 'fixed', 10);
      }
      expect(tte.getCount()).toBe(50);
    });
  });
});