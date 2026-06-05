# PRD: PixelPal V330 — Thunderbolt Event Bus (Direction E Iteration 28)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-118 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v330-event-bus |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 28 = Event Bus**，来源：thunderbolt-design。

本迭代实现事件总线：订阅发布、主题管理、事件过滤、总线统计。

## 功能规格

### 1. 事件总线架构

```
SubscriberRegistry → TopicManager → EventFilter → BusReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bus/EventBus.ts` | 事件总线 |
| `src/bus/__tests__/EventBus.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Subscription {
  id: string;
  topic: string;
  handler: (data: unknown) => void;
}

class EventBus {
  subscribe(topic: string, handler: (data: unknown) => void): string;
  publish(topic: string, data: unknown): number;
  getStats(): { subscriptions: number; topics: number; published: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bus/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bus/__tests__/EventBus.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v330-event-bus` 分支