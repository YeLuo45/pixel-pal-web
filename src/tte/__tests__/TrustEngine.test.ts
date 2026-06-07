/**
 * TrustEngine Tests
 * generic-agent-design Trust Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TrustEngine } from '../TrustEngine';

describe('TrustEngine', () => {
  let tte: TrustEngine;

  beforeEach(() => {
    tte = new TrustEngine();
  });

  afterEach(() => {
    tte.clearAll();
  });

  describe('addEntity / trust / distrust / remove', () => {
    it('should add', () => {
      expect(tte.addEntity('alice')).toMatch(/^tte-/);
    });

    it('should default level to untrusted', () => {
      tte.addEntity('alice');
      expect(tte.getLevel(tte.getAllEntities()[0].id)).toBe('untrusted');
    });

    it('should mark as active', () => {
      tte.addEntity('alice');
      expect(tte.isActive(tte.getAllEntities()[0].id)).toBe(true);
    });

    it('should clamp initial score to 0-100', () => {
      tte.addEntity('alice', 'untrusted', 200);
      expect(tte.getScore(tte.getAllEntities()[0].id)).toBe(100);
    });

    it('should trust', () => {
      const id = tte.addEntity('alice');
      expect(tte.trust(id, 10)).toBe(true);
    });

    it('should increase score on trust', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 10);
      expect(tte.getScore(id)).toBe(10);
    });

    it('should set low level on small trust', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 15);
      expect(tte.isLow(id)).toBe(true);
    });

    it('should set high level on large trust', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 80);
      expect(tte.isHigh(id)).toBe(true);
    });

    it('should not trust inactive', () => {
      const id = tte.addEntity('alice');
      tte.setActive(id, false);
      expect(tte.trust(id, 10)).toBe(false);
    });

    it('should return false for unknown trust', () => {
      expect(tte.trust('unknown', 10)).toBe(false);
    });

    it('should distrust', () => {
      const id = tte.addEntity('alice', 'low', 50);
      expect(tte.distrust(id, 10)).toBe(true);
    });

    it('should decrease score on distrust', () => {
      const id = tte.addEntity('alice', 'low', 50);
      tte.distrust(id, 10);
      expect(tte.getScore(id)).toBe(40);
    });

    it('should clamp distrust at 0', () => {
      const id = tte.addEntity('alice', 'low', 10);
      tte.distrust(id, 50);
      expect(tte.getScore(id)).toBe(0);
    });

    it('should not distrust inactive', () => {
      const id = tte.addEntity('alice', 'low', 50);
      tte.setActive(id, false);
      expect(tte.distrust(id, 10)).toBe(false);
    });

    it('should return false for unknown distrust', () => {
      expect(tte.distrust('unknown', 10)).toBe(false);
    });

    it('should remove', () => {
      const id = tte.addEntity('alice');
      expect(tte.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      tte.addEntity('alice');
      expect(tte.getStats().entities).toBe(1);
    });

    it('should count total added', () => {
      tte.addEntity('alice');
      expect(tte.getStats().totalAdded).toBe(1);
    });

    it('should count total trust', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 10);
      expect(tte.getStats().totalTrust).toBe(1);
    });

    it('should count total distrust', () => {
      const id = tte.addEntity('alice', 'low', 50);
      tte.distrust(id, 10);
      expect(tte.getStats().totalDistrust).toBe(1);
    });

    it('should count untrusted', () => {
      tte.addEntity('alice');
      expect(tte.getStats().untrusted).toBe(1);
    });

    it('should count low', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 15);
      expect(tte.getStats().low).toBe(1);
    });

    it('should count medium', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 50);
      expect(tte.getStats().medium).toBe(1);
    });

    it('should count high', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 80);
      expect(tte.getStats().high).toBe(1);
    });

    it('should count absolute', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 95);
      expect(tte.getStats().absolute).toBe(1);
    });

    it('should count active', () => {
      tte.addEntity('alice');
      expect(tte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tte.addEntity('alice');
      tte.setActive(id, false);
      expect(tte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 10);
      expect(tte.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      tte.addEntity('a');
      tte.addEntity('a');
      expect(tte.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get entity', () => {
      const id = tte.addEntity('alice');
      expect(tte.getEntity(id)?.name).toBe('alice');
    });

    it('should get all', () => {
      tte.addEntity('alice');
      expect(tte.getAllEntities()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = tte.addEntity('alice');
      expect(tte.hasEntity(id)).toBe(true);
    });

    it('should count', () => {
      expect(tte.getCount()).toBe(0);
      tte.addEntity('alice');
      expect(tte.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = tte.addEntity('alice');
      expect(tte.getName(id)).toBe('alice');
    });

    it('should get hits', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 10);
      expect(tte.getHits(id)).toBe(1);
    });

    it('should check untrusted', () => {
      tte.addEntity('alice');
      expect(tte.isUntrusted(tte.getAllEntities()[0].id)).toBe(true);
    });

    it('should check low', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 15);
      expect(tte.isLow(id)).toBe(true);
    });

    it('should check medium', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 50);
      expect(tte.isMedium(id)).toBe(true);
    });

    it('should check high', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 80);
      expect(tte.isHigh(id)).toBe(true);
    });

    it('should check absolute', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 95);
      expect(tte.isAbsolute(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = tte.addEntity('alice');
      expect(tte.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = tte.addEntity('alice');
      expect(tte.setName(id, 'bob')).toBe(true);
    });

    it('should set level', () => {
      const id = tte.addEntity('alice');
      expect(tte.setLevel(id, 'high')).toBe(true);
    });

    it('should set score', () => {
      const id = tte.addEntity('alice');
      expect(tte.setScore(id, 50)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tte.setActive('unknown', false)).toBe(false);
      expect(tte.setName('unknown', 'a')).toBe(false);
      expect(tte.setLevel('unknown', 'low')).toBe(false);
      expect(tte.setScore('unknown', 50)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 80);
      tte.setActive(id, false);
      tte.resetAll();
      expect(tte.isUntrusted(id)).toBe(true);
      expect(tte.isActive(id)).toBe(true);
    });
  });

  describe('by level / state', () => {
    it('should get by level', () => {
      tte.addEntity('alice');
      expect(tte.getByLevel('untrusted')).toHaveLength(1);
    });

    it('should get active', () => {
      tte.addEntity('alice');
      expect(tte.getActiveEntities()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = tte.addEntity('alice');
      tte.setActive(id, false);
      expect(tte.getInactiveEntities()).toHaveLength(1);
    });

    it('should get all names', () => {
      tte.addEntity('a');
      tte.addEntity('b');
      expect(tte.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      tte.addEntity('alice');
      expect(tte.getNewest()?.name).toBe('alice');
    });

    it('should return null for empty newest', () => {
      expect(tte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tte.addEntity('alice');
      expect(tte.getOldest()?.name).toBe('alice');
    });

    it('should return null for empty oldest', () => {
      expect(tte.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = tte.addEntity('alice');
      expect(tte.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 10);
      expect(tte.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      tte.addEntity('alice');
      expect(tte.getTotalAdded()).toBe(1);
    });

    it('should get total trust', () => {
      const id = tte.addEntity('alice');
      tte.trust(id, 10);
      expect(tte.getTotalTrust()).toBe(1);
    });

    it('should get total distrust', () => {
      const id = tte.addEntity('alice', 'low', 50);
      tte.distrust(id, 10);
      expect(tte.getTotalDistrust()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many entities', () => {
      for (let i = 0; i < 50; i++) {
        tte.addEntity(`e${i}`);
      }
      expect(tte.getCount()).toBe(50);
    });
  });
});