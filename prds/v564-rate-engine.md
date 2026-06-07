# PRD: PixelPal V564 — Thunderbolt Rate Engine (Direction E Iteration 75)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-267 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v564-rate-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 75 = Rate Engine**，来源：thunderbolt-design。

本迭代实现速率引擎：添加、滴答、阻止、重置、统计（3 种状态：ok/limited/blocked）。

## 功能规格

### 1. 速率引擎架构

```
RateAdder → Ticker → Blocker → Resetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rae/RateEngine.ts` | 速率引擎 |
| `src/rae/__tests__/RateEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type RateState = 'ok' | 'limited' | 'blocked';

class RateEngine {
  add(name: string, limit: number): string;
  tick(id: string): boolean;
  block(id: string): boolean;
  reset(id: string): boolean;
  getStats(): { rates: number; totalAdded: number; totalLimited: number; totalBlocked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rae/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rae/__tests__/RateEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v564-rate-engine` 分支