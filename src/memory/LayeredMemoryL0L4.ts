/**
 * V186: LayeredMemoryL0L4 - 5-layer memory interface
 * 
 * L0 (Immediate): Current session token window, in-memory
 * L1 (Episodic): Recent N sessions, IndexedDB, emotional tagging
 * L2 (Semantic): Vector search + keyword index, long-term knowledge
 * L3 (Procedural): Behavioral patterns, habits, skills
 * L4 (Meta): Learning strategies, memory compression, self-evolution
 */

import { 
  DreamMemoryStore, 
  getDreamMemoryStore,
  type DreamMemory,
  type SessionMemory,
  type SemanticMemory,
  type ProceduralPattern,
  type MetaStrategy,
  type RecallQuery,
  type RecallResult,
  type ConsolidationReport,
  type MemoryLayer,
  type LayerLevel,
} from './DreamMemoryStore';

// ============================================================================
// Configuration
// ============================================================================

export interface LayerConfig {
  /** L0: Max items in immediate memory */
  L0MaxSize: number;
  /** L1: Number of recent sessions to keep */
  L1MaxSessions: number;
  /** L1: Days to retain episodic memories */
  L1RetentionDays: number;
  /** L2: Max semantic entries */
  L2MaxEntries: number;
  /** L3: Max procedural patterns */
  L3MaxPatterns: number;
  /** L4: Meta strategy update interval */
  L4UpdateIntervalMs: number;
  /** Consolidation batch size */
  consolidationBatchSize: number;
  /** Auto-consolidation interval */
  autoConsolidationIntervalMs: number;
}

const DEFAULT_CONFIG: LayerConfig = {
  L0MaxSize: 100,
  L1MaxSessions: 50,
  L1RetentionDays: 7,
  L2MaxEntries: 1000,
  L3MaxPatterns: 200,
  L4UpdateIntervalMs: 3600000, // 1 hour
  consolidationBatchSize: 10,
  autoConsolidationIntervalMs: 300000, // 5 minutes
};

// ============================================================================
// LayeredMemoryL0L4
// ============================================================================

