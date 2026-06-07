/**
 * SplitterEngine Tests
 * claude-code-design Splitter Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SplitterEngine } from '../SplitterEngine';

describe('SplitterEngine', () => {
  let sle: SplitterEngine;

  beforeEach(() => {
    sle = new SplitterEngine();
  });

  afterEach(() => {
    sle.clearAll();
  });

  describe('split / merge / remove', () => {
    it('should split', () => {
      expect(sle.split('hello world')).toMatch(/^sle-/);
    });

    it('should default mode to word', () => {
      sle.split('hello world');
      expect(sle.getMode(sle.getAllSplits()[0].id)).toBe('word');
    });

    it('should mark as active', () => {
      sle.split('hello world');
      expect(sle.isActive(sle.getAllSplits()[0].id)).toBe(true);
    });

    it('should count chunks for word', () => {
      const id = sle.split('hello world there');
      expect(sle.getChunks(id)).toBe(3);
    });

    it('should count chunks for char', () => {
      const id = sle.split('hi', 'char');
      expect(sle.getChunks(id)).toBe(2);
    });

    it('should count chunks for line', () => {
      const id = sle.split('a\nb\nc', 'line');
      expect(sle.getChunks(id)).toBe(3);
    });

    it('should count chunks for sentence', () => {
      const id = sle.split('Hello. World!', 'sentence');
      expect(sle.getChunks(id)).toBe(2);
    });

    it('should merge', () => {
      const id = sle.split('hello world');
      expect(sle.merge(id)).toBe(true);
    });

    it('should not merge inactive', () => {
      const id = sle.split('hello world');
      sle.setActive(id, false);
      expect(sle.merge(id)).toBe(false);
    });

    it('should return false for unknown merge', () => {
      expect(sle.merge('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = sle.split('hello world');
      expect(sle.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sle.split('hello world');
      expect(sle.getStats().splits).toBe(1);
    });

    it('should count total split', () => {
      sle.split('hello world');
      expect(sle.getStats().totalSplit).toBe(1);
    });

    it('should count total merged', () => {
      const id = sle.split('hello world');
      sle.merge(id);
      expect(sle.getStats().totalMerged).toBe(1);
    });

    it('should count char', () => {
      sle.split('hi', 'char');
      expect(sle.getStats().char).toBe(1);
    });

    it('should count word', () => {
      sle.split('hi', 'word');
      expect(sle.getStats().word).toBe(1);
    });

    it('should count line', () => {
      sle.split('hi', 'line');
      expect(sle.getStats().line).toBe(1);
    });

    it('should count sentence', () => {
      sle.split('hi', 'sentence');
      expect(sle.getStats().sentence).toBe(1);
    });

    it('should count active', () => {
      sle.split('hello world');
      expect(sle.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sle.split('hello world');
      sle.setActive(id, false);
      expect(sle.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sle.split('hello world');
      sle.merge(id);
      expect(sle.getStats().totalHits).toBe(1);
    });

    it('should count unique texts', () => {
      sle.split('a');
      sle.split('a');
      expect(sle.getStats().uniqueTexts).toBe(1);
    });

    it('should count total chunks', () => {
      sle.split('hi there');
      expect(sle.getStats().totalChunks).toBe(2);
    });

    it('should count total text len', () => {
      sle.split('hi');
      expect(sle.getStats().totalTextLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get split', () => {
      const id = sle.split('hello world');
      expect(sle.getSplit(id)?.mode).toBe('word');
    });

    it('should get all', () => {
      sle.split('hello world');
      expect(sle.getAllSplits()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = sle.split('hello world');
      expect(sle.hasSplit(id)).toBe(true);
    });

    it('should count', () => {
      expect(sle.getCount()).toBe(0);
      sle.split('hello world');
      expect(sle.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get text', () => {
      const id = sle.split('hello world');
      expect(sle.getText(id)).toBe('hello world');
    });

    it('should get hits', () => {
      const id = sle.split('hello world');
      sle.merge(id);
      expect(sle.getHits(id)).toBe(1);
    });

    it('should check char', () => {
      sle.split('hi', 'char');
      expect(sle.isChar(sle.getAllSplits()[0].id)).toBe(true);
    });

    it('should check word', () => {
      sle.split('hi', 'word');
      expect(sle.isWord(sle.getAllSplits()[0].id)).toBe(true);
    });

    it('should check line', () => {
      sle.split('hi', 'line');
      expect(sle.isLine(sle.getAllSplits()[0].id)).toBe(true);
    });

    it('should check sentence', () => {
      sle.split('hi', 'sentence');
      expect(sle.isSentence(sle.getAllSplits()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = sle.split('hello world');
      expect(sle.setActive(id, false)).toBe(true);
    });

    it('should set text', () => {
      const id = sle.split('hello world');
      expect(sle.setText(id, 'new text')).toBe(true);
    });

    it('should set mode', () => {
      const id = sle.split('hello world');
      expect(sle.setMode(id, 'char')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sle.setActive('unknown', false)).toBe(false);
      expect(sle.setText('unknown', 't')).toBe(false);
      expect(sle.setMode('unknown', 'word')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = sle.split('hello world');
      sle.setActive(id, false);
      sle.resetAll();
      expect(sle.isActive(id)).toBe(true);
    });
  });

  describe('by mode / state', () => {
    it('should get by mode', () => {
      sle.split('hi', 'char');
      expect(sle.getByMode('char')).toHaveLength(1);
    });

    it('should get active', () => {
      sle.split('hello world');
      expect(sle.getActiveSplits()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sle.split('hello world');
      sle.setActive(id, false);
      expect(sle.getInactiveSplits()).toHaveLength(1);
    });

    it('should get all texts', () => {
      sle.split('a');
      sle.split('b');
      expect(sle.getAllTexts()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sle.split('hello world');
      expect(sle.getNewest()?.mode).toBe('word');
    });

    it('should return null for empty newest', () => {
      expect(sle.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sle.split('hello world');
      expect(sle.getOldest()?.mode).toBe('word');
    });

    it('should return null for empty oldest', () => {
      expect(sle.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = sle.split('hello world');
      expect(sle.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sle.split('hello world');
      sle.merge(id);
      expect(sle.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total split', () => {
      sle.split('hello world');
      expect(sle.getTotalSplit()).toBe(1);
    });

    it('should get total merged', () => {
      const id = sle.split('hello world');
      sle.merge(id);
      expect(sle.getTotalMerged()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many splits', () => {
      for (let i = 0; i < 50; i++) {
        sle.split(`text ${i}`);
      }
      expect(sle.getCount()).toBe(50);
    });
  });
});