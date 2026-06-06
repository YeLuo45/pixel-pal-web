# PRD: PixelPal V464 — Generic-Agent Goal Engine (Direction D Iteration 55)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-039 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v464-goal-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 55 = Goal Engine**，来源：generic-agent-design。

本迭代实现目标引擎：目标设置、目标更新、目标完成、目标失败、目标统计。

## 功能规格

### 1. 目标引擎架构

```
GoalSetter → GoalUpdater → GoalCompleter → GoalFailer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/gol/GoalEngine.ts` | 目标引擎 |
| `src/gol/__tests__/GoalEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type GoalStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused';

interface Goal {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: GoalStatus;
  priority: number;
}

class GoalEngine {
  set(name: string, description: string, priority: number): string;
  update(id: string, progress: number): boolean;
  complete(id: string): boolean;
  fail(id: string): boolean;
  pause(id: string): boolean;
  resume(id: string): boolean;
  getStats(): { goals: number; totalCompleted: number; avgProgress: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/gol/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/gol/__tests__/GoalEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v464-goal-engine` 分支