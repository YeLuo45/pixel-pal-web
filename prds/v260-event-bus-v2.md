# PRD: PixelPal V260 — Thunderbolt Event Bus v2 (Direction E Iteration 14)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-095 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v260-event-bus-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 14 = Event Bus v2**，来源：thunderbolt-design。

本迭代实现事件总线v2：事件路由、事件重试、事件死信、事件追踪。

## 功能规格

### 1. 事件总线v2架构

```
EventRouter → EventRetrier → DeadLetterHandler → EventTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bus/EventBusV2.ts` | 事件总线v2 |
| `src/bus/__tests__/EventBusV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface BusEvent {
  id: string;
  topic: string;
  payload: unknown;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'processed' | 'failed' | 'dead';
}

class EventBusV2 {
  publish(event: Omit<BusEvent, 'id'>): string;
  subscribe(topic: string, handler: (e: BusEvent) => Promise<void>): void;
  retry(eventId: string): boolean;
  getDeadLetter(): BusEvent[];
  getStatus(eventId: string): BusEvent['status'] | null;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bus/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bus/__tests__/EventBusV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v260-event-bus-v2` 分支