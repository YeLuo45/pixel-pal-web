/**
 * AnchorEngine Tests
 * claude-code-design Anchor Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AnchorEngine } from '../AnchorEngine';

describe('AnchorEngine', () => {
  let ane: AnchorEngine;

  beforeEach(() => {
    ane = new AnchorEngine();
  });

  afterEach(() => {
    ane.clearAll();
  });

  describe('add / link / unlink / remove', () => {
    it('should add', () => {
      expect(ane.add('a1', '#sec1', 'h1')).toMatch(/^ane-/);
    });

    it('should default linked to 0', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getLinked(ane.getAllAnchors()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.isActive(ane.getAllAnchors()[0].id)).toBe(true);
    });

    it('should link', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.link(id)).toBe(true);
    });

    it('should increment linked', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      expect(ane.getLinked(id)).toBe(1);
    });

    it('should not link inactive', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.setActive(id, false);
      expect(ane.link(id)).toBe(false);
    });

    it('should return false for unknown link', () => {
      expect(ane.link('unknown')).toBe(false);
    });

    it('should unlink', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      expect(ane.unlink(id)).toBe(true);
    });

    it('should decrement linked', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      ane.unlink(id);
      expect(ane.getLinked(id)).toBe(0);
    });

    it('should not unlink below 0', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.unlink(id)).toBe(false);
    });

    it('should return false for unknown unlink', () => {
      expect(ane.unlink('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getStats().anchors).toBe(1);
    });

    it('should count total added', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getStats().totalAdded).toBe(1);
    });

    it('should count total linked', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      expect(ane.getStats().totalLinked).toBe(1);
    });

    it('should count total unlinked', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      ane.unlink(id);
      expect(ane.getStats().totalUnlinked).toBe(1);
    });

    it('should count h1', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getStats().h1).toBe(1);
    });

    it('should count h2', () => {
      ane.add('a1', '#sec1', 'h2');
      expect(ane.getStats().h2).toBe(1);
    });

    it('should count h3', () => {
      ane.add('a1', '#sec1', 'h3');
      expect(ane.getStats().h3).toBe(1);
    });

    it('should count span', () => {
      ane.add('a1', '#sec1', 'span');
      expect(ane.getStats().span).toBe(1);
    });

    it('should count div', () => {
      ane.add('a1', '#sec1', 'div');
      expect(ane.getStats().div).toBe(1);
    });

    it('should count section', () => {
      ane.add('a1', '#sec1', 'section');
      expect(ane.getStats().section).toBe(1);
    });

    it('should count active', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.setActive(id, false);
      expect(ane.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      expect(ane.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ane.add('a', '#1', 'h1');
      ane.add('a', '#2', 'h1');
      expect(ane.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get anchor', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.getAnchor(id)?.name).toBe('a1');
    });

    it('should get all', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getAllAnchors()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.hasAnchor(id)).toBe(true);
    });

    it('should count', () => {
      expect(ane.getCount()).toBe(0);
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.getName(id)).toBe('a1');
    });

    it('should get href', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.getHref(id)).toBe('#sec1');
    });

    it('should get kind', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.getKind(id)).toBe('h1');
    });

    it('should get hits', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      expect(ane.getHits(id)).toBe(1);
    });

    it('should check h1', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.isH1(ane.getAllAnchors()[0].id)).toBe(true);
    });

    it('should check h2', () => {
      ane.add('a1', '#sec1', 'h2');
      expect(ane.isH2(ane.getAllAnchors()[0].id)).toBe(true);
    });

    it('should check h3', () => {
      ane.add('a1', '#sec1', 'h3');
      expect(ane.isH3(ane.getAllAnchors()[0].id)).toBe(true);
    });

    it('should check span', () => {
      ane.add('a1', '#sec1', 'span');
      expect(ane.isSpan(ane.getAllAnchors()[0].id)).toBe(true);
    });

    it('should check div', () => {
      ane.add('a1', '#sec1', 'div');
      expect(ane.isDiv(ane.getAllAnchors()[0].id)).toBe(true);
    });

    it('should check section', () => {
      ane.add('a1', '#sec1', 'section');
      expect(ane.isSection(ane.getAllAnchors()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.setName(id, 'a2')).toBe(true);
    });

    it('should set href', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.setHref(id, '#sec2')).toBe(true);
    });

    it('should set kind', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.setKind(id, 'h2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ane.setActive('unknown', false)).toBe(false);
      expect(ane.setName('unknown', 'a')).toBe(false);
      expect(ane.setHref('unknown', '#')).toBe(false);
      expect(ane.setKind('unknown', 'h1')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      ane.setActive(id, false);
      ane.resetAll();
      expect(ane.getLinked(id)).toBe(0);
      expect(ane.isActive(id)).toBe(true);
    });
  });

  describe('by kind / state', () => {
    it('should get by kind', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getByKind('h1')).toHaveLength(1);
    });

    it('should get active', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getActiveAnchors()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.setActive(id, false);
      expect(ane.getInactiveAnchors()).toHaveLength(1);
    });

    it('should get all names', () => {
      ane.add('a', '#1', 'h1');
      ane.add('b', '#2', 'h1');
      expect(ane.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getNewest()?.name).toBe('a1');
    });

    it('should return null for empty newest', () => {
      expect(ane.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getOldest()?.name).toBe('a1');
    });

    it('should return null for empty oldest', () => {
      expect(ane.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      expect(ane.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      expect(ane.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      ane.add('a1', '#sec1', 'h1');
      expect(ane.getTotalAdded()).toBe(1);
    });

    it('should get total linked', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      expect(ane.getTotalLinked()).toBe(1);
    });

    it('should get total unlinked', () => {
      const id = ane.add('a1', '#sec1', 'h1');
      ane.link(id);
      ane.unlink(id);
      expect(ane.getTotalUnlinked()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many anchors', () => {
      for (let i = 0; i < 50; i++) {
        ane.add(`a${i}`, `#sec${i}`, 'h1');
      }
      expect(ane.getCount()).toBe(50);
    });
  });
});