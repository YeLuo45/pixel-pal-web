/**
 * ManifestEngine Tests
 * claude-code-design Manifest Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ManifestEngine } from '../ManifestEngine';

describe('ManifestEngine', () => {
  let mfe: ManifestEngine;

  beforeEach(() => {
    mfe = new ManifestEngine();
  });

  afterEach(() => {
    mfe.clearAll();
  });

  describe('create / sign / verify / remove', () => {
    it('should create', () => {
      expect(mfe.create('m1', '1.0.0', '{}')).toMatch(/^mfe-/);
    });

    it('should default format to json', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getFormat(mfe.getAllManifests()[0].id)).toBe('json');
    });

    it('should default signed to false', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.isSigned(mfe.getAllManifests()[0].id)).toBe(false);
    });

    it('should mark as active', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.isActive(mfe.getAllManifests()[0].id)).toBe(true);
    });

    it('should sign', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.sign(id)).toBe(true);
    });

    it('should not sign twice', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.sign(id)).toBe(false);
    });

    it('should return false for unknown sign', () => {
      expect(mfe.sign('unknown')).toBe(false);
    });

    it('should verify signed', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.verify(id)).toBe(true);
    });

    it('should verify unsigned as false', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.verify(id)).toBe(false);
    });

    it('should not verify inactive', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      mfe.setActive(id, false);
      expect(mfe.verify(id)).toBe(false);
    });

    it('should return false for unknown verify', () => {
      expect(mfe.verify('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getStats().manifests).toBe(1);
    });

    it('should count total created', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getStats().totalCreated).toBe(1);
    });

    it('should count total signed', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.getStats().totalSigned).toBe(1);
    });

    it('should count total verified', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      mfe.verify(id);
      expect(mfe.getStats().totalVerified).toBe(1);
    });

    it('should count json', () => {
      mfe.create('m1', '1.0.0', '{}', 'json');
      expect(mfe.getStats().json).toBe(1);
    });

    it('should count yaml', () => {
      mfe.create('m1', '1.0.0', 'a:', 'yaml');
      expect(mfe.getStats().yaml).toBe(1);
    });

    it('should count xml', () => {
      mfe.create('m1', '1.0.0', '<a/>', 'xml');
      expect(mfe.getStats().xml).toBe(1);
    });

    it('should count active', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.setActive(id, false);
      expect(mfe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      mfe.create('a', '1.0.0', '{}');
      mfe.create('a', '1.0.0', '{}');
      expect(mfe.getStats().uniqueNames).toBe(1);
    });

    it('should count unique versions', () => {
      mfe.create('a', '1.0.0', '{}');
      mfe.create('a', '1.0.0', '{}');
      expect(mfe.getStats().uniqueVersions).toBe(1);
    });

    it('should count total content len', () => {
      mfe.create('m1', '1.0.0', 'hi');
      expect(mfe.getStats().totalContentLen).toBe(2);
    });

    it('should count signed', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.getStats().signed).toBe(1);
    });

    it('should count unsigned', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getStats().unsigned).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get manifest', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getManifest(id)?.name).toBe('m1');
    });

    it('should get all', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getAllManifests()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.hasManifest(id)).toBe(true);
    });

    it('should count', () => {
      expect(mfe.getCount()).toBe(0);
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getName(id)).toBe('m1');
    });

    it('should get version', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getVersion(id)).toBe('1.0.0');
    });

    it('should get content', () => {
      const id = mfe.create('m1', '1.0.0', 'hi');
      expect(mfe.getContent(id)).toBe('hi');
    });

    it('should get hits', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.getHits(id)).toBe(1);
    });

    it('should check json', () => {
      mfe.create('m1', '1.0.0', '{}', 'json');
      expect(mfe.isJson(mfe.getAllManifests()[0].id)).toBe(true);
    });

    it('should check yaml', () => {
      mfe.create('m1', '1.0.0', 'a:', 'yaml');
      expect(mfe.isYaml(mfe.getAllManifests()[0].id)).toBe(true);
    });

    it('should check xml', () => {
      mfe.create('m1', '1.0.0', '<a/>', 'xml');
      expect(mfe.isXml(mfe.getAllManifests()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.setName(id, 'm2')).toBe(true);
    });

    it('should set version', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.setVersion(id, '2.0.0')).toBe(true);
    });

    it('should set content', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.setContent(id, 'new')).toBe(true);
    });

    it('should set format', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.setFormat(id, 'yaml')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mfe.setActive('unknown', false)).toBe(false);
      expect(mfe.setName('unknown', 'm')).toBe(false);
      expect(mfe.setVersion('unknown', 'v')).toBe(false);
      expect(mfe.setContent('unknown', 'c')).toBe(false);
      expect(mfe.setFormat('unknown', 'json')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      mfe.setActive(id, false);
      mfe.resetAll();
      expect(mfe.isSigned(id)).toBe(false);
      expect(mfe.isActive(id)).toBe(true);
    });
  });

  describe('by format / state', () => {
    it('should get by format', () => {
      mfe.create('m1', '1.0.0', 'a:', 'yaml');
      expect(mfe.getByFormat('yaml')).toHaveLength(1);
    });

    it('should get signed', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.getSignedManifests()).toHaveLength(1);
    });

    it('should get unsigned', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getUnsignedManifests()).toHaveLength(1);
    });

    it('should get active', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getActiveManifests()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.setActive(id, false);
      expect(mfe.getInactiveManifests()).toHaveLength(1);
    });

    it('should get all names', () => {
      mfe.create('a', '1.0.0', '{}');
      mfe.create('b', '1.0.0', '{}');
      expect(mfe.getAllNames()).toHaveLength(2);
    });

    it('should get all versions', () => {
      mfe.create('a', '1.0.0', '{}');
      mfe.create('b', '2.0.0', '{}');
      expect(mfe.getAllVersions()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getNewest()?.name).toBe('m1');
    });

    it('should return null for empty newest', () => {
      expect(mfe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getOldest()?.name).toBe('m1');
    });

    it('should return null for empty oldest', () => {
      expect(mfe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total created', () => {
      mfe.create('m1', '1.0.0', '{}');
      expect(mfe.getTotalCreated()).toBe(1);
    });

    it('should get total signed', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      expect(mfe.getTotalSigned()).toBe(1);
    });

    it('should get total verified', () => {
      const id = mfe.create('m1', '1.0.0', '{}');
      mfe.sign(id);
      mfe.verify(id);
      expect(mfe.getTotalVerified()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many manifests', () => {
      for (let i = 0; i < 50; i++) {
        mfe.create(`m${i}`, '1.0.0', '{}');
      }
      expect(mfe.getCount()).toBe(50);
    });
  });
});