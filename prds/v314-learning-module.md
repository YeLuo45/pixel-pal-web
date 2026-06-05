# PRD: PixelPal V314 — Generic-Agent Learning Module (Direction D Iteration 25)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-068 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v314-learning-module |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 25 = Learning Module**，来源：generic-agent-design。

本迭代实现学习模块：经验记录、经验评分、经验检索、经验衰减。

## 功能规格

### 1. 学习模块架构

```
ExperienceRecorder → ExperienceScorer → ExperienceRetriever → ExperienceDecay
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/learn/LearningModule.ts` | 学习模块 |
| `src/learn/__tests__/LearningModule.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Experience {
  id: string;
  context: string;
  outcome: string;
  score: number;
  decay: number;
}

class LearningModule {
  record(context: string, outcome: string, score: number): string;
  retrieve(threshold: number): Experience[];
  decay(): void;
  getStats(): { experiences: number; total: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/learn/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/learn/__tests__/LearningModule.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v314-learning-module` 分支