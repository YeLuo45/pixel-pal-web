/**
 * PreviewEngine Tests
 * claude-code-design Preview Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PreviewEngine } from '../PreviewEngine';

describe('PreviewEngine', () => {
  let pve: PreviewEngine;

  beforeEach(() => {
    pve = new PreviewEngine();
  });

  afterEach(() => {
    pve.clearAll();
  });

  describe('create / render / remove', () => {
    it('should create', () => {
      expect(pve.create('p1', 'content', 'text')).toMatch(/^pve-/);
    });

    it('should default rendered to false', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.isRendered(pve.getAllPreviews()[0].id)).toBe(false);
    });

    it('should mark as active', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.isActive(pve.getAllPreviews()[0].id)).toBe(true);
    });

    it('should render', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.render(id)).toBe('content');
    });

    it('should set rendered', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      expect(pve.isRendered(id)).toBe(true);
    });

    it('should render html', () => {
      const id = pve.create('p1', '<b>hi</b>', 'html');
      expect(pve.render(id)).toBe('<b>hi</b>');
    });

    it('should render json', () => {
      const id = pve.create('p1', '{"a":1}', 'json');
      expect(pve.render(id)).toBe('{\n  "a": 1\n}');
    });

    it('should not render inactive', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.setActive(id, false);
      expect(pve.render(id)).toBeNull();
    });

    it('should return null for unknown render', () => {
      expect(pve.render('unknown')).toBeNull();
    });

    it('should remove', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getStats().previews).toBe(1);
    });

    it('should count total added', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getStats().totalAdded).toBe(1);
    });

    it('should count total rendered', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      expect(pve.getStats().totalRendered).toBe(1);
    });

    it('should count text', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getStats().text).toBe(1);
    });

    it('should count markdown', () => {
      pve.create('p1', '# hi', 'markdown');
      expect(pve.getStats().markdown).toBe(1);
    });

    it('should count html', () => {
      pve.create('p1', '<b>', 'html');
      expect(pve.getStats().html).toBe(1);
    });

    it('should count json', () => {
      pve.create('p1', '{}', 'json');
      expect(pve.getStats().json).toBe(1);
    });

    it('should count active', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.setActive(id, false);
      expect(pve.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      expect(pve.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      pve.create('a', 'content', 'text');
      pve.create('a', 'content', 'text');
      expect(pve.getStats().uniqueTitles).toBe(1);
    });

    it('should count total content len', () => {
      pve.create('p1', '12345', 'text');
      expect(pve.getStats().totalContentLen).toBe(5);
    });

    it('should count rendered', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      expect(pve.getStats().rendered).toBe(1);
    });

    it('should count unrendered', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getStats().unrendered).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get preview', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.getPreview(id)?.title).toBe('p1');
    });

    it('should get all', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getAllPreviews()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.hasPreview(id)).toBe(true);
    });

    it('should count', () => {
      expect(pve.getCount()).toBe(0);
      pve.create('p1', 'content', 'text');
      expect(pve.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get title', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.getTitle(id)).toBe('p1');
    });

    it('should get content', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.getContent(id)).toBe('content');
    });

    it('should get format', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.getFormat(id)).toBe('text');
    });

    it('should get hits', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      expect(pve.getHits(id)).toBe(1);
    });

    it('should check text', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.isText(pve.getAllPreviews()[0].id)).toBe(true);
    });

    it('should check markdown', () => {
      pve.create('p1', '#', 'markdown');
      expect(pve.isMarkdown(pve.getAllPreviews()[0].id)).toBe(true);
    });

    it('should check html', () => {
      pve.create('p1', '<b>', 'html');
      expect(pve.isHtml(pve.getAllPreviews()[0].id)).toBe(true);
    });

    it('should check json', () => {
      pve.create('p1', '{}', 'json');
      expect(pve.isJson(pve.getAllPreviews()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.setActive(id, false)).toBe(true);
    });

    it('should set title', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.setTitle(id, 'p2')).toBe(true);
    });

    it('should set content', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.setContent(id, 'new')).toBe(true);
    });

    it('should set format', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.setFormat(id, 'html')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pve.setActive('unknown', false)).toBe(false);
      expect(pve.setTitle('unknown', 'p')).toBe(false);
      expect(pve.setContent('unknown', 'c')).toBe(false);
      expect(pve.setFormat('unknown', 'text')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      pve.setActive(id, false);
      pve.resetAll();
      expect(pve.isRendered(id)).toBe(false);
      expect(pve.isActive(id)).toBe(true);
    });
  });

  describe('by format / state', () => {
    it('should get by format', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getByFormat('text')).toHaveLength(1);
    });

    it('should get active', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getActivePreviews()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.setActive(id, false);
      expect(pve.getInactivePreviews()).toHaveLength(1);
    });

    it('should get rendered', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      expect(pve.getRenderedPreviews()).toHaveLength(1);
    });

    it('should get unrendered', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getUnrenderedPreviews()).toHaveLength(1);
    });

    it('should get all titles', () => {
      pve.create('a', 'content', 'text');
      pve.create('b', 'content', 'text');
      expect(pve.getAllTitles()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getNewest()?.title).toBe('p1');
    });

    it('should return null for empty newest', () => {
      expect(pve.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getOldest()?.title).toBe('p1');
    });

    it('should return null for empty oldest', () => {
      expect(pve.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = pve.create('p1', 'content', 'text');
      expect(pve.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      expect(pve.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      pve.create('p1', 'content', 'text');
      expect(pve.getTotalAdded()).toBe(1);
    });

    it('should get total rendered', () => {
      const id = pve.create('p1', 'content', 'text');
      pve.render(id);
      expect(pve.getTotalRendered()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many previews', () => {
      for (let i = 0; i < 50; i++) {
        pve.create(`p${i}`, 'content', 'text');
      }
      expect(pve.getCount()).toBe(50);
    });
  });
});