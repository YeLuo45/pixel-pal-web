/**
 * MediaEngine Tests
 * chatdev-design Media Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MediaEngine } from '../MediaEngine';

describe('MediaEngine', () => {
  let mme: MediaEngine;

  beforeEach(() => {
    mme = new MediaEngine();
  });

  afterEach(() => {
    mme.clearAll();
  });

  describe('add / attach / detach / remove', () => {
    it('should add', () => {
      expect(mme.add('m1', 'image', 'https://example.com/i.png', 1024)).toMatch(/^mme-/);
    });

    it('should default attached to 0', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getAttached(mme.getAllMedia()[0].id)).toBe(0);
    });

    it('should mark as active', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.isActive(mme.getAllMedia()[0].id)).toBe(true);
    });

    it('should attach', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.attach(id)).toBe(true);
    });

    it('should increment attached', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      expect(mme.getAttached(id)).toBe(1);
    });

    it('should not attach inactive', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.setActive(id, false);
      expect(mme.attach(id)).toBe(false);
    });

    it('should return false for unknown attach', () => {
      expect(mme.attach('unknown')).toBe(false);
    });

    it('should detach', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      expect(mme.detach(id)).toBe(true);
    });

    it('should decrement attached', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      mme.detach(id);
      expect(mme.getAttached(id)).toBe(0);
    });

    it('should not detach below 0', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.detach(id)).toBe(false);
    });

    it('should return false for unknown detach', () => {
      expect(mme.detach('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getStats().media).toBe(1);
    });

    it('should count total added', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getStats().totalAdded).toBe(1);
    });

    it('should count total attached', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      expect(mme.getStats().totalAttached).toBe(1);
    });

    it('should count total detached', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      mme.detach(id);
      expect(mme.getStats().totalDetached).toBe(1);
    });

    it('should count image', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getStats().image).toBe(1);
    });

    it('should count video', () => {
      mme.add('m1', 'video', 'url', 1024);
      expect(mme.getStats().video).toBe(1);
    });

    it('should count audio', () => {
      mme.add('m1', 'audio', 'url', 1024);
      expect(mme.getStats().audio).toBe(1);
    });

    it('should count doc', () => {
      mme.add('m1', 'doc', 'url', 1024);
      expect(mme.getStats().doc).toBe(1);
    });

    it('should count embed', () => {
      mme.add('m1', 'embed', 'url', 1024);
      expect(mme.getStats().embed).toBe(1);
    });

    it('should count active', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.setActive(id, false);
      expect(mme.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      expect(mme.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      mme.add('a', 'image', 'url', 1024);
      mme.add('a', 'image', 'url', 1024);
      expect(mme.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get media', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.getMedia(id)?.name).toBe('m1');
    });

    it('should get all', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getAllMedia()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.hasMedia(id)).toBe(true);
    });

    it('should count', () => {
      expect(mme.getCount()).toBe(0);
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = mme.add('hello', 'image', 'url', 1024);
      expect(mme.getName(id)).toBe('hello');
    });

    it('should get kind', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.getKind(id)).toBe('image');
    });

    it('should get url', () => {
      const id = mme.add('m1', 'image', 'https://x.com', 1024);
      expect(mme.getUrl(id)).toBe('https://x.com');
    });

    it('should get size', () => {
      const id = mme.add('m1', 'image', 'url', 2048);
      expect(mme.getSize(id)).toBe(2048);
    });

    it('should get hits', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      expect(mme.getHits(id)).toBe(1);
    });

    it('should check image', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.isImage(mme.getAllMedia()[0].id)).toBe(true);
    });

    it('should check video', () => {
      mme.add('m1', 'video', 'url', 1024);
      expect(mme.isVideo(mme.getAllMedia()[0].id)).toBe(true);
    });

    it('should check audio', () => {
      mme.add('m1', 'audio', 'url', 1024);
      expect(mme.isAudio(mme.getAllMedia()[0].id)).toBe(true);
    });

    it('should check doc', () => {
      mme.add('m1', 'doc', 'url', 1024);
      expect(mme.isDoc(mme.getAllMedia()[0].id)).toBe(true);
    });

    it('should check embed', () => {
      mme.add('m1', 'embed', 'url', 1024);
      expect(mme.isEmbed(mme.getAllMedia()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.setName(id, 'm2')).toBe(true);
    });

    it('should set kind', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.setKind(id, 'video')).toBe(true);
    });

    it('should set url', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.setUrl(id, 'https://y.com')).toBe(true);
    });

    it('should set size', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.setSize(id, 2048)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mme.setActive('unknown', false)).toBe(false);
      expect(mme.setName('unknown', 'm')).toBe(false);
      expect(mme.setKind('unknown', 'image')).toBe(false);
      expect(mme.setUrl('unknown', 'u')).toBe(false);
      expect(mme.setSize('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      mme.setActive(id, false);
      mme.resetAll();
      expect(mme.getAttached(id)).toBe(0);
      expect(mme.isActive(id)).toBe(true);
    });
  });

  describe('by kind / state', () => {
    it('should get by kind', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getByKind('image')).toHaveLength(1);
    });

    it('should get active', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getActiveMedia()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.setActive(id, false);
      expect(mme.getInactiveMedia()).toHaveLength(1);
    });

    it('should get all names', () => {
      mme.add('a', 'image', 'url', 1024);
      mme.add('b', 'image', 'url', 1024);
      expect(mme.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getNewest()?.name).toBe('m1');
    });

    it('should return null for empty newest', () => {
      expect(mme.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getOldest()?.name).toBe('m1');
    });

    it('should return null for empty oldest', () => {
      expect(mme.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      expect(mme.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      expect(mme.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      mme.add('m1', 'image', 'url', 1024);
      expect(mme.getTotalAdded()).toBe(1);
    });

    it('should get total attached', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      expect(mme.getTotalAttached()).toBe(1);
    });

    it('should get total detached', () => {
      const id = mme.add('m1', 'image', 'url', 1024);
      mme.attach(id);
      mme.detach(id);
      expect(mme.getTotalDetached()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many media', () => {
      for (let i = 0; i < 50; i++) {
        mme.add(`m${i}`, 'image', `https://x.com/${i}`, 1024);
      }
      expect(mme.getCount()).toBe(50);
    });
  });
});