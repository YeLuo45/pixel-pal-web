# PRD: PixelPal V353 — Chatdev Channel Manager (Direction C Iteration 33)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-186 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v353-channel-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 33 = Channel Manager**，来源：chatdev-design。

本迭代实现频道管理器：频道创建、消息发送、消息广播、频道统计。

## 功能规格

### 1. 频道管理器架构

```
ChannelCreator → MessageSender → MessageBroadcaster → ChannelReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ch/ChannelManager.ts` | 频道管理器 |
| `src/ch/__tests__/ChannelManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Channel {
  id: string;
  name: string;
  members: string[];
  messages: number;
}

class ChannelManager {
  create(name: string): string;
  join(channelId: string, userId: string): boolean;
  broadcast(channelId: string, message: string): boolean;
  getStats(): { channels: number; totalMembers: number; totalMessages: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ch/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ch/__tests__/ChannelManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v353-channel-manager` 分支