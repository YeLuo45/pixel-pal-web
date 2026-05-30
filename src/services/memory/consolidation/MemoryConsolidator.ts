/**
 * V168: MemoryConsolidator - Memory Layer Consolidation
 * 
 * Scheduled consolidation job promoting/demoting memories between layers:
 * - L4 entries with accessCount > 3 AND importance > 60 → promote to L3
 * - L3 entries never accessed for 7 days → demote to L2
 * - L2 entries with importance < 20 AND accessCount = 0 → discard
 * - L0 entries with importance > 70 AND accessCount > 5 → promote to L1
 */

import type { MemoryEntry, Layer } from '../MemoryTypes';
import { DreamMemory } from '../DreamMemory';

export interface ConsolidationResult {
  promoted: string[];
  demoted: string[];
  discarded: string[];
  duration: number;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class MemoryConsolidator {
  private dm: DreamMemory;
  private scheduledInterval: ReturnType<typeof setInterval> | null = null;

  constructor(dm?: DreamMemory) {
    this.dm = dm || new DreamMemory();
  }

  /**
   * Perform consolidation based on layer-specific rules
   */
  consolidate(): ConsolidationResult {
    const startTime = Date.now();
    const result: ConsolidationResult = {
      promoted: [],
      demoted: [],
      discarded: [],
      duration: 0,
    };

    // L4 → L3: accessCount > 3 AND importance > 60
    this.promoteL4ToL3(result);

    // L3 → L2: never accessed for 7 days
    this.demoteL3ToL2(result);

    // L2 → discard: importance < 20 AND accessCount = 0
    this.discardL2Entries(result);

    // L0 → L1: importance > 70 AND accessCount > 5
    this.promoteL0ToL1(result);

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Promote L4 entries to L3
   */
  private promoteL4ToL3(result: ConsolidationResult): void {
    const store = this.dm.getStore();
    const l4Entries = store.l4.getAll();

    for (const entry of l4Entries) {
      if (entry.accessCount > 3 && entry.importance > 60) {
        // Create new entry in L3 with updated layer
        const promoted = this.dm.store({
          ...entry,
          layer: 'L3' as Layer,
        });
        // Remove from L4
        store.l4.remove(entry.id);
        result.promoted.push(entry.id);
      }
    }
  }

  /**
   * Demote L3 entries to L2 if not accessed for 7 days
   */
  private demoteL3ToL2(result: ConsolidationResult): void {
    const store = this.dm.getStore();
    const l3Entries = store.l3.getAll();
    const now = Date.now();

    for (const entry of l3Entries) {
      if (now - entry.lastAccessed > SEVEN_DAYS_MS) {
        // Create new entry in L2 with updated layer
        this.dm.store({
          ...entry,
          layer: 'L2' as Layer,
        });
        // Remove from L3
        store.l3.remove(entry.id);
        result.demoted.push(entry.id);
      }
    }
  }

  /**
   * Discard L2 entries with low importance and no access
   */
  private discardL2Entries(result: ConsolidationResult): void {
    const store = this.dm.getStore();
    const l2Entries = store.l2.getAll();

    for (const entry of l2Entries) {
      if (entry.importance < 20 && entry.accessCount === 0) {
        store.l2.remove(entry.id);
        result.discarded.push(entry.id);
      }
    }
  }

  /**
   * Promote L0 entries to L1
   */
  private promoteL0ToL1(result: ConsolidationResult): void {
    const store = this.dm.getStore();
    const l0Entries = store.l0.getAll();

    for (const entry of l0Entries) {
      if (entry.importance > 70 && entry.accessCount > 5) {
        // Create new entry in L1 with updated layer
        this.dm.store({
          ...entry,
          layer: 'L1' as Layer,
        });
        // Remove from L0
        store.l0.remove(entry.id);
        result.promoted.push(entry.id);
      }
    }
  }

  /**
   * Schedule periodic consolidation
   */
  schedule(intervalMs: number): ReturnType<typeof setInterval> {
    if (this.scheduledInterval) {
      clearInterval(this.scheduledInterval);
    }
    this.scheduledInterval = setInterval(() => {
      this.consolidate();
    }, intervalMs);
    return this.scheduledInterval;
  }

  /**
   * Stop scheduled consolidation
   */
  stopSchedule(): void {
    if (this.scheduledInterval) {
      clearInterval(this.scheduledInterval);
      this.scheduledInterval = null;
    }
  }

  /**
   * Get the consolidation rule descriptions
   */
  getRules(): string[] {
    return [
      'L4 entries with accessCount > 3 AND importance > 60 → promote to L3',
      'L3 entries never accessed for 7 days → demote to L2',
      'L2 entries with importance < 20 AND accessCount = 0 → discard',
      'L0 entries with importance > 70 AND accessCount > 5 → promote to L1',
    ];
  }
}