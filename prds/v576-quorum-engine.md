# PRD: PixelPal V576 — Nanobot Quorum Engine (Direction B Iteration 78)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-307 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v576-quorum-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 78 = Quorum Engine**，来源：nanobot-design。

本迭代实现法定人数引擎：添加成员、投票、检查、统计（3 种投票：yes/no/abstain）。

## 功能规格

### 1. 法定人数引擎架构

```
MemberAdder → Voter → Checker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/qum/QuorumEngine.ts` | 法定人数引擎 |
| `src/qum/__tests__/QuorumEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type QuorumVote = 'yes' | 'no' | 'abstain';

class QuorumEngine {
  addMember(name: string, weight: number): string;
  vote(id: string, v: QuorumVote): boolean;
  check(quorumRatio: number): boolean;
  remove(id: string): boolean;
  getStats(): { members: number; totalAdded: number; totalVoted: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/qum/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/qum/__tests__/QuorumEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v576-quorum-engine` 分支