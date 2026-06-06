/**
 * TokenManager Tests
 * thunderbolt-design Token Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TokenManager } from '../TokenManager';

describe('TokenManager', () => {
  let tke: TokenManager;

  beforeEach(() => {
    tke = new TokenManager();
  });

  afterEach(() => {
    tke.clearAll();
  });

  // ============================================================
  // issue / validate / revoke / remove / resetAll
  // ============================================================
  describe('issue / validate / revoke / remove / resetAll', () => {
    it('should issue', () => {
      expect(tke.issue('admin', 0)).toBe('tke-1');
    });

    it('should mark as active', () => {
      const id = tke.issue('admin', 0);
      expect(tke.isActive(id)).toBe(true);
    });

    it('should mark as valid', () => {
      const id = tke.issue('admin', 0);
      expect(tke.isValid(id)).toBe(true);
    });

    it('should accept custom value', () => {
      const id = tke.issue('admin', 0, 'my-token');
      expect(tke.getValue(id)).toBe('my-token');
    });

    it('should validate existing token', () => {
      tke.issue('admin', 0, 'my-token');
      expect(tke.validate('my-token')).toBe(true);
    });

    it('should not validate unknown token', () => {
      expect(tke.validate('unknown')).toBe(false);
    });

    it('should not validate inactive token', () => {
      const id = tke.issue('admin', 0, 'my-token');
      tke.setActive(id, false);
      expect(tke.validate('my-token')).toBe(false);
    });

    it('should revoke', () => {
      const id = tke.issue('admin', 0, 'my-token');
      expect(tke.revoke(id)).toBe(true);
    });

    it('should mark as invalid on revoke', () => {
      const id = tke.issue('admin', 0, 'my-token');
      tke.revoke(id);
      expect(tke.isValid(id)).toBe(false);
    });

    it('should not revoke already revoked', () => {
      const id = tke.issue('admin', 0, 'my-token');
      tke.revoke(id);
      expect(tke.revoke(id)).toBe(false);
    });

    it('should return false for unknown revoke', () => {
      expect(tke.revoke('unknown')).toBe(false);
    });

    it('should not validate revoked', () => {
      const id = tke.issue('admin', 0, 'my-token');
      tke.revoke(id);
      expect(tke.validate('my-token')).toBe(false);
    });

    it('should remove', () => {
      const id = tke.issue('admin', 0);
      expect(tke.remove(id)).toBe(true);
    });

    it('should reset all', () => {
      const id = tke.issue('admin', 0, 'my-token');
      tke.revoke(id);
      tke.resetAll();
      expect(tke.isValid(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      tke.issue('admin', 0);
      const stats = tke.getStats();
      expect(stats.tokens).toBe(1);
    });

    it('should count valid', () => {
      tke.issue('admin', 0);
      expect(tke.getStats().valid).toBe(1);
    });

    it('should count invalid', () => {
      const id = tke.issue('admin', 0);
      tke.revoke(id);
      expect(tke.getStats().invalid).toBe(1);
    });

    it('should count revoked', () => {
      const id = tke.issue('admin', 0);
      tke.revoke(id);
      expect(tke.getStats().revoked).toBe(1);
    });

    it('should count active', () => {
      tke.issue('admin', 0);
      expect(tke.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tke.issue('admin', 0);
      tke.setActive(id, false);
      expect(tke.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tke.issue('admin', 0, 'my-token');
      tke.validate('my-token');
      expect(tke.getStats().totalHits).toBe(1);
    });

    it('should count total validations', () => {
      tke.issue('admin', 0, 'my-token');
      tke.validate('my-token');
      expect(tke.getStats().totalValidations).toBe(1);
    });

    it('should count total revocations', () => {
      const id = tke.issue('admin', 0);
      tke.revoke(id);
      expect(tke.getStats().totalRevocations).toBe(1);
    });

    it('should count unique scopes', () => {
      tke.issue('admin', 0);
      tke.issue('user', 0);
      expect(tke.getStats().uniqueScopes).toBe(2);
    });

    it('should compute avg scope length', () => {
      tke.issue('admin', 0);
      expect(tke.getStats().avgScopeLength).toBe(5);
    });

    it('should compute avg value length', () => {
      tke.issue('admin', 0, 'my-token');
      expect(tke.getStats().avgValueLength).toBe(8);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get token', () => {
      tke.issue('admin', 0, 'my-token');
      expect(tke.getToken('tke-1')?.value).toBe('my-token');
    });

    it('should get all', () => {
      tke.issue('admin', 0);
      expect(tke.getAllTokens()).toHaveLength(1);
    });

    it('should check existence', () => {
      tke.issue('admin', 0);
      expect(tke.hasToken('tke-1')).toBe(true);
    });

    it('should count', () => {
      expect(tke.getCount()).toBe(0);
      tke.issue('admin', 0);
      expect(tke.getCount()).toBe(1);
    });

    it('should get by value', () => {
      tke.issue('admin', 0, 'my-token');
      expect(tke.getByValue('my-token')?.id).toBe('tke-1');
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get value', () => {
      tke.issue('admin', 0, 'my-token');
      expect(tke.getValue('tke-1')).toBe('my-token');
    });

    it('should get scope', () => {
      tke.issue('admin', 0);
      expect(tke.getScope('tke-1')).toBe('admin');
    });

    it('should get scope length', () => {
      tke.issue('admin', 0);
      expect(tke.getScopeLength('tke-1')).toBe(5);
    });

    it('should get value length', () => {
      tke.issue('admin', 0, 'my-token');
      expect(tke.getValueLength('tke-1')).toBe(8);
    });

    it('should get expires', () => {
      tke.issue('admin', 0);
      expect(tke.getExpires('tke-1')).toBe(0);
    });

    it('should get validated', () => {
      tke.issue('admin', 0, 'my-token');
      tke.validate('my-token');
      expect(tke.getValidated('tke-1')).toBe(1);
    });

    it('should get revoked', () => {
      const id = tke.issue('admin', 0);
      tke.revoke(id);
      expect(tke.getRevoked(id)).toBe(1);
    });

    it('should get history', () => {
      tke.issue('admin', 0, 'my-token');
      tke.validate('my-token');
      expect(tke.getHistory('tke-1')).toHaveLength(1);
    });

    it('should get hits', () => {
      tke.issue('admin', 0, 'my-token');
      tke.validate('my-token');
      expect(tke.getHits('tke-1')).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      tke.issue('admin', 0);
      expect(tke.setActive('tke-1', false)).toBe(true);
    });

    it('should set scope', () => {
      tke.issue('admin', 0);
      expect(tke.setScope('tke-1', 'user')).toBe(true);
    });

    it('should set expires', () => {
      tke.issue('admin', 0);
      expect(tke.setExpires('tke-1', 5000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tke.setActive('unknown', false)).toBe(false);
      expect(tke.setScope('unknown', 'admin')).toBe(false);
      expect(tke.setExpires('unknown', 1000)).toBe(false);
    });
  });

  // ============================================================
  // by scope / state
  // ============================================================
  describe('by scope / state', () => {
    it('should get by scope', () => {
      tke.issue('admin', 0);
      expect(tke.getByScope('admin')).toHaveLength(1);
    });

    it('should get active', () => {
      tke.issue('admin', 0);
      expect(tke.getActiveTokens()).toHaveLength(1);
    });

    it('should get inactive', () => {
      tke.issue('admin', 0);
      tke.setActive('tke-1', false);
      expect(tke.getInactiveTokens()).toHaveLength(1);
    });

    it('should get valid', () => {
      tke.issue('admin', 0);
      expect(tke.getValidTokens()).toHaveLength(1);
    });

    it('should get invalid', () => {
      const id = tke.issue('admin', 0);
      tke.revoke(id);
      expect(tke.getInvalidTokens()).toHaveLength(1);
    });

    it('should get all scopes', () => {
      tke.issue('admin', 0);
      tke.issue('user', 0);
      expect(tke.getAllScopes()).toHaveLength(2);
    });

    it('should get scope count', () => {
      tke.issue('admin', 0);
      expect(tke.getScopeCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      tke.issue('admin', 0);
      expect(tke.getNewest()?.id).toBe('tke-1');
    });

    it('should return null for empty newest', () => {
      expect(tke.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tke.issue('admin', 0);
      expect(tke.getOldest()?.id).toBe('tke-1');
    });

    it('should return null for empty oldest', () => {
      expect(tke.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      tke.issue('admin', 0);
      expect(tke.getCreatedAt('tke-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tke.issue('admin', 0);
      tke.revoke(id);
      expect(tke.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total validations', () => {
      tke.issue('admin', 0, 'my-token');
      tke.validate('my-token');
      expect(tke.getTotalValidations()).toBe(1);
    });

    it('should get total revocations', () => {
      const id = tke.issue('admin', 0);
      tke.revoke(id);
      expect(tke.getTotalRevocations()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many tokens', () => {
      for (let i = 0; i < 50; i++) {
        tke.issue('admin', 0);
      }
      expect(tke.getCount()).toBe(50);
    });
  });
});