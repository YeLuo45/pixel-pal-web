# PRD: PixelPal V480 — Claude Code Migration Engine (Direction A Iteration 59)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-105 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v480-migration-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 59 = Migration Engine**，来源：claude-code-design。

本迭代实现迁移引擎：迁移计划、迁移应用、迁移回滚、迁移失败、统计。

## 功能规格

### 1. 迁移引擎架构

```
MigrationPlanner → MigrationApplier → MigrationRollbacker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mge/MigrationEngine.ts` | 迁移引擎 |
| `src/mge/__tests__/MigrationEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type MigrationStatus = 'pending' | 'applied' | 'rolled-back' | 'failed';

class MigrationEngine {
  plan(name: string, version: string): string;
  apply(id: string): boolean;
  rollback(id: string): boolean;
  fail(id: string): boolean;
  getStats(): { migrations: number; totalApplied: number; totalRolledBack: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mge/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mge/__tests__/MigrationEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v480-migration-engine` 分支