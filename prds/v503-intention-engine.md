# PRD: PixelPal V503 — Generic-Agent Intention Engine (Direction D Iteration 63)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-204 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v503-intention-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 63 = Intention Engine**，来源：generic-agent-design。

本迭代实现意图引擎：意图声明、提交、完成、放弃、统计。

## 功能规格

### 1. 意图引擎架构

```
IntentionDeclarer → IntentionCommitter → IntentionCompleter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ine2/IntentionEngine.ts` | 意图引擎 |
| `src/ine2/__tests__/IntentionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type IntentionStatus = 'declared' | 'committed' | 'completed' | 'abandoned';

class IntentionEngine {
  declare(goal: string, motivation: string): string;
  commit(id: string): boolean;
  complete(id: string): boolean;
  abandon(id: string): boolean;
  getStats(): { intentions: number; totalDeclared: number; totalCommitted: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ine2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ine2/__tests__/IntentionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v503-intention-engine` 分支