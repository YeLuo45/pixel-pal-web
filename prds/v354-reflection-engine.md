# PRD: PixelPal V354 — Generic-Agent Reflection Engine (Direction D Iteration 33)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-188 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v354-reflection-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 33 = Reflection Engine**，来源：generic-agent-design。

本迭代实现反思引擎：反思记录、反思分析、反思评分、反思统计。

## 功能规格

### 1. 反思引擎架构

```
ReflectionRecorder → ReflectionAnalyzer → ReflectionScorer → ReflectionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ref/ReflectionEngine.ts` | 反思引擎 |
| `src/ref/__tests__/ReflectionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Reflection {
  id: string;
  trigger: string;
  insight: string;
  score: number;
  applied: number;
}

class ReflectionEngine {
  record(trigger: string, insight: string): string;
  apply(id: string, score: number): boolean;
  analyze(): { topInsight: string; avgScore: number };
  getStats(): { reflections: number; totalApplied: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ref/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ref/__tests__/ReflectionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v354-reflection-engine` 分支