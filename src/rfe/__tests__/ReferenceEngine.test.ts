/**
 * ReferenceEngine Tests
 * claude-code-design Reference Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReferenceEngine } from '../ReferenceEngine';

describe('ReferenceEngine', () => {
  let rfe: ReferenceEngine;

  beforeEach(() => {
    rfe = new ReferenceEngine();
  });

  afterEach(() => {
    rfe.clearAll();
  });

  describe('add / cite / remove', () => {
    it('should add', () => {
      expect(rfe.add('Title', 'Author', 'book', 2024)).toMatch(/^rfe-/);
    });

    it('should mark as active', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.isActive(rfe.getAllReferences()[0].id)).toBe(true);
    });

    it('should cite', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.cite(id)).toBe(true);
    });

    it('should increment cited', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.cite(id);
      expect(rfe.getCited(id)).toBe(1);
    });

    it('should not cite inactive', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.setActive(id, false);
      expect(rfe.cite(id)).toBe(false);
    });

    it('should return false for unknown cite', () => {
      expect(rfe.cite('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getStats().references).toBe(1);
    });

    it('should count total added', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getStats().totalAdded).toBe(1);
    });

    it('should count total cited', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.cite(id);
      expect(rfe.getStats().totalCited).toBe(1);
    });

    it('should count book', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getStats().book).toBe(1);
    });

    it('should count paper', () => {
      rfe.add('Title', 'Author', 'paper', 2024);
      expect(rfe.getStats().paper).toBe(1);
    });

    it('should count article', () => {
      rfe.add('Title', 'Author', 'article', 2024);
      expect(rfe.getStats().article).toBe(1);
    });

    it('should count web', () => {
      rfe.add('Title', 'Author', 'web', 2024);
      expect(rfe.getStats().web).toBe(1);
    });

    it('should count doc', () => {
      rfe.add('Title', 'Author', 'doc', 2024);
      expect(rfe.getStats().doc).toBe(1);
    });

    it('should count note', () => {
      rfe.add('Title', 'Author', 'note', 2024);
      expect(rfe.getStats().note).toBe(1);
    });

    it('should count active', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.setActive(id, false);
      expect(rfe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.cite(id);
      expect(rfe.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      rfe.add('a', 'Author', 'book', 2024);
      rfe.add('a', 'Author', 'book', 2024);
      expect(rfe.getStats().uniqueTitles).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get reference', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getReference(id)?.title).toBe('Title');
    });

    it('should get all', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getAllReferences()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.hasReference(id)).toBe(true);
    });

    it('should count', () => {
      expect(rfe.getCount()).toBe(0);
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get title', () => {
      const id = rfe.add('hello', 'Author', 'book', 2024);
      expect(rfe.getTitle(id)).toBe('hello');
    });

    it('should get author', () => {
      const id = rfe.add('Title', 'Alice', 'book', 2024);
      expect(rfe.getAuthor(id)).toBe('Alice');
    });

    it('should get year', () => {
      const id = rfe.add('Title', 'Author', 'book', 2020);
      expect(rfe.getYear(id)).toBe(2020);
    });

    it('should get hits', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.cite(id);
      expect(rfe.getHits(id)).toBe(1);
    });

    it('should check book', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.isBook(rfe.getAllReferences()[0].id)).toBe(true);
    });

    it('should check paper', () => {
      rfe.add('Title', 'Author', 'paper', 2024);
      expect(rfe.isPaper(rfe.getAllReferences()[0].id)).toBe(true);
    });

    it('should check article', () => {
      rfe.add('Title', 'Author', 'article', 2024);
      expect(rfe.isArticle(rfe.getAllReferences()[0].id)).toBe(true);
    });

    it('should check web', () => {
      rfe.add('Title', 'Author', 'web', 2024);
      expect(rfe.isWeb(rfe.getAllReferences()[0].id)).toBe(true);
    });

    it('should check doc', () => {
      rfe.add('Title', 'Author', 'doc', 2024);
      expect(rfe.isDoc(rfe.getAllReferences()[0].id)).toBe(true);
    });

    it('should check note', () => {
      rfe.add('Title', 'Author', 'note', 2024);
      expect(rfe.isNote(rfe.getAllReferences()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.setActive(id, false)).toBe(true);
    });

    it('should set title', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.setTitle(id, 'NewTitle')).toBe(true);
    });

    it('should set author', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.setAuthor(id, 'NewAuthor')).toBe(true);
    });

    it('should set kind', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.setKind(id, 'paper')).toBe(true);
    });

    it('should set year', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.setYear(id, 2025)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rfe.setActive('unknown', false)).toBe(false);
      expect(rfe.setTitle('unknown', 't')).toBe(false);
      expect(rfe.setAuthor('unknown', 'a')).toBe(false);
      expect(rfe.setKind('unknown', 'book')).toBe(false);
      expect(rfe.setYear('unknown', 2024)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.cite(id);
      rfe.setActive(id, false);
      rfe.resetAll();
      expect(rfe.getCited(id)).toBe(0);
      expect(rfe.isActive(id)).toBe(true);
    });
  });

  describe('by kind / state', () => {
    it('should get by kind', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getByKind('book')).toHaveLength(1);
    });

    it('should get active', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getActiveReferences()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.setActive(id, false);
      expect(rfe.getInactiveReferences()).toHaveLength(1);
    });

    it('should get all titles', () => {
      rfe.add('a', 'Author', 'book', 2024);
      rfe.add('b', 'Author', 'book', 2024);
      expect(rfe.getAllTitles()).toHaveLength(2);
    });

    it('should get all authors', () => {
      rfe.add('Title', 'a', 'book', 2024);
      rfe.add('Title', 'b', 'book', 2024);
      expect(rfe.getAllAuthors()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getNewest()?.title).toBe('Title');
    });

    it('should return null for empty newest', () => {
      expect(rfe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getOldest()?.title).toBe('Title');
    });

    it('should return null for empty oldest', () => {
      expect(rfe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.cite(id);
      expect(rfe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      rfe.add('Title', 'Author', 'book', 2024);
      expect(rfe.getTotalAdded()).toBe(1);
    });

    it('should get total cited', () => {
      const id = rfe.add('Title', 'Author', 'book', 2024);
      rfe.cite(id);
      expect(rfe.getTotalCited()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many references', () => {
      for (let i = 0; i < 50; i++) {
        rfe.add(`Title${i}`, 'Author', 'book', 2024);
      }
      expect(rfe.getCount()).toBe(50);
    });
  });
});