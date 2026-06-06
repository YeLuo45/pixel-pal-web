# PRD: PixelPal V339 — Generic-Agent Belief Network (Direction D Iteration 30)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-148 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v339-belief-network |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 30 = Belief Network**，来源：generic-agent-design。

本迭代实现信念网络：节点定义、关系建立、推理查询、信念报告。

## 功能规格

### 1. 信念网络架构

```
NodeDefiner → RelationBuilder → InferenceQuerier → BeliefReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bn/BeliefNetwork.ts` | 信念网络 |
| `src/bn/__tests__/BeliefNetwork.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface BeliefNode {
  id: string;
  name: string;
  belief: number;
}

class BeliefNetwork {
  addNode(name: string, belief: number): string;
  addEdge(from: string, to: string): boolean;
  query(id: string): number;
  getStats(): { nodes: number; edges: number; totalBelief: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bn/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bn/__tests__/BeliefNetwork.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v339-belief-network` 分支