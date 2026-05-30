/**
 * V168: SessionContextManager - Session Context Management
 * 
 * Manages active session context for LLM prompt injection:
 * - trackTurn(): Track user/agent conversation turns
 * - getSessionContext(): Retrieve memories relevant to current query
 * - getSessionSummary(): Get summary of current session
 * - injectContext(): Inject context into a prompt string
 */

import type { MemoryEntry, SessionSummary } from '../MemoryTypes';
import { DreamMemory } from '../DreamMemory';

export interface SessionSummary {
  sessionId: string;
  turnCount: number;
  keyMemories: MemoryEntry[];
  topicHints: string[];
  startTime: number;
}

interface Turn {
  user: string;
  agent: string;
  timestamp: number;
}

export class SessionContextManager {
  private dm: DreamMemory;
  private turns: Turn[] = [];
  private sessionId: string;
  private startTime: number;

  constructor(dm?: DreamMemory) {
    this.dm = dm || new DreamMemory();
    this.sessionId = crypto.randomUUID();
    this.startTime = Date.now();
  }

  /**
   * Track a conversation turn
   */
  trackTurn(userMsg: string, agentResp: string): void {
    this.turns.push({
      user: userMsg,
      agent: agentResp,
      timestamp: Date.now(),
    });
  }

  /**
   * Get memories relevant to the query from session context
   */
  getSessionContext(query: string, maxEntries: number = 10): MemoryEntry[] {
    // Search across all layers for relevant memories
    const allMemories = this.dm.search(query);
    
    // Also include session-specific memories from L4
    const sessionMemories = this.dm.getStore().l4.getAll();
    
    // Combine and dedupe
    const memoryMap = new Map<string, MemoryEntry>();
    for (const mem of sessionMemories) {
      memoryMap.set(mem.id, mem);
    }
    for (const mem of allMemories) {
      if (!memoryMap.has(mem.id)) {
        memoryMap.set(mem.id, mem);
      }
    }

    // Sort by importance and take top entries
    const combined = Array.from(memoryMap.values());
    combined.sort((a, b) => {
      // Prioritize session memories, then by importance
      const aSession = sessionMemories.some(s => s.id === a.id) ? 1 : 0;
      const bSession = sessionMemories.some(s => s.id === b.id) ? 1 : 0;
      if (aSession !== bSession) return bSession - aSession;
      return b.importance - a.importance;
    });

    return combined.slice(0, maxEntries);
  }

  /**
   * Get summary of current session
   */
  getSessionSummary(): SessionSummary {
    const sessionMemories = this.dm.getStore().l4.getAll();
    
    // Extract topic hints from tags
    const tagCounts = new Map<string, number>();
    for (const mem of sessionMemories) {
      for (const tag of mem.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
    const topicHints = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Get key memories (high importance session memories)
    const keyMemories = sessionMemories
      .filter(m => m.importance >= 60)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5);

    return {
      sessionId: this.sessionId,
      turnCount: this.turns.length,
      keyMemories,
      topicHints,
      startTime: this.startTime,
    };
  }

  /**
   * Inject session context into a prompt string
   */
  injectContext(prompt: string, maxEntries: number = 10): string {
    const memories = this.getSessionContext(prompt, maxEntries);
    
    if (memories.length === 0) {
      return prompt;
    }

    const contextSection = memories
      .map(m => `[${m.layer}:${m.importance}] ${m.content}`)
      .join('\n');

    const summary = this.getSessionSummary();
    const header = `--- Session Context (${summary.turnCount} turns, ${summary.topicHints.join(', ') || 'general'}) ---\n`;
    const footer = '\n--- End Context ---';

    return `${header}${contextSection}\n${footer}\n\n${prompt}`;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get the number of turns in this session
   */
  getTurnCount(): number {
    return this.turns.length;
  }

  /**
   * Reset the session (start fresh)
   */
  reset(): void {
    this.turns = [];
    this.sessionId = crypto.randomUUID();
    this.startTime = Date.now();
    this.dm.getStore().l4.clearWorking();
  }

  /**
   * Get all turns in this session
   */
  getTurns(): Turn[] {
    return [...this.turns];
  }
}