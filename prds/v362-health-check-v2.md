# PRD: PixelPal V362 — Nanobot Health Check v2 (Direction B Iteration 35)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-226 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v362-health-check-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 35 = Health Check v2**，来源：nanobot-design。

本迭代实现健康检查 v2：节点检查、阈值管理、状态报告、健康统计。

## 功能规格

### 1. 健康检查 v2 架构

```
NodeChecker → ThresholdManager → StatusReporter → HealthStatist
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/hc2/HealthCheckV2.ts` | 健康检查 v2 |
| `src/hc2/__tests__/HealthCheckV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface HealthCheck {
  id: string;
  node: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  threshold: number;
  lastValue: number;
}

class HealthCheckV2 {
  check(node: string, value: number, threshold: number): string;
  isHealthy(id: string): boolean;
  getStats(): { checks: number; healthy: number; degraded: number; unhealthy: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/hc2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/hc2/__tests__/HealthCheckV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v362-health-check-v2` 分支