# PRD: PixelPal V563 — Generic-Agent Action Engine (Direction D Iteration 75)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-265 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v563-action-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 75 = Action Engine**，来源：generic-agent-design。

本迭代实现动作引擎：定义、排队、执行、完成、失败、统计（5 种状态：idle/queued/running/done/failed）。

## 功能规格

### 1. 动作引擎架构

```
ActionDefiner → Queuer → Executor → Completer/Failer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ace/ActionEngine.ts` | 动作引擎 |
| `src/ace/__tests__/ActionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ActionState = 'idle' | 'queued' | 'running' | 'done' | 'failed';

class ActionEngine {
  define(name: string): string;
  queue(id: string): boolean;
  execute(id: string): boolean;
  complete(id: string, duration: number): boolean;
  fail(id: string): boolean;
  getStats(): { actions: number; totalDefined: number; totalExecuted: number; totalDone: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ace/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ace/__tests__/ActionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v563-action-engine` 分支