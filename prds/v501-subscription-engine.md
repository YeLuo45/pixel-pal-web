# PRD: PixelPal V501 — Nanobot Subscription Engine (Direction B Iteration 63)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-201 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v501-subscription-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 63 = Subscription Engine**，来源：nanobot-design。

本迭代实现订阅引擎：订阅、通知、取消订阅、统计。

## 功能规格

### 1. 订阅引擎架构

```
SubscriptionRegistrar → TopicNotifier → SubscriptionCanceller
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sue/SubscriptionEngine.ts` | 订阅引擎 |
| `src/sue/__tests__/SubscriptionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
class SubscriptionEngine {
  subscribe(topic: string, subscriber: string): string;
  notify(topic: string): number;
  unsubscribe(id: string): boolean;
  getStats(): { subscriptions: number; totalDelivered: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sue/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sue/__tests__/SubscriptionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v501-subscription-engine` 分支