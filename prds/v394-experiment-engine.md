# PRD: PixelPal V394 — Generic-Agent Experiment Engine (Direction D Iteration 41)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-334 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v394-experiment-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 41 = Experiment Engine**，来源：generic-agent-design。

本迭代实现实验引擎：实验设计、实验执行、实验分析、实验统计。

## 功能规格

### 1. 实验引擎架构

```
ExperimentDesigner → ExperimentRunner → ExperimentAnalyzer → ExperimentReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ee/ExperimentEngine.ts` | 实验引擎 |
| `src/ee/__tests__/ExperimentEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  result: 'pending' | 'confirmed' | 'rejected';
  trials: number;
}

class ExperimentEngine {
  design(name: string, hypothesis: string): string;
  run(id: string, confirmed: boolean): boolean;
  addTrial(id: string): boolean;
  getStats(): { experiments: number; confirmed: number; rejected: number; pending: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ee/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ee/__tests__/ExperimentEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v394-experiment-engine` 分支