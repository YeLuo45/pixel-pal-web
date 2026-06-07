# PRD: PixelPal V553 — Generic-Agent Curiosity Engine (Direction D Iteration 73)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-178 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v553-curiosity-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 73 = Curiosity Engine**，来源：generic-agent-design。

本迭代实现好奇心引擎：提问、探索、学习、统计（4 种级别：low/normal/high/extreme）。

## 功能规格

### 1. 好奇心引擎架构

```
Asker → Explorer → Learner
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cue/CuriosityEngine.ts` | 好奇心引擎 |
| `src/cue/__tests__/CuriosityEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type CuriosityLevel = 'low' | 'normal' | 'high' | 'extreme';

class CuriosityEngine {
  ask(topic: string, text: string, level: CuriosityLevel): string;
  explore(id: string): boolean;
  learn(id: string): boolean;
  getStats(): { questions: number; totalAsked: number; totalExplored: number; totalLearned: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cue/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cue/__tests__/CuriosityEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v553-curiosity-engine` 分支