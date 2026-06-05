# PRD: PixelPal V285 — Thunderbolt Task Scheduler (Direction E Iteration 19)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-161 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v285-task-scheduler |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 19 = Task Scheduler**，来源：thunderbolt-design。

本迭代实现任务调度器：任务定义、任务调度、任务执行、任务追踪。

## 功能规格

### 1. 任务调度器架构

```
TaskDefiner → TaskScheduler → TaskExecutor → TaskTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/schedule/TaskScheduler.ts` | 任务调度器 |
| `src/schedule/__tests__/TaskScheduler.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface ScheduledTask {
  id: string;
  name: string;
  priority: number;
  scheduledAt: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  action: () => Promise<boolean>;
}

class TaskScheduler {
  schedule(name: string, action: () => Promise<boolean>, priority?: number): string;
  runNext(): Promise<boolean>;
  cancel(id: string): boolean;
  getStats(): { pending: number; running: number; completed: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/schedule/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/schedule/__tests__/TaskScheduler.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v285-task-scheduler` 分支