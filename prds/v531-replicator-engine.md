# PRD: PixelPal V531 — Nanobot Replicator Engine (Direction B Iteration 69)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-084 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v531-replicator-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 69 = Replicator Engine**，来源：nanobot-design。

本迭代实现复制器引擎：复制、同步、完成、失败、统计（4 种状态：pending/syncing/synced/failed）。

## 功能规格

### 1. 复制器引擎架构

```
Replicator → Syncer → Completer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rpe/ReplicatorEngine.ts` | 复制器引擎 |
| `src/rpe/__tests__/ReplicatorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ReplicateStatus = 'pending' | 'syncing' | 'synced' | 'failed';

class ReplicatorEngine {
  replicate(source: string, target: string): string;
  sync(id: string): boolean;
  complete(id: string): boolean;
  fail(id: string): boolean;
  getStats(): { replicas: number; totalReplicated: number; totalSynced: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rpe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rpe/__tests__/ReplicatorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v531-replicator-engine` 分支