# PRD: PixelPal V277 — Nanobot Workload Balancer (Direction B Iteration 18)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-136 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v277-workload-balancer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 18 = Workload Balancer**，来源：nanobot-design。

本迭代实现负载均衡器：工作节点、负载分配、健康检查、负载迁移。

## 功能规格

### 1. 负载均衡器架构

```
WorkerRegistry → LoadDistributor → HealthChecker → MigrationManager
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/balancer/WorkloadBalancer.ts` | 负载均衡器 |
| `src/balancer/__tests__/WorkloadBalancer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Worker {
  id: string;
  capacity: number;
  load: number;
  healthy: boolean;
}

class WorkloadBalancer {
  registerWorker(worker: Omit<Worker, 'load' | 'healthy'>): void;
  assign(task: { id: string; size: number }): string | null;
  rebalance(): string[];
  getStats(): { workers: number; totalLoad: number; utilization: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/balancer/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/balancer/__tests__/WorkloadBalancer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v277-workload-balancer` 分支