# PRD: PixelPal V284 — Generic-Agent Intuition Engine v2 (Direction D Iteration 19)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-160 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v284-intuition-engine-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 19 = Intuition Engine v2**，来源：generic-agent-design。

本迭代实现直觉引擎v2：观察积累、模式触发、模式评估、模式校准。

## 功能规格

### 1. 直觉引擎v2架构

```
ObservationAccumulator → PatternTrigger → PatternEvaluator → PatternCalibrator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/intuition/IntuitionEngineV2.ts` | 直觉引擎v2 |
| `src/intuition/__tests__/IntuitionEngineV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Observation {
  id: string;
  context: string;
  pattern: string;
  confidence: number;
  timestamp: number;
  occurrences: number;
}

class IntuitionEngineV2 {
  observe(context: string, pattern: string): string;
  trigger(context: string): string | null;
  evaluate(id: string, actual: boolean): boolean;
  calibrate(id: string, feedback: number): boolean;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/intuition/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/intuition/__tests__/IntuitionEngineV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v284-intuition-engine-v2` 分支