/**
 * SkillMatcher Tests
 * generic-agent-design Skill Matcher
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkillMatcher } from '../SkillMatcher';

describe('SkillMatcher', () => {
  let matcher: SkillMatcher;

  beforeEach(() => {
    matcher = new SkillMatcher();
  });

  afterEach(() => {
    matcher.clearAll();
  });

  // ============================================================
  // index / match
  // ============================================================
  describe('index / match', () => {
    it('should index', () => {
      expect(matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 })).toBe(true);
    });

    it('should reject duplicate', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      expect(matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 })).toBe(false);
    });

    it('should match by capability', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      expect(matcher.match('code')).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      expect(matcher.match('other')).toHaveLength(0);
    });

    it('should match by context', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: ['web'], score: 1 });
      expect(matcher.match('any', ['web'])).toHaveLength(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      const stats = matcher.getStats();
      expect(stats.skills).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get skill', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.getSkill('s1')?.name).toBe('a');
    });

    it('should get all', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.getAllSkills()).toHaveLength(1);
    });

    it('should remove', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.removeSkill('s1')).toBe(true);
    });

    it('should check existence', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.hasSkill('s1')).toBe(true);
    });

    it('should count', () => {
      expect(matcher.getCount()).toBe(0);
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.getName('s1')).toBe('a');
    });

    it('should get score', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 5 });
      expect(matcher.getScore('s1')).toBe(5);
    });

    it('should set score', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.setScore('s1', 10)).toBe(true);
    });

    it('should return false for unknown setScore', () => {
      expect(matcher.setScore('unknown', 1)).toBe(false);
    });

    it('should get capabilities', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      expect(matcher.getCapabilities('s1')).toEqual(['code']);
    });

    it('should get context', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: ['web'], score: 1 });
      expect(matcher.getContext('s1')).toEqual(['web']);
    });

    it('should check hasCapability', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      expect(matcher.hasCapability('s1', 'code')).toBe(true);
    });

    it('should check hasContext', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: ['web'], score: 1 });
      expect(matcher.hasContext('s1', 'web')).toBe(true);
    });
  });

  // ============================================================
  // capability ops
  // ============================================================
  describe('capability ops', () => {
    it('should add capability', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.addCapability('s1', 'code')).toBe(true);
    });

    it('should not add duplicate', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      matcher.addCapability('s1', 'code');
      expect(matcher.getCapabilities('s1')).toEqual(['code']);
    });

    it('should remove capability', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      expect(matcher.removeCapability('s1', 'code')).toBe(true);
    });

    it('should return false for unknown addCapability', () => {
      expect(matcher.addCapability('unknown', 'a')).toBe(false);
    });

    it('should return false for unknown removeCapability', () => {
      expect(matcher.removeCapability('unknown', 'a')).toBe(false);
    });

    it('should return false for missing removeCapability', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.removeCapability('s1', 'z')).toBe(false);
    });
  });

  // ============================================================
  // context ops
  // ============================================================
  describe('context ops', () => {
    it('should add context', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.addContext('s1', 'web')).toBe(true);
    });

    it('should remove context', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: ['web'], score: 1 });
      expect(matcher.removeContext('s1', 'web')).toBe(true);
    });

    it('should return false for unknown addContext', () => {
      expect(matcher.addContext('unknown', 'a')).toBe(false);
    });

    it('should return false for unknown removeContext', () => {
      expect(matcher.removeContext('unknown', 'a')).toBe(false);
    });

    it('should return false for missing removeContext', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.removeContext('s1', 'z')).toBe(false);
    });
  });

  // ============================================================
  // matches
  // ============================================================
  describe('matches', () => {
    it('should get matches for skill', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      matcher.match('code');
      expect(matcher.getMatches('s1')).toBe(1);
    });

    it('should get match count', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      matcher.match('code');
      expect(matcher.getMatchCount()).toBe(1);
    });
  });

  // ============================================================
  // by capability / context
  // ============================================================
  describe('by capability / context', () => {
    it('should get by capability', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      expect(matcher.getByCapability('code')).toHaveLength(1);
    });

    it('should get by context', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: ['web'], score: 1 });
      expect(matcher.getByContext('web')).toHaveLength(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 1 });
      expect(matcher.getCreatedAt('s1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most matched', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      matcher.match('code');
      expect(matcher.getMostMatched()?.id).toBe('s1');
    });

    it('should return null for empty most', () => {
      expect(matcher.getMostMatched()).toBeNull();
    });

    it('should get top scored', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: [], context: [], score: 5 });
      expect(matcher.getTopScored()?.id).toBe('s1');
    });

    it('should return null for empty top', () => {
      expect(matcher.getTopScored()).toBeNull();
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset matches', () => {
      matcher.index({ id: 's1', name: 'a', capabilities: ['code'], context: [], score: 1 });
      matcher.match('code');
      matcher.resetMatches();
      expect(matcher.getMatchCount()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many skills', () => {
      for (let i = 0; i < 50; i++) {
        matcher.index({ id: `s${i}`, name: `s${i}`, capabilities: [], context: [], score: i });
      }
      expect(matcher.getCount()).toBe(50);
    });
  });
});