# PRD: PixelPal V538 — Generic-Agent Intuition Engine (Direction D Iteration 70)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-091 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v538-intuition-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 70 = Intuition Engine**，来源：generic-agent-design。

本迭代实现直觉引擎：猜测、细化、确认、拒绝、统计（3 种状态：guessed/confirmed/rejected）。

## 功能规格

### 1. 直觉引擎架构

```
Guesser → Refiner → Confirmer/Rejecter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/iue/IntuitionEngine.ts` | 直觉引擎 |
| `src/iue/__tests__/IntuitionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type IntuitionStatus = 'guessed' | 'confirmed' | 'rejected';

class IntuitionEngine {
  guess(question: string, answer: string, confidence: number): string;
  refine(id: string, confidence: number): boolean;
  confirm(id: string): boolean;
  reject(id: string): boolean;
  getStats(): { intuitions: number; totalGuessed: number; totalRefined: number; totalConfirmed: number; totalRejected: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/iue/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/iue/__tests__/IntuitionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v538-intuition-engine` 分支