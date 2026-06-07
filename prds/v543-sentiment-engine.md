# PRD: PixelPal V543 — Generic-Agent Sentiment Engine (Direction D Iteration 71)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-158 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v543-sentiment-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 71 = Sentiment Engine**，来源：generic-agent-design。

本迭代实现情感引擎：评分、分类、统计（3 种情感：positive/neutral/negative）。

## 功能规格

### 1. 情感引擎架构

```
Scorer → Classifier → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/snt/SentimentEngine.ts` | 情感引擎 |
| `src/snt/__tests__/SentimentEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type Sentiment = 'positive' | 'neutral' | 'negative';

class SentimentEngine {
  score(text: string, score: number): string;
  classify(id: string, score: number): boolean;
  remove(id: string): boolean;
  getStats(): { items: number; totalScored: number; totalClassified: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/snt/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/snt/__tests__/SentimentEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v543-sentiment-engine` 分支