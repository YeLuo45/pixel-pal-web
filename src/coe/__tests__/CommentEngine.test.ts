/**
 * CommentEngine Tests
 * chatdev-design Comment Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CommentEngine } from '../CommentEngine';

describe('CommentEngine', () => {
  let coe: CommentEngine;

  beforeEach(() => {
    coe = new CommentEngine();
  });

  afterEach(() => {
    coe.clearAll();
  });

  describe('add / reply / pin / unpin / hide / remove', () => {
    it('should add', () => {
      expect(coe.add('hi', 'alice')).toMatch(/^coe-/);
    });

    it('should default status to visible', () => {
      coe.add('hi', 'alice');
      expect(coe.getStatus(coe.getAllComments()[0].id)).toBe('visible');
    });

    it('should default parent to null', () => {
      coe.add('hi', 'alice');
      expect(coe.getParent(coe.getAllComments()[0].id)).toBeNull();
    });

    it('should mark as active', () => {
      coe.add('hi', 'alice');
      expect(coe.isActive(coe.getAllComments()[0].id)).toBe(true);
    });

    it('should default pinned to false', () => {
      coe.add('hi', 'alice');
      expect(coe.isPinned(coe.getAllComments()[0].id)).toBe(false);
    });

    it('should reply', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.reply(id, 'reply', 'bob')).toMatch(/^coe-/);
    });

    it('should increment parent replies', () => {
      const id = coe.add('hi', 'alice');
      coe.reply(id, 'reply', 'bob');
      expect(coe.getReplies(id)).toBe(1);
    });

    it('should return null for unknown reply', () => {
      expect(coe.reply('unknown', 'reply', 'bob')).toBeNull();
    });

    it('should pin', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.pin(id)).toBe(true);
    });

    it('should set pinned', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.isPinned(id)).toBe(true);
    });

    it('should return false for unknown pin', () => {
      expect(coe.pin('unknown')).toBe(false);
    });

    it('should unpin', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.unpin(id)).toBe(true);
    });

    it('should set unpinned', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      coe.unpin(id);
      expect(coe.isPinned(id)).toBe(false);
    });

    it('should return false for unknown unpin', () => {
      expect(coe.unpin('unknown')).toBe(false);
    });

    it('should hide', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.hide(id)).toBe(true);
    });

    it('should set hidden', () => {
      const id = coe.add('hi', 'alice');
      coe.hide(id);
      expect(coe.isHidden(id)).toBe(true);
    });

    it('should return false for unknown hide', () => {
      expect(coe.hide('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      coe.add('hi', 'alice');
      expect(coe.getStats().comments).toBe(1);
    });

    it('should count total added', () => {
      coe.add('hi', 'alice');
      expect(coe.getStats().totalAdded).toBe(1);
    });

    it('should count total replied', () => {
      const id = coe.add('hi', 'alice');
      coe.reply(id, 'reply', 'bob');
      expect(coe.getStats().totalReplied).toBe(1);
    });

    it('should count total pinned', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.getStats().totalPinned).toBe(1);
    });

    it('should count total hidden', () => {
      const id = coe.add('hi', 'alice');
      coe.hide(id);
      expect(coe.getStats().totalHidden).toBe(1);
    });

    it('should count visible', () => {
      coe.add('hi', 'alice');
      expect(coe.getStats().visible).toBe(1);
    });

    it('should count hidden', () => {
      const id = coe.add('hi', 'alice');
      coe.hide(id);
      expect(coe.getStats().hidden).toBe(1);
    });

    it('should count pinned', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.getStats().pinned).toBe(1);
    });

    it('should count unpinned', () => {
      coe.add('hi', 'alice');
      expect(coe.getStats().unpinned).toBe(1);
    });

    it('should count active', () => {
      coe.add('hi', 'alice');
      expect(coe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = coe.add('hi', 'alice');
      coe.setActive(id, false);
      expect(coe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.getStats().totalHits).toBe(1);
    });

    it('should count unique authors', () => {
      coe.add('a', 'alice');
      coe.add('b', 'alice');
      expect(coe.getStats().uniqueAuthors).toBe(1);
    });

    it('should count total replies', () => {
      const id = coe.add('hi', 'alice');
      coe.reply(id, 'reply', 'bob');
      expect(coe.getStats().totalReplies).toBe(1);
    });

    it('should count total text len', () => {
      coe.add('hi', 'alice');
      expect(coe.getStats().totalTextLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get comment', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.getComment(id)?.text).toBe('hi');
    });

    it('should get all', () => {
      coe.add('hi', 'alice');
      expect(coe.getAllComments()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.hasComment(id)).toBe(true);
    });

    it('should count', () => {
      expect(coe.getCount()).toBe(0);
      coe.add('hi', 'alice');
      expect(coe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get text', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.getText(id)).toBe('hi');
    });

    it('should get author', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.getAuthor(id)).toBe('alice');
    });

    it('should get hits', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.getHits(id)).toBe(1);
    });

    it('should check visible', () => {
      coe.add('hi', 'alice');
      expect(coe.isVisible(coe.getAllComments()[0].id)).toBe(true);
    });

    it('should check hidden', () => {
      const id = coe.add('hi', 'alice');
      coe.hide(id);
      expect(coe.isHidden(id)).toBe(true);
    });

    it('should check top level', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.isTopLevel(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.setActive(id, false)).toBe(true);
    });

    it('should set text', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.setText(id, 'new')).toBe(true);
    });

    it('should set author', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.setAuthor(id, 'bob')).toBe(true);
    });

    it('should set replies', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.setReplies(id, 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(coe.setActive('unknown', false)).toBe(false);
      expect(coe.setText('unknown', 't')).toBe(false);
      expect(coe.setAuthor('unknown', 'a')).toBe(false);
      expect(coe.setReplies('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      coe.setActive(id, false);
      coe.resetAll();
      expect(coe.isPinned(id)).toBe(false);
      expect(coe.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      coe.add('hi', 'alice');
      expect(coe.getByStatus('visible')).toHaveLength(1);
    });

    it('should get pinned', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.getPinned()).toHaveLength(1);
    });

    it('should get active', () => {
      coe.add('hi', 'alice');
      expect(coe.getActiveComments()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = coe.add('hi', 'alice');
      coe.setActive(id, false);
      expect(coe.getInactiveComments()).toHaveLength(1);
    });

    it('should get all authors', () => {
      coe.add('a', 'alice');
      coe.add('b', 'bob');
      expect(coe.getAllAuthors()).toHaveLength(2);
    });

    it('should get children', () => {
      const id = coe.add('hi', 'alice');
      coe.reply(id, 'reply', 'bob');
      expect(coe.getChildren(id)).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      coe.add('hi', 'alice');
      expect(coe.getNewest()?.text).toBe('hi');
    });

    it('should return null for empty newest', () => {
      expect(coe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      coe.add('hi', 'alice');
      expect(coe.getOldest()?.text).toBe('hi');
    });

    it('should return null for empty oldest', () => {
      expect(coe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = coe.add('hi', 'alice');
      expect(coe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      coe.add('hi', 'alice');
      expect(coe.getTotalAdded()).toBe(1);
    });

    it('should get total replied', () => {
      const id = coe.add('hi', 'alice');
      coe.reply(id, 'reply', 'bob');
      expect(coe.getTotalReplied()).toBe(1);
    });

    it('should get total pinned', () => {
      const id = coe.add('hi', 'alice');
      coe.pin(id);
      expect(coe.getTotalPinned()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many comments', () => {
      for (let i = 0; i < 50; i++) {
        coe.add(`c${i}`, 'alice');
      }
      expect(coe.getCount()).toBe(50);
    });
  });
});