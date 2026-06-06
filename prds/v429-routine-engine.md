# PRD: PixelPal V429 — Generic-Agent Routine Engine (Direction D Iteration 48)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-478 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v429-routine-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 48 = Routine Engine**，来源：generic-agent-design。

本迭代实现例程引擎：例程定义、例程执行、例程统计。

## 功能规格

### 1. 例程引擎架构

```
RoutineDefiner → RoutineExecutor → RoutineReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/re2/RoutineEngine.ts` | 例程引擎 |
| `src/re2/__tests__/RoutineEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Routine {
  id: string;
  name: string;
  steps: string[];
  currentStep: number;
  runs: number;
}

class RoutineEngine {
  define(name: string, steps: string[]): string;
  execute(id: string): boolean;
  reset(id: string): boolean;
  getStats(): { routines: number; totalRuns: number; totalSteps: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/re2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/re2/__tests__/RoutineEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v429-routine-engine` 分支