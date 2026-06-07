/**
 * BufferEngine Tests
 * nanobot-design Buffer Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BufferEngine } from '../BufferEngine';

describe('BufferEngine', () => {
  let bre: BufferEngine;

  beforeEach(() => {
    bre = new BufferEngine();
  });

  afterEach(() => {
    bre.clearAll();
  });

  describe('push / pop / flush / remove', () => {
    it('should push', () => {
      expect(bre.push('v1')).toMatch(/^bre-/);
    });

    it('should not push on full', () => {
      const small = new BufferEngine(2);
      small.push('a');
      small.push('b');
      expect(small.push('c')).toBeNull();
    });

    it('should pop', () => {
      bre.push('v1');
      expect(bre.pop()).toBe('v1');
    });

    it('should return null pop on empty', () => {
      expect(bre.pop()).toBeNull();
    });

    it('should return null pop on undefined', () => {
      bre.push('v1');
      bre.pop();
      expect(bre.pop()).toBeNull();
    });

    it('should flush', () => {
      bre.push('v1');
      bre.push('v2');
      expect(bre.flush()).toBe(2);
    });

    it('should flush 0 on empty', () => {
      expect(bre.flush()).toBe(0);
    });

    it('should remove', () => {
      const id = bre.push('v1');
      expect(bre.remove(id!)).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(bre.remove('unknown')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      bre.push('v1');
      expect(bre.getStats().items).toBe(1);
    });

    it('should count total pushed', () => {
      bre.push('v1');
      expect(bre.getStats().totalPushed).toBe(1);
    });

    it('should count total popped', () => {
      bre.push('v1');
      bre.pop();
      expect(bre.getStats().totalPopped).toBe(1);
    });

    it('should count total flushed', () => {
      bre.push('v1');
      bre.flush();
      expect(bre.getStats().totalFlushed).toBe(1);
    });

    it('should count active', () => {
      bre.push('v1');
      expect(bre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = bre.push('v1');
      bre.setActive(id!, false);
      expect(bre.getStats().inactive).toBe(1);
    });

    it('should count capacity used', () => {
      bre.push('v1');
      expect(bre.getStats().capacityUsed).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get item', () => {
      const id = bre.push('v1');
      expect(bre.getItem(id!)?.value).toBe('v1');
    });

    it('should check existence', () => {
      const id = bre.push('v1');
      expect(bre.hasItem(id!)).toBe(true);
    });

    it('should count', () => {
      expect(bre.getCount()).toBe(0);
      bre.push('v1');
      expect(bre.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get value', () => {
      const id = bre.push('v1');
      expect(bre.getValue(id!)).toBe('v1');
    });

    it('should get hits', () => {
      const id = bre.push('v1');
      expect(bre.getHits(id!)).toBe(0);
    });

    it('should check active', () => {
      const id = bre.push('v1');
      expect(bre.isActive(id!)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = bre.push('v1');
      expect(bre.setActive(id!, false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(bre.setActive('unknown', false)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = bre.push('v1');
      bre.setActive(id!, false);
      bre.resetAll();
      expect(bre.isActive(id!)).toBe(true);
    });
  });

  describe('by state', () => {
    it('should get active', () => {
      bre.push('v1');
      expect(bre.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = bre.push('v1');
      bre.setActive(id!, false);
      expect(bre.getInactiveItems()).toHaveLength(1);
    });
  });

  describe('state', () => {
    it('should peek', () => {
      bre.push('v1');
      expect(bre.peek()).toBe('v1');
    });

    it('should return null peek on empty', () => {
      expect(bre.peek()).toBeNull();
    });

    it('should get capacity', () => {
      const b = new BufferEngine(50);
      expect(b.getCapacity()).toBe(50);
    });

    it('should check isFull', () => {
      const b = new BufferEngine(2);
      b.push('a');
      b.push('b');
      expect(b.isFull()).toBe(true);
    });

    it('should check isEmpty', () => {
      expect(bre.isEmpty()).toBe(true);
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = bre.push('v1');
      expect(bre.getCreatedAt(id!)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = bre.push('v1');
      bre.setActive(id!, false);
      expect(bre.getUpdatedAt(id!)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total pushed', () => {
      bre.push('v1');
      expect(bre.getTotalPushed()).toBe(1);
    });

    it('should get total popped', () => {
      bre.push('v1');
      bre.pop();
      expect(bre.getTotalPopped()).toBe(1);
    });

    it('should get total flushed', () => {
      bre.push('v1');
      bre.flush();
      expect(bre.getTotalFlushed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many items', () => {
      for (let i = 0; i < 50; i++) {
        bre.push(`v${i}`);
      }
      expect(bre.getCount()).toBe(50);
    });
  });
});