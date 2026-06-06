# PRD: PixelPal V368 — Chatdev Consensus Engine (Direction C Iteration 36)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-235 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v368-consensus-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 36 = Consensus Engine**，来源：chatdev-design。

本迭代实现共识引擎：提案注册、投票收集、共识达成、共识统计。

## 功能规格

### 1. 共识引擎架构

```
ProposalRegister → VoteCollector → ConsensusChecker → ConsensusReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cons/ConsensusEngine.ts` | 共识引擎 |
| `src/cons/__tests__/ConsensusEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Proposal {
  id: string;
  topic: string;
  votes: { yes: number; no: number; abstain: number };
  decided: boolean;
  passed: boolean;
}

class ConsensusEngine {
  propose(topic: string): string;
  vote(id: string, voter: string, choice: 'yes' | 'no' | 'abstain'): boolean;
  decide(id: string, threshold: number): boolean;
  getStats(): { proposals: number; passed: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cons/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cons/__tests__/ConsensusEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v368-consensus-engine` 分支