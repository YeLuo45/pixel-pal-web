# PRD: PixelPal V499 — Thunderbolt Backoff Engine (Direction E Iteration 62)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-196 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v499-backoff-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 62 = Backoff Engine**，来源：thunderbolt-design。

本迭代实现退避引擎：fixed/linear/exponential 退避策略、retry、reset、统计。

## 功能规格

### 1. 退避引擎架构

```
BackoffScheduler → RetryExecutor → BackoffResetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/boe/BackoffEngine.ts` | 退避引擎 |
| `src/boe/__tests__/BackoffEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BackoffStrategy = 'fixed' | 'linear' | 'exponential';

class BackoffEngine {
  schedule(strategy: BackoffStrategy, baseMs: number, maxMs: number): string;
  retry(id: string): number;
  reset(id: string): boolean;
  getStats(): { backoffs: number; totalRetries: number; totalResets: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/boe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/boe/__tests__/BackoffEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v499-backoff-engine` 分支