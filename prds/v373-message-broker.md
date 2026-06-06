# PRD: PixelPal V373 — Chatdev Message Broker (Direction C Iteration 37)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-264 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v373-message-broker |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 37 = Message Broker**，来源：chatdev-design。

本迭代实现消息代理：主题订阅、消息发布、消息过滤、消息统计。

## 功能规格

### 1. 消息代理架构

```
TopicSubscriber → MessagePublisher → MessageFilter → MessageReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mb/MessageBroker.ts` | 消息代理 |
| `src/mb/__tests__/MessageBroker.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Message {
  id: string;
  topic: string;
  payload: unknown;
  delivered: number;
}

class MessageBroker {
  subscribe(topic: string, handler: string): string;
  publish(topic: string, payload: unknown): string;
  unsubscribe(id: string): boolean;
  getStats(): { topics: number; messages: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mb/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mb/__tests__/MessageBroker.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v373-message-broker` 分支