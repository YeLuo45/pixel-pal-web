# PRD: PixelPal V168 — Dream Memory Engine Phase 2

## 1. Project Overview

- **Project**: pixel-pal-web (PRJ-20260420-002)
- **Version**: V168
- **Direction**: A (Dream Memory Engine - nanobot + generic-agent L0-L4)
- **Phase**: Phase 2 of 4 (Session Context + Consolidation + Query)

## 2. What's Already Built (V167)

- L0-L4 memory layers with type definitions
- DreamMemory core (store/retrieve/search/consolidate)
- MemoryStore SQLite persistence
- 126 tests, 100% pass rate

## 3. What's Being Built Now (V168)

### 3.1 SessionContextManager
Tracks active session context, injects relevant memories into LLM prompts.

```typescript
// src/services/memory/session/SessionContextManager.ts
export class SessionContextManager {
  // getRelevantContext(query, maxEntries): MemoryEntry[]
  // trackTurn(userMsg, agentResp): void
  // getSessionSummary(): SessionSummary
}
```

### 3.2 MemoryConsolidator
Scheduled job that promotes/demotes memories between layers.

```typescript
// src/services/memory/consolidation/MemoryConsolidator.ts
export class MemoryConsolidator {
  // consolidate(): ConsolidationResult
  // scheduleInterval(ms): void
}
```

### 3.3 MemoryQueryEngine
Unified query interface with layer-aware search.

```typescript
// src/services/memory/query/MemoryQueryEngine.ts
export class MemoryQueryEngine {
  // query(q, options): QueryResult
  // explain(query): string
}
```

## 4. Acceptance Criteria

- SessionContextManager: tracks turns, injects context, 10+ tests
- MemoryConsolidator: correctly promotes L4→L3/L2 based on importance/accessCount
- MemoryQueryEngine: layer-aware search with relevance scoring, 10+ tests
- All new tests pass, coverage ≥ 95% on new modules
- Build succeeds (GITHUB_PAGES=true npx vite build)

## 5. File Structure

```
src/services/memory/
  session/
    SessionContextManager.ts
    SessionContextManager.test.ts
  consolidation/
    MemoryConsolidator.ts
    MemoryConsolidator.test.ts
  query/
    MemoryQueryEngine.ts
    MemoryQueryEngine.test.ts
```

## 6. Design Systems Source

- nanobot-design: "Dream Memory", L0-L4 promotion/demotion
- generic-agent-design: L0-L4 self-evolution, context injection
- thunderbolt-design: Offline-first SQLite periodic sync
