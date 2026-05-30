/**
 * V167: MemoryStore - Unified Interface
 * 
 * Provides a unified interface to query across all memory layers:
 * - L0: getRecent(limit)
 * - L1: getIndexed(tag), getByTags(tags)
 * - L2: getGlobal(predicate?)
 * - L3: getSkills()
 * - L4: getWorking()
 */

import type { MemoryEntry, MemoryFilter } from './MemoryTypes';
import { L0Meta } from './layers/L0Meta';
import { L1Index } from './layers/L1Index';
import { L2Global } from './layers/L2Global';
import { L3Skill } from './layers/L3Skill';
import { L4Session } from './layers/L4Session';

export class MemoryStore {
  readonly l0: L0Meta;
  readonly l1: L1Index;
  readonly l2: L2Global;
  readonly l3: L3Skill;
  readonly l4: L4Session;

  constructor() {
    this.l0 = new L0Meta();
    this.l1 = new L1Index();
    this.l2 = new L2Global();
    this.l3 = new L3Skill();
    this.l4 = new L4Session();
  }

  /**
   * Get recent memories from L0
   */
  getRecent(limit: number): MemoryEntry[] {
    return this.l0.getRecent(limit);
  }

  /**
   * Get memories indexed by tag from L1
   */
  getIndexed(tag: string): MemoryEntry[] {
    return this.l1.getIndexed(tag);
  }

  /**
   * Get memories by multiple tags from L1
   */
  getByTags(tags: string[]): MemoryEntry[] {
    return this.l1.getByTags(tags);
  }

  /**
   * Get global memories from L2 with optional predicate filter
   */
  getGlobal(predicate?: MemoryFilter): MemoryEntry[] {
    if (predicate) {
      return this.l2.searchGlobal(predicate);
    }
    return this.l2.getAll();
  }

  /**
   * Get skills from L3
   */
  getSkills(): MemoryEntry[] {
    return this.l3.getSkills();
  }

  /**
   * Get skills by category from L3
   */
  getSkillsByCategory(category: string): MemoryEntry[] {
    return this.l3.getSkillsByCategory(category);
  }

  /**
   * Get working memory from L4
   */
  getWorking(): MemoryEntry[] {
    return this.l4.getWorking();
  }

  /**
   * Get all memories from all layers
   */
  getAll(): MemoryEntry[] {
    return [
      ...this.l0.getAll(),
      ...this.l1.getAll(),
      ...this.l2.getAll(),
      ...this.l3.getAll(),
      ...this.l4.getAll(),
    ];
  }

  /**
   * Clear all layers (use with caution)
   */
  clearAll(): void {
    this.l0.clear();
    this.l1.clear();
    this.l2.clear();
    this.l3.clear();
    this.l4.clearWorking();
  }

  /**
   * Get total memory count across all layers
   */
  getTotalCount(): number {
    return (
      this.l0.size() +
      this.l1.size() +
      this.l2.size() +
      this.l3.size() +
      this.l4.size()
    );
  }

  /**
   * Destroy the store and clean up resources
   */
  destroy(): void {
    this.l0.destroy();
    this.clearAll();
  }
}