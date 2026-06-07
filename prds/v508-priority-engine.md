# PRD: PixelPal V508 — Generic-Agent Priority Engine (Direction D Iteration 64)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-210 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v508-priority-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 64 = Priority Engine**，来源：generic-agent-design。

本迭代实现优先级引擎：项目添加、升级、降级、统计（4 级优先级：low/medium/high/critical）。

## 功能规格

### 1. 优先级引擎架构

```
ItemAdder → ItemPromoter → ItemDemoter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pri/PriorityEngine.ts` | 优先级引擎 |
| `src/pri/__tests__/PriorityEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

class PriorityEngine {
  add(name: string, level: PriorityLevel): string;
  promote(id: string, amount: number): boolean;
  demote(id: string, amount: number): boolean;
  getStats(): { items: number; totalAdded: number; totalPromoted: number; totalDemoted: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pri/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pri/__tests__/PriorityEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v508-priority-engine` 分支