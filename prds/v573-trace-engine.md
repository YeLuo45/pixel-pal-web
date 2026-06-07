# PRD: PixelPal V573 — Generic-Agent Trace Engine (Direction D Iteration 77)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-304 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v573-trace-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 77 = Trace Engine**，来源：generic-agent-design。

本迭代实现追踪引擎：添加、追踪、完成、失败、统计（4 种状态：pending/running/completed/failed）。

## 功能规格

### 1. 追踪引擎架构

```
TraceAdder → Tracer → Completer/Failer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tee/TraceEngine.ts` | 追踪引擎 |
| `src/tee/__tests__/TraceEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type TraceStatus = 'pending' | 'running' | 'completed' | 'failed';

class TraceEngine {
  add(name: string, parent: string): string;
  trace(id: string, duration: number): boolean;
  complete(id: string): boolean;
  fail(id: string): boolean;
  getStats(): { entries: number; totalAdded: number; totalTraced: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tee/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tee/__tests__/TraceEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v573-trace-engine` 分支