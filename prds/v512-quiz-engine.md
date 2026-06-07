# PRD: PixelPal V512 — Chatdev Quiz Engine (Direction C Iteration 65)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-247 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v512-quiz-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 65 = Quiz Engine**，来源：chatdev-design。

本迭代实现测验引擎：题目添加、答题、计分、统计。

## 功能规格

### 1. 测验引擎架构

```
QuestionAdder → QuestionAnswerer → Scorer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/qze/QuizEngine.ts` | 测验引擎 |
| `src/qze/__tests__/QuizEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
class QuizEngine {
  add(text: string, answer: string): string;
  answer(id: string, given: string): boolean;
  check(id: string, given: string): boolean;
  getStats(): { questions: number; totalAdded: number; totalAnswered: number; totalCorrect: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/qze/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/qze/__tests__/QuizEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v512-quiz-engine` 分支