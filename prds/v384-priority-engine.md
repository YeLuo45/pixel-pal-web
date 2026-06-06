# PRD: PixelPal V384 — Generic-Agent Priority Engine (Direction D Iteration 39)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-295 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v384-priority-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 39 = Priority Engine**，来源：generic-agent-design。

本迭代实现优先级引擎：任务入队、优先级排序、任务调度、优先级统计。

## 功能规格

### 1. 优先级引擎架构

```
TaskEnqueuer → PrioritySorter → TaskScheduler → PriorityReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pe3/PriorityEngine.ts` | 优先级引擎 |
| `src/pe3/__tests__/PriorityEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Task {
  id: string;
  name: string;
  priority: number;
  scheduled: boolean;
}

class PriorityEngine {
  enqueue(name: string, priority: number): string;
  schedule(id: string): boolean;
  getNext(): Task | null;
  getStats(): { tasks: number; scheduled: number; pending: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pe3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pe3/__tests__/PriorityEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v384-priority-engine` 分支