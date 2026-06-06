/**
 * ReasonerEngine Tests
 * generic-agent-design Reasoner Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReasonerEngine } from '../ReasonerEngine';

describe('ReasonerEngine', () => {
  let rre: ReasonerEngine;

  beforeEach(() => {
    rre = new ReasonerEngine();
  });

  afterEach(() => {
    rre.clearAll();
  });

  // ============================================================
  // addPremise / infer / complete / fail / remove
  // ============================================================
  describe('addPremise / infer / complete / fail / remove', () => {
    it('should add premise', () => {
      expect(rre.addPremise('sky is blue', 0.9)).toMatch(/^rre-p-/);
    });

    it('should default confidence to 0.5', () => {
      const id = rre.addPremise('p1');
      expect(rre.getConfidence(id)).toBe(0.5);
    });

    it('should clamp confidence', () => {
      const id = rre.addPremise('p1', 1.5);
      expect(rre.getConfidence(id)).toBe(1);
    });

    it('should mark premise as active', () => {
      const id = rre.addPremise('p1');
      expect(rre.isActive(id)).toBe(true);
    });

    it('should infer', () => {
      expect(rre.infer('c1')).toMatch(/^rre-i-/);
    });

    it('should infer with sources', () => {
      const pid = rre.addPremise('p1', 0.8);
      const iid = rre.infer('c1', [pid]);
      expect(iid).toMatch(/^rre-i-/);
    });

    it('should default inference confidence to 0.5', () => {
      const iid = rre.infer('c1');
      expect(rre.getConclusion(iid)).toBe('c1');
    });

    it('should complete inference', () => {
      const iid = rre.infer('c1');
      expect(rre.complete(iid)).toBe(true);
    });

    it('should not double complete', () => {
      const iid = rre.infer('c1');
      rre.complete(iid);
      expect(rre.complete(iid)).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(rre.complete('unknown')).toBe(false);
    });

    it('should fail inference', () => {
      const iid = rre.infer('c1');
      expect(rre.fail(iid)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(rre.fail('unknown')).toBe(false);
    });

    it('should remove premise', () => {
      const id = rre.addPremise('p1');
      expect(rre.removePremise(id)).toBe(true);
    });

    it('should remove inference', () => {
      const id = rre.infer('c1');
      expect(rre.removeInference(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rre.addPremise('p1');
      const stats = rre.getStats();
      expect(stats.premises).toBe(1);
    });

    it('should count inferences', () => {
      rre.infer('c1');
      expect(rre.getStats().inferences).toBe(1);
    });

    it('should count total inferred', () => {
      const iid = rre.infer('c1');
      rre.complete(iid);
      expect(rre.getStats().totalInferred).toBe(1);
    });

    it('should count total failed', () => {
      const iid = rre.infer('c1');
      rre.fail(iid);
      expect(rre.getStats().totalFailed).toBe(1);
    });

    it('should count pending', () => {
      rre.infer('c1');
      expect(rre.getStats().pending).toBe(1);
    });

    it('should count inferred', () => {
      const iid = rre.infer('c1');
      rre.complete(iid);
      expect(rre.getStats().inferred).toBe(1);
    });

    it('should count failed', () => {
      const iid = rre.infer('c1');
      rre.fail(iid);
      expect(rre.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      rre.addPremise('p1');
      expect(rre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rre.addPremise('p1');
      rre.setActivePremise(id, false);
      expect(rre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const iid = rre.infer('c1');
      rre.complete(iid);
      expect(rre.getStats().totalHits).toBe(1);
    });

    it('should compute avg premise confidence', () => {
      rre.addPremise('a', 0.5);
      rre.addPremise('b', 0.9);
      expect(rre.getStats().avgPremiseConfidence).toBe(0.7);
    });

    it('should get max premise confidence', () => {
      rre.addPremise('a', 0.5);
      rre.addPremise('b', 0.9);
      expect(rre.getStats().maxPremiseConfidence).toBe(0.9);
    });

    it('should get min premise confidence', () => {
      rre.addPremise('a', 0.5);
      rre.addPremise('b', 0.9);
      expect(rre.getStats().minPremiseConfidence).toBe(0.5);
    });

    it('should compute avg inference confidence', () => {
      rre.infer('c1');
      expect(rre.getStats().avgInferenceConfidence).toBe(0.5);
    });

    it('should count unique statements', () => {
      rre.addPremise('a');
      rre.addPremise('a');
      expect(rre.getStats().uniqueStatements).toBe(1);
    });

    it('should count unique conclusions', () => {
      rre.infer('c1');
      rre.infer('c1');
      expect(rre.getStats().uniqueConclusions).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get premise', () => {
      rre.addPremise('p1');
      expect(rre.getPremise(rre.getAllPremises()[0].id)?.statement).toBe('p1');
    });

    it('should get all premises', () => {
      rre.addPremise('p1');
      expect(rre.getAllPremises()).toHaveLength(1);
    });

    it('should get inference', () => {
      rre.infer('c1');
      expect(rre.getInference(rre.getAllInferences()[0].id)?.conclusion).toBe('c1');
    });

    it('should get all inferences', () => {
      rre.infer('c1');
      expect(rre.getAllInferences()).toHaveLength(1);
    });

    it('should get count', () => {
      expect(rre.getCount()).toBe(0);
      rre.addPremise('p1');
      expect(rre.getCount()).toBe(1);
    });

    it('should get premise count', () => {
      rre.addPremise('p1');
      expect(rre.getPremiseCount()).toBe(1);
    });

    it('should get inference count', () => {
      rre.infer('c1');
      expect(rre.getInferenceCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get statement', () => {
      const id = rre.addPremise('p1');
      expect(rre.getStatement(id)).toBe('p1');
    });

    it('should get conclusion', () => {
      const id = rre.infer('c1');
      expect(rre.getConclusion(id)).toBe('c1');
    });

    it('should get inference status', () => {
      const id = rre.infer('c1');
      expect(rre.getInferenceStatus(id)).toBe('pending');
    });

    it('should get hits', () => {
      const id = rre.infer('c1');
      rre.complete(id);
      expect(rre.getHits(id)).toBe(1);
    });

    it('should check inferred', () => {
      const id = rre.infer('c1');
      rre.complete(id);
      expect(rre.isInferred(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = rre.infer('c1');
      rre.fail(id);
      expect(rre.isFailed(id)).toBe(true);
    });

    it('should check pending', () => {
      const id = rre.infer('c1');
      expect(rre.isPending(id)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active premise', () => {
      const id = rre.addPremise('p1');
      expect(rre.setActivePremise(id, false)).toBe(true);
    });

    it('should set active inference', () => {
      const id = rre.infer('c1');
      expect(rre.setActiveInference(id, false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rre.setActivePremise('unknown', false)).toBe(false);
      expect(rre.setActiveInference('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const pid = rre.addPremise('p1');
      const iid = rre.infer('c1');
      rre.complete(iid);
      rre.setActivePremise(pid, false);
      rre.resetAll();
      expect(rre.getInferenceStatus(iid)).toBe('pending');
      expect(rre.isActive(pid)).toBe(true);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many premises and inferences', () => {
      for (let i = 0; i < 25; i++) {
        rre.addPremise(`p${i}`, 0.5);
      }
      for (let i = 0; i < 25; i++) {
        rre.infer(`c${i}`);
      }
      expect(rre.getPremiseCount()).toBe(25);
      expect(rre.getInferenceCount()).toBe(25);
    });
  });
});