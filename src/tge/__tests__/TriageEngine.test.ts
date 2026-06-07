/**
 * TriageEngine Tests
 * nanobot-design Triage Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TriageEngine } from '../TriageEngine';

describe('TriageEngine', () => {
  let tge: TriageEngine;

  beforeEach(() => {
    tge = new TriageEngine();
  });

  afterEach(() => {
    tge.clearAll();
  });

  describe('add / triage / remove', () => {
    it('should add', () => {
      expect(tge.add('subject1')).toMatch(/^tge-/);
    });

    it('should default level to medium', () => {
      tge.add('subject1');
      expect(tge.getLevel(tge.getAllItems()[0].id)).toBe('medium');
    });

    it('should mark as active', () => {
      tge.add('subject1');
      expect(tge.isActive(tge.getAllItems()[0].id)).toBe(true);
    });

    it('should default unassigned', () => {
      tge.add('subject1');
      expect(tge.isAssigned(tge.getAllItems()[0].id)).toBe(false);
    });

    it('should triage', () => {
      const id = tge.add('subject1');
      expect(tge.triage(id, 'high', 'alice')).toBe(true);
    });

    it('should set level on triage', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.isHigh(id)).toBe(true);
    });

    it('should set assignee on triage', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getAssignee(id)).toBe('alice');
    });

    it('should not triage inactive', () => {
      const id = tge.add('subject1');
      tge.setActive(id, false);
      expect(tge.triage(id, 'high', 'alice')).toBe(false);
    });

    it('should return false for unknown triage', () => {
      expect(tge.triage('unknown', 'high', 'alice')).toBe(false);
    });

    it('should remove', () => {
      const id = tge.add('subject1');
      expect(tge.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      tge.add('subject1');
      expect(tge.getStats().items).toBe(1);
    });

    it('should count total added', () => {
      tge.add('subject1');
      expect(tge.getStats().totalAdded).toBe(1);
    });

    it('should count total triaged', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getStats().totalTriaged).toBe(1);
    });

    it('should count critical', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'critical', 'alice');
      expect(tge.getStats().critical).toBe(1);
    });

    it('should count high', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getStats().high).toBe(1);
    });

    it('should count medium', () => {
      tge.add('subject1');
      expect(tge.getStats().medium).toBe(1);
    });

    it('should count low', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'low', 'alice');
      expect(tge.getStats().low).toBe(1);
    });

    it('should count deferred', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'deferred', 'alice');
      expect(tge.getStats().deferred).toBe(1);
    });

    it('should count assigned', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getStats().assigned).toBe(1);
    });

    it('should count unassigned', () => {
      tge.add('subject1');
      expect(tge.getStats().unassigned).toBe(1);
    });

    it('should count active', () => {
      tge.add('subject1');
      expect(tge.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tge.add('subject1');
      tge.setActive(id, false);
      expect(tge.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getStats().totalHits).toBe(1);
    });

    it('should count unique subjects', () => {
      tge.add('a');
      tge.add('a');
      expect(tge.getStats().uniqueSubjects).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get item', () => {
      const id = tge.add('subject1');
      expect(tge.getItem(id)?.subject).toBe('subject1');
    });

    it('should get all', () => {
      tge.add('subject1');
      expect(tge.getAllItems()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = tge.add('subject1');
      expect(tge.hasItem(id)).toBe(true);
    });

    it('should count', () => {
      expect(tge.getCount()).toBe(0);
      tge.add('subject1');
      expect(tge.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get subject', () => {
      const id = tge.add('hello');
      expect(tge.getSubject(id)).toBe('hello');
    });

    it('should get hits', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getHits(id)).toBe(1);
    });

    it('should check critical', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'critical', 'alice');
      expect(tge.isCritical(id)).toBe(true);
    });

    it('should check high', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.isHigh(id)).toBe(true);
    });

    it('should check medium', () => {
      tge.add('subject1');
      expect(tge.isMedium(tge.getAllItems()[0].id)).toBe(true);
    });

    it('should check low', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'low', 'alice');
      expect(tge.isLow(id)).toBe(true);
    });

    it('should check deferred', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'deferred', 'alice');
      expect(tge.isDeferred(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = tge.add('subject1');
      expect(tge.setActive(id, false)).toBe(true);
    });

    it('should set subject', () => {
      const id = tge.add('subject1');
      expect(tge.setSubject(id, 'subject2')).toBe(true);
    });

    it('should set level', () => {
      const id = tge.add('subject1');
      expect(tge.setLevel(id, 'high')).toBe(true);
    });

    it('should set assignee', () => {
      const id = tge.add('subject1');
      expect(tge.setAssignee(id, 'bob')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tge.setActive('unknown', false)).toBe(false);
      expect(tge.setSubject('unknown', 's')).toBe(false);
      expect(tge.setLevel('unknown', 'high')).toBe(false);
      expect(tge.setAssignee('unknown', 'a')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      tge.setActive(id, false);
      tge.resetAll();
      expect(tge.isMedium(id)).toBe(true);
      expect(tge.isActive(id)).toBe(true);
    });
  });

  describe('by level / state', () => {
    it('should get by level', () => {
      tge.add('subject1');
      expect(tge.getByLevel('medium')).toHaveLength(1);
    });

    it('should get assigned', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getAssignedItems()).toHaveLength(1);
    });

    it('should get unassigned', () => {
      tge.add('subject1');
      expect(tge.getUnassignedItems()).toHaveLength(1);
    });

    it('should get active', () => {
      tge.add('subject1');
      expect(tge.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = tge.add('subject1');
      tge.setActive(id, false);
      expect(tge.getInactiveItems()).toHaveLength(1);
    });

    it('should get all subjects', () => {
      tge.add('a');
      tge.add('b');
      expect(tge.getAllSubjects()).toHaveLength(2);
    });

    it('should get all assignees', () => {
      const id1 = tge.add('s1');
      const id2 = tge.add('s2');
      tge.triage(id1, 'high', 'alice');
      tge.triage(id2, 'low', 'alice');
      expect(tge.getAllAssignees()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      tge.add('subject1');
      expect(tge.getNewest()?.subject).toBe('subject1');
    });

    it('should return null for empty newest', () => {
      expect(tge.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tge.add('subject1');
      expect(tge.getOldest()?.subject).toBe('subject1');
    });

    it('should return null for empty oldest', () => {
      expect(tge.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = tge.add('subject1');
      expect(tge.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      tge.add('subject1');
      expect(tge.getTotalAdded()).toBe(1);
    });

    it('should get total triaged', () => {
      const id = tge.add('subject1');
      tge.triage(id, 'high', 'alice');
      expect(tge.getTotalTriaged()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many items', () => {
      for (let i = 0; i < 50; i++) {
        tge.add(`s${i}`);
      }
      expect(tge.getCount()).toBe(50);
    });
  });
});