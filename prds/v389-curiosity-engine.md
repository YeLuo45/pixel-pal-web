# PRD: PixelPal V389 — Generic-Agent Curiosity Engine (Direction D Iteration 40)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-319 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v389-curiosity-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 40 = Curiosity Engine**，来源：generic-agent-design。

本迭代实现好奇心引擎：问题生成、探索记录、好奇心统计。

## 功能规格

### 1. 好奇心引擎架构

```
QuestionGenerator → ExplorationRecorder → CuriosityReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ce2/CuriosityEngine.ts` | 好奇心引擎 |
| `src/ce2/__tests__/CuriosityEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Question {
  id: string;
  text: string;
  answered: boolean;
}

class CuriosityEngine {
  ask(text: string): string;
  answer(id: string): boolean;
  explore(id: string, info: string): boolean;
  getStats(): { questions: number; answered: number; pending: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ce2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ce2/__tests__/CuriosityEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v389-curiosity-engine` 分支