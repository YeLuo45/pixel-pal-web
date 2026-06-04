# PRD: PixelPal V225 — Thunderbolt Task Scheduler v2 (Direction E Iteration 7/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-025 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v225-task-scheduler-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 7/9 = Task Scheduler v2**，来源：thunderbolt-design。

本迭代实现任务调度器v2：任务调度、优先级队列、并发控制、调度统计。

## 功能规格

### 1. 任务调度器v2架构

```
TaskQueue → PriorityScheduler → ConcurrencyController → SchedulerStats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/scheduler/TaskSchedulerV2.ts` | 任务调度器v2 |
| `src/scheduler/__tests__/TaskSchedulerV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Task {
  id: string;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  duration?: number;
}

class TaskSchedulerV2 {
  addTask(task: Task): void;
  schedule(): Task | null;
  execute(task: Task): Promise<void>;
  setMaxConcurrency(n: number): void;
  getStats(): { total: number; completed: number; failed: number; avgDuration: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/scheduler/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/scheduler/__tests__/TaskSchedulerV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v225-task-scheduler-v2` 分支