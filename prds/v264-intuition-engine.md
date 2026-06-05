# PRD: PixelPal V264 — Generic-Agent Intuition Engine (Direction D Iteration 15)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-102 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v264-intuition-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 15 = Intuition Engine**，来源：generic-agent-design。

本迭代实现直觉引擎：直觉积累、直觉触发、直觉评估、直觉校准。

## 功能规格

### 1. 直觉引擎架构

```
IntuitionAccumulator → IntuitionTrigger → IntuitionEvaluator → IntuitionCalibrator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/intuition/IntuitionEngine.ts` | 直觉引擎 |
| `src/intuition/__tests__/IntuitionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Intuition {
  id: string;
  context: string;
  hypothesis: string;
  confidence: number;
  occurrences: number;
}

class IntuitionEngine {
  observe(context: string, outcome: string): string;
  trigger(context: string): Intuition | null;
  calibrate(id: string, score: number): boolean;
  getTopIntuitions(limit: number): Intuition[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/intuition/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/intuition/__tests__/IntuitionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v264-intuition-engine` 分支