# PRD: PixelPal V532 — Chatdev Schedule Engine (Direction C Iteration 69)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-085 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v532-schedule-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 69 = Schedule Engine**，来源：chatdev-design。

本迭代实现调度引擎：调度、运行、重新调度、标记到期/逾期、统计（4 种状态：pending/due/overdue/completed）。

## 功能规格

### 1. 调度引擎架构

```
Scheduler → Runner → Rescheduler
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sce/ScheduleEngine.ts` | 调度引擎 |
| `src/sce/__tests__/ScheduleEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ScheduleStatus = 'pending' | 'due' | 'overdue' | 'completed';

class ScheduleEngine {
  schedule(name: string, cron: string, nextRun: number): string;
  run(id: string): boolean;
  reschedule(id: string, nextRun: number): boolean;
  markDue(id: string): boolean;
  markOverdue(id: string): boolean;
  getStats(): { schedules: number; totalScheduled: number; totalRun: number; totalRescheduled: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sce/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sce/__tests__/ScheduleEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v532-schedule-engine` 分支