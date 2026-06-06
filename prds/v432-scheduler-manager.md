# PRD: PixelPal V432 — Nanobot Scheduler Manager (Direction B Iteration 49)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-481 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v432-scheduler-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 49 = Scheduler Manager**，来源：nanobot-design。

本迭代实现调度器管理器：任务调度、定时任务、调度统计。

## 功能规格

### 1. 调度器管理器架构

```
TaskScheduler → CronDispatcher → ScheduleReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sc2/SchedulerManager.ts` | 调度器管理器 |
| `src/sc2/__tests__/SchedulerManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Schedule {
  id: string;
  name: string;
  cron: string;
  active: boolean;
  lastRun: number;
  runs: number;
}

class SchedulerManager {
  schedule(name: string, cron: string): string;
  run(id: string): boolean;
  unschedule(id: string): boolean;
  enable(id: string): boolean;
  disable(id: string): boolean;
  getStats(): { schedules: number; active: number; inactive: number; totalRuns: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sc2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sc2/__tests__/SchedulerManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v432-scheduler-manager` 分支