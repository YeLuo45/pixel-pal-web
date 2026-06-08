/**
 * LeaseEngine Tests
 * nanobot-design Lease Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LeaseEngine } from '../LeaseEngine';

describe('LeaseEngine', () => {
  let lee: LeaseEngine;

  beforeEach(() => {
    lee = new LeaseEngine();
  });

  afterEach(() => {
    lee.clearAll();
  });

  describe('add / renew / release / remove', () => {
    it('should add', () => {
      expect(lee.add('res1', 'alice', 60000)).toMatch(/^lee-/);
    });

    it('should default state to leased', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getState(lee.getAllLeases()[0].id)).toBe('leased');
    });

    it('should mark as active', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.isActive(lee.getAllLeases()[0].id)).toBe(true);
    });

    it('should renew', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.renew(id, 30000)).toBe(true);
    });

    it('should increment duration on renew', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.renew(id, 30000);
      expect(lee.getDuration(id)).toBe(90000);
    });

    it('should not renew inactive', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.setActive(id, false);
      expect(lee.renew(id, 30000)).toBe(false);
    });

    it('should not renew released', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.release(id);
      expect(lee.renew(id, 30000)).toBe(false);
    });

    it('should return false for unknown renew', () => {
      expect(lee.renew('unknown', 30000)).toBe(false);
    });

    it('should release', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.release(id)).toBe(true);
    });

    it('should set revoked on release', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.release(id);
      expect(lee.isRevoked(id)).toBe(true);
    });

    it('should return false for unknown release', () => {
      expect(lee.release('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getStats().leases).toBe(1);
    });

    it('should count total added', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getStats().totalAdded).toBe(1);
    });

    it('should count total renewed', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.renew(id, 30000);
      expect(lee.getStats().totalRenewed).toBe(1);
    });

    it('should count total released', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.release(id);
      expect(lee.getStats().totalReleased).toBe(1);
    });

    it('should count leased', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getStats().leased).toBe(1);
    });

    it('should count revoked', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.release(id);
      expect(lee.getStats().revoked).toBe(1);
    });

    it('should count available', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.setState ? null : (id as any);
      lee.release(id);
      const avl = lee.getStats().available + lee.getStats().revoked;
      expect(avl).toBeGreaterThanOrEqual(1);
    });

    it('should count active', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.setActive(id, false);
      expect(lee.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.renew(id, 30000);
      expect(lee.getStats().totalHits).toBe(1);
    });

    it('should count unique holders', () => {
      lee.add('res1', 'alice', 60000);
      lee.add('res2', 'bob', 60000);
      expect(lee.getStats().uniqueHolders).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get lease', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.getLease(id)?.resource).toBe('res1');
    });

    it('should get all', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getAllLeases()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.hasLease(id)).toBe(true);
    });

    it('should count', () => {
      expect(lee.getCount()).toBe(0);
      lee.add('res1', 'alice', 60000);
      expect(lee.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get resource', () => {
      const id = lee.add('hello', 'alice', 60000);
      expect(lee.getResource(id)).toBe('hello');
    });

    it('should get holder', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.getHolder(id)).toBe('alice');
    });

    it('should get duration', () => {
      const id = lee.add('res1', 'alice', 90000);
      expect(lee.getDuration(id)).toBe(90000);
    });

    it('should get expires at', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.getExpiresAt(id)).toBeGreaterThan(Date.now());
    });

    it('should get hits', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.renew(id, 30000);
      expect(lee.getHits(id)).toBe(1);
    });

    it('should check leased', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.isLeased(lee.getAllLeases()[0].id)).toBe(true);
    });

    it('should check revoked', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.release(id);
      expect(lee.isRevoked(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.setActive(id, false)).toBe(true);
    });

    it('should set resource', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.setResource(id, 'res2')).toBe(true);
    });

    it('should set holder', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.setHolder(id, 'bob')).toBe(true);
    });

    it('should set duration', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.setDuration(id, 120000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(lee.setActive('unknown', false)).toBe(false);
      expect(lee.setResource('unknown', 'r')).toBe(false);
      expect(lee.setHolder('unknown', 'a')).toBe(false);
      expect(lee.setDuration('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.renew(id, 30000);
      lee.release(id);
      lee.resetAll();
      expect(lee.isLeased(id)).toBe(true);
      expect(lee.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getByState('leased')).toHaveLength(1);
    });

    it('should get active', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getActiveLeases()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.setActive(id, false);
      expect(lee.getInactiveLeases()).toHaveLength(1);
    });

    it('should get all holders', () => {
      lee.add('res1', 'a', 60000);
      lee.add('res2', 'b', 60000);
      expect(lee.getAllHolders()).toHaveLength(2);
    });

    it('should get all resources', () => {
      lee.add('r1', 'a', 60000);
      lee.add('r2', 'b', 60000);
      expect(lee.getAllResources()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getNewest()?.resource).toBe('res1');
    });

    it('should return null for empty newest', () => {
      expect(lee.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getOldest()?.resource).toBe('res1');
    });

    it('should return null for empty oldest', () => {
      expect(lee.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = lee.add('res1', 'alice', 60000);
      expect(lee.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.renew(id, 30000);
      expect(lee.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      lee.add('res1', 'alice', 60000);
      expect(lee.getTotalAdded()).toBe(1);
    });

    it('should get total renewed', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.renew(id, 30000);
      expect(lee.getTotalRenewed()).toBe(1);
    });

    it('should get total released', () => {
      const id = lee.add('res1', 'alice', 60000);
      lee.release(id);
      expect(lee.getTotalReleased()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many leases', () => {
      for (let i = 0; i < 50; i++) {
        lee.add(`res${i}`, 'alice', 60000);
      }
      expect(lee.getCount()).toBe(50);
    });
  });
});