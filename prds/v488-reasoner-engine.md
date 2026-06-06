# PRD: PixelPal V488 — Generic-Agent Reasoner Engine (Direction D Iteration 60)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-147 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v488-reasoner-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 60 = Reasoner Engine**，来源：generic-agent-design。

本迭代实现推理引擎：前提添加、推理、推理完成、推理失败、统计。

## 功能规格

### 1. 推理引擎架构

```
PremiseAdder → Inferencer → Completer/Failer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rre/ReasonerEngine.ts` | 推理引擎 |
| `src/rre/__tests__/ReasonerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ReasonStatus = 'pending' | 'inferred' | 'failed';

class ReasonerEngine {
  addPremise(statement: string, confidence: number): string;
  infer(conclusion: string, sourceIds: string[]): string;
  complete(id: string): boolean;
  fail(id: string): boolean;
  getStats(): { premises: number; inferences: number; totalInferred: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rre/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rre/__tests__/ReasonerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v488-reasoner-engine` 分支