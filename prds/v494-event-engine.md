# PRD: PixelPal V494 — Thunderbolt Event Engine (Direction E Iteration 61)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-156 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v494-event-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 61 = Event Engine**，来源：thunderbolt-design。

本迭代实现事件引擎：事件订阅、事件发布、取消订阅、统计。

## 功能规格

### 1. 事件引擎架构

```
EventSubscriber → EventPublisher → EventUnsubscriber
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ete/EventEngine.ts` | 事件引擎 |
| `src/ete/__tests__/EventEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
class EventEngine {
  subscribe(event: string, callback: string): string;
  publish(event: string): number;
  unsubscribe(id: string): boolean;
  getStats(): { subscribers: number; totalPublished: number; totalReceived: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ete/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ete/__tests__/EventEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v494-event-engine` 分支