# PRD: PixelPal V302 — Nanobot Circuit Breaker (Direction B Iteration 23)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-035 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v302-circuit-breaker |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 23 = Circuit Breaker**，来源：nanobot-design。

本迭代实现断路器：状态管理、失败计数、半开探测、重置。

## 功能规格

### 1. 断路器架构

```
StateManager → FailureCounter → HalfOpenProbe → Resetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/breaker/CircuitBreaker.ts` | 断路器 |
| `src/breaker/__tests__/CircuitBreaker.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BreakerState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  recordSuccess(): void;
  recordFailure(): void;
  canRequest(): boolean;
  reset(): void;
  getStats(): { state: BreakerState; failures: number; successes: number };
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
- [ ] Git commit 到 `v302-circuit-breaker` 分支