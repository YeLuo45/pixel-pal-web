# PRD: PixelPal V517 — Chatdev Vote Engine (Direction C Iteration 66)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-266 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v517-vote-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 66 = Vote Engine**，来源：chatdev-design。

本迭代实现投票引擎：选票创建、投票、计票、获胜者、统计（3 种类型：simple/ranked/approval）。

## 功能规格

### 1. 投票引擎架构

```
BallotCreator → BallotVoter → TallyCalculator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/vte/VoteEngine.ts` | 投票引擎 |
| `src/vte/__tests__/VoteEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type VoteType = 'simple' | 'ranked' | 'approval';

class VoteEngine {
  create(question: string, options: string[], type: VoteType): string;
  cast(id: string, option: string, weight: number): boolean;
  tally(id: string): Map<string, number>;
  winner(id: string): string;
  getStats(): { ballots: number; totalCreated: number; totalCast: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/vte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/vte/__tests__/VoteEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v517-vote-engine` 分支