# PRD: PixelPal V424 — Generic-Agent Habit Engine (Direction D Iteration 47)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-469 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v424-habit-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 47 = Habit Engine**，来源：generic-agent-design。

本迭代实现习惯引擎：习惯定义、习惯执行、习惯统计。

## 功能规格

### 1. 习惯引擎架构

```
HabitDefiner → HabitExecutor → HabitReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/he2/HabitEngine.ts` | 习惯引擎 |
| `src/he2/__tests__/HabitEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  completed: boolean;
}

class HabitEngine {
  define(name: string, frequency: 'daily' | 'weekly' | 'monthly'): string;
  complete(id: string): boolean;
  break_(id: string): boolean;
  getStats(): { habits: number; totalCompletions: number; totalStreak: number; daily: number; weekly: number; monthly: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/he2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/he2/__tests__/HabitEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v424-habit-engine` 分支