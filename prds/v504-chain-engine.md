# PRD: PixelPal V504 — Thunderbolt Chain Engine (Direction E Iteration 63)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-205 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v504-chain-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 63 = Chain Engine**，来源：thunderbolt-design。

本迭代实现链式引擎：链接添加、执行、完成、失败、统计。

## 功能规格

### 1. 链式引擎架构

```
LinkAdder → LinkExecuter → LinkCompleter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/che/ChainEngine.ts` | 链式引擎 |
| `src/che/__tests__/ChainEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ChainStepStatus = 'pending' | 'running' | 'completed' | 'failed';

class ChainEngine {
  addLink(name: string, index: number): string;
  execute(id: string): boolean;
  complete(id: string, result: string): boolean;
  fail(id: string): boolean;
  getStats(): { links: number; totalAdded: number; totalExecuted: number; totalCompleted: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/che/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/che/__tests__/ChainEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v504-chain-engine` 分支