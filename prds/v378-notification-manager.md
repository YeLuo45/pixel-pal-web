# PRD: PixelPal V378 — Chatdev Notification Manager (Direction C Iteration 38)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-288 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v378-notification-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 38 = Notification Manager**，来源：chatdev-design。

本迭代实现通知管理器：通知发送、通知接收、通知标记、通知统计。

## 功能规格

### 1. 通知管理器架构

```
NotificationSender → NotificationReceiver → NotificationMarker → NotificationReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/nm/NotificationManager.ts` | 通知管理器 |
| `src/nm/__tests__/NotificationManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Notification {
  id: string;
  recipient: string;
  message: string;
  read: boolean;
  sent: number;
}

class NotificationManager {
  send(recipient: string, message: string): string;
  markRead(id: string): boolean;
  getUnread(recipient: string): Notification[];
  getStats(): { notifications: number; read: number; unread: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/nm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/nm/__tests__/NotificationManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v378-notification-manager` 分支