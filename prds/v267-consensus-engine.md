# PRD: PixelPal V267 — Nanobot Consensus Engine (Direction B Iteration 16)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-107 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v267-consensus-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 16 = Consensus Engine**，来源：nanobot-design。

本迭代实现共识引擎：节点投票、提案提交、共识达成、共识审计。

## 功能规格

### 1. 共识引擎架构

```
VotingService → ProposalService → ConsensusBuilder → AuditService
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/consensus/ConsensusEngine.ts` | 共识引擎 |
| `src/consensus/__tests__/ConsensusEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Vote {
  voter: string;
  proposal: string;
  choice: 'yes' | 'no' | 'abstain';
}

interface Proposal {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: Vote[];
}

class ConsensusEngine {
  propose(title: string): string;
  vote(proposalId: string, voter: string, choice: Vote['choice']): boolean;
  tally(proposalId: string): 'yes' | 'no' | 'abstain' | 'tie';
  audit(proposalId: string): Proposal;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/consensus/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/consensus/__tests__/ConsensusEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v267-consensus-engine` 分支