# PRD: PixelPal V544 — Thunderbolt Breaker Engine (Direction E Iteration 71)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-159 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v544-breaker-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 71 = Breaker Engine**，来源：thunderbolt-design。

本迭代实现断路器引擎：打开、跳闸、重置、半开、统计（3 种状态：closed/open/half-open）。

## 功能规格

### 1. 断路器引擎架构

```
BreakerOpener → Tripper → Resetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bre3/BreakerEngine.ts` | 断路器引擎 |
| `src/bre3/__tests__/BreakerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BreakerState = 'closed' | 'open' | 'half-open';

class BreakerEngine {
  open(name: string, threshold: number): string;
  trip(id: string): boolean;
  reset(id: string): boolean;
  halfOpen(id: string): boolean;
  getStats(): { breakers: number; totalOpened: number; totalTripped: number; totalReset: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bre3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bre3/__tests__/BreakerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v544-breaker-engine` 分支