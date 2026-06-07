/**
 * VoiceEngine Tests
 * chatdev-design Voice Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VoiceEngine } from '../VoiceEngine';

describe('VoiceEngine', () => {
  let vce: VoiceEngine;

  beforeEach(() => {
    vce = new VoiceEngine();
  });

  afterEach(() => {
    vce.clearAll();
  });

  describe('speak / mute / listen / remove', () => {
    it('should speak', () => {
      expect(vce.speak('alice', 'hello')).toMatch(/^vce-/);
    });

    it('should default mode to normal', () => {
      vce.speak('alice', 'hello');
      expect(vce.getMode(vce.getAllMessages()[0].id)).toBe('normal');
    });

    it('should mark as active', () => {
      vce.speak('alice', 'hello');
      expect(vce.isActive(vce.getAllMessages()[0].id)).toBe(true);
    });

    it('should mute', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.mute(id)).toBe(true);
    });

    it('should mark as muted', () => {
      const id = vce.speak('alice', 'hello');
      vce.mute(id);
      expect(vce.isMuted(id)).toBe(true);
    });

    it('should return false for unknown mute', () => {
      expect(vce.mute('unknown')).toBe(false);
    });

    it('should listen', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.listen(id)).toBe(true);
    });

    it('should not listen muted', () => {
      const id = vce.speak('alice', 'hello');
      vce.mute(id);
      expect(vce.listen(id)).toBe(false);
    });

    it('should not listen inactive', () => {
      const id = vce.speak('alice', 'hello');
      vce.setActive(id, false);
      expect(vce.listen(id)).toBe(false);
    });

    it('should return false for unknown listen', () => {
      expect(vce.listen('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      vce.speak('alice', 'hello');
      expect(vce.getStats().messages).toBe(1);
    });

    it('should count total spoken', () => {
      vce.speak('alice', 'hello');
      expect(vce.getStats().totalSpoken).toBe(1);
    });

    it('should count total muted', () => {
      const id = vce.speak('alice', 'hello');
      vce.mute(id);
      expect(vce.getStats().totalMuted).toBe(1);
    });

    it('should count total listened', () => {
      const id = vce.speak('alice', 'hello');
      vce.listen(id);
      expect(vce.getStats().totalListened).toBe(1);
    });

    it('should count loud', () => {
      vce.speak('alice', 'hello', 'loud');
      expect(vce.getStats().loud).toBe(1);
    });

    it('should count normal', () => {
      vce.speak('alice', 'hello', 'normal');
      expect(vce.getStats().normal).toBe(1);
    });

    it('should count whisper', () => {
      vce.speak('alice', 'hello', 'whisper');
      expect(vce.getStats().whisper).toBe(1);
    });

    it('should count active', () => {
      vce.speak('alice', 'hello');
      expect(vce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = vce.speak('alice', 'hello');
      vce.setActive(id, false);
      expect(vce.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = vce.speak('alice', 'hello');
      vce.listen(id);
      expect(vce.getStats().totalHits).toBe(1);
    });

    it('should count unique speakers', () => {
      vce.speak('alice', 'hi');
      vce.speak('alice', 'hey');
      expect(vce.getStats().uniqueSpeakers).toBe(1);
    });

    it('should count total text len', () => {
      vce.speak('alice', 'hello');
      expect(vce.getStats().totalTextLen).toBe(5);
    });
  });

  describe('queries', () => {
    it('should get message', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.getMessage(id)?.text).toBe('hello');
    });

    it('should get all', () => {
      vce.speak('alice', 'hello');
      expect(vce.getAllMessages()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.hasMessage(id)).toBe(true);
    });

    it('should count', () => {
      expect(vce.getCount()).toBe(0);
      vce.speak('alice', 'hello');
      expect(vce.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get speaker', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.getSpeaker(id)).toBe('alice');
    });

    it('should get text', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.getText(id)).toBe('hello');
    });

    it('should get hits', () => {
      const id = vce.speak('alice', 'hello');
      vce.listen(id);
      expect(vce.getHits(id)).toBe(1);
    });

    it('should check loud', () => {
      vce.speak('alice', 'hi', 'loud');
      expect(vce.isLoud(vce.getAllMessages()[0].id)).toBe(true);
    });

    it('should check normal', () => {
      vce.speak('alice', 'hi', 'normal');
      expect(vce.isNormal(vce.getAllMessages()[0].id)).toBe(true);
    });

    it('should check whisper', () => {
      vce.speak('alice', 'hi', 'whisper');
      expect(vce.isWhisper(vce.getAllMessages()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.setActive(id, false)).toBe(true);
    });

    it('should set speaker', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.setSpeaker(id, 'bob')).toBe(true);
    });

    it('should set text', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.setText(id, 'world')).toBe(true);
    });

    it('should set mode', () => {
      const id = vce.speak('alice', 'hello');
      expect(vce.setMode(id, 'loud')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(vce.setActive('unknown', false)).toBe(false);
      expect(vce.setSpeaker('unknown', 'a')).toBe(false);
      expect(vce.setText('unknown', 't')).toBe(false);
      expect(vce.setMode('unknown', 'loud')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = vce.speak('alice', 'hello');
      vce.mute(id);
      vce.setActive(id, false);
      vce.resetAll();
      expect(vce.isMuted(id)).toBe(false);
      expect(vce.isActive(id)).toBe(true);
    });
  });

  describe('by mode / state', () => {
    it('should get by mode', () => {
      vce.speak('alice', 'hi', 'loud');
      expect(vce.getByMode('loud')).toHaveLength(1);
    });

    it('should get active', () => {
      vce.speak('alice', 'hi');
      expect(vce.getActiveMessages()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = vce.speak('alice', 'hi');
      vce.setActive(id, false);
      expect(vce.getInactiveMessages()).toHaveLength(1);
    });

    it('should get muted', () => {
      const id = vce.speak('alice', 'hi');
      vce.mute(id);
      expect(vce.getMutedMessages()).toHaveLength(1);
    });

    it('should get unmuted', () => {
      vce.speak('alice', 'hi');
      expect(vce.getUnmutedMessages()).toHaveLength(1);
    });

    it('should get all speakers', () => {
      vce.speak('alice', 'hi');
      vce.speak('bob', 'hi');
      expect(vce.getAllSpeakers()).toHaveLength(2);
    });

    it('should get all texts', () => {
      vce.speak('alice', 'hi');
      vce.speak('alice', 'hey');
      expect(vce.getAllTexts()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      vce.speak('alice', 'hi');
      expect(vce.getNewest()?.text).toBe('hi');
    });

    it('should return null for empty newest', () => {
      expect(vce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      vce.speak('alice', 'hi');
      expect(vce.getOldest()?.text).toBe('hi');
    });

    it('should return null for empty oldest', () => {
      expect(vce.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = vce.speak('alice', 'hi');
      expect(vce.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = vce.speak('alice', 'hi');
      vce.mute(id);
      expect(vce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total spoken', () => {
      vce.speak('alice', 'hi');
      expect(vce.getTotalSpoken()).toBe(1);
    });

    it('should get total muted', () => {
      const id = vce.speak('alice', 'hi');
      vce.mute(id);
      expect(vce.getTotalMuted()).toBe(1);
    });

    it('should get total listened', () => {
      const id = vce.speak('alice', 'hi');
      vce.listen(id);
      expect(vce.getTotalListened()).toBe(1);
    });

    it('should get total text len', () => {
      vce.speak('alice', 'hi');
      expect(vce.getTotalTextLen()).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle many messages', () => {
      for (let i = 0; i < 50; i++) {
        vce.speak('alice', `msg${i}`);
      }
      expect(vce.getCount()).toBe(50);
    });
  });
});