# PRD: PixelPal V471 — Nanobot Heartbeat Engine (Direction B Iteration 57)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-082 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v471-heartbeat-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 57 = Heartbeat Engine**，来源：nanobot-design。

本迭代实现心跳引擎：心跳启动、心跳跳动、心跳停止、心跳过期、统计。

## 功能规格

### 1. 心跳引擎架构

```
HeartbeatStarter → HeartbeatBeater → HeartbeatStopper
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/hbe/HeartbeatEngine.ts` | 心跳引擎 |
| `src/hbe/__tests__/HeartbeatEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type HeartbeatState = 'stopped' | 'running' | 'expired';

class HeartbeatEngine {
  start(name: string, interval: number): string;
  beat(id: string): boolean;
  stop(id: string): boolean;
  expire(id: string): boolean;
  isExpired(id: string): boolean;
  getStats(): { heartbeats: number; totalBeats: number; running: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/hbe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/hbe/__tests__/HeartbeatEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v471-heartbeat-engine` 分支