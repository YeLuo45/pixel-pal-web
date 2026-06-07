# PRD: PixelPal V571 — Nanobot Range Engine (Direction B Iteration 77)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-273 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v571-range-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 77 = Range Engine**，来源：nanobot-design。

本迭代实现范围引擎：添加、检查、统计（4 种类型：numeric/date/time/string）。

## 功能规格

### 1. 范围引擎架构

```
RangeAdder → Checker → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rne/RangeEngine.ts` | 范围引擎 |
| `src/rne/__tests__/RangeEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type RangeKind = 'numeric' | 'date' | 'time' | 'string';

class RangeEngine {
  add(name: string, min: number | string, max: number | string, kind: RangeKind): string;
  check(id: string, value: number | string): boolean;
  remove(id: string): boolean;
  getStats(): { ranges: number; totalAdded: number; totalChecked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rne/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rne/__tests__/RangeEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v571-range-engine` 分支