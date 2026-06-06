# PRD: PixelPal V492 — Chatdev Presence Engine (Direction C Iteration 61)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-154 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v492-presence-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 61 = Presence Engine**，来源：chatdev-design。

本迭代实现在线状态引擎：用户加入、心跳、离开、暂离、统计。

## 功能规格

### 1. 在线状态引擎架构

```
UserJoiner → HeartbeatBeater → UserLeaver
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pre/PresenceEngine.ts` | 在线状态引擎 |
| `src/pre/__tests__/PresenceEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PresenceStatus = 'online' | 'away' | 'offline';

class PresenceEngine {
  join(user: string): string;
  heartbeat(id: string): boolean;
  setAway(id: string): boolean;
  setOnline(id: string): boolean;
  leave(id: string): boolean;
  isStale(id: string, threshold: number): boolean;
  getStats(): { presences: number; totalJoins: number; totalLeaves: number; totalHeartbeats: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pre/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pre/__tests__/PresenceEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v492-presence-engine` 分支