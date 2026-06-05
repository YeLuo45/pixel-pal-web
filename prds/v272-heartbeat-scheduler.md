# PRD: PixelPal V272 — Nanobot Heartbeat Scheduler (Direction B Iteration 17)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-112 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v272-heartbeat-scheduler |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 17 = Heartbeat Scheduler**，来源：nanobot-design。

本迭代实现心跳调度器：节点心跳、心跳检测、过期清理、心跳统计。

## 功能规格

### 1. 心跳调度器架构

```
HeartbeatManager → HeartbeatDetector → ExpirationCleaner → HeartbeatStatistics
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/heartbeat/HeartbeatScheduler.ts` | 心跳调度器 |
| `src/heartbeat/__tests__/HeartbeatScheduler.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Heartbeat {
  nodeId: string;
  timestamp: number;
  status: 'alive' | 'slow' | 'dead';
}

class HeartbeatScheduler {
  register(nodeId: string): void;
  heartbeat(nodeId: string): boolean;
  detect(nodeId: string, threshold: number): Heartbeat;
  cleanup(threshold: number): string[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/heartbeat/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/heartbeat/__tests__/HeartbeatScheduler.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v272-heartbeat-scheduler` 分支