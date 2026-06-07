/**
 * TokenEngine Tests
 * nanobot-design Token Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TokenEngine } from '../TokenEngine';

describe('TokenEngine', () => {
  let tke: TokenEngine;

  beforeEach(() => {
    tke = new TokenEngine();
  });

  afterEach(() => {
    tke.clearAll();
  });

  describe('issue / verify / revoke / expire / remove', () => {
    it('should issue', () => {
      expect(tke.issue('alice', 3600000)).toMatch(/^tke-/);
    });

    it('should default state to valid', () => {
      tke.issue('alice', 3600000);
      expect(tke.getState(tke.getAllTokens()[0].id)).toBe('valid');
    });

    it('should mark as active', () => {
      tke.issue('alice', 3600000);
      expect(tke.isActive(tke.getAllTokens()[0].id)).toBe(true);
    });

    it('should verify', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.verify(id)).toBe(true);
    });

    it('should not verify revoked', () => {
      const id = tke.issue('alice', 3600000);
      tke.revoke(id);
      expect(tke.verify(id)).toBe(false);
    });

    it('should not verify inactive', () => {
      const id = tke.issue('alice', 3600000);
      tke.setActive(id, false);
      expect(tke.verify(id)).toBe(false);
    });

    it('should expire on verify when past expiresAt', () => {
      const id = tke.issue('alice', -1000);
      expect(tke.verify(id)).toBe(false);
    });

    it('should return false for unknown verify', () => {
      expect(tke.verify('unknown')).toBe(false);
    });

    it('should revoke', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.revoke(id)).toBe(true);
    });

    it('should set revoked', () => {
      const id = tke.issue('alice', 3600000);
      tke.revoke(id);
      expect(tke.isRevoked(id)).toBe(true);
    });

    it('should not revoke inactive', () => {
      const id = tke.issue('alice', 3600000);
      tke.setActive(id, false);
      expect(tke.revoke(id)).toBe(false);
    });

    it('should return false for unknown revoke', () => {
      expect(tke.revoke('unknown')).toBe(false);
    });

    it('should expire', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.expire(id)).toBe(true);
    });

    it('should set expired', () => {
      const id = tke.issue('alice', 3600000);
      tke.expire(id);
      expect(tke.isExpired(id)).toBe(true);
    });

    it('should return false for unknown expire', () => {
      expect(tke.expire('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      tke.issue('alice', 3600000);
      expect(tke.getStats().tokens).toBe(1);
    });

    it('should count total issued', () => {
      tke.issue('alice', 3600000);
      expect(tke.getStats().totalIssued).toBe(1);
    });

    it('should count total verified', () => {
      const id = tke.issue('alice', 3600000);
      tke.verify(id);
      expect(tke.getStats().totalVerified).toBe(1);
    });

    it('should count total revoked', () => {
      const id = tke.issue('alice', 3600000);
      tke.revoke(id);
      expect(tke.getStats().totalRevoked).toBe(1);
    });

    it('should count total expired', () => {
      const id = tke.issue('alice', -1000);
      tke.verify(id);
      expect(tke.getStats().totalExpired).toBe(1);
    });

    it('should count valid', () => {
      tke.issue('alice', 3600000);
      expect(tke.getStats().valid).toBe(1);
    });

    it('should count expired', () => {
      const id = tke.issue('alice', 3600000);
      tke.expire(id);
      expect(tke.getStats().expired).toBe(1);
    });

    it('should count revoked', () => {
      const id = tke.issue('alice', 3600000);
      tke.revoke(id);
      expect(tke.getStats().revoked).toBe(1);
    });

    it('should count active', () => {
      tke.issue('alice', 3600000);
      expect(tke.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tke.issue('alice', 3600000);
      tke.setActive(id, false);
      expect(tke.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tke.issue('alice', 3600000);
      tke.verify(id);
      expect(tke.getStats().totalHits).toBe(1);
    });

    it('should count unique subjects', () => {
      tke.issue('alice', 3600000);
      tke.issue('alice', 3600000);
      expect(tke.getStats().uniqueSubjects).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get token', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.getToken(id)?.subject).toBe('alice');
    });

    it('should get all', () => {
      tke.issue('alice', 3600000);
      expect(tke.getAllTokens()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.hasToken(id)).toBe(true);
    });

    it('should count', () => {
      expect(tke.getCount()).toBe(0);
      tke.issue('alice', 3600000);
      expect(tke.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get value', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.getValue(id)).toMatch(/^tok-/);
    });

    it('should get subject', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.getSubject(id)).toBe('alice');
    });

    it('should get expires at', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.getExpiresAt(id)).toBeGreaterThan(Date.now());
    });

    it('should get hits', () => {
      const id = tke.issue('alice', 3600000);
      tke.verify(id);
      expect(tke.getHits(id)).toBe(1);
    });

    it('should check valid', () => {
      tke.issue('alice', 3600000);
      expect(tke.isValid(tke.getAllTokens()[0].id)).toBe(true);
    });

    it('should check expired', () => {
      const id = tke.issue('alice', 3600000);
      tke.expire(id);
      expect(tke.isExpired(id)).toBe(true);
    });

    it('should check revoked', () => {
      const id = tke.issue('alice', 3600000);
      tke.revoke(id);
      expect(tke.isRevoked(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.setActive(id, false)).toBe(true);
    });

    it('should set subject', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.setSubject(id, 'bob')).toBe(true);
    });

    it('should set expires at', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.setExpiresAt(id, Date.now() + 7200000)).toBe(true);
    });

    it('should set state', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.setState(id, 'expired')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tke.setActive('unknown', false)).toBe(false);
      expect(tke.setSubject('unknown', 'b')).toBe(false);
      expect(tke.setExpiresAt('unknown', 0)).toBe(false);
      expect(tke.setState('unknown', 'valid')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = tke.issue('alice', 3600000);
      tke.verify(id);
      tke.setActive(id, false);
      tke.resetAll();
      expect(tke.isValid(id)).toBe(true);
      expect(tke.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      tke.issue('alice', 3600000);
      expect(tke.getByState('valid')).toHaveLength(1);
    });

    it('should get active', () => {
      tke.issue('alice', 3600000);
      expect(tke.getActiveTokens()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = tke.issue('alice', 3600000);
      tke.setActive(id, false);
      expect(tke.getInactiveTokens()).toHaveLength(1);
    });

    it('should get all subjects', () => {
      tke.issue('alice', 3600000);
      tke.issue('bob', 3600000);
      expect(tke.getAllSubjects()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      tke.issue('alice', 3600000);
      expect(tke.getNewest()?.subject).toBe('alice');
    });

    it('should return null for empty newest', () => {
      expect(tke.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tke.issue('alice', 3600000);
      expect(tke.getOldest()?.subject).toBe('alice');
    });

    it('should return null for empty oldest', () => {
      expect(tke.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = tke.issue('alice', 3600000);
      expect(tke.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tke.issue('alice', 3600000);
      tke.verify(id);
      expect(tke.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total issued', () => {
      tke.issue('alice', 3600000);
      expect(tke.getTotalIssued()).toBe(1);
    });

    it('should get total verified', () => {
      const id = tke.issue('alice', 3600000);
      tke.verify(id);
      expect(tke.getTotalVerified()).toBe(1);
    });

    it('should get total revoked', () => {
      const id = tke.issue('alice', 3600000);
      tke.revoke(id);
      expect(tke.getTotalRevoked()).toBe(1);
    });

    it('should get total expired', () => {
      const id = tke.issue('alice', -1000);
      tke.verify(id);
      expect(tke.getTotalExpired()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many tokens', () => {
      for (let i = 0; i < 50; i++) {
        tke.issue('alice', 3600000);
      }
      expect(tke.getCount()).toBe(50);
    });
  });
});