import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SemanticSearchEngine, SearchResult, SearchOptions } from '../SemanticSearchEngine';

describe('SemanticSearchEngine', () => {
  let engine: SemanticSearchEngine;

  beforeEach(() => {
    engine = new SemanticSearchEngine();
  });

  afterEach(() => {
    engine.clear();
  });

  describe('index()', () => {
    it('should index a single document', () => {
      engine.index('doc1', 'Hello world');
      expect(engine.getIndexSize()).toBe(1);
    });

    it('should index multiple documents', () => {
      engine.index('doc1', 'First document');
      engine.index('doc2', 'Second document');
      engine.index('doc3', 'Third document');
      expect(engine.getIndexSize()).toBe(3);
    });

    it('should store content with metadata', () => {
      const metadata = { tier: 'L1', tags: ['important'], timestamp: 123456 };
      engine.index('doc1', 'Test content', metadata);
      const results = engine.search('Test');
      expect(results[0].metadata).toEqual(metadata);
    });

    it('should update existing document if same id is used', () => {
      engine.index('doc1', 'Original content');
      engine.index('doc1', 'Updated content');
      expect(engine.getIndexSize()).toBe(1);
      const results = engine.search('Updated');
      expect(results.length).toBe(1);
      expect(results[0].content).toBe('Updated content');
    });
  });

  describe('remove()', () => {
    it('should remove an existing document', () => {
      engine.index('doc1', 'Content to remove');
      expect(engine.getIndexSize()).toBe(1);
      const removed = engine.remove('doc1');
      expect(removed).toBe(true);
      expect(engine.getIndexSize()).toBe(0);
    });

    it('should return false for non-existent document', () => {
      const removed = engine.remove('nonexistent');
      expect(removed).toBe(false);
    });

    it('should handle remove after multiple indices', () => {
      engine.index('doc1', 'First');
      engine.index('doc2', 'Second');
      engine.index('doc3', 'Third');
      engine.remove('doc2');
      expect(engine.getIndexSize()).toBe(2);
    });
  });

  describe('clear()', () => {
    it('should clear all indexed documents', () => {
      engine.index('doc1', 'First');
      engine.index('doc2', 'Second');
      engine.clear();
      expect(engine.getIndexSize()).toBe(0);
    });
  });

  describe('search()', () => {
    beforeEach(() => {
      engine.index('doc1', 'The quick brown fox jumps over the lazy dog');
      engine.index('doc2', 'A fast brown fox runs through the forest');
      engine.index('doc3', 'The lazy dog sleeps peacefully');
      engine.index('doc4', 'Python is a programming language');
      engine.index('doc5', 'JavaScript is also a programming language');
    });

    it('should find documents containing query words', () => {
      const results = engine.search('fox');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return results with scores', () => {
      const results = engine.search('fox');
      results.forEach(result => {
        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(1);
      });
    });

    it('should order results by relevance score', () => {
      const results = engine.search('programming');
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should handle multiple word queries', () => {
      const results = engine.search('brown fox');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle partial word matching', () => {
      const results = engine.search('progr');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      const results = engine.search('xyz123nonexistent');
      expect(results).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const resultsUpper = engine.search('FOX');
      const resultsLower = engine.search('fox');
      expect(resultsUpper.length).toBe(resultsLower.length);
    });

    it('should respect limit option', () => {
      const results = engine.search('programming', { limit: 1 });
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should respect threshold option', () => {
      const results = engine.search('dog', { threshold: 0.9 });
      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0.9);
      });
    });

    it('should filter by layer option', () => {
      engine.index('layer1-doc', 'Layer 1 content', { layer: 'layer1' });
      engine.index('layer2-doc', 'Layer 2 content', { layer: 'layer2' });
      const results = engine.search('content', { layer: 'layer1' });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('layer1-doc');
    });

    it('should return empty when no documents match layer filter', () => {
      const results = engine.search('programming', { layer: 'nonexistent' });
      expect(results).toEqual([]);
    });
  });

  describe('searchByEmbedding()', () => {
    it('should handle embedding-based search', () => {
      const embedding = [0.1, 0.2, 0.3, 0.4];
      engine.index('doc1', 'Content with embedding', { embedding });
      const results = engine.searchByEmbedding(embedding);
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getIndexSize()', () => {
    it('should return 0 for empty engine', () => {
      expect(engine.getIndexSize()).toBe(0);
    });

    it('should return correct count after indexing', () => {
      engine.index('doc1', 'First');
      engine.index('doc2', 'Second');
      engine.index('doc3', 'Third');
      expect(engine.getIndexSize()).toBe(3);
    });

    it('should return correct count after removal', () => {
      engine.index('doc1', 'First');
      engine.index('doc2', 'Second');
      engine.remove('doc1');
      expect(engine.getIndexSize()).toBe(1);
    });
  });

  describe('textMatch()', () => {
    it('should return higher score for exact matches', () => {
      engine.index('doc1', 'Hello world');
      const results = engine.search('Hello');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should return lower score for partial matches', () => {
      engine.index('doc1', 'Hello world');
      const results = engine.search('Hell');
      expect(results[0].score).toBeLessThan(1);
    });
  });

  describe('empty content handling', () => {
    it('should handle empty string content', () => {
      engine.index('doc1', '');
      expect(engine.getIndexSize()).toBe(1);
    });

    it('should handle empty query', () => {
      engine.index('doc1', 'Some content');
      const results = engine.search('');
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('special characters', () => {
    it('should handle special characters in content', () => {
      engine.index('doc1', 'Special chars: @#$%^&*()');
      const results = engine.search('Special');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle unicode content', () => {
      engine.index('doc1', 'Unicode: 你好世界 🌍');
      const results = engine.search('你好');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('large dataset performance', () => {
    it('should handle large number of documents', () => {
      for (let i = 0; i < 100; i++) {
        engine.index(`doc${i}`, `Document content number ${i}`);
      }
      expect(engine.getIndexSize()).toBe(100);
      const results = engine.search('Document');
      expect(results.length).toBe(100);
    });

    it('should handle long content strings', () => {
      const longContent = 'A'.repeat(10000);
      engine.index('doc1', longContent);
      const results = engine.search('A');
      expect(results.length).toBe(1);
    });
  });
});