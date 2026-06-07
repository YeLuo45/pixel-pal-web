/**
 * QuorumEngine Tests
 * nanobot-design Quorum Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuorumEngine } from '../QuorumEngine';

describe('QuorumEngine', () => {
  let qum: QuorumEngine;

  beforeEach(() => {
    qum = new QuorumEngine();
  });

  afterEach(() => {
    qum.clearAll();
  });

  describe('addMember / vote / check / remove', () => {
    it('should add member', () => {
      expect(qum.addMember('m1', 1)).toMatch(/^qum-/);
    });

    it('should default vote to abstain', () => {
      qum.addMember('m1', 1);
      expect(qum.getVote(qum.getAllMembers()[0].id)).toBe('abstain');
    });

    it('should mark as not voted', () => {
      qum.addMember('m1', 1);
      expect(qum.hasVoted(qum.getAllMembers()[0].id)).toBe(false);
    });

    it('should mark as active', () => {
      qum.addMember('m1', 1);
      expect(qum.isActive(qum.getAllMembers()[0].id)).toBe(true);
    });

    it('should vote yes', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.vote(id, 'yes')).toBe(true);
    });

    it('should set voted', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.hasVoted(id)).toBe(true);
    });

    it('should not vote inactive', () => {
      const id = qum.addMember('m1', 1);
      qum.setActive(id, false);
      expect(qum.vote(id, 'yes')).toBe(false);
    });

    it('should return false for unknown vote', () => {
      expect(qum.vote('unknown', 'yes')).toBe(false);
    });

    it('should check quorum', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.check(0.5)).toBe(true);
    });

    it('should not reach quorum', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'no');
      expect(qum.check(0.5)).toBe(false);
    });

    it('should return false for empty check', () => {
      expect(qum.check(0.5)).toBe(false);
    });

    it('should remove', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      qum.addMember('m1', 1);
      expect(qum.getStats().members).toBe(1);
    });

    it('should count total added', () => {
      qum.addMember('m1', 1);
      expect(qum.getStats().totalAdded).toBe(1);
    });

    it('should count total voted', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.getStats().totalVoted).toBe(1);
    });

    it('should count yes', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.getStats().yes).toBe(1);
    });

    it('should count no', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'no');
      expect(qum.getStats().no).toBe(1);
    });

    it('should count abstain', () => {
      qum.addMember('m1', 1);
      expect(qum.getStats().abstain).toBe(1);
    });

    it('should count voted', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.getStats().voted).toBe(1);
    });

    it('should count unvoted', () => {
      qum.addMember('m1', 1);
      expect(qum.getStats().unvoted).toBe(1);
    });

    it('should count active', () => {
      qum.addMember('m1', 1);
      expect(qum.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = qum.addMember('m1', 1);
      qum.setActive(id, false);
      expect(qum.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      qum.addMember('a', 1);
      qum.addMember('a', 1);
      expect(qum.getStats().uniqueNames).toBe(1);
    });

    it('should count total weight', () => {
      qum.addMember('m1', 5);
      expect(qum.getStats().totalWeight).toBe(5);
    });

    it('should count yes weight', () => {
      const id = qum.addMember('m1', 5);
      qum.vote(id, 'yes');
      expect(qum.getStats().yesWeight).toBe(5);
    });

    it('should count no weight', () => {
      const id = qum.addMember('m1', 5);
      qum.vote(id, 'no');
      expect(qum.getStats().noWeight).toBe(5);
    });
  });

  describe('queries', () => {
    it('should get member', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.getMember(id)?.name).toBe('m1');
    });

    it('should get all', () => {
      qum.addMember('m1', 1);
      expect(qum.getAllMembers()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.hasMember(id)).toBe(true);
    });

    it('should count', () => {
      expect(qum.getCount()).toBe(0);
      qum.addMember('m1', 1);
      expect(qum.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.getName(id)).toBe('m1');
    });

    it('should get weight', () => {
      const id = qum.addMember('m1', 5);
      expect(qum.getWeight(id)).toBe(5);
    });

    it('should get hits', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.getHits(id)).toBe(1);
    });

    it('should check yes', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.isYes(id)).toBe(true);
    });

    it('should check no', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'no');
      expect(qum.isNo(id)).toBe(true);
    });

    it('should check abstain', () => {
      qum.addMember('m1', 1);
      expect(qum.isAbstain(qum.getAllMembers()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.setName(id, 'm2')).toBe(true);
    });

    it('should set weight', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.setWeight(id, 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(qum.setActive('unknown', false)).toBe(false);
      expect(qum.setName('unknown', 'm')).toBe(false);
      expect(qum.setWeight('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      qum.setActive(id, false);
      qum.resetAll();
      expect(qum.hasVoted(id)).toBe(false);
      expect(qum.isActive(id)).toBe(true);
    });
  });

  describe('by vote / state', () => {
    it('should get by vote', () => {
      qum.addMember('m1', 1);
      expect(qum.getByVote('abstain')).toHaveLength(1);
    });

    it('should get voted', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.getVoted()).toHaveLength(1);
    });

    it('should get unvoted', () => {
      qum.addMember('m1', 1);
      expect(qum.getUnvoted()).toHaveLength(1);
    });

    it('should get active', () => {
      qum.addMember('m1', 1);
      expect(qum.getActiveMembers()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = qum.addMember('m1', 1);
      qum.setActive(id, false);
      expect(qum.getInactiveMembers()).toHaveLength(1);
    });

    it('should get all names', () => {
      qum.addMember('a', 1);
      qum.addMember('b', 1);
      expect(qum.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      qum.addMember('m1', 1);
      expect(qum.getNewest()?.name).toBe('m1');
    });

    it('should return null for empty newest', () => {
      expect(qum.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      qum.addMember('m1', 1);
      expect(qum.getOldest()?.name).toBe('m1');
    });

    it('should return null for empty oldest', () => {
      expect(qum.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = qum.addMember('m1', 1);
      expect(qum.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      qum.addMember('m1', 1);
      expect(qum.getTotalAdded()).toBe(1);
    });

    it('should get total voted', () => {
      const id = qum.addMember('m1', 1);
      qum.vote(id, 'yes');
      expect(qum.getTotalVoted()).toBe(1);
    });

    it('should get total weight', () => {
      qum.addMember('m1', 5);
      expect(qum.getTotalWeight()).toBe(5);
    });

    it('should get yes weight', () => {
      const id = qum.addMember('m1', 5);
      qum.vote(id, 'yes');
      expect(qum.getYesWeight()).toBe(5);
    });

    it('should get no weight', () => {
      const id = qum.addMember('m1', 5);
      qum.vote(id, 'no');
      expect(qum.getNoWeight()).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle many members', () => {
      for (let i = 0; i < 50; i++) {
        qum.addMember(`m${i}`, 1);
      }
      expect(qum.getCount()).toBe(50);
    });
  });
});