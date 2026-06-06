/**
 * FormatterEngine Tests
 * claude-code-design Formatter Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormatterEngine } from '../FormatterEngine';

describe('FormatterEngine', () => {
  let fte: FormatterEngine;

  beforeEach(() => {
    fte = new FormatterEngine();
  });

  afterEach(() => {
    fte.clearAll();
  });

  // ============================================================
  // format / reFormat / remove
  // ============================================================
  describe('format / reFormat / remove', () => {
    it('should format upper', () => {
      expect(fte.format('f1', 'upper', 'hello')).toBe('HELLO');
    });

    it('should format lower', () => {
      expect(fte.format('f1', 'lower', 'HELLO')).toBe('hello');
    });

    it('should format title', () => {
      expect(fte.format('f1', 'title', 'hello world')).toBe('Hello World');
    });

    it('should format camel', () => {
      expect(fte.format('f1', 'camel', 'hello world')).toBe('helloWorld');
    });

    it('should format snake', () => {
      expect(fte.format('f1', 'snake', 'Hello World')).toBe('hello_world');
    });

    it('should format kebab', () => {
      expect(fte.format('f1', 'kebab', 'Hello World')).toBe('hello-world');
    });

    it('should mark as active', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.isActive(fte.getAllFormatters()[0].id)).toBe(true);
    });

    it('should reFormat', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.reFormat(fte.getAllFormatters()[0].id)).toBe('HI');
    });

    it('should return null for unknown reFormat', () => {
      expect(fte.reFormat('unknown')).toBeNull();
    });

    it('should remove', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.remove(fte.getAllFormatters()[0].id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      fte.format('f1', 'upper', 'hi');
      const stats = fte.getStats();
      expect(stats.formatters).toBe(1);
    });

    it('should count total formatted', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getStats().totalFormatted).toBe(1);
    });

    it('should count active', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      fte.format('f1', 'upper', 'hi');
      fte.setActive(fte.getAllFormatters()[0].id, false);
      expect(fte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      fte.format('f1', 'upper', 'hi');
      fte.reFormat(fte.getAllFormatters()[0].id);
      expect(fte.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      fte.format('a', 'upper', 'x');
      fte.format('a', 'upper', 'y');
      expect(fte.getStats().uniqueNames).toBe(1);
    });

    it('should count upper', () => {
      fte.format('f1', 'upper', 'x');
      expect(fte.getStats().upper).toBe(1);
    });

    it('should count lower', () => {
      fte.format('f1', 'lower', 'X');
      expect(fte.getStats().lower).toBe(1);
    });

    it('should count title', () => {
      fte.format('f1', 'title', 'x');
      expect(fte.getStats().title).toBe(1);
    });

    it('should count camel', () => {
      fte.format('f1', 'camel', 'x');
      expect(fte.getStats().camel).toBe(1);
    });

    it('should count snake', () => {
      fte.format('f1', 'snake', 'x');
      expect(fte.getStats().snake).toBe(1);
    });

    it('should count kebab', () => {
      fte.format('f1', 'kebab', 'x');
      expect(fte.getStats().kebab).toBe(1);
    });

    it('should count total input length', () => {
      fte.format('f1', 'upper', 'hi');
      fte.format('f2', 'upper', 'hello');
      expect(fte.getStats().totalInputLength).toBe(7);
    });

    it('should count total output length', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getStats().totalOutputLength).toBe(2);
    });

    it('should compute avg input length', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getStats().avgInputLength).toBe(2);
    });

    it('should compute avg output length', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getStats().avgOutputLength).toBe(2);
    });

    it('should get max input length', () => {
      fte.format('f1', 'upper', 'hi');
      fte.format('f2', 'upper', 'hello');
      expect(fte.getStats().maxInputLength).toBe(5);
    });

    it('should get max output length', () => {
      fte.format('f1', 'upper', 'hi');
      fte.format('f2', 'upper', 'hello');
      expect(fte.getStats().maxOutputLength).toBe(5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get formatter', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getFormatter(fte.getAllFormatters()[0].id)?.name).toBe('f1');
    });

    it('should get all', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getAllFormatters()).toHaveLength(1);
    });

    it('should check existence', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.hasFormatter(fte.getAllFormatters()[0].id)).toBe(true);
    });

    it('should count', () => {
      expect(fte.getCount()).toBe(0);
      fte.format('f1', 'upper', 'hi');
      expect(fte.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getName(fte.getAllFormatters()[0].id)).toBe('f1');
    });

    it('should get type', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getType(fte.getAllFormatters()[0].id)).toBe('upper');
    });

    it('should get input', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getInput(fte.getAllFormatters()[0].id)).toBe('hi');
    });

    it('should get output', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getOutput(fte.getAllFormatters()[0].id)).toBe('HI');
    });

    it('should get input length', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getInputLength(fte.getAllFormatters()[0].id)).toBe(2);
    });

    it('should get output length', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.getOutputLength(fte.getAllFormatters()[0].id)).toBe(2);
    });

    it('should get hits', () => {
      fte.format('f1', 'upper', 'hi');
      fte.reFormat(fte.getAllFormatters()[0].id);
      expect(fte.getHits(fte.getAllFormatters()[0].id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.setActive(fte.getAllFormatters()[0].id, false)).toBe(true);
    });

    it('should set input', () => {
      fte.format('f1', 'upper', 'hi');
      expect(fte.setInput(fte.getAllFormatters()[0].id, 'bye')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(fte.setActive('unknown', false)).toBe(false);
      expect(fte.setInput('unknown', 'x')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      fte.format('f1', 'upper', 'hi');
      fte.reFormat(fte.getAllFormatters()[0].id);
      fte.setActive(fte.getAllFormatters()[0].id, false);
      fte.resetAll();
      expect(fte.isActive(fte.getAllFormatters()[0].id)).toBe(true);
    });
  });

  // ============================================================
  // by type / state
  // ============================================================
  describe('by type / state', () => {
    it('should get by type', () => {
      fte.format('f1', 'upper', 'x');
      expect(fte.getByType('upper')).toHaveLength(1);
    });

    it('should get active', () => {
      fte.format('f1', 'upper', 'x');
      expect(fte.getActiveFormatters()).toHaveLength(1);
    });

    it('should get inactive', () => {
      fte.format('f1', 'upper', 'x');
      fte.setActive(fte.getAllFormatters()[0].id, false);
      expect(fte.getInactiveFormatters()).toHaveLength(1);
    });

    it('should get all names', () => {
      fte.format('a', 'upper', 'x');
      fte.format('b', 'upper', 'x');
      expect(fte.getAllNames()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      fte.format('f1', 'upper', 'x');
      expect(fte.getNewest()?.id).toBe(fte.getAllFormatters()[0].id);
    });

    it('should return null for empty newest', () => {
      expect(fte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      fte.format('f1', 'upper', 'x');
      expect(fte.getOldest()?.id).toBe(fte.getAllFormatters()[0].id);
    });

    it('should return null for empty oldest', () => {
      expect(fte.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      fte.format('f1', 'upper', 'x');
      expect(fte.getCreatedAt(fte.getAllFormatters()[0].id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      fte.format('f1', 'upper', 'x');
      fte.reFormat(fte.getAllFormatters()[0].id);
      expect(fte.getUpdatedAt(fte.getAllFormatters()[0].id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total formatted', () => {
      fte.format('f1', 'upper', 'x');
      expect(fte.getTotalFormatted()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many formatters', () => {
      for (let i = 0; i < 50; i++) {
        fte.format(`f${i}`, 'upper', `s${i}`);
      }
      expect(fte.getCount()).toBe(50);
    });
  });
});