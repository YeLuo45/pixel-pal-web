/**
 * BadgeEngine Tests
 * chatdev-design Badge Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BadgeEngine } from '../BadgeEngine';

describe('BadgeEngine', () => {
  let bge: BadgeEngine;

  beforeEach(() => {
    bge = new BadgeEngine();
  });

  afterEach(() => {
    bge.clearAll();
  });

  describe('define / award / revoke / remove', () => {
    it('should define', () => {
      expect(bge.define('b1', 'gold')).toMatch(/^bge-/);
    });

    it('should default awarded to 0', () => {
      bge.define('b1', 'gold');
      expect(bge.getAwarded(bge.getAllBadges()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      bge.define('b1', 'gold');
      expect(bge.isActive(bge.getAllBadges()[0].id)).toBe(true);
    });

    it('should award', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.award(id)).toBe(true);
    });

    it('should increment awarded', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      expect(bge.getAwarded(id)).toBe(1);
    });

    it('should not award inactive', () => {
      const id = bge.define('b1', 'gold');
      bge.setActive(id, false);
      expect(bge.award(id)).toBe(false);
    });

    it('should return false for unknown award', () => {
      expect(bge.award('unknown')).toBe(false);
    });

    it('should revoke', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      expect(bge.revoke(id)).toBe(true);
    });

    it('should decrement awarded', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      bge.revoke(id);
      expect(bge.getAwarded(id)).toBe(0);
    });

    it('should not revoke below 0', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.revoke(id)).toBe(false);
    });

    it('should return false for unknown revoke', () => {
      expect(bge.revoke('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      bge.define('b1', 'gold');
      expect(bge.getStats().badges).toBe(1);
    });

    it('should count total added', () => {
      bge.define('b1', 'gold');
      expect(bge.getStats().totalAdded).toBe(1);
    });

    it('should count total awarded', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      expect(bge.getStats().totalAwarded).toBe(1);
    });

    it('should count total revoked', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      bge.revoke(id);
      expect(bge.getStats().totalRevoked).toBe(1);
    });

    it('should count bronze', () => {
      bge.define('b1', 'bronze');
      expect(bge.getStats().bronze).toBe(1);
    });

    it('should count silver', () => {
      bge.define('b1', 'silver');
      expect(bge.getStats().silver).toBe(1);
    });

    it('should count gold', () => {
      bge.define('b1', 'gold');
      expect(bge.getStats().gold).toBe(1);
    });

    it('should count platinum', () => {
      bge.define('b1', 'platinum');
      expect(bge.getStats().platinum).toBe(1);
    });

    it('should count diamond', () => {
      bge.define('b1', 'diamond');
      expect(bge.getStats().diamond).toBe(1);
    });

    it('should count active', () => {
      bge.define('b1', 'gold');
      expect(bge.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bge.define('b1', 'gold');
      bge.setActive(id, false);
      expect(bge.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      expect(bge.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      bge.define('a', 'gold');
      bge.define('a', 'gold');
      expect(bge.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get badge', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.getBadge(id)?.name).toBe('b1');
    });

    it('should get all', () => {
      bge.define('b1', 'gold');
      expect(bge.getAllBadges()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.hasBadge(id)).toBe(true);
    });

    it('should count', () => {
      expect(bge.getCount()).toBe(0);
      bge.define('b1', 'gold');
      expect(bge.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.getName(id)).toBe('b1');
    });

    it('should get tier', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.getTier(id)).toBe('gold');
    });

    it('should get hits', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      expect(bge.getHits(id)).toBe(1);
    });

    it('should check bronze', () => {
      bge.define('b1', 'bronze');
      expect(bge.isBronze(bge.getAllBadges()[0].id)).toBe(true);
    });

    it('should check silver', () => {
      bge.define('b1', 'silver');
      expect(bge.isSilver(bge.getAllBadges()[0].id)).toBe(true);
    });

    it('should check gold', () => {
      bge.define('b1', 'gold');
      expect(bge.isGold(bge.getAllBadges()[0].id)).toBe(true);
    });

    it('should check platinum', () => {
      bge.define('b1', 'platinum');
      expect(bge.isPlatinum(bge.getAllBadges()[0].id)).toBe(true);
    });

    it('should check diamond', () => {
      bge.define('b1', 'diamond');
      expect(bge.isDiamond(bge.getAllBadges()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.setName(id, 'b2')).toBe(true);
    });

    it('should set tier', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.setTier(id, 'silver')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bge.setActive('unknown', false)).toBe(false);
      expect(bge.setName('unknown', 'b')).toBe(false);
      expect(bge.setTier('unknown', 'gold')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      bge.setActive(id, false);
      bge.resetAll();
      expect(bge.getAwarded(id)).toBe(0);
      expect(bge.isActive(id)).toBe(true);
    });
  });

  describe('by tier / state', () => {
    it('should get by tier', () => {
      bge.define('b1', 'gold');
      expect(bge.getByTier('gold')).toHaveLength(1);
    });

    it('should get active', () => {
      bge.define('b1', 'gold');
      expect(bge.getActiveBadges()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bge.define('b1', 'gold');
      bge.setActive(id, false);
      expect(bge.getInactiveBadges()).toHaveLength(1);
    });

    it('should get all names', () => {
      bge.define('a', 'gold');
      bge.define('b', 'gold');
      expect(bge.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      bge.define('b1', 'gold');
      expect(bge.getNewest()?.name).toBe('b1');
    });

    it('should return null for empty newest', () => {
      expect(bge.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      bge.define('b1', 'gold');
      expect(bge.getOldest()?.name).toBe('b1');
    });

    it('should return null for empty oldest', () => {
      expect(bge.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = bge.define('b1', 'gold');
      expect(bge.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      expect(bge.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      bge.define('b1', 'gold');
      expect(bge.getTotalAdded()).toBe(1);
    });

    it('should get total awarded', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      expect(bge.getTotalAwarded()).toBe(1);
    });

    it('should get total revoked', () => {
      const id = bge.define('b1', 'gold');
      bge.award(id);
      bge.revoke(id);
      expect(bge.getTotalRevoked()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many badges', () => {
      for (let i = 0; i < 50; i++) {
        bge.define(`b${i}`, 'gold');
      }
      expect(bge.getCount()).toBe(50);
    });
  });
});