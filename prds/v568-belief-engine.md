# PRD: PixelPal V568 — Generic-Agent Belief Engine (Direction D Iteration 76)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-270 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v568-belief-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 76 = Belief Engine**，来源：generic-agent-design。

本迭代实现信念引擎：添加、修正、统计（4 种强度：weak/moderate/strong/absolute）。

## 功能规格

### 1. 信念引擎架构

```
BeliefAdder → Reviser → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ble/BeliefEngine.ts` | 信念引擎 |
| `src/ble/__tests__/BeliefEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BeliefStrength = 'weak' | 'moderate' | 'strong' | 'absolute';

class BeliefEngine {
  add(name: string, statement: string, strength: BeliefStrength, confidence: number): string;
  revise(id: string, confidence: number): boolean;
  remove(id: string): boolean;
  getStats(): { beliefs: number; totalAdded: number; totalRevised: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ble/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ble/__tests__/BeliefEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v568-belief-engine` 分支