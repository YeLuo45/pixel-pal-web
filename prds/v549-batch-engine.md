# PRD: PixelPal V549 — Thunderbolt Batch Engine (Direction E Iteration 72)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-172 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v549-batch-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 72 = Batch Engine**，来源：thunderbolt-design。

本迭代实现批处理引擎：添加、执行、失败、统计（4 种状态：pending/running/completed/failed）。

## 功能规格

### 1. 批处理引擎架构

```
BatchAdder → BatchExecutor → BatchFailer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bae/BatchEngine.ts` | 批处理引擎 |
| `src/bae/__tests__/BatchEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BatchStatus = 'pending' | 'running' | 'completed' | 'failed';

class BatchEngine {
  add(name: string, items: number): string;
  execute(id: string, count: number): boolean;
  fail(id: string): boolean;
  getStats(): { batches: number; totalAdded: number; totalExecuted: number; totalCompleted: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bae/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bae/__tests__/BatchEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v549-batch-engine` 分支