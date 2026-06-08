# PRD: PixelPal V601 — Nanobot Quota Engine (Direction B Iteration 83)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-047 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v601-quota-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 83 = Quota Engine**，来源：nanobot-design。

本迭代实现配额引擎：添加、使用、重置、统计（5 种 period：minute/hour/day/week/month）。

## 功能规格

### 1. 配额引擎架构

```
QuotaAdder → User → Resetter → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/qte/QuotaEngine.ts` | 配额引擎 |
| `src/qte/__tests__/QuotaEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type QuotaPeriod = 'minute' | 'hour' | 'day' | 'week' | 'month';

class QuotaEngine {
  add(name: string, period: QuotaPeriod, limit: number): string;
  use(id: string, amount?: number): boolean;
  reset(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { quotas: number; totalAdded: number; totalUsed: number; totalReset: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/qte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/qte/__tests__/QuotaEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v601-quota-engine` 分支