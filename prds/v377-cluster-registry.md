# PRD: PixelPal V377 — Nanobot Cluster Registry (Direction B Iteration 38)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-285 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v377-cluster-registry |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 38 = Cluster Registry**，来源：nanobot-design。

本迭代实现集群注册：集群注册、心跳检测、集群注销、集群统计。

## 功能规格

### 1. 集群注册架构

```
ClusterRegistrar → HeartbeatChecker → ClusterDeregister → ClusterReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cr/ClusterRegistry.ts` | 集群注册 |
| `src/cr/__tests__/ClusterRegistry.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Cluster {
  id: string;
  name: string;
  address: string;
  lastHeartbeat: number;
  registered: boolean;
}

class ClusterRegistry {
  register(name: string, address: string): string;
  heartbeat(id: string): boolean;
  deregister(id: string): boolean;
  isAlive(id: string): boolean;
  getStats(): { clusters: number; alive: number; dead: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cr/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cr/__tests__/ClusterRegistry.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v377-cluster-registry` 分支