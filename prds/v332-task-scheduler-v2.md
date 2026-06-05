# PRD: PixelPal V332 — Nanobot Task Scheduler v2 (Direction B Iteration 29)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-120 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v332-task-scheduler-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 29 = Task Scheduler v2**，来源：nanobot-design。

本迭代实现任务调度器 v2：任务队列、优先级调度、任务取消、调度统计。

## 功能规格

### 1. 任务调度器 v2 架构

```
TaskEnqueuer → PriorityScheduler → TaskCanceller → ScheduleReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sched/TaskSchedulerV2.ts` | 任务调度器 v2 |
| `src/sched/__tests__/TaskSchedulerV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface SchedTask {
  id: string;
  name: string;
  priority: number;
  state: 'pending' | 'running' | 'done' | 'cancelled';
}

class TaskSchedulerV2 {
  enqueue(name: string, priority: number): string;
  next(): string | null;
  complete(id: string): boolean;
  cancel(id: string): boolean;
  getStats(): { tasks: number; pending: number; done: number; cancelled: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sched/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sched/__tests__/TaskSchedulerV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v332-task-scheduler-v2` 分支