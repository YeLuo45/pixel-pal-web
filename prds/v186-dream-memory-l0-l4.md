# PRD: PixelPal V186 — Dream Memory + L0-L4 Hierarchy (Direction B Iteration 1/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-027 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v186-dream-memory-l0-l4 |
| 部署分支 | gh-pages (via GitHub Actions on master push) |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B = Dream Memory + L0-L4 Hierarchy**，来源：nanobot Dream Memory + generic-agent L0-L4。

本迭代 (1/9) 实现核心数据模型 + 五层记忆接口 + IndexedDB 持久化层。

## 功能规格

### 1. 层级记忆架构

```
L0 (瞬时记忆) — 当前会话 token 窗口内，内存中
L1 (情景记忆) — 最近 N 次会话，IndexedDB 存储，情感标记
L2 (语义记忆) — 向量搜索 + 关键词索引，长期知识
L3 (程序记忆) — 行为模式、习惯、技能
L4 (元记忆) — 学习策略、记忆压缩策略、自演化
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/memory/DreamMemoryStore.ts` | IndexedDB 封装，原子写入，自动摘要 |
| `src/memory/LayeredMemoryL0L4.ts` | 五层记忆接口：store/recall/consolidate/purge |
| `src/memory/__tests__/DreamMemoryStore.test.ts` | IndexedDB mock 测试，≥99% 覆盖率 |
| `src/memory/__tests__/LayeredMemoryL0L4.test.ts` | 五层接口测试，100% pass |

### 3. IndexedDB Schema

```
Database: PixelPalDreamMemory
  Store: dream_memories
    keyPath: id (auto-increment)
    indexes: [timestamp, type, importance, sessionId]
  Store: layer_l1_sessions
    keyPath: sessionId
  Store: layer_l2_semantic
    keyPath: id (auto-increment)
    indexes: [embedding_vector (if present), keywords]
  Store: layer_l3_procedural
    keyPath: patternId
  Store: layer_l4_meta
    keyPath: metaId
```

### 4. API 接口

```typescript
interface DreamMemoryStore {
  // L0: 瞬时（内存）
  setImmediate(key: string, value: any): void
  getImmediate(key: string): any
  
  // L1: 情景记忆（IndexedDB）
  saveSession(session: SessionMemory): Promise<void>
  getRecentSessions(limit: number): Promise<SessionMemory[]>
  
  // L2: 语义记忆（IndexedDB）
  addSemantic(semantic: SemanticMemory): Promise<string>
  searchSemantic(query: string, limit: number): Promise<SemanticMemory[]>
  
  // L3: 程序记忆（IndexedDB）
  storePattern(pattern: ProceduralPattern): Promise<void>
  getPatterns(context: string): Promise<ProceduralPattern[]>
  
  // L4: 元记忆（IndexedDB）
  updateMetaStrategy(strategy: MetaStrategy): Promise<void>
  getMetaStrategy(): Promise<MetaStrategy>
  
  // 跨层操作
  consolidate(): Promise<ConsolidationReport>  // L0→L1→L2→L3 压缩
  recall(query: RecallQuery): Promise<RecallResult>
  purge(olderThan: Date): Promise<number>  // 清理旧记忆
}
```

### 5. DreamRecall 检索接口

```typescript
interface RecallQuery {
  type: 'semantic' | 'episodic' | 'procedural' | 'meta'
  query?: string
  limit?: number
  timeRange?: { start: Date; end: Date }
}

interface RecallResult {
  items: MemoryItem[]
  confidence: number
  layers: ('L0' | 'L1' | 'L2' | 'L3' | 'L4')[]
}
```

## 测试要求

- 覆盖率 ≥ 99%（statements/branches/functions/lines）
- 通过率 100%
- 测试位置：`src/memory/__tests__/`
- IndexedDB mock 使用 vi.stubGlobal + fake indexedDB API

## 技术约束

- 零新增依赖（使用原生 IndexedDB API）
- 兼容性：现代浏览器（Chrome/Firefox/Safari/Edge 最新版）
- 无外部服务依赖

## 验收标准

- [ ] `npx vitest run src/memory --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `npm run build` 成功（HashRouter SPA）
- [ ] Git commit 到 `v186-dream-memory-l0-l4` 分支