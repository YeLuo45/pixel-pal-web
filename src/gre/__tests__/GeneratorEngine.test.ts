/**
 * GeneratorEngine Tests
 * claude-code-design Generator Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeneratorEngine } from '../GeneratorEngine';

describe('GeneratorEngine', () => {
  let gre: GeneratorEngine;

  beforeEach(() => {
    gre = new GeneratorEngine();
  });

  afterEach(() => {
    gre.clearAll();
  });

  describe('generate / validate / remove', () => {
    it('should generate', () => {
      expect(gre.generate('token', 16)).toMatch(/^gre-/);
    });

    it('should default length to 16', () => {
      gre.generate('token');
      expect(gre.getLength(gre.getAllResults()[0].id)).toBe(16);
    });

    it('should mark as active', () => {
      gre.generate('token');
      expect(gre.isActive(gre.getAllResults()[0].id)).toBe(true);
    });

    it('should validate', () => {
      const id = gre.generate('token');
      expect(gre.validate(id)).toBe(true);
    });

    it('should not validate inactive', () => {
      const id = gre.generate('token');
      gre.setActive(id, false);
      expect(gre.validate(id)).toBe(false);
    });

    it('should return false for unknown validate', () => {
      expect(gre.validate('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = gre.generate('token');
      expect(gre.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      gre.generate('token');
      expect(gre.getStats().results).toBe(1);
    });

    it('should count total generated', () => {
      gre.generate('token');
      expect(gre.getStats().totalGenerated).toBe(1);
    });

    it('should count total validated', () => {
      const id = gre.generate('token');
      gre.validate(id);
      expect(gre.getStats().totalValidated).toBe(1);
    });

    it('should count uuid', () => {
      gre.generate('uuid', 32);
      expect(gre.getStats().uuid).toBe(1);
    });

    it('should count token', () => {
      gre.generate('token');
      expect(gre.getStats().token).toBe(1);
    });

    it('should count password', () => {
      gre.generate('password');
      expect(gre.getStats().password).toBe(1);
    });

    it('should count code', () => {
      gre.generate('code');
      expect(gre.getStats().code).toBe(1);
    });

    it('should count slug', () => {
      gre.generate('slug');
      expect(gre.getStats().slug).toBe(1);
    });

    it('should count active', () => {
      gre.generate('token');
      expect(gre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = gre.generate('token');
      gre.setActive(id, false);
      expect(gre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = gre.generate('token');
      gre.validate(id);
      expect(gre.getStats().totalHits).toBe(1);
    });

    it('should count total length', () => {
      gre.generate('token', 10);
      expect(gre.getStats().totalLength).toBe(10);
    });
  });

  describe('queries', () => {
    it('should get result', () => {
      const id = gre.generate('token');
      expect(gre.getResult(id)?.type).toBe('token');
    });

    it('should get all', () => {
      gre.generate('token');
      expect(gre.getAllResults()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = gre.generate('token');
      expect(gre.hasResult(id)).toBe(true);
    });

    it('should count', () => {
      expect(gre.getCount()).toBe(0);
      gre.generate('token');
      expect(gre.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get value', () => {
      const id = gre.generate('token', 10);
      expect(gre.getValue(id)).toBeDefined();
      expect(gre.getValue(id)!.length).toBe(10);
    });

    it('should get type', () => {
      const id = gre.generate('token');
      expect(gre.getType(id)).toBe('token');
    });

    it('should get length', () => {
      const id = gre.generate('token', 10);
      expect(gre.getLength(id)).toBe(10);
    });

    it('should get hits', () => {
      const id = gre.generate('token');
      gre.validate(id);
      expect(gre.getHits(id)).toBe(1);
    });

    it('should check uuid', () => {
      gre.generate('uuid', 32);
      expect(gre.isUUID(gre.getAllResults()[0].id)).toBe(true);
    });

    it('should check token', () => {
      gre.generate('token');
      expect(gre.isToken(gre.getAllResults()[0].id)).toBe(true);
    });

    it('should check password', () => {
      gre.generate('password');
      expect(gre.isPassword(gre.getAllResults()[0].id)).toBe(true);
    });

    it('should check code', () => {
      gre.generate('code');
      expect(gre.isCode(gre.getAllResults()[0].id)).toBe(true);
    });

    it('should check slug', () => {
      gre.generate('slug');
      expect(gre.isSlug(gre.getAllResults()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = gre.generate('token');
      expect(gre.setActive(id, false)).toBe(true);
    });

    it('should set type', () => {
      const id = gre.generate('token');
      expect(gre.setType(id, 'uuid')).toBe(true);
    });

    it('should set value', () => {
      const id = gre.generate('token');
      expect(gre.setValue(id, 'custom')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(gre.setActive('unknown', false)).toBe(false);
      expect(gre.setType('unknown', 'token')).toBe(false);
      expect(gre.setValue('unknown', 'v')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = gre.generate('token');
      gre.setActive(id, false);
      gre.resetAll();
      expect(gre.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      gre.generate('uuid', 32);
      expect(gre.getByType('uuid')).toHaveLength(1);
    });

    it('should get active', () => {
      gre.generate('token');
      expect(gre.getActiveResults()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = gre.generate('token');
      gre.setActive(id, false);
      expect(gre.getInactiveResults()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      gre.generate('token');
      expect(gre.getNewest()?.type).toBe('token');
    });

    it('should return null for empty newest', () => {
      expect(gre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      gre.generate('token');
      expect(gre.getOldest()?.type).toBe('token');
    });

    it('should return null for empty oldest', () => {
      expect(gre.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = gre.generate('token');
      expect(gre.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = gre.generate('token');
      gre.validate(id);
      expect(gre.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total generated', () => {
      gre.generate('token');
      expect(gre.getTotalGenerated()).toBe(1);
    });

    it('should get total validated', () => {
      const id = gre.generate('token');
      gre.validate(id);
      expect(gre.getTotalValidated()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many results', () => {
      for (let i = 0; i < 50; i++) {
        gre.generate('token');
      }
      expect(gre.getCount()).toBe(50);
    });
  });
});