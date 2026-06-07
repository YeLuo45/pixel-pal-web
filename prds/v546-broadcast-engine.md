# PRD: PixelPal V546 — Nanobot Broadcast Engine (Direction B Iteration 72)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-164 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v546-broadcast-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 72 = Broadcast Engine**，来源：nanobot-design。

本迭代实现广播引擎：发送、接收、确认、统计（3 种模式：all/group/region）。

## 功能规格

### 1. 广播引擎架构

```
Broadcaster → Receiver → Acrknower
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/brd2/BroadcastEngine.ts` | 广播引擎 |
| `src/brd2/__tests__/BroadcastEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BroadcastMode = 'all' | 'group' | 'region';

class BroadcastEngine {
  send(message: string, sender: string, target: string, mode: BroadcastMode): string;
  receive(id: string): boolean;
  ack(id: string): boolean;
  getStats(): { broadcasts: number; totalSent: number; totalReceived: number; totalAcked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/brd2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/brd2/__tests__/BroadcastEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v546-broadcast-engine` 分支