export class LayeredMemoryL0L4 {
  private store: DreamMemoryStore;
  private config: LayerConfig;
  private isRunning: boolean = false;
  private maintenanceInterval: ReturnType<typeof setInterval> | null = null;
  private consolidationInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<LayerConfig> = {}) {
    this.store = getDreamMemoryStore();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start automatic maintenance
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Periodic maintenance
    this.maintenanceInterval = setInterval(() => {
      this.runMaintenance().catch(console.error);
    }, this.config.autoConsolidationIntervalMs);

    // Periodic consolidation
    this.consolidationInterval = setInterval(() => {
      this.consolidate().catch(console.error);
    }, this.config.L4UpdateIntervalMs);
  }

  /**
   * Stop automatic maintenance
   */
  stop(): void {
    if (this.maintenanceInterval !== null) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }
    if (this.consolidationInterval !== null) {
      clearInterval(this.consolidationInterval);
      this.consolidationInterval = null;
    }
    this.isRunning = false;
  }

  // ===========================================================================
  // L0: Immediate Memory (In-Memory, session-scoped)
  // ===========================================================================

  /**
   * Store immediate memory
   */
  storeImmediate(key: string, value: unknown): void {
    this.store.setImmediate(key, value);
    
    // Enforce L0 size limit
    const keys = this.getImmediateKeys();
    if (keys.length > this.config.L0MaxSize) {
      const oldestKey = keys[0];
      this.store.clearImmediate(oldestKey);
    }
  }

  /**
   * Retrieve immediate memory
   */
  recallImmediate(key: string): unknown {
    return this.store.getImmediate(key);
  }

  /**
   * Get all immediate memory keys
   */
  getImmediateKeys(): string[] {
    // Access the internal L0 store
    const allMemories = this.store.getAll();
    return allMemories.filter(m => m.layerLevel === 'L0').map(m => m.id);
  }

  /**
   * Clear immediate memory
   */
  clearImmediate(key?: string): void {
    this.store.clearImmediate(key);
  }

  /**
   * Get immediate memory stats
   */
  getL0Stats(): { size: number; maxSize: number; utilization: number } {
    const keys = this.getImmediateKeys();
    return {
      size: keys.length,
      maxSize: this.config.L0MaxSize,
      utilization: keys.length / this.config.L0MaxSize,
    };
  }

  // ===========================================================================
  // L1: Episodic Memory (Session-based)
  // ===========================================================================

  /**
   * Store episodic memory (session)
   */
  async storeEpisode(session: SessionMemory): Promise<void> {
    await this.store.saveSession(session);
    
    // Enforce L1 retention limit
    const sessions = await this.store.getRecentSessions(this.config.L1MaxSessions + 1);
    if (sessions.length > this.config.L1MaxSessions) {
      const toDelete = sessions.slice(this.config.L1MaxSessions);
      for (const s of toDelete) {
        await this.store.deleteSession(s.sessionId);
      }
    }
  }

  /**
   * Recall episodic memories
   */
  async recallEpisodes(limit?: number): Promise<SessionMemory[]> {
    return this.store.getRecentSessions(limit ?? this.config.L1MaxSessions);
  }

  /**
   * Get specific episode
   */
  async getEpisode(sessionId: string): Promise<SessionMemory | null> {
    return this.store.getSession(sessionId);
  }

  /**
   * Tag episode with emotion
   */
  async tagEpisodeEmotion(sessionId: string, emotionTag: string): Promise<void> {
    const session = await this.store.getSession(sessionId);
    if (session) {
      session.emotionTag = emotionTag;
      await this.store.saveSession(session);
    }
  }

  /**
   * Get L1 stats
   */
  async getL1Stats(): Promise<{ sessionCount: number; maxSessions: number; oldestSession: number | null }> {
    const sessions = await this.store.getRecentSessions(this.config.L1MaxSessions);
    return {
      sessionCount: sessions.length,
      maxSessions: this.config.L1MaxSessions,
      oldestSession: sessions.length > 0 ? sessions[sessions.length - 1].timestamp : null,
    };
  }

  // ===========================================================================
  // L2: Semantic Memory (Knowledge, vector search)
  // ===========================================================================

  /**
   * Add semantic memory
   */
  async addSemantic(content: string, keywords?: string[], embedding?: Uint8Array): Promise<string> {
    const semantic: Omit<SemanticMemory, 'id'> = {
      content,
      keywords: keywords ?? this.extractKeywords(content),
      embedding: embedding ?? null,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
    };
    
    return this.store.addSemantic(semantic);
  }

  /**
   * Search semantic memories
   */
  async searchSemantic(query: string, limit?: number): Promise<SemanticMemory[]> {
    return this.store.searchSemantic(query, limit ?? 20);
  }

  /**
   * Get semantic memory by ID
   */
  async getSemantic(id: string | number): Promise<SemanticMemory | null> {
    return this.store.getSemanticById(id);
  }

  /**
   * Get L2 stats
   */
  async getL2Stats(): Promise<{ entryCount: number; maxEntries: number; utilization: number }> {
    const all = await this.store.getAll<SemanticMemory>('layer_l2_semantic' as any);
    return {
      entryCount: all.length,
      maxEntries: this.config.L2MaxEntries,
      utilization: all.length / this.config.L2MaxEntries,
    };
  }

  // ===========================================================================
  // L3: Procedural Memory (Patterns, habits, skills)
  // ===========================================================================

  /**
   * Store procedural pattern
   */
  async storePattern(pattern: ProceduralPattern): Promise<void> {
    await this.store.storePattern(pattern);
  }

  /**
   * Get patterns by context
   */
  async getProcedures(context?: string): Promise<ProceduralPattern[]> {
    return this.store.getPatterns(context);
  }

  /**
   * Get specific pattern
   */
  async getProcedure(patternId: string): Promise<ProceduralPattern | null> {
    return this.store.getPatternById(patternId);
  }

  /**
   * Update pattern success rate
   */
  async updatePatternSuccess(patternId: string, success: boolean): Promise<void> {
    const pattern = await this.store.getPatternById(patternId);
    if (pattern) {
      const newRate = success 
        ? (pattern.successRate * pattern.usageCount + 1) / (pattern.usageCount + 1)
        : (pattern.successRate * pattern.usageCount) / (pattern.usageCount + 1);
      
      await this.store.updatePattern(patternId, {
        successRate: newRate,
        usageCount: pattern.usageCount + 1,
      });
    }
  }

  /**
   * Get L3 stats
   */
  async getL3Stats(): Promise<{ patternCount: number; maxPatterns: number; avgSuccessRate: number }> {
    const patterns = await this.store.getPatterns();
    const avgSuccess = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length 
      : 0;
    
    return {
      patternCount: patterns.length,
      maxPatterns: this.config.L3MaxPatterns,
      avgSuccessRate: avgSuccess,
    };
  }

  // ===========================================================================
  // L4: Meta Memory (Self-evolution, learning strategies)
  // ===========================================================================

  /**
   * Update meta strategy
   */
  async updateMetaStrategy(strategy: MetaStrategy): Promise<void> {
    await this.store.updateMetaStrategy(strategy);
  }

  /**
   * Get meta strategies
   */
  async getMetaStrategies(strategyType?: string): Promise<MetaStrategy | MetaStrategy[] | null> {
    return this.store.getMetaStrategy(strategyType);
  }

  /**
   * Evolve meta strategy based on performance
   */
  async evolveMetaStrategy(strategyType: string, performance: number): Promise<void> {
    const existing = await this.store.getMetaStrategy(strategyType);
    
    if (existing && !Array.isArray(existing)) {
      const evolved: MetaStrategy = {
        ...existing,
        performance: (existing.performance * 0.7) + (performance * 0.3),
        updatedAt: Date.now(),
      };
      await this.store.updateMetaStrategy(evolved);
    } else {
      const newStrategy: MetaStrategy = {
        metaId: `meta-${strategyType}-${Date.now()}`,
        strategyType: strategyType as MetaStrategy['strategyType'],
        parameters: { evolution: 'initialized', threshold: 0.5 },
        performance,
        updatedAt: Date.now(),
      };
      await this.store.updateMetaStrategy(newStrategy);
    }
  }

  /**
   * Get L4 stats
   */
  async getL4Stats(): Promise<{ strategyCount: number; avgPerformance: number; lastUpdate: number | null }> {
    const strategies = await this.store.getAllMetaStrategies();
    const avgPerformance = strategies.length > 0
      ? strategies.reduce((sum, s) => sum + s.performance, 0) / strategies.length
      : 0;
    const lastUpdate = strategies.length > 0
      ? Math.max(...strategies.map(s => s.updatedAt))
      : null;

    return {
      strategyCount: strategies.length,
      avgPerformance,
      lastUpdate,
    };
  }

  // ===========================================================================
  // Cross-layer Operations
  // ===========================================================================

  /**
   * Recall from any layer
   */
  async recall(query: RecallQuery): Promise<RecallResult> {
    return this.store.recall(query);
  }

  /**
   * Consolidate memories across layers
   */
  async consolidate(): Promise<ConsolidationReport> {
    return this.store.consolidate();
  }

  /**
   * Purge old memories
   */
  async purge(olderThan: Date): Promise<number> {
    return this.store.purge(olderThan);
  }

  /**
   * Run maintenance tasks
   */
  async runMaintenance(): Promise<void> {
    // L1: Clean old sessions
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.config.L1RetentionDays);
    await this.purge(cutoff);

    // L2: Enforce entry limit
    const l2Stats = await this.getL2Stats();
    if (l2Stats.entryCount > this.config.L2MaxEntries) {
      const semantics = await this.store.searchSemantic('', this.config.L2MaxEntries);
      const allSemantics = await this.store.getAll<SemanticMemory>('layer_l2_semantic' as any);
      const toRemove = allSemantics.filter(s => !semantics.find(sem => sem.id === s.id));
      for (const s of toRemove) {
        await this.store.deleteOne('layer_l2_semantic' as any, s.id);
      }
    }

    // L3: Enforce pattern limit
    const l3Stats = await this.getL3Stats();
    if (l3Stats.patternCount > this.config.L3MaxPatterns) {
      const patterns = await this.store.getPatterns();
      const sorted = patterns.sort((a, b) => a.successRate - b.successRate);
      const toRemove = sorted.slice(0, l3Stats.patternCount - this.config.L3MaxPatterns);
      for (const p of toRemove) {
        await this.store.deleteOne('layer_l3_procedural' as any, p.patternId);
      }
    }
  }

  /**
   * Get comprehensive stats for all layers
   */
  async getAllStats(): Promise<{
    L0: { size: number; maxSize: number; utilization: number };
    L1: { sessionCount: number; maxSessions: number; oldestSession: number | null };
    L2: { entryCount: number; maxEntries: number; utilization: number };
    L3: { patternCount: number; maxPatterns: number; avgSuccessRate: number };
    L4: { strategyCount: number; avgPerformance: number; lastUpdate: number | null };
  }> {
    const [l0, l1, l2, l3, l4] = await Promise.all([
      Promise.resolve(this.getL0Stats()),
      this.getL1Stats(),
      this.getL2Stats(),
      this.getL3Stats(),
      this.getL4Stats(),
    ]);

    return { L0: l0, L1: l1, L2: l2, L3: l3, L4: l4 };
  }

  /**
   * Export memories for debugging
   */
  async export(): Promise<Record<string, unknown>> {
    const stats = await this.getAllStats();
    const recentSessions = await this.store.getRecentSessions(5);
    const recentSemantics = await this.store.searchSemantic('', 10);

    return {
      stats,
      recentSessions: recentSessions.map(s => ({
        sessionId: s.sessionId,
        timestamp: s.timestamp,
        emotionTag: s.emotionTag,
      })),
      recentSemantics: recentSemantics.map(s => ({
        id: s.id,
        keywords: s.keywords,
        accessCount: s.accessCount,
      })),
    };
  }

  // ===========================================================================
  // Helper methods
  // ===========================================================================

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return [...new Set(words.filter(w => w.length > 3 && !stopWords.has(w)))].slice(0, 20);
  }

  /**
   * Get configuration
   */
  getConfig(): LayerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LayerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// Singleton instance
// ============================================================================

let layeredMemoryInstance: LayeredMemoryL0L4 | null = null;

export function getLayeredMemory(): LayeredMemoryL0L4 {
  if (!layeredMemoryInstance) {
    layeredMemoryInstance = new LayeredMemoryL0L4();
  }
  return layeredMemoryInstance;
}

export default LayeredMemoryL0L4;