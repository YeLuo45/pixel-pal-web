/**
 * LabelEngine Tests
 * chatdev-design Label Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LabelEngine } from '../LabelEngine';

describe('LabelEngine', () => {
  let lbe: LabelEngine;

  beforeEach(() => {
    lbe = new LabelEngine();
  });

  afterEach(() => {
    lbe.clearAll();
  });

  describe('add / tag / untag / remove', () => {
    it('should add', () => {
      expect(lbe.add('l1', 'red')).toMatch(/^lbe-/);
    });

    it('should default tagged to 0', () => {
      lbe.add('l1', 'red');
      expect(lbe.getTagged(lbe.getAllLabels()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      lbe.add('l1', 'red');
      expect(lbe.isActive(lbe.getAllLabels()[0].id)).toBe(true);
    });

    it('should tag', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.tag(id)).toBe(true);
    });

    it('should increment tagged', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      expect(lbe.getTagged(id)).toBe(1);
    });

    it('should not tag inactive', () => {
      const id = lbe.add('l1', 'red');
      lbe.setActive(id, false);
      expect(lbe.tag(id)).toBe(false);
    });

    it('should return false for unknown tag', () => {
      expect(lbe.tag('unknown')).toBe(false);
    });

    it('should untag', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      expect(lbe.untag(id)).toBe(true);
    });

    it('should decrement tagged', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      lbe.untag(id);
      expect(lbe.getTagged(id)).toBe(0);
    });

    it('should not untag below 0', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.untag(id)).toBe(false);
    });

    it('should return false for unknown untag', () => {
      expect(lbe.untag('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      lbe.add('l1', 'red');
      expect(lbe.getStats().labels).toBe(1);
    });

    it('should count total added', () => {
      lbe.add('l1', 'red');
      expect(lbe.getStats().totalAdded).toBe(1);
    });

    it('should count total tagged', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      expect(lbe.getStats().totalTagged).toBe(1);
    });

    it('should count total untagged', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      lbe.untag(id);
      expect(lbe.getStats().totalUntagged).toBe(1);
    });

    it('should count red', () => {
      lbe.add('l1', 'red');
      expect(lbe.getStats().red).toBe(1);
    });

    it('should count blue', () => {
      lbe.add('l1', 'blue');
      expect(lbe.getStats().blue).toBe(1);
    });

    it('should count green', () => {
      lbe.add('l1', 'green');
      expect(lbe.getStats().green).toBe(1);
    });

    it('should count yellow', () => {
      lbe.add('l1', 'yellow');
      expect(lbe.getStats().yellow).toBe(1);
    });

    it('should count purple', () => {
      lbe.add('l1', 'purple');
      expect(lbe.getStats().purple).toBe(1);
    });

    it('should count orange', () => {
      lbe.add('l1', 'orange');
      expect(lbe.getStats().orange).toBe(1);
    });

    it('should count active', () => {
      lbe.add('l1', 'red');
      expect(lbe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = lbe.add('l1', 'red');
      lbe.setActive(id, false);
      expect(lbe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      expect(lbe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      lbe.add('a', 'red');
      lbe.add('a', 'red');
      expect(lbe.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get label', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.getLabel(id)?.name).toBe('l1');
    });

    it('should get all', () => {
      lbe.add('l1', 'red');
      expect(lbe.getAllLabels()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.hasLabel(id)).toBe(true);
    });

    it('should count', () => {
      expect(lbe.getCount()).toBe(0);
      lbe.add('l1', 'red');
      expect(lbe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.getName(id)).toBe('l1');
    });

    it('should get color', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.getColor(id)).toBe('red');
    });

    it('should get hits', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      expect(lbe.getHits(id)).toBe(1);
    });

    it('should check red', () => {
      lbe.add('l1', 'red');
      expect(lbe.isRed(lbe.getAllLabels()[0].id)).toBe(true);
    });

    it('should check blue', () => {
      lbe.add('l1', 'blue');
      expect(lbe.isBlue(lbe.getAllLabels()[0].id)).toBe(true);
    });

    it('should check green', () => {
      lbe.add('l1', 'green');
      expect(lbe.isGreen(lbe.getAllLabels()[0].id)).toBe(true);
    });

    it('should check yellow', () => {
      lbe.add('l1', 'yellow');
      expect(lbe.isYellow(lbe.getAllLabels()[0].id)).toBe(true);
    });

    it('should check purple', () => {
      lbe.add('l1', 'purple');
      expect(lbe.isPurple(lbe.getAllLabels()[0].id)).toBe(true);
    });

    it('should check orange', () => {
      lbe.add('l1', 'orange');
      expect(lbe.isOrange(lbe.getAllLabels()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.setName(id, 'l2')).toBe(true);
    });

    it('should set color', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.setColor(id, 'blue')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(lbe.setActive('unknown', false)).toBe(false);
      expect(lbe.setName('unknown', 'l')).toBe(false);
      expect(lbe.setColor('unknown', 'red')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      lbe.setActive(id, false);
      lbe.resetAll();
      expect(lbe.getTagged(id)).toBe(0);
      expect(lbe.isActive(id)).toBe(true);
    });
  });

  describe('by color / state', () => {
    it('should get by color', () => {
      lbe.add('l1', 'red');
      expect(lbe.getByColor('red')).toHaveLength(1);
    });

    it('should get active', () => {
      lbe.add('l1', 'red');
      expect(lbe.getActiveLabels()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = lbe.add('l1', 'red');
      lbe.setActive(id, false);
      expect(lbe.getInactiveLabels()).toHaveLength(1);
    });

    it('should get all names', () => {
      lbe.add('a', 'red');
      lbe.add('b', 'red');
      expect(lbe.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      lbe.add('l1', 'red');
      expect(lbe.getNewest()?.name).toBe('l1');
    });

    it('should return null for empty newest', () => {
      expect(lbe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      lbe.add('l1', 'red');
      expect(lbe.getOldest()?.name).toBe('l1');
    });

    it('should return null for empty oldest', () => {
      expect(lbe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = lbe.add('l1', 'red');
      expect(lbe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      expect(lbe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      lbe.add('l1', 'red');
      expect(lbe.getTotalAdded()).toBe(1);
    });

    it('should get total tagged', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      expect(lbe.getTotalTagged()).toBe(1);
    });

    it('should get total untagged', () => {
      const id = lbe.add('l1', 'red');
      lbe.tag(id);
      lbe.untag(id);
      expect(lbe.getTotalUntagged()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many labels', () => {
      for (let i = 0; i < 50; i++) {
        lbe.add(`l${i}`, 'red');
      }
      expect(lbe.getCount()).toBe(50);
    });
  });
});