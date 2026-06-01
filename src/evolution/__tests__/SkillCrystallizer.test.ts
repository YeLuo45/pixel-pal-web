/**
 * V178: SkillCrystallizer Self-Crystallization Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillCrystallizer, SkillFragment } from '../SkillCrystallizer';

describe('SkillCrystallizer', () => {
  let crystallizer: SkillCrystallizer;

  beforeEach(() => {
    vi.useFakeTimers();
    crystallizer = new SkillCrystallizer();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('canCrystallize', () => {
    it('should return true when access count meets threshold', () => {
      expect(crystallizer.canCrystallize('memory-1', 10)).toBe(true);
    });

    it('should return false when access count below threshold', () => {
      expect(crystallizer.canCrystallize('memory-1', 3)).toBe(false);
    });

    it('should return false for zero access count', () => {
      expect(crystallizer.canCrystallize('memory-1', 0)).toBe(false);
    });

    it('should return true for high access counts', () => {
      expect(crystallizer.canCrystallize('memory-1', 100)).toBe(true);
    });

    it('should respect configurable threshold', () => {
      const customCrystallizer = new SkillCrystallizer({ minAccessCount: 15 });
      expect(customCrystallizer.canCrystallize('memory-1', 10)).toBe(false);
      expect(customCrystallizer.canCrystallize('memory-1', 15)).toBe(true);
    });
  });

  describe('crystallize', () => {
    it('should create a SkillFragment from memory content', () => {
      const fragment = crystallizer.crystallize('memory-1', 'Test memory content with valuable patterns');
      expect(fragment).not.toBeNull();
      expect(fragment?.name).toBeDefined();
      expect(fragment?.description).toBeDefined();
    });

    it('should set crystallized_from to source memory ID', () => {
      const fragment = crystallizer.crystallize('memory-source-123', 'Content');
      expect(fragment?.crystallized_from).toBe('memory-source-123');
    });

    it('should return null when crystallization not possible', () => {
      const fragment = crystallizer.crystallize('memory-low', 'Low access content', 2);
      expect(fragment).toBeNull();
    });

    it('should set usage_count to 0 for new fragments', () => {
      const fragment = crystallizer.crystallize('memory-new', 'New content');
      expect(fragment?.usage_count).toBe(0);
    });

    it('should set last_used to null for new fragments', () => {
      const fragment = crystallizer.crystallize('memory-new', 'New content');
      expect(fragment?.last_used).toBeNull();
    });

    it('should generate unique IDs for each fragment', () => {
      const frag1 = crystallizer.crystallize('memory-1', 'Content 1');
      const frag2 = crystallizer.crystallize('memory-2', 'Content 2');
      expect(frag1?.id).not.toBe(frag2?.id);
    });
  });

  describe('getAllFragments', () => {
    it('should return empty array initially', () => {
      expect(crystallizer.getAllFragments()).toEqual([]);
    });

    it('should return all crystallized fragments', () => {
      crystallizer.crystallize('memory-1', 'Content 1');
      crystallizer.crystallize('memory-2', 'Content 2');
      crystallizer.crystallize('memory-3', 'Content 3');
      expect(crystallizer.getAllFragments().length).toBe(3);
    });
  });

  describe('getFragment', () => {
    it('should return null for non-existent fragment', () => {
      expect(crystallizer.getFragment('non-existent')).toBeNull();
    });

    it('should return fragment by ID', () => {
      const created = crystallizer.crystallize('memory-get', 'Get test content');
      expect(crystallizer.getFragment(created!.id)).toEqual(created);
    });
  });

  describe('useFragment', () => {
    it('should return action string when fragment exists', () => {
      const fragment = crystallizer.crystallize('memory-use', 'Use test content');
      const action = crystallizer.useFragment(fragment!.id);
      expect(action).toBeDefined();
      expect(typeof action).toBe('string');
    });

    it('should return null for non-existent fragment', () => {
      expect(crystallizer.useFragment('non-existent')).toBeNull();
    });

    it('should increment usage_count when used', () => {
      const fragment = crystallizer.crystallize('memory-inc', 'Increment test');
      const initialCount = fragment!.usage_count;
      crystallizer.useFragment(fragment!.id);
      const afterUse = crystallizer.getFragment(fragment!.id);
      expect(afterUse!.usage_count).toBe(initialCount + 1);
    });
  });

  describe('updateConfidence', () => {
    it('should increase confidence with positive delta', () => {
      const fragment = crystallizer.crystallize('memory-conf', 'Confidence test');
      const initialConf = fragment!.confidence;
      crystallizer.updateConfidence(fragment!.id, 10);
      const updated = crystallizer.getFragment(fragment!.id);
      expect(updated!.confidence).toBe(initialConf + 10);
    });

    it('should decrease confidence with negative delta', () => {
      const fragment = crystallizer.crystallize('memory-conf', 'Confidence test');
      const initialConf = fragment!.confidence;
      crystallizer.updateConfidence(fragment!.id, -10);
      const updated = crystallizer.getFragment(fragment!.id);
      expect(updated!.confidence).toBe(initialConf - 10);
    });

    it('should not go below 0', () => {
      const fragment = crystallizer.crystallize('memory-conf', 'Confidence test');
      crystallizer.updateConfidence(fragment!.id, -200);
      const updated = crystallizer.getFragment(fragment!.id);
      expect(updated!.confidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('fuse', () => {
    it('should return null for less than 2 fragments', () => {
      const frag = crystallizer.crystallize('memory-1', 'Content 1');
      expect(crystallizer.fuse([frag!.id])).toBeNull();
    });

    it('should fuse multiple fragments into one', () => {
      const frag1 = crystallizer.crystallize('memory-1', 'Content 1');
      const frag2 = crystallizer.crystallize('memory-2', 'Content 2');
      const fused = crystallizer.fuse([frag1!.id, frag2!.id]);
      expect(fused).not.toBeNull();
      expect(fused!.name).toContain('Fused');
    });
  });

  describe('deleteFragment', () => {
    it('should delete fragment and return true', () => {
      const frag = crystallizer.crystallize('memory-del', 'Delete test');
      expect(crystallizer.deleteFragment(frag!.id)).toBe(true);
      expect(crystallizer.getFragment(frag!.id)).toBeNull();
    });

    it('should return false for non-existent fragment', () => {
      expect(crystallizer.deleteFragment('non-existent')).toBe(false);
    });
  });

  describe('findByTrigger', () => {
    it('should find fragments by trigger keyword', () => {
      crystallizer.crystallize('memory-1', 'When user asks about pricing');
      const found = crystallizer.findByTrigger('when');
      expect(found.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
      crystallizer.crystallize('memory-1', 'Content without triggers');
      const found = crystallizer.findByTrigger('xyz123');
      expect(found.length).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return stats for empty crystallizer', () => {
      const stats = crystallizer.getStats();
      expect(stats.total).toBe(0);
      expect(stats.avgConfidence).toBe(0);
    });

    it('should calculate correct stats', () => {
      crystallizer.crystallize('memory-1', 'Content 1');
      crystallizer.crystallize('memory-2', 'Content 2');
      const stats = crystallizer.getStats();
      expect(stats.total).toBe(2);
      expect(stats.avgConfidence).toBeGreaterThan(0);
    });
  });
});
