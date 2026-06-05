/**
 * ConsensusEngine Tests
 * nanobot-design Consensus Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConsensusEngine } from '../ConsensusEngine';

describe('ConsensusEngine', () => {
  let engine: ConsensusEngine;

  beforeEach(() => {
    engine = new ConsensusEngine();
  });

  afterEach(() => {
    engine.clearAll();
  });

  // ============================================================
  // propose
  // ============================================================
  describe('propose', () => {
    it('should create proposal', () => {
      const id = engine.propose('test');
      expect(id).toBe('prop-1');
    });
  });

  // ============================================================
  // vote
  // ============================================================
  describe('vote', () => {
    it('should vote', () => {
      const id = engine.propose('test');
      expect(engine.vote(id, 'v1', 'yes')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(engine.vote('unknown', 'v1', 'yes')).toBe(false);
    });

    it('should update existing vote', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      engine.vote(id, 'v1', 'no');
      expect(engine.getNoCount(id)).toBe(1);
    });

    it('should not allow voting on finalized', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      engine.vote(id, 'v2', 'yes');
      engine.finalize(id);
      expect(engine.vote(id, 'v3', 'yes')).toBe(false);
    });
  });

  // ============================================================
  // tally
  // ============================================================
  describe('tally', () => {
    it('should tally yes', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      engine.vote(id, 'v2', 'yes');
      expect(engine.tally(id)).toBe('yes');
    });

    it('should tally no', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'no');
      engine.vote(id, 'v2', 'no');
      expect(engine.tally(id)).toBe('no');
    });

    it('should tally tie', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      engine.vote(id, 'v2', 'no');
      expect(engine.tally(id)).toBe('tie');
    });

    it('should return tie for unknown', () => {
      expect(engine.tally('unknown')).toBe('tie');
    });
  });

  // ============================================================
  // audit
  // ============================================================
  describe('audit', () => {
    it('should audit', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      const result = engine.audit(id);
      expect(result?.votes).toHaveLength(1);
    });

    it('should return null for unknown', () => {
      expect(engine.audit('unknown')).toBeNull();
    });
  });

  // ============================================================
  // finalize
  // ============================================================
  describe('finalize', () => {
    it('should finalize approved', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      engine.vote(id, 'v2', 'yes');
      expect(engine.finalize(id)).toBe(true);
      expect(engine.getProposal(id)?.status).toBe('approved');
    });

    it('should finalize rejected', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'no');
      engine.vote(id, 'v2', 'no');
      expect(engine.finalize(id)).toBe(true);
      expect(engine.getProposal(id)?.status).toBe('rejected');
    });

    it('should return false for unknown', () => {
      expect(engine.finalize('unknown')).toBe(false);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get proposal', () => {
      engine.propose('test');
      expect(engine.getProposal('prop-1')?.title).toBe('test');
    });

    it('should get all', () => {
      engine.propose('a');
      engine.propose('b');
      expect(engine.getAllProposals()).toHaveLength(2);
    });

    it('should remove', () => {
      const id = engine.propose('test');
      expect(engine.removeProposal(id)).toBe(true);
    });

    it('should check existence', () => {
      engine.propose('test');
      expect(engine.hasProposal('prop-1')).toBe(true);
    });

    it('should count', () => {
      engine.propose('a');
      expect(engine.getCount()).toBe(1);
    });
  });

  // ============================================================
  // vote queries
  // ============================================================
  describe('vote queries', () => {
    it('should get votes', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      expect(engine.getVotes(id)).toHaveLength(1);
    });

    it('should get vote count', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      expect(engine.getVoteCount(id)).toBe(1);
    });

    it('should get yes count', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      expect(engine.getYesCount(id)).toBe(1);
    });

    it('should get no count', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'no');
      expect(engine.getNoCount(id)).toBe(1);
    });

    it('should get abstain count', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'abstain');
      expect(engine.getAbstainCount(id)).toBe(1);
    });
  });

  // ============================================================
  // status filters
  // ============================================================
  describe('status filters', () => {
    it('should get approved', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      engine.vote(id, 'v2', 'yes');
      engine.finalize(id);
      expect(engine.getApprovedProposals()).toHaveLength(1);
    });

    it('should get rejected', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'no');
      engine.vote(id, 'v2', 'no');
      engine.finalize(id);
      expect(engine.getRejectedProposals()).toHaveLength(1);
    });

    it('should get pending', () => {
      engine.propose('test');
      expect(engine.getPendingProposals()).toHaveLength(1);
    });

    it('should get by status', () => {
      engine.propose('test');
      expect(engine.getByStatus('pending')).toHaveLength(1);
    });
  });

  // ============================================================
  // voter checks
  // ============================================================
  describe('voter checks', () => {
    it('should check hasVoted', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      expect(engine.hasVoted(id, 'v1')).toBe(true);
    });

    it('should get voter choice', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      expect(engine.getVoterChoice(id, 'v1')).toBe('yes');
    });

    it('should return null for unknown', () => {
      const id = engine.propose('test');
      expect(engine.getVoterChoice(id, 'unknown')).toBeNull();
    });
  });

  // ============================================================
  // approval rate
  // ============================================================
  describe('approval rate', () => {
    it('should return 0 for empty', () => {
      expect(engine.getApprovalRate()).toBe(0);
    });

    it('should calculate', () => {
      const id1 = engine.propose('a');
      engine.vote(id1, 'v1', 'yes');
      engine.vote(id1, 'v2', 'yes');
      engine.finalize(id1);
      expect(engine.getApprovalRate()).toBe(1);
    });
  });

  // ============================================================
  // status checks
  // ============================================================
  describe('status checks', () => {
    it('should check isApproved', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      engine.vote(id, 'v2', 'yes');
      engine.finalize(id);
      expect(engine.isApproved(id)).toBe(true);
    });

    it('should check isRejected', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'no');
      engine.vote(id, 'v2', 'no');
      engine.finalize(id);
      expect(engine.isRejected(id)).toBe(true);
    });

    it('should check isPending', () => {
      engine.propose('test');
      expect(engine.isPending('prop-1')).toBe(true);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      engine.propose('test');
      expect(engine.getCreatedAt('prop-1')).toBeGreaterThan(0);
    });

    it('should get finalized at', () => {
      const id = engine.propose('test');
      engine.vote(id, 'v1', 'yes');
      engine.finalize(id);
      expect(engine.getFinalizedAt(id)).toBeGreaterThan(0);
    });

    it('should return 0 for not finalized', () => {
      engine.propose('test');
      expect(engine.getFinalizedAt('prop-1')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many proposals', () => {
      for (let i = 0; i < 50; i++) {
        engine.propose(`p${i}`);
      }
      expect(engine.getCount()).toBe(50);
    });
  });
});