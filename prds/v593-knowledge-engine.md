# PRD: PixelPal V593 — Generic-Agent Knowledge Engine (Direction D Iteration 81)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-020 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v593-knowledge-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 81 = Knowledge Engine**，来源：generic-agent-design。

本迭代实现知识引擎：添加事实、验证、忘记、统计（4 种 confidence：low/medium/high/certain）。

## 功能规格

### 1. 知识引擎架构

```
FactAdder → Verifier → Forgetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/kne/KnowledgeEngine.ts` | 知识引擎 |
| `src/kne/__tests__/KnowledgeEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type KnowledgeConfidence = 'low' | 'medium' | 'high' | 'certain';

class KnowledgeEngine {
  addFact(statement: string, confidence?: KnowledgeConfidence): string;
  verify(id: string): boolean;
  forget(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { facts: number; totalAdded: number; totalVerified: number; totalForgotten: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/kne/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/kne/__tests__/KnowledgeEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v593-knowledge-engine` 分支