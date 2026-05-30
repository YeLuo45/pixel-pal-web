# PRD: PixelPal V167 — Dream Memory Engine Phase 1

## 1. Project Overview

- **Project**: pixel-pal-web (PRJ-20260420-002)
- **Version**: V167
- **Direction**: A (Dream Memory Engine - nanobot + generic-agent)
- **Proposal ID**: P-20260530-060
- **Date**: 2026-05-30
- **Status**: approved_for_dev
- **Iteration**: 1/9

## 2. Motivation

V167 implements the Dream Memory Engine - combining nanobot's Dream Memory concept with generic-agent's L0-L4 layered memory architecture. This enables PixelPal to maintain persistent, hierarchical memory across sessions with automatic organization during idle periods.

## 3. Design Sources

- **nanobot-design**: Dream Memory - memory consolidation during sleep/dormant periods
- **generic-agent-design**: L0-L4 Memory Hierarchy - Meta/Index/Global/Skill/Session layers

## 4. Technical Specification

### 4.1 L0-L4 Memory Layers

| Layer | Name | Description | Persistence |
|-------|------|-------------|-------------|
| L0 | META | Memory metadata, access patterns, importance scores | Session |
| L1 | INDEX | Quick lookup index, recent accesses, tags | Session |
| L2 | GLOBAL | Cross-session facts, user preferences, long-term context | Persistent |
| L3 | SKILL | Crystallized skills, learned patterns, procedures | Persistent |
| L4 | SESSION | Current session context, working memory | Session |

### 4.2 New File Structure

```
src/services/memory/
├── DreamMemory.ts           # Main engine
├── layers/
│   ├── L0Meta.ts           # L0: Metadata layer
│   ├── L1Index.ts          # L1: Index layer  
│   ├── L2Global.ts         # L2: Global persistent layer
│   ├── L3Skill.ts          # L3: Skill crystallization layer
│   └── L4Session.ts        # L4: Session working memory
├── MemoryStore.ts          # Unified interface
├── MemoryTypes.ts          # Type definitions
└── __tests__/
    ├── DreamMemory.test.ts
    ├── L0Meta.test.ts
    ├── L1Index.test.ts
    ├── L2Global.test.ts
    ├── L3Skill.test.ts
    └── L4Session.test.ts
```

### 4.3 Core Interfaces

```typescript
// Memory entry structure
interface MemoryEntry {
  id: string;
  layer: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
  content: string;
  importance: number;        // 0-100
  accessCount: number;
  lastAccessed: number;
  createdAt: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

// DreamMemory main class
class DreamMemory {
  // Store a memory in appropriate layer
  store(entry: Omit<MemoryEntry, 'id' | 'accessCount' | 'lastAccessed' | 'createdAt'>): MemoryEntry;
  
  // Retrieve with layer preference
  retrieve(id: string, layers?: Layer[]): MemoryEntry | null;
  
  // Search across layers
  search(query: string, layers?: Layer[]): MemoryEntry[];
  
  // Consolidate memories (called during idle/sleep)
  consolidate(): ConsolidationResult;
  
  // Get context for new session
  getSessionContext(): SessionContext;
}

// Layer-specific queries
interface MemoryStore {
  getRecent(limit: number): MemoryEntry[];       // L0
  getIndexed(tag: string): MemoryEntry[];        // L1
  getGlobal(predicate?: Filter): MemoryEntry[]; // L2
  getSkills(): MemoryEntry[];                   // L3
  getWorking(): MemoryEntry[];                  // L4
}
```

### 4.4 SqliteStorage Integration

- Use existing `SqliteStorage` class for persistent layers (L2, L3)
- Session layers (L0, L1, L4) use in-memory Maps with periodic persistence
- Leverage existing `src/db/index.ts` database instance

## 5. Testing Requirements

- **Coverage Target**: ≥95%
- **Pass Rate**: 100%
- **Test Files**: 6 test files (one per layer + main engine)
- **Test Location**: `src/services/memory/__tests__/`

## 6. Acceptance Criteria

- [ ] `DreamMemory` class with store/retrieve/search/consolidate/getSessionContext methods
- [ ] L0-L4 layer implementations complete
- [ ] `SqliteStorage` integration for persistent layers (L2, L3)
- [ ] All tests pass with ≥95% coverage
- [ ] `npm run build` succeeds
- [ ] No new console errors

## 7. Dependencies

- Existing: SqliteStorage, evolutionStore
- No new external dependencies