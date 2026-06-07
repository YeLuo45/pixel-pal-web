# PRD: PixelPal V548 — Generic-Agent Planner Engine (Direction D Iteration 72)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-170 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v548-planner-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 72 = Planner Engine**，来源：generic-agent-design。

本迭代实现规划器引擎：添加计划、开始、步进、失败、统计（4 种状态：pending/in-progress/completed/failed）。

## 功能规格

### 1. 规划器引擎架构

```
PlanAdder → PlanStarter → PlanStepper → PlanFailer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ple2/PlannerEngine.ts` | 规划器引擎 |
| `src/ple2/__tests__/PlannerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PlanStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

class PlannerEngine {
  addPlan(goal: string, steps: number): string;
  start(id: string): boolean;
  step(id: string): boolean;
  fail(id: string): boolean;
  getStats(): { plans: number; totalAdded: number; totalCompleted: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ple2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ple2/__tests__/PlannerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v548-planner-engine` 分支