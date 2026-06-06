# PRD: PixelPal V473 — Generic-Agent Belief Engine (Direction D Iteration 57)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-084 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v473-belief-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 57 = Belief Engine**，来源：generic-agent-design。

本迭代实现信念引擎：信念设置、信念强化、信念削弱、统计。

## 功能规格

### 1. 信念引擎架构

```
BeliefSetter → BeliefStrengthener → BeliefWeakener
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bfe/BeliefEngine.ts` | 信念引擎 |
| `src/bfe/__tests__/BeliefEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Belief {
  id: string;
  proposition: string;
  confidence: number; // 0-1
  evidence: number;
}

class BeliefEngine {
  set(proposition: string, confidence: number, evidence: number): string;
  strengthen(id: string, amount: number): boolean;
  weaken(id: string, amount: number): boolean;
  getStats(): { beliefs: number; totalStrengthens: number; totalWeakens: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bfe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bfe/__tests__/BeliefEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v473-belief-engine` 分支