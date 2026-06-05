# PRD: PixelPal V275 — Thunderbolt State Machine (Direction E Iteration 17)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-124 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v275-state-machine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 17 = State Machine**，来源：thunderbolt-design。

本迭代实现状态机：状态定义、状态转移、状态守卫、状态机追踪。

## 功能规格

### 1. 状态机架构

```
StateDefiner → StateTransition → StateGuard → StateTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/fsm/StateMachine.ts` | 状态机 |
| `src/fsm/__tests__/StateMachine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface FSMTransition {
  from: string;
  to: string;
  event: string;
  guard?: () => boolean;
}

interface FSMState {
  name: string;
  isInitial: boolean;
  isFinal: boolean;
}

class StateMachine {
  addState(name: string, opts?: { initial?: boolean; final?: boolean }): void;
  addTransition(transition: FSMTransition): boolean;
  fire(event: string): boolean;
  getCurrentState(): string | null;
  getHistory(): { from: string; to: string; event: string }[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/fsm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/fsm/__tests__/StateMachine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v275-state-machine` 分支