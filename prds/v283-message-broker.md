# PRD: PixelPal V283 — Chatdev Message Broker (Direction C Iteration 19)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-147 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v283-message-broker |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 19 = Message Broker**，来源：chatdev-design。

本迭代实现消息代理：消息发布、消息订阅、消息路由、消息追踪。

## 功能规格

### 1. 消息代理架构

```
MessagePublisher → MessageSubscriber → MessageRouter → MessageTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/broker/MessageBroker.ts` | 消息代理 |
| `src/broker/__tests__/MessageBroker.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Message {
  id: string;
  topic: string;
  payload: unknown;
  timestamp: number;
}

interface Subscription {
  id: string;
  topic: string;
  callback: (msg: Message) => void;
}

class MessageBroker {
  publish(topic: string, payload: unknown): string;
  subscribe(topic: string, callback: (msg: Message) => void): string;
  unsubscribe(subscriptionId: string): boolean;
  getStats(): { messages: number; subscriptions: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/broker/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/broker/__tests__/MessageBroker.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v283-message-broker` 分支