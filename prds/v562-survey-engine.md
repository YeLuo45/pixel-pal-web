# PRD: PixelPal V562 — Chatdev Survey Engine (Direction C Iteration 75)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-264 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v562-survey-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 75 = Survey Engine**，来源：chatdev-design。

本迭代实现问卷引擎：添加问题、回答、打开、关闭、统计（3 种状态：draft/open/closed）。

## 功能规格

### 1. 问卷引擎架构

```
QuestionAdder → Answerer → Opener → Closer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sue2/SurveyEngine.ts` | 问卷引擎 |
| `src/sue2/__tests__/SurveyEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type SurveyStatus = 'draft' | 'open' | 'closed';

class SurveyEngine {
  addQuestion(question: string): string;
  answer(id: string, answer: string): boolean;
  open(id: string): boolean;
  close(id: string): boolean;
  getStats(): { surveys: number; totalAdded: number; totalAnswered: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sue2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sue2/__tests__/SurveyEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v562-survey-engine` 分支