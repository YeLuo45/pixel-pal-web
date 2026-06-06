# PRD: PixelPal V413 — Chatdev Presence Engine (Direction C Iteration 45)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-414 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v413-presence-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 45 = Presence Engine**，来源：chatdev-design。

本迭代实现在线状态引擎：状态注册、状态更新、状态统计。

## 功能规格

### 1. 在线状态引擎架构

```
PresenceRegistrar → PresenceUpdater → PresenceReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pr/PresenceEngine.ts` | 在线状态引擎 |
| `src/pr/__tests__/PresenceEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

interface Presence {
  id: string;
  user: string;
  status: PresenceStatus;
  lastSeen: number;
}

class PresenceEngine {
  register(user: string, status: PresenceStatus): string;
  setStatus(id: string, status: PresenceStatus): boolean;
  heartbeat(id: string): boolean;
  getStats(): { presences: number; online: number; offline: number; away: number; busy: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pr/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pr/__tests__/PresenceEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v413-presence-engine` 分支