/**
 * AttachmentEngine Tests
 * chatdev-design Attachment Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AttachmentEngine } from '../AttachmentEngine';

describe('AttachmentEngine', () => {
  let ate2: AttachmentEngine;

  beforeEach(() => {
    ate2 = new AttachmentEngine();
  });

  afterEach(() => {
    ate2.clearAll();
  });

  describe('add / list / remove', () => {
    it('should add', () => {
      expect(ate2.add('a1', 'image', 100)).toMatch(/^ate2-/);
    });

    it('should mark as active', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.isActive(ate2.getAllAttachments()[0].id)).toBe(true);
    });

    it('should list', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.list(id)).toBe(true);
    });

    it('should not list inactive', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.setActive(id, false);
      expect(ate2.list(id)).toBe(false);
    });

    it('should return false for unknown list', () => {
      expect(ate2.list('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getStats().attachments).toBe(1);
    });

    it('should count total added', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getStats().totalAdded).toBe(1);
    });

    it('should count total listed', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.list(id);
      expect(ate2.getStats().totalListed).toBe(1);
    });

    it('should count image', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getStats().image).toBe(1);
    });

    it('should count video', () => {
      ate2.add('a1', 'video', 100);
      expect(ate2.getStats().video).toBe(1);
    });

    it('should count audio', () => {
      ate2.add('a1', 'audio', 100);
      expect(ate2.getStats().audio).toBe(1);
    });

    it('should count document', () => {
      ate2.add('a1', 'document', 100);
      expect(ate2.getStats().document).toBe(1);
    });

    it('should count other', () => {
      ate2.add('a1', 'other', 100);
      expect(ate2.getStats().other).toBe(1);
    });

    it('should count active', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.setActive(id, false);
      expect(ate2.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.list(id);
      expect(ate2.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ate2.add('a', 'image', 100);
      ate2.add('a', 'image', 100);
      expect(ate2.getStats().uniqueNames).toBe(1);
    });

    it('should count total size', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getStats().totalSize).toBe(100);
    });
  });

  describe('queries', () => {
    it('should get attachment', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.getAttachment(id)?.name).toBe('a1');
    });

    it('should get all', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getAllAttachments()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.hasAttachment(id)).toBe(true);
    });

    it('should count', () => {
      expect(ate2.getCount()).toBe(0);
      ate2.add('a1', 'image', 100);
      expect(ate2.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.getName(id)).toBe('a1');
    });

    it('should get size', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.getSize(id)).toBe(100);
    });

    it('should get hits', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.list(id);
      expect(ate2.getHits(id)).toBe(1);
    });

    it('should check image', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.isImage(ate2.getAllAttachments()[0].id)).toBe(true);
    });

    it('should check video', () => {
      ate2.add('a1', 'video', 100);
      expect(ate2.isVideo(ate2.getAllAttachments()[0].id)).toBe(true);
    });

    it('should check audio', () => {
      ate2.add('a1', 'audio', 100);
      expect(ate2.isAudio(ate2.getAllAttachments()[0].id)).toBe(true);
    });

    it('should check document', () => {
      ate2.add('a1', 'document', 100);
      expect(ate2.isDocument(ate2.getAllAttachments()[0].id)).toBe(true);
    });

    it('should check other', () => {
      ate2.add('a1', 'other', 100);
      expect(ate2.isOther(ate2.getAllAttachments()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.setName(id, 'a2')).toBe(true);
    });

    it('should set type', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.setType(id, 'video')).toBe(true);
    });

    it('should set size', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.setSize(id, 200)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ate2.setActive('unknown', false)).toBe(false);
      expect(ate2.setName('unknown', 'a')).toBe(false);
      expect(ate2.setType('unknown', 'image')).toBe(false);
      expect(ate2.setSize('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.setActive(id, false);
      ate2.resetAll();
      expect(ate2.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getByType('image')).toHaveLength(1);
    });

    it('should get active', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getActiveAttachments()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.setActive(id, false);
      expect(ate2.getInactiveAttachments()).toHaveLength(1);
    });

    it('should get all names', () => {
      ate2.add('a', 'image', 100);
      ate2.add('b', 'image', 100);
      expect(ate2.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getNewest()?.name).toBe('a1');
    });

    it('should return null for empty newest', () => {
      expect(ate2.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getOldest()?.name).toBe('a1');
    });

    it('should return null for empty oldest', () => {
      expect(ate2.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ate2.add('a1', 'image', 100);
      expect(ate2.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.list(id);
      expect(ate2.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      ate2.add('a1', 'image', 100);
      expect(ate2.getTotalAdded()).toBe(1);
    });

    it('should get total listed', () => {
      const id = ate2.add('a1', 'image', 100);
      ate2.list(id);
      expect(ate2.getTotalListed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many attachments', () => {
      for (let i = 0; i < 50; i++) {
        ate2.add(`a${i}`, 'image', 100);
      }
      expect(ate2.getCount()).toBe(50);
    });
  });
});