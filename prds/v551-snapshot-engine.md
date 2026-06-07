# PRD: PixelPal V551 — Nanobot Snapshot Engine (Direction B Iteration 73)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-175 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v551-snapshot-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 73 = Snapshot Engine**，来源：nanobot-design。

本迭代实现快照引擎：拍摄、恢复、删除、统计（3 种状态：creating/ready/deleted）。

## 功能规格

### 1. 快照引擎架构

```
SnapshotTaker → Restorer → Deleter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sne/SnapshotEngine.ts` | 快照引擎 |
| `src/sne/__tests__/SnapshotEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type SnapshotStatus = 'creating' | 'ready' | 'deleted';

class SnapshotEngine {
  take(name: string, data: string): string;
  restore(id: string): boolean;
  delete(id: string): boolean;
  getStats(): { snapshots: number; totalTaken: number; totalRestored: number; totalDeleted: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sne/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sne/__tests__/SnapshotEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v551-snapshot-engine` 分支