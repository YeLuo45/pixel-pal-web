# PRD: PixelPal V227 — Nanobot Load Balancer (Direction B Iteration 8/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-028 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v227-load-balancer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 8/9 = Load Balancer**，来源：nanobot-design。

本迭代实现负载均衡器：轮询调度、加权调度、健康感知、限流。

## 功能规格

### 1. 负载均衡器架构

```
BackendRegistry → BalancerEngine → HealthChecker → RateLimiter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/balancer/LoadBalancer.ts` | 负载均衡器 |
| `src/balancer/__tests__/LoadBalancer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Backend {
  id: string;
  url: string;
  weight: number;
  healthy: boolean;
  activeConnections: number;
}

type BalanceStrategy = 'round-robin' | 'weighted' | 'least-connections';

class LoadBalancer {
  addBackend(backend: Backend): void;
  select(strategy: BalanceStrategy): Backend | null;
  incrementConnections(id: string): void;
  decrementConnections(id: string): void;
  markHealthy(id: string): void;
  markUnhealthy(id: string): void;
  canServe(id: string): boolean;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/balancer/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/balancer/__tests__/LoadBalancer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v227-load-balancer` 分支