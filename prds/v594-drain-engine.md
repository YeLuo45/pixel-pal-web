# PRD: PixelPal V594 — Thunderbolt Drain Engine (Direction E Iteration 81)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-023 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v594-drain-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 81 = Drain Engine**，来源：thunderbolt-design。

本迭代实现漏桶引擎：添加汇、推入、刷新、关闭、统计（4 种 mode：normal/overflow/drain/closed）。

## 功能规格

### 1. 漏桶引擎架构

```
SinkAdder → Pusher → Flusher → Closer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/dne/DrainEngine.ts` | 漏桶引擎 |
| `src/dne/__tests__/DrainEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type DrainMode = 'normal' | 'overflow' | 'drain' | 'closed';

class DrainEngine {
  addSink(name: string, capacity: number): string;
  push(id: string, amount: number): boolean;
  flush(id: string): boolean;
  close(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { sinks: number; totalAdded: number; totalPushed: number; totalFlushed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/dne/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/dne/__tests__/DrainEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v594-drain-engine` 分支