# PRD: PixelPal V536 — Nanobot Broker Engine (Direction B Iteration 70)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-089 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v536-broker-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 70 = Broker Engine**，来源：nanobot-design。

本迭代实现消息代理引擎：发布、订阅、取消订阅、路由、统计（3 种模式：direct/fanout/topic）。

## 功能规格

### 1. 消息代理引擎架构

```
Publisher → Subscriber → Router
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bre2/BrokerEngine.ts` | 消息代理引擎 |
| `src/bre2/__tests__/BrokerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BrokerMode = 'direct' | 'fanout' | 'topic';

class BrokerEngine {
  publish(topic: string, sender: string, payload: string, mode: BrokerMode): string;
  subscribe(topic: string, subscriber: string): boolean;
  unsubscribe(topic: string, subscriber: string): boolean;
  route(id: string): number;
  getStats(): { messages: number; totalPublished: number; totalSubscribed: number; totalRouted: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bre2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bre2/__tests__/BrokerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v536-broker-engine` 分支