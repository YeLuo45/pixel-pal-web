# PRD: PixelPal V487 — Chatdev Notification Engine (Direction C Iteration 60)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-145 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v487-notification-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 60 = Notification Engine**，来源：chatdev-design。

本迭代实现通知引擎：通知发送、通知已读、通知忽略、统计。

## 功能规格

### 1. 通知引擎架构

```
NotificationSender → NotificationReader → NotificationDismisser
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/nte/NotificationEngine.ts` | 通知引擎 |
| `src/nte/__tests__/NotificationEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type NotificationType = 'alert' | 'info' | 'reminder' | 'system';

class NotificationEngine {
  send(type: NotificationType, recipient: string, message: string): string;
  read(id: string): boolean;
  dismiss(id: string): boolean;
  getStats(): { notifications: number; totalSent: number; totalRead: number; totalDismissed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/nte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/nte/__tests__/NotificationEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v487-notification-engine` 分支