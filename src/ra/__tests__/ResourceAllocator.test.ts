/**
 * ResourceAllocator Tests
 * thunderbolt-design Resource Allocator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResourceAllocator } from '../ResourceAllocator';

describe('ResourceAllocator', () => {
  let ra: ResourceAllocator;

  beforeEach(() => {
    ra = new ResourceAllocator();
  });

  afterEach(() => {
    ra.clearAll();
  });

  // ============================================================
  // add / request / execute
  // ============================================================
  describe('add / request / execute', () => {
    it('should add', () => {
      expect(ra.add('cpu', 100)).toBe('ra-r-1');
    });

    it('should mark as active', () => {
      const id = ra.add('cpu', 100);
      expect(ra.isResourceActive(id)).toBe(true);
    });

    it('should request', () => {
      const resId = ra.add('cpu', 100);
      expect(ra.request(resId, 'user1', 10)).toBe('ra-a-1');
    });

    it('should mark as pending', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.isPending(id)).toBe(true);
    });

    it('should execute', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.execute(id)).toBe(true);
    });

    it('should mark as allocated on execute', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      expect(ra.isAllocated(id)).toBe(true);
    });

    it('should increment used on allocate', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      expect(ra.getUsed(resId)).toBe(10);
    });

    it('should deny when over capacity', () => {
      const resId = ra.add('cpu', 5);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.execute(id)).toBe(false);
    });

    it('should mark as denied when over capacity', () => {
      const resId = ra.add('cpu', 5);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      expect(ra.isDenied(id)).toBe(true);
    });

    it('should not execute non-pending', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      expect(ra.execute(id)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(ra.execute('unknown')).toBe(false);
    });

    it('should release allocation', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      expect(ra.release(id)).toBe(true);
    });

    it('should decrement used on release', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      ra.release(id);
      expect(ra.getUsed(resId)).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ra.add('cpu', 100);
      const stats = ra.getStats();
      expect(stats.resources).toBe(1);
    });

    it('should count allocations', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      expect(ra.getStats().allocations).toBe(1);
    });

    it('should count pending', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      expect(ra.getStats().pending).toBe(1);
    });

    it('should count allocated', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      expect(ra.getStats().allocated).toBe(1);
    });

    it('should count denied', () => {
      const resId = ra.add('cpu', 5);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      expect(ra.getStats().denied).toBe(1);
    });

    it('should count total amount', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      ra.request(resId, 'user2', 20);
      expect(ra.getStats().totalAmount).toBe(30);
    });

    it('should count total capacity', () => {
      ra.add('cpu', 100);
      ra.add('mem', 200);
      expect(ra.getStats().totalCapacity).toBe(300);
    });

    it('should compute utilization rate', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 50);
      ra.execute(id);
      expect(ra.getStats().utilizationRate).toBe(0.5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get resource', () => {
      ra.add('cpu', 100);
      expect(ra.getResource('ra-r-1')?.name).toBe('cpu');
    });

    it('should get allocation', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.getAllocation(id)?.requester).toBe('user1');
    });

    it('should get all resources', () => {
      ra.add('cpu', 100);
      expect(ra.getAllResources()).toHaveLength(1);
    });

    it('should get all allocations', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      expect(ra.getAllAllocations()).toHaveLength(1);
    });

    it('should remove resource', () => {
      ra.add('cpu', 100);
      expect(ra.removeResource('ra-r-1')).toBe(true);
    });

    it('should remove allocation', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.removeAllocation(id)).toBe(true);
    });

    it('should check existence', () => {
      ra.add('cpu', 100);
      expect(ra.hasResource('ra-r-1')).toBe(true);
    });

    it('should count', () => {
      expect(ra.getResourceCount()).toBe(0);
      ra.add('cpu', 100);
      expect(ra.getResourceCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get resource name', () => {
      ra.add('cpu', 100);
      expect(ra.getResourceName('ra-r-1')).toBe('cpu');
    });

    it('should get capacity', () => {
      ra.add('cpu', 100);
      expect(ra.getCapacity('ra-r-1')).toBe(100);
    });

    it('should get used', () => {
      ra.add('cpu', 100);
      expect(ra.getUsed('ra-r-1')).toBe(0);
    });

    it('should get available', () => {
      ra.add('cpu', 100);
      expect(ra.getAvailable('ra-r-1')).toBe(100);
    });

    it('should get requester', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.getRequester(id)).toBe('user1');
    });

    it('should get amount', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.getAmount(id)).toBe(10);
    });

    it('should get status', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.getStatus(id)).toBe('pending');
    });

    it('should get attempts', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      expect(ra.getAttempts(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set resource active', () => {
      const id = ra.add('cpu', 100);
      expect(ra.setResourceActive(id, false)).toBe(true);
    });

    it('should set alloc active', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      expect(ra.setAllocActive(id, false)).toBe(true);
    });

    it('should set capacity', () => {
      const id = ra.add('cpu', 100);
      expect(ra.setCapacity(id, 200)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ra.setResourceActive('unknown', false)).toBe(false);
      expect(ra.setAllocActive('unknown', false)).toBe(false);
      expect(ra.setCapacity('unknown', 100)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const resId = ra.add('cpu', 100);
      const id = ra.request(resId, 'user1', 10);
      ra.execute(id);
      ra.resetAll();
      expect(ra.getUsed(resId)).toBe(0);
      expect(ra.isPending(id)).toBe(true);
    });
  });

  // ============================================================
  // by requester / status
  // ============================================================
  describe('by requester / status', () => {
    it('should get by requester', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      expect(ra.getByRequester('user1')).toHaveLength(1);
    });

    it('should get by status', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      expect(ra.getByStatus('pending')).toHaveLength(1);
    });

    it('should get by resource', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      expect(ra.getByResource(resId)).toHaveLength(1);
    });
  });

  // ============================================================
  // active / inactive
  // ============================================================
  describe('active / inactive', () => {
    it('should get active resources', () => {
      ra.add('cpu', 100);
      expect(ra.getActiveResources()).toHaveLength(1);
    });

    it('should get inactive resources', () => {
      const id = ra.add('cpu', 100);
      ra.setResourceActive(id, false);
      expect(ra.getInactiveResources()).toHaveLength(1);
    });
  });

  // ============================================================
  // names
  // ============================================================
  describe('names', () => {
    it('should get all resource names', () => {
      ra.add('cpu', 100);
      ra.add('mem', 200);
      expect(ra.getAllResourceNames()).toHaveLength(2);
    });

    it('should get resource name count', () => {
      ra.add('cpu', 100);
      expect(ra.getResourceNameCount()).toBe(1);
    });

    it('should get all requesters', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      ra.request(resId, 'user2', 20);
      expect(ra.getAllRequesters()).toHaveLength(2);
    });

    it('should get requester count', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      expect(ra.getRequesterCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest resource', () => {
      ra.add('cpu', 100);
      expect(ra.getNewestResource()?.id).toBe('ra-r-1');
    });

    it('should return null for empty newest', () => {
      expect(ra.getNewestResource()).toBeNull();
    });

    it('should get newest allocation', () => {
      const resId = ra.add('cpu', 100);
      ra.request(resId, 'user1', 10);
      expect(ra.getNewestAllocation()?.id).toBe('ra-a-1');
    });

    it('should return null for empty newest alloc', () => {
      expect(ra.getNewestAllocation()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many resources', () => {
      for (let i = 0; i < 50; i++) {
        ra.add(`r${i}`, 100);
      }
      expect(ra.getResourceCount()).toBe(50);
    });
  });
});