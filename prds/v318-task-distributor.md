# PRD: PixelPal V318 — Chatdev Task Distributor (Direction C Iteration 26)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-075 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v318-task-distributor |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 26 = Task Distributor**，来源：chatdev-design。

本迭代实现任务分发器：任务入队、任务分配、任务回收、任务统计。

## 功能规格

### 1. 任务分发器架构

```
TaskEnqueuer → TaskAssigner → TaskReclaimer → TaskStatistics
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/distrib/TaskDistributor.ts` | 任务分发器 |
| `src/distrib/__tests__/TaskDistributor.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface DistTask {
  id: string;
  name: string;
  assignee: string | null;
  state: 'queued' | 'assigned' | 'done' | 'failed';
}

class TaskDistributor {
  enqueue(name: string): string;
  assign(taskId: string, assignee: string): boolean;
  complete(taskId: string): boolean;
  fail(taskId: string, reason: string): boolean;
  getStats(): { tasks: number; done: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/distrib/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/distrib/__tests__/TaskDistributor.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v318-task-distributor` 分支