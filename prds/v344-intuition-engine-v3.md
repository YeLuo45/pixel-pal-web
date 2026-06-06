# PRD: PixelPal V344 — Generic-Agent Intuition Engine v3 (Direction D Iteration 31)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-159 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v344-intuition-engine-v3 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 31 = Intuition Engine v3**，来源：generic-agent-design。

本迭代实现直觉引擎 v3：直觉定义、直觉触发、直觉校准、直觉统计。

## 功能规格

### 1. 直觉引擎 v3 架构

```
IntuitionDefiner → IntuitionTrigger → IntuitionCalibrator → IntuitionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/intuition3/IntuitionEngineV3.ts` | 直觉引擎 v3 |
| `src/intuition3/__tests__/IntuitionEngineV3.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Intuition {
  id: string;
  signal: string;
  confidence: number;
  triggered: number;
}

class IntuitionEngineV3 {
  define(signal: string, confidence: number): string;
  trigger(id: string): boolean;
  calibrate(id: string, adjustment: number): boolean;
  getStats(): { intuitions: number; totalTriggers: number; avgConfidence: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/intuition3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/intuition3/__tests__/IntuitionEngineV3.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v344-intuition-engine-v3` 分支