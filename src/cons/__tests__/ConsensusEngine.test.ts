/**
 * ConsensusEngine Tests
 * chatdev-design Consensus Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConsensusEngine } from '../ConsensusEngine';

describe('ConsensusEngine', () => {
  let ce: ConsensusEngine;

  beforeEach(() => {
    ce = new ConsensusEngine();
  });

  afterEach(() => {
    ce.clearAll();
  });

  // ============================================================
  // propose / vote / decide
  // ============================================================
  describe('propose / vote / decide', () => {
    it('should propose', () => {
      expect(ce.propose('topic1')).toBe('cons-1');
    });

    it('should mark as active', () => {
      const id = ce.propose('topic1');
      expect(ce.isActive(id)).toBe(true);
    });

    it('should vote', () => {
      const id = ce.propose('topic1');
      expect(ce.vote(id, 'voter1', 'yes')).toBe(true);
    });

    it('should not vote twice', () => {
      const id = ce.propose('topic1');
      ce.vote(id, 'voter1', 'yes');
      expect(ce.vote(id, 'voter1', 'no')).toBe(false);
    });

    it('should not vote decided', () => {
      const id = ce.propose('topic1');
      ce.vote(id, 'voter1', 'yes');
      ce.decide(id, 0.5);
      expect(ce.vote(id, 'voter2', 'yes')).toBe(false);
    });

    it('should not vote inactive', () => {
      const id = ce.propose('topic1');
      ce.setActive(id, false);
      expect(ce.vote(id, 'voter1', 'yes')).toBe(false);
    });

    it('should return false for unknown vote', () => {
      expect(ce.vote('unknown', 'voter1', 'yes')).toBe(false);
    });

    it('should decide', () => {
      const id = ce.propose('topic1');
      ce.vote(id, 'voter1', 'yes');
      expect(ce.decide(id, 0.5)).toBe(true);
    });

    it('should mark as passed when threshold met', () => {
      const id = ce.propose('topic1');
      ce.vote(id, 'voter1', 'yes');
      ce.vote(id, 'voter2', 'yes');
      ce.decide(id, 0.5);
      expect(ce.isPassed(id)).toBe(true);
    });

    it('should mark as failed when threshold not met', () => {
      const id = ce.propose('topic1');
      ce.vote(id, 'voter1', 'no');
      ce.vote(id, 'voter2', 'no');
      ce.decide(id, 0.5);
      expect(ce.isPassed(id)).toBe(false);
    });

    it('should not decide without votes', () => {
      const id = ce.propose('topic1');
      expect(ce.decide(id, 0.5)).toBe(false);
    });

    it('should not decide already decided', () => {
      const id = ce.propose('topic1');
      ce.vote(id, 'voter1', 'yes');
      ce.decide(id, 0.5);
      expect(ce.decide(id, 0.5)).toBe(false);
    });

    it('should return false for unknown decide', () => {
      expect(ce.decide('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ce.propose('t1');
      const stats = ce.getStats();
      expect(stats.proposals).toBe(1);
    });

    it('should count passed', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      ce.decide(id, 0.5);
      expect(ce.getStats().passed).toBe(1);
    });

    it('should count failed', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'no');
      ce.decide(id, 0.5);
      expect(ce.getStats().failed).toBe(1);
    });

    it('should count pending', () => {
      ce.propose('t1');
      expect(ce.getStats().pending).toBe(1);
    });

    it('should count total votes', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      ce.vote(id, 'v2', 'no');
      expect(ce.getStats().totalVotes).toBe(2);
    });

    it('should count total yes', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getStats().totalYes).toBe(1);
    });

    it('should count total no', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'no');
      expect(ce.getStats().totalNo).toBe(1);
    });

    it('should count total abstain', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'abstain');
      expect(ce.getStats().totalAbstain).toBe(1);
    });

    it('should count active', () => {
      ce.propose('t1');
      expect(ce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ce.propose('t1');
      ce.setActive(id, false);
      expect(ce.getStats().inactive).toBe(1);
    });

    it('should compute pass rate', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      ce.decide(id, 0.5);
      expect(ce.getStats().passRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get proposal', () => {
      ce.propose('t1');
      expect(ce.getProposal('cons-1')?.topic).toBe('t1');
    });

    it('should get all', () => {
      ce.propose('t1');
      expect(ce.getAllProposals()).toHaveLength(1);
    });

    it('should remove', () => {
      ce.propose('t1');
      expect(ce.removeProposal('cons-1')).toBe(true);
    });

    it('should check existence', () => {
      ce.propose('t1');
      expect(ce.hasProposal('cons-1')).toBe(true);
    });

    it('should count', () => {
      expect(ce.getCount()).toBe(0);
      ce.propose('t1');
      expect(ce.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get topic', () => {
      ce.propose('t1');
      expect(ce.getTopic('cons-1')).toBe('t1');
    });

    it('should get votes', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getYesCount(id)).toBe(1);
    });

    it('should get yes count', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getYesCount(id)).toBe(1);
    });

    it('should get no count', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'no');
      expect(ce.getNoCount(id)).toBe(1);
    });

    it('should get abstain count', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'abstain');
      expect(ce.getAbstainCount(id)).toBe(1);
    });

    it('should get total votes', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getTotalVotes(id)).toBe(1);
    });

    it('should get voter count', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getVoterCount(id)).toBe(1);
    });

    it('should get voters', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getVoters(id)).toContain('v1');
    });

    it('should get voter choice', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getVoterChoice(id, 'v1')).toBe('yes');
    });

    it('should get history', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getHistory(id)).toEqual(['yes']);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isDecided', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      ce.decide(id, 0.5);
      expect(ce.isDecided(id)).toBe(true);
    });

    it('should check isPassed', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      ce.decide(id, 0.5);
      expect(ce.isPassed(id)).toBe(true);
    });

    it('should check isActive', () => {
      ce.propose('t1');
      expect(ce.isActive('cons-1')).toBe(true);
    });

    it('should check isPending', () => {
      ce.propose('t1');
      expect(ce.isPending('cons-1')).toBe(true);
    });

    it('should check hasVoted', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.hasVoted(id, 'v1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = ce.propose('t1');
      expect(ce.setActive(id, false)).toBe(true);
    });

    it('should set topic', () => {
      const id = ce.propose('t1');
      expect(ce.setTopic(id, 't2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ce.setActive('unknown', false)).toBe(false);
      expect(ce.setTopic('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset votes', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.resetVotes(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ce.resetVotes('unknown')).toBe(false);
    });

    it('should reset all', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      ce.decide(id, 0.5);
      ce.setActive(id, false);
      ce.resetAll();
      expect(ce.getTotalVotes(id)).toBe(0);
      expect(ce.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by topic / state
  // ============================================================
  describe('by topic / state', () => {
    it('should get by topic', () => {
      ce.propose('t1');
      expect(ce.getByTopic('t1')).toHaveLength(1);
    });

    it('should get passed', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      ce.decide(id, 0.5);
      expect(ce.getPassedProposals()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'no');
      ce.decide(id, 0.5);
      expect(ce.getFailedProposals()).toHaveLength(1);
    });

    it('should get pending', () => {
      ce.propose('t1');
      expect(ce.getPendingProposals()).toHaveLength(1);
    });

    it('should get active', () => {
      ce.propose('t1');
      expect(ce.getActiveProposals()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ce.propose('t1');
      ce.setActive(id, false);
      expect(ce.getInactiveProposals()).toHaveLength(1);
    });

    it('should get all topics', () => {
      ce.propose('t1');
      ce.propose('t2');
      expect(ce.getAllTopics()).toHaveLength(2);
    });

    it('should get topic count', () => {
      ce.propose('t1');
      expect(ce.getTopicCount()).toBe(1);
    });

    it('should get by min votes', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getByMinVotes(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most votes', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      ce.vote(id, 'v2', 'no');
      expect(ce.getMostVotes()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ce.getMostVotes()).toBeNull();
    });

    it('should get newest', () => {
      ce.propose('t1');
      expect(ce.getNewest()?.id).toBe('cons-1');
    });

    it('should return null for empty newest', () => {
      expect(ce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ce.propose('t1');
      expect(ce.getOldest()?.id).toBe('cons-1');
    });

    it('should return null for empty oldest', () => {
      expect(ce.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ce.propose('t1');
      expect(ce.getCreatedAt('cons-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ce.propose('t1');
      ce.vote(id, 'v1', 'yes');
      expect(ce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many proposals', () => {
      for (let i = 0; i < 50; i++) {
        ce.propose(`t${i}`);
      }
      expect(ce.getCount()).toBe(50);
    });
  });
});