/**
 * NormalizerEngine Tests
 * claude-code-design Normalizer Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NormalizerEngine } from '../NormalizerEngine';

describe('NormalizerEngine', () => {
  let nre: NormalizerEngine;

  beforeEach(() => {
    nre = new NormalizerEngine();
  });

  afterEach(() => {
    nre.clearAll();
  });

  describe('add / normalize / remove', () => {
    it('should add', () => {
      expect(nre.add('HELLO', 'lowercase')).toMatch(/^nre-/);
    });

    it('should lowercase', () => {
      nre.add('HELLO', 'lowercase');
      expect(nre.getOutput(nre.getAllNormalizes()[0].id)).toBe('hello');
    });

    it('should uppercase', () => {
      nre.add('hello', 'uppercase');
      expect(nre.getOutput(nre.getAllNormalizes()[0].id)).toBe('HELLO');
    });

    it('should trim', () => {
      nre.add('  hello  ', 'trim');
      expect(nre.getOutput(nre.getAllNormalizes()[0].id)).toBe('hello');
    });

    it('should collapse', () => {
      nre.add('hello   world', 'collapse');
      expect(nre.getOutput(nre.getAllNormalizes()[0].id)).toBe('hello world');
    });

    it('should strip', () => {
      nre.add('hello!@#world', 'strip');
      expect(nre.getOutput(nre.getAllNormalizes()[0].id)).toBe('helloworld');
    });

    it('should reverse', () => {
      nre.add('hello', 'reverse');
      expect(nre.getOutput(nre.getAllNormalizes()[0].id)).toBe('olleh');
    });

    it('should mark as active', () => {
      nre.add('hi', 'lowercase');
      expect(nre.isActive(nre.getAllNormalizes()[0].id)).toBe(true);
    });

    it('should normalize', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.normalize(id, 'WORLD')).toBe(true);
    });

    it('should not normalize inactive', () => {
      const id = nre.add('hi', 'lowercase');
      nre.setActive(id, false);
      expect(nre.normalize(id, 'WORLD')).toBe(false);
    });

    it('should return false for unknown normalize', () => {
      expect(nre.normalize('unknown', 'hi')).toBe(false);
    });

    it('should remove', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getStats().normalizes).toBe(1);
    });

    it('should count total added', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getStats().totalAdded).toBe(1);
    });

    it('should count total normalized', () => {
      const id = nre.add('hi', 'lowercase');
      nre.normalize(id, 'WORLD');
      expect(nre.getStats().totalNormalized).toBe(1);
    });

    it('should count lowercase', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getStats().lowercase).toBe(1);
    });

    it('should count uppercase', () => {
      nre.add('hi', 'uppercase');
      expect(nre.getStats().uppercase).toBe(1);
    });

    it('should count trim', () => {
      nre.add('hi', 'trim');
      expect(nre.getStats().trim).toBe(1);
    });

    it('should count collapse', () => {
      nre.add('hi', 'collapse');
      expect(nre.getStats().collapse).toBe(1);
    });

    it('should count strip', () => {
      nre.add('hi', 'strip');
      expect(nre.getStats().strip).toBe(1);
    });

    it('should count reverse', () => {
      nre.add('hi', 'reverse');
      expect(nre.getStats().reverse).toBe(1);
    });

    it('should count active', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = nre.add('hi', 'lowercase');
      nre.setActive(id, false);
      expect(nre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = nre.add('hi', 'lowercase');
      nre.normalize(id, 'WORLD');
      expect(nre.getStats().totalHits).toBe(1);
    });

    it('should count total input len', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getStats().totalInputLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get normalize', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.getNormalize(id)?.op).toBe('lowercase');
    });

    it('should get all', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getAllNormalizes()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.hasNormalize(id)).toBe(true);
    });

    it('should count', () => {
      expect(nre.getCount()).toBe(0);
      nre.add('hi', 'lowercase');
      expect(nre.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get input', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.getInput(id)).toBe('hi');
    });

    it('should get output', () => {
      const id = nre.add('HI', 'lowercase');
      expect(nre.getOutput(id)).toBe('hi');
    });

    it('should get hits', () => {
      const id = nre.add('hi', 'lowercase');
      nre.normalize(id, 'WORLD');
      expect(nre.getHits(id)).toBe(1);
    });

    it('should check lowercase', () => {
      nre.add('hi', 'lowercase');
      expect(nre.isLowercase(nre.getAllNormalizes()[0].id)).toBe(true);
    });

    it('should check uppercase', () => {
      nre.add('hi', 'uppercase');
      expect(nre.isUppercase(nre.getAllNormalizes()[0].id)).toBe(true);
    });

    it('should check trim', () => {
      nre.add('hi', 'trim');
      expect(nre.isTrim(nre.getAllNormalizes()[0].id)).toBe(true);
    });

    it('should check collapse', () => {
      nre.add('hi', 'collapse');
      expect(nre.isCollapse(nre.getAllNormalizes()[0].id)).toBe(true);
    });

    it('should check strip', () => {
      nre.add('hi', 'strip');
      expect(nre.isStrip(nre.getAllNormalizes()[0].id)).toBe(true);
    });

    it('should check reverse', () => {
      nre.add('hi', 'reverse');
      expect(nre.isReverse(nre.getAllNormalizes()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.setActive(id, false)).toBe(true);
    });

    it('should set input', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.setInput(id, 'HI')).toBe(true);
    });

    it('should set op', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.setOp(id, 'uppercase')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(nre.setActive('unknown', false)).toBe(false);
      expect(nre.setInput('unknown', 'hi')).toBe(false);
      expect(nre.setOp('unknown', 'lowercase')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = nre.add('hi', 'lowercase');
      nre.setActive(id, false);
      nre.resetAll();
      expect(nre.isActive(id)).toBe(true);
    });
  });

  describe('by op / state', () => {
    it('should get by op', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getByOp('lowercase')).toHaveLength(1);
    });

    it('should get active', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getActiveNormalizes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = nre.add('hi', 'lowercase');
      nre.setActive(id, false);
      expect(nre.getInactiveNormalizes()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getNewest()?.op).toBe('lowercase');
    });

    it('should return null for empty newest', () => {
      expect(nre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getOldest()?.op).toBe('lowercase');
    });

    it('should return null for empty oldest', () => {
      expect(nre.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = nre.add('hi', 'lowercase');
      expect(nre.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = nre.add('hi', 'lowercase');
      nre.normalize(id, 'WORLD');
      expect(nre.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      nre.add('hi', 'lowercase');
      expect(nre.getTotalAdded()).toBe(1);
    });

    it('should get total normalized', () => {
      const id = nre.add('hi', 'lowercase');
      nre.normalize(id, 'WORLD');
      expect(nre.getTotalNormalized()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many normalizes', () => {
      for (let i = 0; i < 50; i++) {
        nre.add(`hi${i}`, 'lowercase');
      }
      expect(nre.getCount()).toBe(50);
    });
  });
});