/**
 * EmpathyEngine Tests
 * generic-agent-design Empathy Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmpathyEngine } from '../EmpathyEngine';

describe('EmpathyEngine', () => {
  let eme: EmpathyEngine;

  beforeEach(() => {
    eme = new EmpathyEngine();
  });

  afterEach(() => {
    eme.clearAll();
  });

  describe('add / respond / remove', () => {
    it('should add', () => {
      expect(eme.add('sad', 'warm', 'I understand')).toMatch(/^eme-/);
    });

    it('should mark as active', () => {
      eme.add('sad', 'warm', 'I understand');
      expect(eme.isActive(eme.getAllEntries()[0].id)).toBe(true);
    });

    it('should respond', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.respond(id)).toBe('I understand');
    });

    it('should increment hits', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      eme.respond(id);
      expect(eme.getHits(id)).toBe(1);
    });

    it('should not respond inactive', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      eme.setActive(id, false);
      expect(eme.respond(id)).toBeNull();
    });

    it('should return null for unknown respond', () => {
      expect(eme.respond('unknown')).toBeNull();
    });

    it('should remove', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      eme.add('sad', 'warm', 'I understand');
      expect(eme.getStats().entries).toBe(1);
    });

    it('should count total added', () => {
      eme.add('sad', 'warm', 'I understand');
      expect(eme.getStats().totalAdded).toBe(1);
    });

    it('should count total responded', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      eme.respond(id);
      expect(eme.getStats().totalResponded).toBe(1);
    });

    it('should count warm', () => {
      eme.add('sad', 'warm', 'I understand');
      expect(eme.getStats().warm).toBe(1);
    });

    it('should count caring', () => {
      eme.add('sad', 'caring', 'I care');
      expect(eme.getStats().caring).toBe(1);
    });

    it('should count supportive', () => {
      eme.add('sad', 'supportive', 'I support');
      expect(eme.getStats().supportive).toBe(1);
    });

    it('should count compassionate', () => {
      eme.add('sad', 'compassionate', 'I feel');
      expect(eme.getStats().compassionate).toBe(1);
    });

    it('should count neutral', () => {
      eme.add('sad', 'neutral', 'I see');
      expect(eme.getStats().neutral).toBe(1);
    });

    it('should count active', () => {
      eme.add('sad', 'warm', 'I understand');
      expect(eme.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      eme.setActive(id, false);
      expect(eme.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      eme.respond(id);
      expect(eme.getStats().totalHits).toBe(1);
    });

    it('should count unique triggers', () => {
      eme.add('sad', 'warm', 'I');
      eme.add('sad', 'warm', 'I');
      expect(eme.getStats().uniqueTriggers).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get entry', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.getEntry(id)?.trigger).toBe('sad');
    });

    it('should get all', () => {
      eme.add('sad', 'warm', 'I understand');
      expect(eme.getAllEntries()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.hasEntry(id)).toBe(true);
    });

    it('should count', () => {
      expect(eme.getCount()).toBe(0);
      eme.add('sad', 'warm', 'I understand');
      expect(eme.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get trigger', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.getTrigger(id)).toBe('sad');
    });

    it('should get response', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.getResponse(id)).toBe('I understand');
    });

    it('should get hits', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      eme.respond(id);
      expect(eme.getHits(id)).toBe(1);
    });

    it('should check warm', () => {
      eme.add('sad', 'warm', 'I');
      expect(eme.isWarm(eme.getAllEntries()[0].id)).toBe(true);
    });

    it('should check caring', () => {
      eme.add('sad', 'caring', 'I');
      expect(eme.isCaring(eme.getAllEntries()[0].id)).toBe(true);
    });

    it('should check supportive', () => {
      eme.add('sad', 'supportive', 'I');
      expect(eme.isSupportive(eme.getAllEntries()[0].id)).toBe(true);
    });

    it('should check compassionate', () => {
      eme.add('sad', 'compassionate', 'I');
      expect(eme.isCompassionate(eme.getAllEntries()[0].id)).toBe(true);
    });

    it('should check neutral', () => {
      eme.add('sad', 'neutral', 'I');
      expect(eme.isNeutral(eme.getAllEntries()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.setActive(id, false)).toBe(true);
    });

    it('should set trigger', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.setTrigger(id, 'happy')).toBe(true);
    });

    it('should set tone', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.setTone(id, 'caring')).toBe(true);
    });

    it('should set response', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      expect(eme.setResponse(id, 'I hear')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(eme.setActive('unknown', false)).toBe(false);
      expect(eme.setTrigger('unknown', 't')).toBe(false);
      expect(eme.setTone('unknown', 'warm')).toBe(false);
      expect(eme.setResponse('unknown', 'r')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = eme.add('sad', 'warm', 'I understand');
      eme.respond(id);
      eme.setActive(id, false);
      eme.resetAll();
      expect(eme.getHits(id)).toBe(0);
      expect(eme.isActive(id)).toBe(true);
    });
  });

  describe('by tone / state', () => {
    it('should get by tone', () => {
      eme.add('sad', 'warm', 'I');
      expect(eme.getByTone('warm')).toHaveLength(1);
    });

    it('should get active', () => {
      eme.add('sad', 'warm', 'I');
      expect(eme.getActiveEntries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = eme.add('sad', 'warm', 'I');
      eme.setActive(id, false);
      expect(eme.getInactiveEntries()).toHaveLength(1);
    });

    it('should get all triggers', () => {
      eme.add('a', 'warm', 'I');
      eme.add('b', 'warm', 'I');
      expect(eme.getAllTriggers()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      eme.add('sad', 'warm', 'I');
      expect(eme.getNewest()?.trigger).toBe('sad');
    });

    it('should return null for empty newest', () => {
      expect(eme.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      eme.add('sad', 'warm', 'I');
      expect(eme.getOldest()?.trigger).toBe('sad');
    });

    it('should return null for empty oldest', () => {
      expect(eme.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = eme.add('sad', 'warm', 'I');
      expect(eme.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = eme.add('sad', 'warm', 'I');
      eme.respond(id);
      expect(eme.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      eme.add('sad', 'warm', 'I');
      expect(eme.getTotalAdded()).toBe(1);
    });

    it('should get total responded', () => {
      const id = eme.add('sad', 'warm', 'I');
      eme.respond(id);
      expect(eme.getTotalResponded()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        eme.add(`t${i}`, 'warm', 'I understand');
      }
      expect(eme.getCount()).toBe(50);
    });
  });
});