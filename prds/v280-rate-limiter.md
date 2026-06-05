# PRD: PixelPal V280 — Thunderbolt Rate Limiter (Direction E Iteration 18)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-140 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v280-rate-limiter |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 18 = Rate Limiter**，来源：thunderbolt-design。

本迭代实现限流器：速率定义、速率检查、速率统计、速率重置。

## 功能规格

### 1. 限流器架构

```
RateDefiner → RateChecker → RateStatistics → RateReset
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/limiter/RateLimiter.ts` | 限流器 |
| `src/limiter/__tests__/RateLimiter.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface RateLimit {
  key: string;
  limit: number;
  window: number; // ms
  count: number;
  resetAt: number;
}

class RateLimiter {
  configure(key: string, limit: number, window: number): void;
  check(key: string): boolean;
  consume(key: string, amount?: number): boolean;
  reset(key: string): void;
  getStats(): { key: string; count: number; remaining: number }[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/limiter/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/limiter/__tests__/RateLimiter.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v280-rate-limiter` 分支