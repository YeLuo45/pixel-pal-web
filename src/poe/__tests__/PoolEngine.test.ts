/**
 * PoolEngine Tests
 * thunderbolt-design Pool Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PoolEngine } from '../PoolEngine';

describe('PoolEngine', () => {
  let poe: PoolEngine;

  beforeEach(() => {
    poe = new PoolEngine();
  });

  afterEach(() => {
    poe.clearAll();
  });

  describe('add / acquire / release / close / remove', () => {
    it('should add', () => {
      expect(poe.add('r1')).toMatch(/^poe-/);
    });

    it('should default state to idle', () => {
      poe.add('r1');
      expect(poe.getState(poe.getAllResources()[0].id)).toBe('idle');
    });

    it('should mark as active', () => {
      poe.add('r1');
      expect(poe.isActive(poe.getAllResources()[0].id)).toBe(true);
    });

    it('should acquire', () => {
      const id = poe.add('r1');
      expect(poe.acquire(id, 'alice')).toBe(true);
    });

    it('should set in-use on acquire', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.isInUse(id)).toBe(true);
    });

    it('should set acquirer', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.getAcquirer(id)).toBe('alice');
    });

    it('should not acquire inactive', () => {
      const id = poe.add('r1');
      poe.setActive(id, false);
      expect(poe.acquire(id, 'alice')).toBe(false);
    });

    it('should not double acquire', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.acquire(id, 'bob')).toBe(false);
    });

    it('should return false for unknown acquire', () => {
      expect(poe.acquire('unknown', 'alice')).toBe(false);
    });

    it('should release', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.release(id)).toBe(true);
    });

    it('should set idle on release', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      poe.release(id);
      expect(poe.isIdle(id)).toBe(true);
    });

    it('should clear acquirer on release', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      poe.release(id);
      expect(poe.getAcquirer(id)).toBe('');
    });

    it('should not release idle', () => {
      const id = poe.add('r1');
      expect(poe.release(id)).toBe(false);
    });

    it('should return false for unknown release', () => {
      expect(poe.release('unknown')).toBe(false);
    });

    it('should close', () => {
      const id = poe.add('r1');
      expect(poe.close(id)).toBe(true);
    });

    it('should set closed', () => {
      const id = poe.add('r1');
      poe.close(id);
      expect(poe.isClosed(id)).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(poe.close('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = poe.add('r1');
      expect(poe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      poe.add('r1');
      expect(poe.getStats().resources).toBe(1);
    });

    it('should count total added', () => {
      poe.add('r1');
      expect(poe.getStats().totalAdded).toBe(1);
    });

    it('should count total acquired', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.getStats().totalAcquired).toBe(1);
    });

    it('should count total released', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      poe.release(id);
      expect(poe.getStats().totalReleased).toBe(1);
    });

    it('should count idle', () => {
      poe.add('r1');
      expect(poe.getStats().idle).toBe(1);
    });

    it('should count in-use', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.getStats().inUse).toBe(1);
    });

    it('should count closed', () => {
      const id = poe.add('r1');
      poe.close(id);
      expect(poe.getStats().closed).toBe(1);
    });

    it('should count active', () => {
      poe.add('r1');
      expect(poe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = poe.add('r1');
      poe.setActive(id, false);
      expect(poe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      poe.add('a');
      poe.add('a');
      expect(poe.getStats().uniqueNames).toBe(1);
    });

    it('should count unique acquirers', () => {
      const id1 = poe.add('r1');
      const id2 = poe.add('r2');
      poe.acquire(id1, 'alice');
      poe.acquire(id2, 'alice');
      expect(poe.getStats().uniqueAcquirers).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get resource', () => {
      const id = poe.add('r1');
      expect(poe.getResource(id)?.name).toBe('r1');
    });

    it('should get all', () => {
      poe.add('r1');
      expect(poe.getAllResources()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = poe.add('r1');
      expect(poe.hasResource(id)).toBe(true);
    });

    it('should count', () => {
      expect(poe.getCount()).toBe(0);
      poe.add('r1');
      expect(poe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = poe.add('r1');
      expect(poe.getName(id)).toBe('r1');
    });

    it('should get hits', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.getHits(id)).toBe(1);
    });

    it('should check idle', () => {
      poe.add('r1');
      expect(poe.isIdle(poe.getAllResources()[0].id)).toBe(true);
    });

    it('should check in-use', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.isInUse(id)).toBe(true);
    });

    it('should check closed', () => {
      const id = poe.add('r1');
      poe.close(id);
      expect(poe.isClosed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = poe.add('r1');
      expect(poe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = poe.add('r1');
      expect(poe.setName(id, 'r2')).toBe(true);
    });

    it('should set state', () => {
      const id = poe.add('r1');
      expect(poe.setState(id, 'in-use')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(poe.setActive('unknown', false)).toBe(false);
      expect(poe.setName('unknown', 'r')).toBe(false);
      expect(poe.setState('unknown', 'idle')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      poe.setActive(id, false);
      poe.resetAll();
      expect(poe.isIdle(id)).toBe(true);
      expect(poe.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      poe.add('r1');
      expect(poe.getByState('idle')).toHaveLength(1);
    });

    it('should get idle', () => {
      poe.add('r1');
      expect(poe.getIdleResources()).toHaveLength(1);
    });

    it('should get in-use', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.getInUseResources()).toHaveLength(1);
    });

    it('should get closed', () => {
      const id = poe.add('r1');
      poe.close(id);
      expect(poe.getClosedResources()).toHaveLength(1);
    });

    it('should get active', () => {
      poe.add('r1');
      expect(poe.getActiveResources()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = poe.add('r1');
      poe.setActive(id, false);
      expect(poe.getInactiveResources()).toHaveLength(1);
    });

    it('should get all names', () => {
      poe.add('a');
      poe.add('b');
      expect(poe.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      poe.add('r1');
      expect(poe.getNewest()?.name).toBe('r1');
    });

    it('should return null for empty newest', () => {
      expect(poe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      poe.add('r1');
      expect(poe.getOldest()?.name).toBe('r1');
    });

    it('should return null for empty oldest', () => {
      expect(poe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = poe.add('r1');
      expect(poe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      poe.add('r1');
      expect(poe.getTotalAdded()).toBe(1);
    });

    it('should get total acquired', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      expect(poe.getTotalAcquired()).toBe(1);
    });

    it('should get total released', () => {
      const id = poe.add('r1');
      poe.acquire(id, 'alice');
      poe.release(id);
      expect(poe.getTotalReleased()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many resources', () => {
      for (let i = 0; i < 50; i++) {
        poe.add(`r${i}`);
      }
      expect(poe.getCount()).toBe(50);
    });
  });
});