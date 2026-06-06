# PRD: PixelPal V444 — Generic-Agent Memory Engine (Direction D Iteration 51)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-523 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v444-memory-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 51 = Memory Engine**，来源：generic-agent-design。

本迭代实现记忆引擎：记忆存储、记忆回忆、记忆统计。

## 功能规格

### 1. 记忆引擎架构

```
MemoryStorer → MemoryRecaller → MemoryReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mre/MemoryEngine.ts` | 记忆引擎 |
| `src/mre/__tests__/MemoryEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Memory {
  id: string;
  content: string;
  importance: number;
  accessCount: number;
  created: number;
}

class MemoryEngine {
  store(content: string, importance: number): string;
  recall(id: string): Memory | null;
  forget(id: string): boolean;
  getStats(): { memories: number; totalAccess: number; avgImportance: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mre/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mre/__tests__/MemoryEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v444-memory-engine` 分支