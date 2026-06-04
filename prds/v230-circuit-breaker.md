# PRD: PixelPal V230 — Thunderbolt Circuit Breaker (Direction E Iteration 8/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-031 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v230-circuit-breaker |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 8/9 = Circuit Breaker**，来源：thunderbolt-design。

本迭代实现熔断器：失败检测、状态转换、半开探测、熔断统计。

## 功能规格

### 1. 熔断器架构

```
FailureDetector → StateMachine → HalfOpenProbe → BreakerStats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/breaker/CircuitBreaker.ts` | 熔断器 |
| `src/breaker/__tests__/CircuitBreaker.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BreakerState = 'closed' | 'open' | 'half_open';

interface BreakerStats {
  totalRequests: number;
  failedRequests: number;
  rejectedRequests: number;
  stateTransitions: number;
}

class CircuitBreaker {
  call<T>(fn: () => Promise<T>): Promise<T>;
  recordSuccess(): void;
  recordFailure(): void;
  getState(): BreakerState;
  reset(): void;
  getStats(): BreakerStats;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/breaker/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/breaker/__tests__/CircuitBreaker.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v230-circuit-breaker` 分支