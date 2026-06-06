# PRD: PixelPal V379 — Generic-Agent Memory Hierarchy (Direction D Iteration 38)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-290 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v379-memory-hierarchy |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 38 = Memory Hierarchy**，来源：generic-agent-design。

本迭代实现记忆层级：长期记忆、短期记忆、工作记忆、记忆统计。

## 功能规格

### 1. 记忆层级架构

```
LongTermStore → ShortTermCache → WorkingMemory → MemoryReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mh/MemoryHierarchy.ts` | 记忆层级 |
| `src/mh/__tests__/MemoryHierarchy.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface MemoryItem {
  key: string;
  value: unknown;
  tier: 'long' | 'short' | 'working';
  importance: number;
}

class MemoryHierarchy {
  store(tier: 'long' | 'short' | 'working', key: string, value: unknown): boolean;
  recall(key: string): MemoryItem | null;
  promote(key: string, toTier: 'long' | 'short' | 'working'): boolean;
  getStats(): { long: number; short: number; working: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mh/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mh/__tests__/MemoryHierarchy.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v379-memory-hierarchy` 分支