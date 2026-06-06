# PRD: PixelPal V382 — Nanobot Network Manager (Direction B Iteration 39)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-293 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v382-network-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 39 = Network Manager**，来源：nanobot-design。

本迭代实现网络管理器：节点连接、消息路由、网络统计。

## 功能规格

### 1. 网络管理器架构

```
NodeConnector → MessageRouter → BandwidthMonitor → NetworkReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/nm2/NetworkManager.ts` | 网络管理器 |
| `src/nm2/__tests__/NetworkManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface NetworkNode {
  id: string;
  host: string;
  port: number;
  bandwidth: number;
}

class NetworkManager {
  connect(host: string, port: number): string;
  send(id: string, bytes: number): boolean;
  disconnect(id: string): boolean;
  getStats(): { nodes: number; totalBytes: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/nm2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/nm2/__tests__/NetworkManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v382-network-manager` 分支