# PRD: PixelPal V235 — Thunderbolt Retry Engine (Direction E Iteration 9/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-036 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v235-retry-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 9/9 = Retry Engine**，来源：thunderbolt-design。

本迭代实现重试引擎：重试策略、退避算法、重试限制、重试统计。

## 功能规格

### 1. 重试引擎架构

```
RetryPolicy → BackoffCalculator → RetryExecutor → RetryStats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/retry/RetryEngine.ts` | 重试引擎 |
| `src/retry/__tests__/RetryEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BackoffStrategy = 'fixed' | 'exponential' | 'linear';

interface RetryConfig {
  maxAttempts: number;
  backoff: BackoffStrategy;
  initialDelayMs: number;
}

class RetryEngine {
  execute<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T>;
  calculateDelay(attempt: number, config: RetryConfig): number;
  getStats(): { total: number; successful: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/retry/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/retry/__tests__/RetryEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v235-retry-engine` 分支