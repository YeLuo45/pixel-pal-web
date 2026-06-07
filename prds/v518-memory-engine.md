# PRD: PixelPal V518 — Generic-Agent Memory Engine (Direction D Iteration 66)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-268 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v518-memory-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 66 = Memory Engine**，来源：generic-agent-design。

本迭代实现记忆引擎：记忆存储、回忆、遗忘、搜索、统计（3 种类型：episodic/semantic/procedural，重要度 0-10）。

## 功能规格

### 1. 记忆引擎架构

```
MemoryStorer → MemoryRecaller → MemoryForgetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mme/MemoryEngine.ts` | 记忆引擎 |
| `src/mme/__tests__/MemoryEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type MemoryType = 'episodic' | 'semantic' | 'procedural';

class MemoryEngine {
  store(content: string, type: MemoryType, importance: number): string;
  recall(id: string): Memory;
  forget(id: string): boolean;
  search(query: string): Memory[];
  getStats(): { memories: number; totalStored: number; totalRecalled: number; totalForgotten: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mme/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mme/__tests__/MemoryEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v518-memory-engine` 分支