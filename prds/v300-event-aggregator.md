# PRD: PixelPal V300 — Thunderbolt Event Aggregator (Direction E Iteration 22)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-023 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v300-event-aggregator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 22 = Event Aggregator**，来源：thunderbolt-design。

本迭代实现事件聚合器：事件收集、事件聚合、事件分析、事件报告。

## 功能规格

### 1. 事件聚合器架构

```
EventCollector → EventAggregator → EventAnalyzer → EventReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/agg/EventAggregator.ts` | 事件聚合器 |
| `src/agg/__tests__/EventAggregator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Event {
  id: string;
  type: string;
  source: string;
  data: unknown;
  timestamp: number;
}

interface Aggregation {
  type: string;
  count: number;
  first: number;
  last: number;
}

class EventAggregator {
  addEvent(type: string, source: string, data: unknown): string;
  aggregate(): Aggregation[];
  getStats(): { events: number; types: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/agg/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/agg/__tests__/EventAggregator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v300-event-aggregator` 分支