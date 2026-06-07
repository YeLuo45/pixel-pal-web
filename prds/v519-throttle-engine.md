# PRD: PixelPal V519 — Thunderbolt Throttle Engine (Direction E Iteration 66)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-270 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v519-throttle-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 66 = Throttle Engine**，来源：thunderbolt-design。

本迭代实现限流引擎：限流器添加、限流、检查、统计（3 种策略：fixed/sliding/token）。

## 功能规格

### 1. 限流引擎架构

```
ThrottleAdder → ThrottleExecutor → RateChecker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tte/ThrottleEngine.ts` | 限流引擎 |
| `src/tte/__tests__/ThrottleEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ThrottleStrategy = 'fixed' | 'sliding' | 'token';

class ThrottleEngine {
  add(name: string, strategy: ThrottleStrategy, rate: number): string;
  throttle(id: string): boolean;
  check(id: string): boolean;
  getStats(): { throttles: number; totalAdded: number; totalAllowed: number; totalBlocked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tte/__tests__/ThrottleEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v519-throttle-engine` 分支