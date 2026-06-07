/**
 * ValidatorEngine Tests
 * claude-code-design Validator Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ValidatorEngine } from '../ValidatorEngine';

describe('ValidatorEngine', () => {
  let vle: ValidatorEngine;

  beforeEach(() => {
    vle = new ValidatorEngine();
  });

  afterEach(() => {
    vle.clearAll();
  });

  describe('add / validate / remove', () => {
    it('should add', () => {
      expect(vle.add('email', 'a@b.com')).toBe('vle-1');
    });

    it('should default result to pending', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getResult('vle-1')).toBe('pending');
    });

    it('should mark as active', () => {
      vle.add('email', 'a@b.com');
      expect(vle.isActive('vle-1')).toBe(true);
    });

    it('should validate', () => {
      vle.add('email', 'a@b.com');
      expect(vle.validate('vle-1')).toBe(true);
    });

    it('should validate email valid', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('valid');
    });

    it('should validate email invalid', () => {
      vle.add('email', 'bad');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('invalid');
    });

    it('should validate url valid', () => {
      vle.add('url', 'https://a.com');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('valid');
    });

    it('should validate url invalid', () => {
      vle.add('url', 'bad');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('invalid');
    });

    it('should validate number valid', () => {
      vle.add('number', '123');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('valid');
    });

    it('should validate number invalid', () => {
      vle.add('number', 'abc');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('invalid');
    });

    it('should validate non-empty valid', () => {
      vle.add('non-empty', 'x');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('valid');
    });

    it('should validate non-empty invalid', () => {
      vle.add('non-empty', '');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('invalid');
    });

    it('should return pending for unknown field', () => {
      vle.add('unknown', 'x');
      vle.validate('vle-1');
      expect(vle.getResult('vle-1')).toBe('pending');
    });

    it('should not validate inactive', () => {
      vle.add('email', 'a@b.com');
      vle.setActive('vle-1', false);
      expect(vle.validate('vle-1')).toBe(false);
    });

    it('should return false for unknown validate', () => {
      expect(vle.validate('unknown')).toBe(false);
    });

    it('should remove', () => {
      vle.add('email', 'a@b.com');
      expect(vle.remove('vle-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getStats().validations).toBe(1);
    });

    it('should count total added', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getStats().totalAdded).toBe(1);
    });

    it('should count total valid', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.getStats().totalValid).toBe(1);
    });

    it('should count total invalid', () => {
      vle.add('email', 'bad');
      vle.validate('vle-1');
      expect(vle.getStats().totalInvalid).toBe(1);
    });

    it('should count pending', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getStats().pending).toBe(1);
    });

    it('should count valid', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.getStats().valid).toBe(1);
    });

    it('should count invalid', () => {
      vle.add('email', 'bad');
      vle.validate('vle-1');
      expect(vle.getStats().invalid).toBe(1);
    });

    it('should count active', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      vle.add('email', 'a@b.com');
      vle.setActive('vle-1', false);
      expect(vle.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.getStats().totalHits).toBe(1);
    });

    it('should count unique fields', () => {
      vle.add('email', 'a@b.com');
      vle.add('email', 'b@c.com');
      expect(vle.getStats().uniqueFields).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get validation', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getValidation('vle-1')?.field).toBe('email');
    });

    it('should get all', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getAllValidations()).toHaveLength(1);
    });

    it('should check existence', () => {
      vle.add('email', 'a@b.com');
      expect(vle.hasValidation('vle-1')).toBe(true);
    });

    it('should count', () => {
      expect(vle.getCount()).toBe(0);
      vle.add('email', 'a@b.com');
      expect(vle.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get field', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getField('vle-1')).toBe('email');
    });

    it('should get value', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getValue('vle-1')).toBe('a@b.com');
    });

    it('should get reason', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.getReason('vle-1')).toBe('email format');
    });

    it('should get hits', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.getHits('vle-1')).toBe(1);
    });

    it('should check pending', () => {
      vle.add('email', 'a@b.com');
      expect(vle.isPending('vle-1')).toBe(true);
    });

    it('should check valid', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.isValid('vle-1')).toBe(true);
    });

    it('should check invalid', () => {
      vle.add('email', 'bad');
      vle.validate('vle-1');
      expect(vle.isInvalid('vle-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      vle.add('email', 'a@b.com');
      expect(vle.setActive('vle-1', false)).toBe(true);
    });

    it('should set field', () => {
      vle.add('email', 'a@b.com');
      expect(vle.setField('vle-1', 'url')).toBe(true);
    });

    it('should set value', () => {
      vle.add('email', 'a@b.com');
      expect(vle.setValue('vle-1', 'b@c.com')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(vle.setActive('unknown', false)).toBe(false);
      expect(vle.setField('unknown', 'f')).toBe(false);
      expect(vle.setValue('unknown', 'v')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      vle.setActive('vle-1', false);
      vle.resetAll();
      expect(vle.getResult('vle-1')).toBe('pending');
      expect(vle.isActive('vle-1')).toBe(true);
    });
  });

  describe('by result / field / state', () => {
    it('should get by result', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getByResult('pending')).toHaveLength(1);
    });

    it('should get by field', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getByField('email')).toHaveLength(1);
    });

    it('should get active', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getActiveValidations()).toHaveLength(1);
    });

    it('should get inactive', () => {
      vle.add('email', 'a@b.com');
      vle.setActive('vle-1', false);
      expect(vle.getInactiveValidations()).toHaveLength(1);
    });

    it('should get all fields', () => {
      vle.add('email', 'a@b.com');
      vle.add('url', 'https://a.com');
      expect(vle.getAllFields()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getNewest()?.id).toBe('vle-1');
    });

    it('should return null for empty newest', () => {
      expect(vle.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getOldest()?.id).toBe('vle-1');
    });

    it('should return null for empty oldest', () => {
      expect(vle.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getCreatedAt('vle-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.getUpdatedAt('vle-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      vle.add('email', 'a@b.com');
      expect(vle.getTotalAdded()).toBe(1);
    });

    it('should get total valid', () => {
      vle.add('email', 'a@b.com');
      vle.validate('vle-1');
      expect(vle.getTotalValid()).toBe(1);
    });

    it('should get total invalid', () => {
      vle.add('email', 'bad');
      vle.validate('vle-1');
      expect(vle.getTotalInvalid()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many validations', () => {
      for (let i = 0; i < 50; i++) {
        vle.add('email', `u${i}@b.com`);
      }
      expect(vle.getCount()).toBe(50);
    });
  });
});