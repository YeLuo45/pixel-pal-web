# PRD: PixelPal V319 — Generic-Agent Belief Engine (Direction D Iteration 26)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-076 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v319-belief-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 26 = Belief Engine**，来源：generic-agent-design。

本迭代实现信念引擎：信念定义、信念更新、信念查询、信念继承。

## 功能规格

### 1. 信念引擎架构

```
BeliefDefiner → BeliefUpdater → BeliefQuerier → BeliefInheritor
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/belief/BeliefEngine.ts` | 信念引擎 |
| `src/belief/__tests__/BeliefEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Belief {
  id: string;
  name: string;
  value: unknown;
  confidence: number;
  parent: string | null;
  updated: number;
}

class BeliefEngine {
  define(name: string, value: unknown, parent?: string): string;
  update(id: string, value: unknown, confidence: number): boolean;
  query(name: string): Belief[];
  getStats(): { beliefs: number; avgConfidence: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/belief/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/belief/__tests__/BeliefEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v319-belief-engine` 分支