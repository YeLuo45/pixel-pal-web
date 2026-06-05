# PRD: PixelPal V325 — Thunderbolt Action Sequencer (Direction E Iteration 27)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-098 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v325-action-sequencer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 27 = Action Sequencer**，来源：thunderbolt-design。

本迭代实现动作序列器：动作定义、动作顺序、动作执行、动作统计。

## 功能规格

### 1. 动作序列器架构

```
ActionDefiner → ActionSequencer → ActionExecutor → ActionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/seq/ActionSequencer.ts` | 动作序列器 |
| `src/seq/__tests__/ActionSequencer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Action {
  id: string;
  name: string;
  order: number;
  executed: boolean;
  result: unknown;
}

class ActionSequencer {
  define(name: string, order: number): string;
  execute(id: string, fn: () => unknown): unknown;
  reset(): void;
  getStats(): { total: number; executed: number; pending: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/seq/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/seq/__tests__/ActionSequencer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v325-action-sequencer` 分支