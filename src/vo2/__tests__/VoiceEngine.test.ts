/**
 * VoiceEngine Tests
 * chatdev-design Voice Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VoiceEngine } from '../VoiceEngine';

describe('VoiceEngine', () => {
  let vo: VoiceEngine;

  beforeEach(() => {
    vo = new VoiceEngine();
  });

  afterEach(() => {
    vo.clearAll();
  });

  // ============================================================
  // join / leave / setState / startSpeaking / stopSpeaking
  // ============================================================
  describe('join / leave / setState / startSpeaking / stopSpeaking', () => {
    it('should join', () => {
      expect(vo.join('alice')).toBe('vo2-1');
    });

    it('should mark as active', () => {
      const id = vo.join('alice');
      expect(vo.isActive(id)).toBe(true);
    });

    it('should mark as idle by default', () => {
      const id = vo.join('alice');
      expect(vo.isIdle(id)).toBe(true);
    });

    it('should not be speaking by default', () => {
      const id = vo.join('alice');
      expect(vo.isSpeaking(id)).toBe(false);
    });

    it('should leave', () => {
      const id = vo.join('alice');
      expect(vo.leave(id)).toBe(true);
    });

    it('should remove on leave', () => {
      const id = vo.join('alice');
      vo.leave(id);
      expect(vo.hasVoice(id)).toBe(false);
    });

    it('should setState', () => {
      const id = vo.join('alice');
      expect(vo.setState(id, 'muted')).toBe(true);
    });

    it('should mark as muted on setState', () => {
      const id = vo.join('alice');
      vo.setState(id, 'muted');
      expect(vo.isMuted(id)).toBe(true);
    });

    it('should mark as deafened on setState', () => {
      const id = vo.join('alice');
      vo.setState(id, 'deafened');
      expect(vo.isDeafened(id)).toBe(true);
    });

    it('should not setState inactive', () => {
      const id = vo.join('alice');
      vo.setActive(id, false);
      expect(vo.setState(id, 'muted')).toBe(false);
    });

    it('should return false for unknown setState', () => {
      expect(vo.setState('unknown', 'muted')).toBe(false);
    });

    it('should start speaking', () => {
      const id = vo.join('alice');
      expect(vo.startSpeaking(id)).toBe(true);
    });

    it('should mark as speaking on startSpeaking', () => {
      const id = vo.join('alice');
      vo.startSpeaking(id);
      expect(vo.isSpeaking(id)).toBe(true);
    });

    it('should not start speaking twice', () => {
      const id = vo.join('alice');
      vo.startSpeaking(id);
      expect(vo.startSpeaking(id)).toBe(true);
    });

    it('should not start speaking inactive', () => {
      const id = vo.join('alice');
      vo.setActive(id, false);
      expect(vo.startSpeaking(id)).toBe(false);
    });

    it('should return false for unknown startSpeaking', () => {
      expect(vo.startSpeaking('unknown')).toBe(false);
    });

    it('should stop speaking', () => {
      const id = vo.join('alice');
      vo.startSpeaking(id);
      expect(vo.stopSpeaking(id)).toBe(true);
    });

    it('should mark as not speaking on stop', () => {
      const id = vo.join('alice');
      vo.startSpeaking(id);
      vo.stopSpeaking(id);
      expect(vo.isSpeaking(id)).toBe(false);
    });

    it('should mark as idle on stop', () => {
      const id = vo.join('alice');
      vo.startSpeaking(id);
      vo.stopSpeaking(id);
      expect(vo.isIdle(id)).toBe(true);
    });

    it('should return false for unknown stopSpeaking', () => {
      expect(vo.stopSpeaking('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      vo.join('alice');
      const stats = vo.getStats();
      expect(stats.voices).toBe(1);
    });

    it('should count speaking', () => {
      const id = vo.join('alice');
      vo.startSpeaking(id);
      expect(vo.getStats().speaking).toBe(1);
    });

    it('should count muted', () => {
      const id = vo.join('alice');
      vo.setState(id, 'muted');
      expect(vo.getStats().muted).toBe(1);
    });

    it('should count deafened', () => {
      const id = vo.join('alice');
      vo.setState(id, 'deafened');
      expect(vo.getStats().deafened).toBe(1);
    });

    it('should count idle', () => {
      vo.join('alice');
      expect(vo.getStats().idle).toBe(1);
    });

    it('should count active', () => {
      vo.join('alice');
      expect(vo.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = vo.join('alice');
      vo.setActive(id, false);
      expect(vo.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = vo.join('alice');
      vo.setState(id, 'muted');
      expect(vo.getStats().totalHits).toBe(1);
    });

    it('should count unique users', () => {
      vo.join('alice');
      vo.join('bob');
      expect(vo.getStats().uniqueUsers).toBe(2);
    });

    it('should count unique states', () => {
      const id1 = vo.join('alice');
      const id2 = vo.join('bob');
      vo.setState(id1, 'muted');
      vo.setState(id2, 'deafened');
      expect(vo.getStats().uniqueStates).toBe(2);
    });

    it('should compute speaking ratio', () => {
      const id = vo.join('alice');
      vo.startSpeaking(id);
      expect(vo.getStats().speakingRatio).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get voice', () => {
      vo.join('alice');
      expect(vo.getVoice('vo2-1')?.user).toBe('alice');
    });

    it('should get all', () => {
      vo.join('alice');
      expect(vo.getAllVoices()).toHaveLength(1);
    });

    it('should remove', () => {
      vo.join('alice');
      expect(vo.removeVoice('vo2-1')).toBe(true);
    });

    it('should check existence', () => {
      vo.join('alice');
      expect(vo.hasVoice('vo2-1')).toBe(true);
    });

    it('should count', () => {
      expect(vo.getCount()).toBe(0);
      vo.join('alice');
      expect(vo.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get user', () => {
      vo.join('alice');
      expect(vo.getUser('vo2-1')).toBe('alice');
    });

    it('should get state', () => {
      vo.join('alice');
      expect(vo.getState('vo2-1')).toBe('idle');
    });

    it('should get history', () => {
      vo.join('alice');
      expect(vo.getHistory('vo2-1')).toEqual(['idle']);
    });

    it('should get hits', () => {
      const id = vo.join('alice');
      vo.setState(id, 'muted');
      expect(vo.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      vo.join('alice');
      expect(vo.setActive('vo2-1', false)).toBe(true);
    });

    it('should set user', () => {
      vo.join('alice');
      expect(vo.setUser('vo2-1', 'bob')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(vo.setActive('unknown', false)).toBe(false);
      expect(vo.setUser('unknown', 'u')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = vo.join('alice');
      vo.setState(id, 'muted');
      vo.setActive(id, false);
      vo.resetAll();
      expect(vo.isIdle(id)).toBe(true);
      expect(vo.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by user / state
  // ============================================================
  describe('by user / state', () => {
    it('should get by user', () => {
      vo.join('alice');
      expect(vo.getByUser('alice')).toHaveLength(1);
    });

    it('should get speaking', () => {
      const id = vo.join('alice');
      vo.startSpeaking(id);
      expect(vo.getSpeakingVoices()).toHaveLength(1);
    });

    it('should get muted', () => {
      const id = vo.join('alice');
      vo.setState(id, 'muted');
      expect(vo.getMutedVoices()).toHaveLength(1);
    });

    it('should get deafened', () => {
      const id = vo.join('alice');
      vo.setState(id, 'deafened');
      expect(vo.getDeafenedVoices()).toHaveLength(1);
    });

    it('should get idle', () => {
      vo.join('alice');
      expect(vo.getIdleVoices()).toHaveLength(1);
    });

    it('should get active', () => {
      vo.join('alice');
      expect(vo.getActiveVoices()).toHaveLength(1);
    });

    it('should get inactive', () => {
      vo.join('alice');
      vo.setActive('vo2-1', false);
      expect(vo.getInactiveVoices()).toHaveLength(1);
    });

    it('should get all users', () => {
      vo.join('alice');
      vo.join('bob');
      expect(vo.getAllUsers()).toHaveLength(2);
    });

    it('should get user count', () => {
      vo.join('alice');
      expect(vo.getUserCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      vo.join('alice');
      expect(vo.getNewest()?.id).toBe('vo2-1');
    });

    it('should return null for empty newest', () => {
      expect(vo.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      vo.join('alice');
      expect(vo.getOldest()?.id).toBe('vo2-1');
    });

    it('should return null for empty oldest', () => {
      expect(vo.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      vo.join('alice');
      expect(vo.getCreatedAt('vo2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = vo.join('alice');
      vo.setState(id, 'muted');
      expect(vo.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total state changes', () => {
      const id = vo.join('alice');
      vo.setState(id, 'muted');
      expect(vo.getTotalStateChanges()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many voices', () => {
      for (let i = 0; i < 50; i++) {
        vo.join(`user${i}`);
      }
      expect(vo.getCount()).toBe(50);
    });
  });
});