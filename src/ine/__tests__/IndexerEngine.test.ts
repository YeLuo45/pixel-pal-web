/**
 * IndexerEngine Tests
 * claude-code-design Indexer Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexerEngine } from '../IndexerEngine';

describe('IndexerEngine', () => {
  let ine: IndexerEngine;

  beforeEach(() => {
    ine = new IndexerEngine();
  });

  afterEach(() => {
    ine.clearAll();
  });

  // ============================================================
  // index / search / searchByDocument / remove / increment
  // ============================================================
  describe('index / search / searchByDocument / remove / increment', () => {
    it('should index', () => {
      expect(ine.index('term1', 'doc1', 0)).toBe('ine-1');
    });

    it('should mark as active', () => {
      const id = ine.index('term1', 'doc1', 0);
      expect(ine.isActive(id)).toBe(true);
    });

    it('should default position to 0', () => {
      const id = ine.index('term1', 'doc1');
      expect(ine.getPosition(id)).toBe(0);
    });

    it('should search', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.search('term1')).toHaveLength(1);
    });

    it('should return empty for missing term', () => {
      expect(ine.search('missing')).toHaveLength(0);
    });

    it('should search by document', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.searchByDocument('doc1')).toHaveLength(1);
    });

    it('should return empty for missing document', () => {
      expect(ine.searchByDocument('missing')).toHaveLength(0);
    });

    it('should remove', () => {
      const id = ine.index('term1', 'doc1', 0);
      expect(ine.remove(id)).toBe(true);
    });

    it('should increment', () => {
      const id = ine.index('term1', 'doc1', 0);
      expect(ine.increment(id)).toBe(true);
    });

    it('should increment frequency', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.increment(id);
      expect(ine.getFrequency(id)).toBe(2);
    });

    it('should not increment unknown', () => {
      expect(ine.increment('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ine.index('term1', 'doc1', 0);
      const stats = ine.getStats();
      expect(stats.entries).toBe(1);
    });

    it('should count total searches', () => {
      ine.index('term1', 'doc1', 0);
      ine.search('term1');
      expect(ine.getStats().totalSearches).toBe(1);
    });

    it('should count active', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.setActive(id, false);
      expect(ine.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.increment(id);
      expect(ine.getStats().totalHits).toBe(1);
    });

    it('should count unique terms', () => {
      ine.index('term1', 'doc1', 0);
      ine.index('term2', 'doc1', 0);
      expect(ine.getStats().uniqueTerms).toBe(2);
    });

    it('should count unique documents', () => {
      ine.index('term1', 'doc1', 0);
      ine.index('term1', 'doc2', 0);
      expect(ine.getStats().uniqueDocuments).toBe(2);
    });

    it('should compute avg frequency', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getStats().avgFrequency).toBe(1);
    });

    it('should get max frequency', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.increment(id);
      ine.increment(id);
      expect(ine.getStats().maxFrequency).toBe(3);
    });

    it('should get min frequency', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getStats().minFrequency).toBe(1);
    });

    it('should compute avg position', () => {
      ine.index('term1', 'doc1', 5);
      expect(ine.getStats().avgPosition).toBe(5);
    });

    it('should get max position', () => {
      ine.index('term1', 'doc1', 3);
      ine.index('term2', 'doc1', 10);
      expect(ine.getStats().maxPosition).toBe(10);
    });

    it('should get min position', () => {
      ine.index('term1', 'doc1', 3);
      ine.index('term2', 'doc1', 10);
      expect(ine.getStats().minPosition).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getEntry('ine-1')?.term).toBe('term1');
    });

    it('should get all', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getAllEntries()).toHaveLength(1);
    });

    it('should check existence', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.hasEntry('ine-1')).toBe(true);
    });

    it('should count', () => {
      expect(ine.getCount()).toBe(0);
      ine.index('term1', 'doc1', 0);
      expect(ine.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get term', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getTerm('ine-1')).toBe('term1');
    });

    it('should get document id', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getDocumentId('ine-1')).toBe('doc1');
    });

    it('should get position', () => {
      ine.index('term1', 'doc1', 5);
      expect(ine.getPosition('ine-1')).toBe(5);
    });

    it('should get frequency', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getFrequency('ine-1')).toBe(1);
    });

    it('should get hits', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.increment(id);
      expect(ine.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.setActive('ine-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ine.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.increment(id);
      ine.setActive(id, false);
      ine.resetAll();
      expect(ine.getFrequency(id)).toBe(1);
      expect(ine.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by term / document / state
  // ============================================================
  describe('by term / document / state', () => {
    it('should get by term', () => {
      ine.index('term1', 'doc1', 0);
      ine.index('term1', 'doc2', 0);
      expect(ine.getByTerm('term1')).toHaveLength(2);
    });

    it('should get by document all', () => {
      ine.index('term1', 'doc1', 0);
      ine.index('term2', 'doc1', 0);
      expect(ine.getByDocumentAll('doc1')).toHaveLength(2);
    });

    it('should get active', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getActiveEntries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ine.index('term1', 'doc1', 0);
      ine.setActive('ine-1', false);
      expect(ine.getInactiveEntries()).toHaveLength(1);
    });

    it('should get all terms', () => {
      ine.index('term1', 'doc1', 0);
      ine.index('term2', 'doc1', 0);
      expect(ine.getAllTerms()).toHaveLength(2);
    });

    it('should get term count', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getTermCount()).toBe(1);
    });

    it('should get all documents', () => {
      ine.index('term1', 'doc1', 0);
      ine.index('term1', 'doc2', 0);
      expect(ine.getAllDocuments()).toHaveLength(2);
    });

    it('should get document count', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getDocumentCount()).toBe(1);
    });

    it('should get by min frequency', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.increment(id);
      expect(ine.getByMinFrequency(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most frequent', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.increment(id);
      ine.increment(id);
      expect(ine.getMostFrequent()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ine.getMostFrequent()).toBeNull();
    });

    it('should get newest', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getNewest()?.id).toBe('ine-1');
    });

    it('should return null for empty newest', () => {
      expect(ine.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getOldest()?.id).toBe('ine-1');
    });

    it('should return null for empty oldest', () => {
      expect(ine.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ine.index('term1', 'doc1', 0);
      expect(ine.getCreatedAt('ine-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ine.index('term1', 'doc1', 0);
      ine.increment(id);
      expect(ine.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total searches', () => {
      ine.index('term1', 'doc1', 0);
      ine.search('term1');
      expect(ine.getTotalSearches()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        ine.index(`term${i}`, `doc${i}`, i);
      }
      expect(ine.getCount()).toBe(50);
    });
  });
});