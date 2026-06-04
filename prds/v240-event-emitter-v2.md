# PRD: PixelPal V240 — Thunderbolt Event Emitter v2 (Direction E Iteration 10)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-051 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v240-event-emitter-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 10 = Event Emitter v2**，来源：thunderbolt-design。

本迭代实现事件发射器v2：事件订阅、事件发布、事件过滤、事件历史。

## 功能规格

### 1. 事件发射器v2架构

```
EventBus → SubscriberRegistry → EventFilter → EventHistory
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/events/EventEmitterV2.ts` | 事件发射器v2 |
| `src/events/__tests__/EventEmitterV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Event {
  type: string;
  data: unknown;
  timestamp: number;
}

type Handler = (event: Event) => void;

class EventEmitterV2 {
  on(type: string, handler: Handler): void;
  off(type: string, handler: Handler): void;
  emit(type: string, data: unknown): void;
  getHistory(type?: string): Event[];
  clearHistory(): void;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/events/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/events/__tests__/EventEmitterV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v240-event-emitter-v2` 分支