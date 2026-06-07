# PRD: PixelPal V574 — Thunderbolt Scale Engine (Direction E Iteration 77)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-305 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v574-scale-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 77 = Scale Engine**，来源：thunderbolt-design。

本迭代实现伸缩引擎：添加、伸缩、自动、统计（4 种方向：up/down/auto/none）。

## 功能规格

### 1. 伸缩引擎架构

```
ScaleAdder → Scaler → AutoSetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/see/ScaleEngine.ts` | 伸缩引擎 |
| `src/see/__tests__/ScaleEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ScaleDirection = 'up' | 'down' | 'auto' | 'none';

class ScaleEngine {
  add(name: string, capacity: number): string;
  scale(id: string, target: number): boolean;
  setAuto(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { units: number; totalAdded: number; totalScaled: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/see/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/see/__tests__/ScaleEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v574-scale-engine` 分支