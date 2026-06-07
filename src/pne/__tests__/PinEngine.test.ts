/**
 * PinEngine Tests
 * chatdev-design Pin Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PinEngine } from '../PinEngine';

describe('PinEngine', () => {
  let pne: PinEngine;

  beforeEach(() => {
    pne = new PinEngine();
  });

  afterEach(() => {
    pne.clearAll();
  });

  describe('add / pin / unpin / remove', () => {
    it('should add', () => {
      expect(pne.add('p1', 'top')).toMatch(/^pne-/);
    });

    it('should default pinned to 0', () => {
      pne.add('p1', 'top');
      expect(pne.getPinned(pne.getAllPins()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      pne.add('p1', 'top');
      expect(pne.isActive(pne.getAllPins()[0].id)).toBe(true);
    });

    it('should pin', () => {
      const id = pne.add('p1', 'top');
      expect(pne.pin(id)).toBe(true);
    });

    it('should increment pinned', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      expect(pne.getPinned(id)).toBe(1);
    });

    it('should not pin inactive', () => {
      const id = pne.add('p1', 'top');
      pne.setActive(id, false);
      expect(pne.pin(id)).toBe(false);
    });

    it('should return false for unknown pin', () => {
      expect(pne.pin('unknown')).toBe(false);
    });

    it('should unpin', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      expect(pne.unpin(id)).toBe(true);
    });

    it('should decrement pinned', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      pne.unpin(id);
      expect(pne.getPinned(id)).toBe(0);
    });

    it('should not unpin below 0', () => {
      const id = pne.add('p1', 'top');
      expect(pne.unpin(id)).toBe(false);
    });

    it('should return false for unknown unpin', () => {
      expect(pne.unpin('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = pne.add('p1', 'top');
      expect(pne.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      pne.add('p1', 'top');
      expect(pne.getStats().pins).toBe(1);
    });

    it('should count total added', () => {
      pne.add('p1', 'top');
      expect(pne.getStats().totalAdded).toBe(1);
    });

    it('should count total pinned', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      expect(pne.getStats().totalPinned).toBe(1);
    });

    it('should count total unpinned', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      pne.unpin(id);
      expect(pne.getStats().totalUnpinned).toBe(1);
    });

    it('should count top', () => {
      pne.add('p1', 'top');
      expect(pne.getStats().top).toBe(1);
    });

    it('should count sticky', () => {
      pne.add('p1', 'sticky');
      expect(pne.getStats().sticky).toBe(1);
    });

    it('should count highlight', () => {
      pne.add('p1', 'highlight');
      expect(pne.getStats().highlight).toBe(1);
    });

    it('should count announcement', () => {
      pne.add('p1', 'announcement');
      expect(pne.getStats().announcement).toBe(1);
    });

    it('should count active', () => {
      pne.add('p1', 'top');
      expect(pne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pne.add('p1', 'top');
      pne.setActive(id, false);
      expect(pne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      expect(pne.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pne.add('a', 'top');
      pne.add('a', 'top');
      expect(pne.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get pin', () => {
      const id = pne.add('p1', 'top');
      expect(pne.getPin(id)?.name).toBe('p1');
    });

    it('should get all', () => {
      pne.add('p1', 'top');
      expect(pne.getAllPins()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = pne.add('p1', 'top');
      expect(pne.hasPin(id)).toBe(true);
    });

    it('should count', () => {
      expect(pne.getCount()).toBe(0);
      pne.add('p1', 'top');
      expect(pne.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = pne.add('p1', 'top');
      expect(pne.getName(id)).toBe('p1');
    });

    it('should get kind', () => {
      const id = pne.add('p1', 'top');
      expect(pne.getKind(id)).toBe('top');
    });

    it('should get hits', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      expect(pne.getHits(id)).toBe(1);
    });

    it('should check top', () => {
      pne.add('p1', 'top');
      expect(pne.isTop(pne.getAllPins()[0].id)).toBe(true);
    });

    it('should check sticky', () => {
      pne.add('p1', 'sticky');
      expect(pne.isSticky(pne.getAllPins()[0].id)).toBe(true);
    });

    it('should check highlight', () => {
      pne.add('p1', 'highlight');
      expect(pne.isHighlight(pne.getAllPins()[0].id)).toBe(true);
    });

    it('should check announcement', () => {
      pne.add('p1', 'announcement');
      expect(pne.isAnnouncement(pne.getAllPins()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = pne.add('p1', 'top');
      expect(pne.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = pne.add('p1', 'top');
      expect(pne.setName(id, 'p2')).toBe(true);
    });

    it('should set kind', () => {
      const id = pne.add('p1', 'top');
      expect(pne.setKind(id, 'sticky')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pne.setActive('unknown', false)).toBe(false);
      expect(pne.setName('unknown', 'p')).toBe(false);
      expect(pne.setKind('unknown', 'top')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      pne.setActive(id, false);
      pne.resetAll();
      expect(pne.getPinned(id)).toBe(0);
      expect(pne.isActive(id)).toBe(true);
    });
  });

  describe('by kind / state', () => {
    it('should get by kind', () => {
      pne.add('p1', 'top');
      expect(pne.getByKind('top')).toHaveLength(1);
    });

    it('should get active', () => {
      pne.add('p1', 'top');
      expect(pne.getActivePins()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = pne.add('p1', 'top');
      pne.setActive(id, false);
      expect(pne.getInactivePins()).toHaveLength(1);
    });

    it('should get all names', () => {
      pne.add('a', 'top');
      pne.add('b', 'top');
      expect(pne.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      pne.add('p1', 'top');
      expect(pne.getNewest()?.name).toBe('p1');
    });

    it('should return null for empty newest', () => {
      expect(pne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pne.add('p1', 'top');
      expect(pne.getOldest()?.name).toBe('p1');
    });

    it('should return null for empty oldest', () => {
      expect(pne.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = pne.add('p1', 'top');
      expect(pne.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      expect(pne.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      pne.add('p1', 'top');
      expect(pne.getTotalAdded()).toBe(1);
    });

    it('should get total pinned', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      expect(pne.getTotalPinned()).toBe(1);
    });

    it('should get total unpinned', () => {
      const id = pne.add('p1', 'top');
      pne.pin(id);
      pne.unpin(id);
      expect(pne.getTotalUnpinned()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many pins', () => {
      for (let i = 0; i < 50; i++) {
        pne.add(`p${i}`, 'top');
      }
      expect(pne.getCount()).toBe(50);
    });
  });
});