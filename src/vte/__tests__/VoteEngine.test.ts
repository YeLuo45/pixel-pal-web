/**
 * VoteEngine Tests
 * chatdev-design Vote Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VoteEngine } from '../VoteEngine';

describe('VoteEngine', () => {
  let vte: VoteEngine;

  beforeEach(() => {
    vte = new VoteEngine();
  });

  afterEach(() => {
    vte.clearAll();
  });

  describe('create / cast / tally / winner / remove', () => {
    it('should create', () => {
      expect(vte.create('q1', ['a', 'b'])).toBe('vte-1');
    });

    it('should default type to simple', () => {
      vte.create('q1', ['a', 'b']);
      expect(vte.getType('vte-1')).toBe('simple');
    });

    it('should mark as active', () => {
      vte.create('q1', ['a', 'b']);
      expect(vte.isActive('vte-1')).toBe(true);
    });

    it('should cast', () => {
      vte.create('q1', ['a', 'b']);
      expect(vte.cast('vte-1', 'a')).toBe(true);
    });

    it('should increment votes', () => {
      vte.create('q1', ['a', 'b']);
      vte.cast('vte-1', 'a');
      expect(vte.getTotalVotes('vte-1')).toBe(1);
    });

    it('should not cast unknown option', () => {
      vte.create('q1', ['a', 'b']);
      expect(vte.cast('vte-1', 'c')).toBe(false);
    });

    it('should not cast inactive', () => {
      vte.create('q1', ['a', 'b']);
      vte.setActive('vte-1', false);
      expect(vte.cast('vte-1', 'a')).toBe(false);
    });

    it('should return false for unknown cast', () => {
      expect(vte.cast('unknown', 'a')).toBe(false);
    });

    it('should tally', () => {
      vte.create('q1', ['a', 'b']);
      vte.cast('vte-1', 'a');
      expect(vte.tally('vte-1')?.get('a')).toBe(1);
    });

    it('should return undefined for unknown tally', () => {
      expect(vte.tally('unknown')).toBeUndefined();
    });

    it('should winner', () => {
      vte.create('q1', ['a', 'b']);
      vte.cast('vte-1', 'a');
      vte.cast('vte-1', 'a');
      vte.cast('vte-1', 'b');
      expect(vte.winner('vte-1')).toBe('a');
    });

    it('should return undefined winner for unknown', () => {
      expect(vte.winner('unknown')).toBeUndefined();
    });

    it('should remove', () => {
      vte.create('q1', ['a', 'b']);
      expect(vte.remove('vte-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      vte.create('q1', ['a', 'b']);
      expect(vte.getStats().ballots).toBe(1);
    });

    it('should count total created', () => {
      vte.create('q1', ['a', 'b']);
      expect(vte.getStats().totalCreated).toBe(1);
    });

    it('should count total cast', () => {
      vte.create('q1', ['a', 'b']);
      vte.cast('vte-1', 'a');
      expect(vte.getStats().totalCast).toBe(1);
    });

    it('should count simple', () => {
      vte.create('q1', ['a'], 'simple');
      expect(vte.getStats().simple).toBe(1);
    });

    it('should count ranked', () => {
      vte.create('q1', ['a'], 'ranked');
      expect(vte.getStats().ranked).toBe(1);
    });

    it('should count approval', () => {
      vte.create('q1', ['a'], 'approval');
      expect(vte.getStats().approval).toBe(1);
    });

    it('should count active', () => {
      vte.create('q1', ['a']);
      expect(vte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      vte.create('q1', ['a']);
      vte.setActive('vte-1', false);
      expect(vte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      vte.create('q1', ['a']);
      vte.cast('vte-1', 'a');
      expect(vte.getStats().totalHits).toBe(1);
    });

    it('should count unique questions', () => {
      vte.create('a', ['x']);
      vte.create('a', ['x']);
      expect(vte.getStats().uniqueQuestions).toBe(1);
    });

    it('should count total votes', () => {
      vte.create('q1', ['a', 'b']);
      vte.cast('vte-1', 'a');
      vte.cast('vte-1', 'a');
      expect(vte.getStats().totalVotes2).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get ballot', () => {
      vte.create('q1', ['a']);
      expect(vte.getBallot('vte-1')?.question).toBe('q1');
    });

    it('should get all', () => {
      vte.create('q1', ['a']);
      expect(vte.getAllBallots()).toHaveLength(1);
    });

    it('should check existence', () => {
      vte.create('q1', ['a']);
      expect(vte.hasBallot('vte-1')).toBe(true);
    });

    it('should count', () => {
      expect(vte.getCount()).toBe(0);
      vte.create('q1', ['a']);
      expect(vte.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get question', () => {
      vte.create('q1', ['a']);
      expect(vte.getQuestion('vte-1')).toBe('q1');
    });

    it('should get options', () => {
      vte.create('q1', ['a', 'b']);
      expect(vte.getOptions('vte-1')).toHaveLength(2);
    });

    it('should get hits', () => {
      vte.create('q1', ['a']);
      vte.cast('vte-1', 'a');
      expect(vte.getHits('vte-1')).toBe(1);
    });

    it('should check simple', () => {
      vte.create('q1', ['a'], 'simple');
      expect(vte.isSimple('vte-1')).toBe(true);
    });

    it('should check ranked', () => {
      vte.create('q1', ['a'], 'ranked');
      expect(vte.isRanked('vte-1')).toBe(true);
    });

    it('should check approval', () => {
      vte.create('q1', ['a'], 'approval');
      expect(vte.isApproval('vte-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      vte.create('q1', ['a']);
      expect(vte.setActive('vte-1', false)).toBe(true);
    });

    it('should set question', () => {
      vte.create('q1', ['a']);
      expect(vte.setQuestion('vte-1', 'q2')).toBe(true);
    });

    it('should set type', () => {
      vte.create('q1', ['a']);
      expect(vte.setType('vte-1', 'ranked')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(vte.setActive('unknown', false)).toBe(false);
      expect(vte.setQuestion('unknown', 'q')).toBe(false);
      expect(vte.setType('unknown', 'simple')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      vte.create('q1', ['a']);
      vte.cast('vte-1', 'a');
      vte.setActive('vte-1', false);
      vte.resetAll();
      expect(vte.getTotalVotes('vte-1')).toBe(0);
      expect(vte.isActive('vte-1')).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      vte.create('q1', ['a'], 'ranked');
      expect(vte.getByType('ranked')).toHaveLength(1);
    });

    it('should get active', () => {
      vte.create('q1', ['a']);
      expect(vte.getActiveBallots()).toHaveLength(1);
    });

    it('should get inactive', () => {
      vte.create('q1', ['a']);
      vte.setActive('vte-1', false);
      expect(vte.getInactiveBallots()).toHaveLength(1);
    });

    it('should get all questions', () => {
      vte.create('a', ['x']);
      vte.create('b', ['x']);
      expect(vte.getAllQuestions()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      vte.create('q1', ['a']);
      expect(vte.getNewest()?.id).toBe('vte-1');
    });

    it('should return null for empty newest', () => {
      expect(vte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      vte.create('q1', ['a']);
      expect(vte.getOldest()?.id).toBe('vte-1');
    });

    it('should return null for empty oldest', () => {
      expect(vte.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      vte.create('q1', ['a']);
      expect(vte.getCreatedAt('vte-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      vte.create('q1', ['a']);
      vte.cast('vte-1', 'a');
      expect(vte.getUpdatedAt('vte-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total created', () => {
      vte.create('q1', ['a']);
      expect(vte.getTotalCreated()).toBe(1);
    });

    it('should get total cast', () => {
      vte.create('q1', ['a']);
      vte.cast('vte-1', 'a');
      expect(vte.getTotalCast()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many ballots', () => {
      for (let i = 0; i < 50; i++) {
        vte.create(`q${i}`, ['a', 'b']);
      }
      expect(vte.getCount()).toBe(50);
    });
  });
});