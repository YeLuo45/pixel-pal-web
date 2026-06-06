/**
 * EmbeddingEngine Tests
 * chatdev-design Embedding Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmbeddingEngine } from '../EmbeddingEngine';

describe('EmbeddingEngine', () => {
  let ee: EmbeddingEngine;

  beforeEach(() => {
    ee = new EmbeddingEngine();
  });

  afterEach(() => {
    ee.clearAll();
  });

  // ============================================================
  // store / search / remove / reset
  // ============================================================
  describe('store / search / remove / reset', () => {
    it('should store', () => {
      expect(ee.store('text1', [1, 0, 0], 'src1')).toBe('ee2-1');
    });

    it('should mark as active', () => {
      const id = ee.store('text1', [1, 0, 0], 'src1');
      expect(ee.isActive(id)).toBe(true);
    });

    it('should default source', () => {
      const id = ee.store('text1', [1, 0, 0]);
      expect(ee.getSource(id)).toBe('default');
    });

    it('should set dimension', () => {
      const id = ee.store('text1', [1, 0, 0], 'src1');
      expect(ee.getDimension(id)).toBe(3);
    });

    it('should search', () => {
      ee.store('a', [1, 0, 0], 'src1');
      ee.store('b', [0, 1, 0], 'src1');
      const results = ee.search([1, 0, 0]);
      expect(results).toHaveLength(2);
    });

    it('should return closest first', () => {
      ee.store('far', [0, 1, 0], 'src1');
      const id = ee.store('near', [1, 0, 0], 'src1');
      const results = ee.search([1, 0, 0]);
      expect(results[0]).toBe(id);
    });

    it('should respect limit', () => {
      ee.store('a', [1, 0, 0], 'src1');
      ee.store('b', [0, 1, 0], 'src1');
      ee.store('c', [0, 0, 1], 'src1');
      const results = ee.search([1, 0, 0], 1);
      expect(results).toHaveLength(1);
    });

    it('should not search inactive', () => {
      const id = ee.store('a', [1, 0, 0], 'src1');
      ee.setActive(id, false);
      const results = ee.search([1, 0, 0]);
      expect(results).toHaveLength(0);
    });

    it('should return empty for empty search', () => {
      expect(ee.search([1, 0, 0])).toEqual([]);
    });

    it('should remove', () => {
      const id = ee.store('text1', [1, 0, 0], 'src1');
      expect(ee.remove(id)).toBe(true);
    });

    it('should remove from map on remove', () => {
      const id = ee.store('text1', [1, 0, 0], 'src1');
      ee.remove(id);
      expect(ee.hasEmbedding(id)).toBe(false);
    });

    it('should reset', () => {
      const id = ee.store('text1', [1, 0, 0], 'src1');
      ee.search([1, 0, 0]);
      expect(ee.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = ee.store('text1', [1, 0, 0], 'src1');
      ee.search([1, 0, 0]);
      ee.reset(id);
      expect(ee.getHits(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(ee.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ee.store('text1', [1, 0, 0], 'src1');
      const stats = ee.getStats();
      expect(stats.embeddings).toBe(1);
    });

    it('should count total dimension', () => {
      ee.store('a', [1, 0, 0], 's');
      ee.store('b', [1, 0, 0, 0], 's');
      expect(ee.getStats().totalDimension).toBe(7);
    });

    it('should count sources', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.store('b', [1, 0, 0], 's2');
      expect(ee.getStats().sources).toBe(2);
    });

    it('should count active', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ee.store('a', [1, 0, 0], 's1');
      ee.setActive(id, false);
      expect(ee.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ee.store('a', [1, 0, 0], 's1');
      ee.search([1, 0, 0]);
      expect(ee.getStats().totalHits).toBe(0);
    });

    it('should count unique sources', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.store('b', [1, 0, 0], 's2');
      expect(ee.getStats().uniqueSources).toBe(2);
    });

    it('should count unique texts', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.store('a', [0, 1, 0], 's1');
      expect(ee.getStats().uniqueTexts).toBe(1);
    });

    it('should compute avg dimension', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getStats().avgDimension).toBe(3);
    });

    it('should get max dimension', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.store('b', [1, 0, 0, 0], 's1');
      expect(ee.getStats().maxDimension).toBe(4);
    });

    it('should get min dimension', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.store('b', [1, 0, 0, 0], 's1');
      expect(ee.getStats().minDimension).toBe(3);
    });

    it('should count total searches', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.search([1, 0, 0]);
      expect(ee.getStats().totalSearches).toBe(1);
    });

    it('should compute avg vector length', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getStats().avgVectorLength).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get embedding', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getEmbedding('ee2-1')?.text).toBe('a');
    });

    it('should get all', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getAllEmbeddings()).toHaveLength(1);
    });

    it('should check existence', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.hasEmbedding('ee2-1')).toBe(true);
    });

    it('should count', () => {
      expect(ee.getCount()).toBe(0);
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get text', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getText('ee2-1')).toBe('a');
    });

    it('should get vector', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getVector('ee2-1')).toEqual([1, 0, 0]);
    });

    it('should get dimension', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getDimension('ee2-1')).toBe(3);
    });

    it('should get source', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getSource('ee2-1')).toBe('s1');
    });

    it('should get history', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getHistory('ee2-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = ee.store('a', [1, 0, 0], 's1');
      ee.reset(id);
      ee.search([1, 0, 0]);
      expect(ee.getHits(id)).toBe(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.setActive('ee2-1', false)).toBe(true);
    });

    it('should set text', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.setText('ee2-1', 'b')).toBe(true);
    });

    it('should set source', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.setSource('ee2-1', 's2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ee.setActive('unknown', false)).toBe(false);
      expect(ee.setText('unknown', 't')).toBe(false);
      expect(ee.setSource('unknown', 's')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ee.store('a', [1, 0, 0], 's1');
      ee.setActive(id, false);
      ee.resetAll();
      expect(ee.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by text / source / state
  // ============================================================
  describe('by text / source / state', () => {
    it('should get by text', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getByText('a')).toHaveLength(1);
    });

    it('should get by source', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getBySource('s1')).toHaveLength(1);
    });

    it('should get active', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getActiveEmbeddings()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.setActive('ee2-1', false);
      expect(ee.getInactiveEmbeddings()).toHaveLength(1);
    });

    it('should get all sources', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.store('b', [1, 0, 0], 's2');
      expect(ee.getAllSources()).toHaveLength(2);
    });

    it('should get source count', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getSourceCount()).toBe(1);
    });

    it('should get all texts', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.store('b', [1, 0, 0], 's1');
      expect(ee.getAllTexts()).toHaveLength(2);
    });

    it('should get text count', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getTextCount()).toBe(1);
    });

    it('should get by min dimension', () => {
      ee.store('a', [1, 0, 0, 0], 's1');
      expect(ee.getByMinDimension(4)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getNewest()?.id).toBe('ee2-1');
    });

    it('should return null for empty newest', () => {
      expect(ee.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getOldest()?.id).toBe('ee2-1');
    });

    it('should return null for empty oldest', () => {
      expect(ee.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ee.store('a', [1, 0, 0], 's1');
      expect(ee.getCreatedAt('ee2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ee.store('a', [1, 0, 0], 's1');
      ee.setActive(id, false);
      expect(ee.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total searches', () => {
      ee.store('a', [1, 0, 0], 's1');
      ee.search([1, 0, 0]);
      expect(ee.getTotalSearches()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many embeddings', () => {
      for (let i = 0; i < 50; i++) {
        ee.store(`t${i}`, [i, 0, 0], 's1');
      }
      expect(ee.getCount()).toBe(50);
    });
  });
});