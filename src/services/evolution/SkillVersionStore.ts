/**
 * V132 Skill Version Store — localStorage persistence for version history
 * 
 * Each version stored at: localStorage/skill-versions/{skillId}/{version}.json
 */

import type { SkillGenome, SkillVersion } from './SkillGenome';

const STORAGE_PREFIX = 'pixelpal_skill_versions';

/**
 * Get storage key for a skill version
 */
function getVersionKey(skillId: string, version: string): string {
  return `${STORAGE_PREFIX}/${skillId}/${version}`;
}

/**
 * Get storage key for skill genome
 */
function getGenomeKey(skillId: string): string {
  return `${STORAGE_PREFIX}/${skillId}/genome`;
}

/**
 * Save a skill version to localStorage
 */
export function saveVersion(skillId: string, version: SkillVersion): void {
  try {
    const key = getVersionKey(skillId, version.version);
    localStorage.setItem(key, JSON.stringify(version));
  } catch (err) {
    console.warn('[SkillVersionStore] Failed to save version:', err);
  }
}

/**
 * Load a specific version of a skill
 */
export function loadVersion(skillId: string, version: string): SkillVersion | null {
  try {
    const key = getVersionKey(skillId, version);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as SkillVersion;
    }
  } catch (err) {
    console.warn('[SkillVersionStore] Failed to load version:', err);
  }
  return null;
}

/**
 * Get all versions for a skill
 */
export function getVersions(skillId: string): SkillVersion[] {
  try {
    const prefix = `${STORAGE_PREFIX}/${skillId}/`;
    const versions: SkillVersion[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.endsWith('.json')) {
        // Extract version from key
        const versionMatch = key.match(/v\d+$/);
        if (versionMatch) {
          const version = loadVersion(skillId, versionMatch[0]);
          if (version) {
            versions.push(version);
          }
        }
      }
    }
    
    return versions.sort((a, b) => a.version.localeCompare(b.version));
  } catch (err) {
    console.warn('[SkillVersionStore] Failed to get versions:', err);
    return [];
  }
}

/**
 * Save skill genome to localStorage
 */
export function saveGenome(genome: SkillGenome): void {
  try {
    const key = getGenomeKey(genome.skillId);
    localStorage.setItem(key, JSON.stringify(genome));
  } catch (err) {
    console.warn('[SkillVersionStore] Failed to save genome:', err);
  }
}

/**
 * Load skill genome from localStorage
 */
export function loadGenome(skillId: string): SkillGenome | null {
  try {
    const key = getGenomeKey(skillId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as SkillGenome;
    }
  } catch (err) {
    console.warn('[SkillVersionStore] Failed to load genome:', err);
  }
  return null;
}

/**
 * Get all skill IDs that have version history
 */
export function getAllSkillIdsWithVersions(): string[] {
  const skillIds = new Set<string>();
  
  try {
    const prefix = `${STORAGE_PREFIX}/`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        // Extract skillId from key: pixelpal_skill_versions/{skillId}/genome
        const match = key.match(new RegExp(`${prefix}([^/]+)/genome`));
        if (match) {
          skillIds.add(match[1]);
        }
      }
    }
  } catch (err) {
    console.warn('[SkillVersionStore] Failed to get skill IDs:', err);
  }
  
  return Array.from(skillIds);
}

/**
 * Delete all version data for a skill
 */
export function deleteSkillVersions(skillId: string): void {
  try {
    const prefix = `${STORAGE_PREFIX}/${skillId}/`;
    const keysToDelete: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => localStorage.removeItem(key));
  } catch (err) {
    console.warn('[SkillVersionStore] Failed to delete versions:', err);
  }
}

/**
 * Check if localStorage has quota to store versions
 */
export function hasStorageQuota(): boolean {
  try {
    const testKey = `${STORAGE_PREFIX}/_test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}