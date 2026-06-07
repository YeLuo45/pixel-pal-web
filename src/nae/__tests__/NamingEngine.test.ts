/**
 * NamingEngine Tests
 * chatdev-design Naming Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NamingEngine } from '../NamingEngine';

describe('NamingEngine', () => {
  let nae: NamingEngine;

  beforeEach(() => {
    nae = new NamingEngine();
  });

  afterEach(() => {
    nae.clearAll();
  });

  describe('generate / allocate / free / remove', () => {
    it('should generate', () => {
      expect(nae.generate('HelloWorld')).toMatch(/^nae-/);
    });

    it('should default style to camel', () => {
      nae.generate('HelloWorld');
      expect(nae.getStyle(nae.getAllNames()[0].id)).toBe('camel');
    });

    it('should format camel', () => {
      const id = nae.generate('HelloWorld', 'camel');
      expect(nae.getWord(id)).toBe('helloWorld');
    });

    it('should format snake', () => {
      const id = nae.generate('HelloWorld', 'snake');
      expect(nae.getWord(id)).toBe('helloworld');
    });

    it('should format kebab', () => {
      const id = nae.generate('HelloWorld', 'kebab');
      expect(nae.getWord(id)).toBe('helloworld');
    });

    it('should format pascal', () => {
      const id = nae.generate('helloWorld', 'pascal');
      expect(nae.getWord(id)).toBe('HelloWorld');
    });

    it('should mark as active', () => {
      nae.generate('HelloWorld');
      expect(nae.isActive(nae.getAllNames()[0].id)).toBe(true);
    });

    it('should default not allocated', () => {
      nae.generate('HelloWorld');
      expect(nae.isAllocated(nae.getAllNames()[0].id)).toBe(false);
    });

    it('should allocate', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.allocate(id)).toBe(true);
    });

    it('should mark as allocated', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.isAllocated(id)).toBe(true);
    });

    it('should not allocate twice', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.allocate(id)).toBe(false);
    });

    it('should not allocate inactive', () => {
      const id = nae.generate('HelloWorld');
      nae.setActive(id, false);
      expect(nae.allocate(id)).toBe(false);
    });

    it('should return false for unknown allocate', () => {
      expect(nae.allocate('unknown')).toBe(false);
    });

    it('should free', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.free(id)).toBe(true);
    });

    it('should not free unallocated', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.free(id)).toBe(false);
    });

    it('should return false for unknown free', () => {
      expect(nae.free('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      nae.generate('HelloWorld');
      expect(nae.getStats().names).toBe(1);
    });

    it('should count total generated', () => {
      nae.generate('HelloWorld');
      expect(nae.getStats().totalGenerated).toBe(1);
    });

    it('should count total allocated', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.getStats().totalAllocated).toBe(1);
    });

    it('should count total freed', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      nae.free(id);
      expect(nae.getStats().totalFreed).toBe(1);
    });

    it('should count camel', () => {
      nae.generate('HelloWorld', 'camel');
      expect(nae.getStats().camel).toBe(1);
    });

    it('should count snake', () => {
      nae.generate('HelloWorld', 'snake');
      expect(nae.getStats().snake).toBe(1);
    });

    it('should count kebab', () => {
      nae.generate('HelloWorld', 'kebab');
      expect(nae.getStats().kebab).toBe(1);
    });

    it('should count pascal', () => {
      nae.generate('HelloWorld', 'pascal');
      expect(nae.getStats().pascal).toBe(1);
    });

    it('should count active', () => {
      nae.generate('HelloWorld');
      expect(nae.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = nae.generate('HelloWorld');
      nae.setActive(id, false);
      expect(nae.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.getStats().totalHits).toBe(1);
    });

    it('should count unique words', () => {
      nae.generate('HelloWorld');
      nae.generate('HelloWorld');
      expect(nae.getStats().uniqueWords).toBe(1);
    });

    it('should count total word len', () => {
      nae.generate('hi', 'camel');
      expect(nae.getStats().totalWordLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get name', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.getName2(id)?.style).toBe('camel');
    });

    it('should get all', () => {
      nae.generate('HelloWorld');
      expect(nae.getAllNames()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.hasName(id)).toBe(true);
    });

    it('should count', () => {
      expect(nae.getCount()).toBe(0);
      nae.generate('HelloWorld');
      expect(nae.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get word', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.getWord(id)).toBe('helloWorld');
    });

    it('should get hits', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.getHits(id)).toBe(1);
    });

    it('should check camel', () => {
      nae.generate('HelloWorld', 'camel');
      expect(nae.isCamel(nae.getAllNames()[0].id)).toBe(true);
    });

    it('should check snake', () => {
      nae.generate('HelloWorld', 'snake');
      expect(nae.isSnake(nae.getAllNames()[0].id)).toBe(true);
    });

    it('should check kebab', () => {
      nae.generate('HelloWorld', 'kebab');
      expect(nae.isKebab(nae.getAllNames()[0].id)).toBe(true);
    });

    it('should check pascal', () => {
      nae.generate('HelloWorld', 'pascal');
      expect(nae.isPascal(nae.getAllNames()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.setActive(id, false)).toBe(true);
    });

    it('should set word', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.setWord(id, 'newName')).toBe(true);
    });

    it('should set style', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.setStyle(id, 'snake')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(nae.setActive('unknown', false)).toBe(false);
      expect(nae.setWord('unknown', 'w')).toBe(false);
      expect(nae.setStyle('unknown', 'camel')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      nae.setActive(id, false);
      nae.resetAll();
      expect(nae.isAllocated(id)).toBe(false);
      expect(nae.isActive(id)).toBe(true);
    });
  });

  describe('by style / state', () => {
    it('should get by style', () => {
      nae.generate('HelloWorld', 'snake');
      expect(nae.getByStyle('snake')).toHaveLength(1);
    });

    it('should get allocated', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.getAllocatedNames()).toHaveLength(1);
    });

    it('should get free', () => {
      nae.generate('HelloWorld');
      expect(nae.getFreeNames()).toHaveLength(1);
    });

    it('should get active', () => {
      nae.generate('HelloWorld');
      expect(nae.getActiveNames()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = nae.generate('HelloWorld');
      nae.setActive(id, false);
      expect(nae.getInactiveNames()).toHaveLength(1);
    });

    it('should get all words', () => {
      nae.generate('HelloWorld', 'camel');
      nae.generate('HelloWorld', 'snake');
      expect(nae.getAllWords()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      nae.generate('HelloWorld');
      expect(nae.getNewest()?.style).toBe('camel');
    });

    it('should return null for empty newest', () => {
      expect(nae.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      nae.generate('HelloWorld');
      expect(nae.getOldest()?.style).toBe('camel');
    });

    it('should return null for empty oldest', () => {
      expect(nae.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = nae.generate('HelloWorld');
      expect(nae.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total generated', () => {
      nae.generate('HelloWorld');
      expect(nae.getTotalGenerated()).toBe(1);
    });

    it('should get total allocated', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      expect(nae.getTotalAllocated()).toBe(1);
    });

    it('should get total freed', () => {
      const id = nae.generate('HelloWorld');
      nae.allocate(id);
      nae.free(id);
      expect(nae.getTotalFreed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many names', () => {
      for (let i = 0; i < 50; i++) {
        nae.generate(`name${i}`);
      }
      expect(nae.getCount()).toBe(50);
    });
  });
});