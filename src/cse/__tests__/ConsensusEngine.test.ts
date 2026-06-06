/**
 * ConsensusEngine Tests
 * nanobot-design Consensus Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConsensusEngine } from '../ConsensusEngine';

describe('ConsensusEngine', () => {
  let cse: ConsensusEngine;

  beforeEach(() => {
    cse = new ConsensusEngine();
  });

  afterEach(() => {
    cse.clearAll();
  });

  // ============================================================
  // propose / vote / resolve / remove
  // ============================================================
  describe('propose / vote / resolve / remove', () => {
    it('should propose', () => {
      expect(cse.propose('p1', 'desc')).toBe('cse-1');
    });

    it('should default description to empty', () => {
      const id = cse.propose('p1');
      expect(cse.getDescription(id)).toBe('');
    });

    it('should default status to pending', () => {
      const id = cse.propose('p1');
      expect(cse.getStatus(id)).toBe('pending');
    });

    it('should mark as active', () => {
      const id = cse.propose('p1');
      expect(cse.isActive(id)).toBe(true);
    });

    it('should vote approve', () => {
      const id = cse.propose('p1');
      expect(cse.vote(id, 'alice', true)).toBe(true);
    });

    it('should vote reject', () => {
      const id = cse.propose('p1');
      expect(cse.vote(id, 'alice', false)).toBe(true);
    });

    it('should not double vote', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      expect(cse.vote(id, 'alice', false)).toBe(false);
    });

    it('should not vote on inactive', () => {
      const id = cse.propose('p1');
      cse.setActive(id, false);
      expect(cse.vote(id, 'alice', true)).toBe(false);
    });

    it('should not vote on resolved', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.resolve(id);
      expect(cse.vote(id, 'bob', true)).toBe(false);
    });

    it('should return false for unknown vote', () => {
      expect(cse.vote('unknown', 'alice', true)).toBe(false);
    });

    it('should resolve approve', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.vote(id, 'bob', true);
      expect(cse.resolve(id)).toBe(true);
    });

    it('should resolve reject', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', false);
      cse.vote(id, 'bob', true);
      expect(cse.resolve(id)).toBe(true);
    });

    it('should not resolve already resolved', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.resolve(id);
      expect(cse.resolve(id)).toBe(false);
    });

    it('should return false for unknown resolve', () => {
      expect(cse.resolve('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = cse.propose('p1');
      expect(cse.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      cse.propose('p1');
      const stats = cse.getStats();
      expect(stats.proposals).toBe(1);
    });

    it('should count total approved', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.resolve(id);
      expect(cse.getStats().totalApproved).toBe(1);
    });

    it('should count total rejected', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', false);
      cse.resolve(id);
      expect(cse.getStats().totalRejected).toBe(1);
    });

    it('should count pending', () => {
      cse.propose('p1');
      expect(cse.getStats().pending).toBe(1);
    });

    it('should count approved', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.resolve(id);
      expect(cse.getStats().approved).toBe(1);
    });

    it('should count rejected', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', false);
      cse.resolve(id);
      expect(cse.getStats().rejected).toBe(1);
    });

    it('should count active', () => {
      cse.propose('p1');
      expect(cse.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = cse.propose('p1');
      cse.setActive(id, false);
      expect(cse.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      expect(cse.getStats().totalHits).toBe(1);
    });

    it('should count unique titles', () => {
      cse.propose('a');
      cse.propose('b');
      expect(cse.getStats().uniqueTitles).toBe(2);
    });

    it('should count total votes', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.vote(id, 'bob', false);
      expect(cse.getStats().totalVotes).toBe(2);
    });

    it('should compute avg votes', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      expect(cse.getStats().avgVotes).toBe(1);
    });

    it('should get max votes', () => {
      const id1 = cse.propose('p1');
      const id2 = cse.propose('p2');
      cse.vote(id1, 'a', true);
      cse.vote(id2, 'a', true);
      cse.vote(id2, 'b', true);
      expect(cse.getStats().maxVotes).toBe(2);
    });

    it('should get min votes', () => {
      cse.propose('p1');
      expect(cse.getStats().minVotes).toBe(0);
    });

    it('should count unique voters', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.vote(id, 'bob', false);
      expect(cse.getStats().uniqueVoters).toBe(2);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get proposal', () => {
      cse.propose('p1');
      expect(cse.getProposal('cse-1')?.title).toBe('p1');
    });

    it('should get all', () => {
      cse.propose('p1');
      expect(cse.getAllProposals()).toHaveLength(1);
    });

    it('should check existence', () => {
      cse.propose('p1');
      expect(cse.hasProposal('cse-1')).toBe(true);
    });

    it('should count', () => {
      expect(cse.getCount()).toBe(0);
      cse.propose('p1');
      expect(cse.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get title', () => {
      cse.propose('p1');
      expect(cse.getTitle('cse-1')).toBe('p1');
    });

    it('should get votes', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      expect(cse.getVotes(id)).toHaveLength(1);
    });

    it('should get vote count', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      expect(cse.getVoteCount(id)).toBe(1);
    });

    it('should get approve count', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.vote(id, 'bob', false);
      expect(cse.getApproveCount(id)).toBe(1);
    });

    it('should get reject count', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.vote(id, 'bob', false);
      expect(cse.getRejectCount(id)).toBe(1);
    });

    it('should get hits', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      expect(cse.getHits(id)).toBe(1);
    });

    it('should check approved', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.resolve(id);
      expect(cse.isApproved(id)).toBe(true);
    });

    it('should check rejected', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', false);
      cse.resolve(id);
      expect(cse.isRejected(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      cse.propose('p1');
      expect(cse.setActive('cse-1', false)).toBe(true);
    });

    it('should set title', () => {
      cse.propose('p1');
      expect(cse.setTitle('cse-1', 'p2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cse.setActive('unknown', false)).toBe(false);
      expect(cse.setTitle('unknown', 'p')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.resolve(id);
      cse.setActive(id, false);
      cse.resetAll();
      expect(cse.getStatus(id)).toBe('pending');
      expect(cse.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by status / state
  // ============================================================
  describe('by status / state', () => {
    it('should get by status', () => {
      cse.propose('p1');
      expect(cse.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      cse.propose('p1');
      expect(cse.getActiveProposals()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cse.propose('p1');
      cse.setActive('cse-1', false);
      expect(cse.getInactiveProposals()).toHaveLength(1);
    });

    it('should get all titles', () => {
      cse.propose('a');
      cse.propose('b');
      expect(cse.getAllTitles()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      cse.propose('p1');
      expect(cse.getNewest()?.id).toBe('cse-1');
    });

    it('should return null for empty newest', () => {
      expect(cse.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cse.propose('p1');
      expect(cse.getOldest()?.id).toBe('cse-1');
    });

    it('should return null for empty oldest', () => {
      expect(cse.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      cse.propose('p1');
      expect(cse.getCreatedAt('cse-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      expect(cse.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total approved', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', true);
      cse.resolve(id);
      expect(cse.getTotalApproved()).toBe(1);
    });

    it('should get total rejected', () => {
      const id = cse.propose('p1');
      cse.vote(id, 'alice', false);
      cse.resolve(id);
      expect(cse.getTotalRejected()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many proposals', () => {
      for (let i = 0; i < 50; i++) {
        cse.propose(`p${i}`);
      }
      expect(cse.getCount()).toBe(50);
    });
  });
});