/**
 * FormatterEngine Tests
 * claude-code-design Formatter Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormatterEngine } from '../FormatterEngine';

describe('FormatterEngine', () => {
  let fme: FormatterEngine;

  beforeEach(() => {
    fme = new FormatterEngine();
  });

  afterEach(() => {
    fme.clearAll();
  });

  // ============================================================
  // define / format / reset
  // ============================================================
  describe('define / format / reset', () => {
    it('should define', () => {
      expect(fme.define('f1', 'json')).toBe('fme-1');
    });

    it('should mark as active', () => {
      const id = fme.define('f1', 'json');
      expect(fme.isActive(id)).toBe(true);
    });

    it('should mark as json by default', () => {
      const id = fme.define('f1');
      expect(fme.isJson(id)).toBe(true);
    });

    it('should mark as xml', () => {
      const id = fme.define('f1', 'xml');
      expect(fme.isXml(id)).toBe(true);
    });

    it('should mark as yaml', () => {
      const id = fme.define('f1', 'yaml');
      expect(fme.isYaml(id)).toBe(true);
    });

    it('should mark as csv', () => {
      const id = fme.define('f1', 'csv');
      expect(fme.isCsv(id)).toBe(true);
    });

    it('should format json', () => {
      const id = fme.define('f1', 'json');
      expect(fme.format(id, 'hello')).toBe('{"value":"hello"}');
    });

    it('should format xml', () => {
      const id = fme.define('f1', 'xml');
      expect(fme.format(id, 'hello')).toBe('<value>hello</value>');
    });

    it('should format yaml', () => {
      const id = fme.define('f1', 'yaml');
      expect(fme.format(id, 'hello')).toBe('value: hello');
    });

    it('should format csv', () => {
      const id = fme.define('f1', 'csv');
      expect(fme.format(id, 'hello')).toBe('value\nhello');
    });

    it('should return null for unknown', () => {
      expect(fme.format('unknown', 'input')).toBeNull();
    });

    it('should return null for inactive', () => {
      const id = fme.define('f1', 'json');
      fme.setActive(id, false);
      expect(fme.format(id, 'hello')).toBeNull();
    });

    it('should set input on format', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getInput(id)).toBe('hello');
    });

    it('should set output on format', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getOutput(id)).toBe('{"value":"hello"}');
    });

    it('should increment applications on format', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getApplications(id)).toBe(1);
    });

    it('should log history on format', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getHistory(id)).toHaveLength(1);
    });

    it('should reset', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      fme.reset(id);
      expect(fme.getApplications(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(fme.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      fme.define('f1', 'json');
      const stats = fme.getStats();
      expect(stats.formatters).toBe(1);
    });

    it('should count total applications', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getStats().totalApplications).toBe(1);
    });

    it('should count active', () => {
      fme.define('f1', 'json');
      expect(fme.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = fme.define('f1', 'json');
      fme.setActive(id, false);
      expect(fme.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      fme.define('f1', 'json');
      fme.define('f2', 'json');
      expect(fme.getStats().uniqueNames).toBe(2);
    });

    it('should count unique formats', () => {
      fme.define('f1', 'json');
      fme.define('f2', 'xml');
      expect(fme.getStats().uniqueFormats).toBe(2);
    });

    it('should count json', () => {
      fme.define('f1', 'json');
      expect(fme.getStats().json).toBe(1);
    });

    it('should count xml', () => {
      fme.define('f1', 'xml');
      expect(fme.getStats().xml).toBe(1);
    });

    it('should count yaml', () => {
      fme.define('f1', 'yaml');
      expect(fme.getStats().yaml).toBe(1);
    });

    it('should count csv', () => {
      fme.define('f1', 'csv');
      expect(fme.getStats().csv).toBe(1);
    });

    it('should compute avg applications', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getStats().avgApplications).toBe(1);
    });

    it('should get max applications', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'a');
      fme.format(id, 'b');
      expect(fme.getStats().maxApplications).toBe(2);
    });

    it('should get min applications', () => {
      fme.define('f1', 'json');
      expect(fme.getStats().minApplications).toBe(0);
    });

    it('should compute avg input length', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getStats().avgInputLength).toBe(5);
    });

    it('should compute avg output length', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getStats().avgOutputLength).toBe(17);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get formatter', () => {
      fme.define('f1', 'json');
      expect(fme.getFormatter('fme-1')?.name).toBe('f1');
    });

    it('should get all', () => {
      fme.define('f1', 'json');
      expect(fme.getAllFormatters()).toHaveLength(1);
    });

    it('should remove', () => {
      fme.define('f1', 'json');
      expect(fme.removeFormatter('fme-1')).toBe(true);
    });

    it('should check existence', () => {
      fme.define('f1', 'json');
      expect(fme.hasFormatter('fme-1')).toBe(true);
    });

    it('should count', () => {
      expect(fme.getCount()).toBe(0);
      fme.define('f1', 'json');
      expect(fme.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      fme.define('f1', 'json');
      expect(fme.getName('fme-1')).toBe('f1');
    });

    it('should get format', () => {
      fme.define('f1', 'json');
      expect(fme.getFormat('fme-1')).toBe('json');
    });

    it('should get history', () => {
      fme.define('f1', 'json');
      expect(fme.getHistory('fme-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      fme.define('f1', 'json');
      expect(fme.setActive('fme-1', false)).toBe(true);
    });

    it('should set name', () => {
      fme.define('f1', 'json');
      expect(fme.setName('fme-1', 'f2')).toBe(true);
    });

    it('should set format', () => {
      fme.define('f1', 'json');
      expect(fme.setFormat('fme-1', 'xml')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(fme.setActive('unknown', false)).toBe(false);
      expect(fme.setName('unknown', 'f')).toBe(false);
      expect(fme.setFormat('unknown', 'json')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      fme.setActive(id, false);
      fme.resetAll();
      expect(fme.getApplications(id)).toBe(0);
      expect(fme.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / format / state
  // ============================================================
  describe('by name / format / state', () => {
    it('should get by name', () => {
      fme.define('f1', 'json');
      expect(fme.getByName('f1')).toHaveLength(1);
    });

    it('should get by format', () => {
      fme.define('f1', 'json');
      expect(fme.getByFormat('json')).toHaveLength(1);
    });

    it('should get json', () => {
      fme.define('f1', 'json');
      expect(fme.getJsonFormatters()).toHaveLength(1);
    });

    it('should get xml', () => {
      fme.define('f1', 'xml');
      expect(fme.getXmlFormatters()).toHaveLength(1);
    });

    it('should get yaml', () => {
      fme.define('f1', 'yaml');
      expect(fme.getYamlFormatters()).toHaveLength(1);
    });

    it('should get csv', () => {
      fme.define('f1', 'csv');
      expect(fme.getCsvFormatters()).toHaveLength(1);
    });

    it('should get active', () => {
      fme.define('f1', 'json');
      expect(fme.getActiveFormatters()).toHaveLength(1);
    });

    it('should get inactive', () => {
      fme.define('f1', 'json');
      fme.setActive('fme-1', false);
      expect(fme.getInactiveFormatters()).toHaveLength(1);
    });

    it('should get all names', () => {
      fme.define('f1', 'json');
      fme.define('f2', 'json');
      expect(fme.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      fme.define('f1', 'json');
      expect(fme.getNameCount()).toBe(1);
    });

    it('should get by min applications', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getByMinApplications(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most applications', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'a');
      fme.format(id, 'b');
      expect(fme.getMostApplications()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(fme.getMostApplications()).toBeNull();
    });

    it('should get newest', () => {
      fme.define('f1', 'json');
      expect(fme.getNewest()?.id).toBe('fme-1');
    });

    it('should return null for empty newest', () => {
      expect(fme.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      fme.define('f1', 'json');
      expect(fme.getOldest()?.id).toBe('fme-1');
    });

    it('should return null for empty oldest', () => {
      expect(fme.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      fme.define('f1', 'json');
      expect(fme.getCreatedAt('fme-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total applications', () => {
      const id = fme.define('f1', 'json');
      fme.format(id, 'hello');
      expect(fme.getTotalApplications()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many formatters', () => {
      for (let i = 0; i < 50; i++) {
        fme.define(`f${i}`, 'json');
      }
      expect(fme.getCount()).toBe(50);
    });
  });
});