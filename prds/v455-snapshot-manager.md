# PRD: PixelPal V455 — Thunderbolt Snapshot Manager (Direction E Iteration 53)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-568 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v455-snapshot-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 53 = Snapshot Manager**，来源：thunderbolt-design。

本迭代实现快照管理器：快照创建、快照恢复、快照删除、快照统计。

## 功能规格

### 1. 快照管理器架构

```
SnapshotCreator → SnapshotRestorer → SnapshotDeleter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/snm/SnapshotManager.ts` | 快照管理器 |
| `src/snm/__tests__/SnapshotManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Snapshot {
  id: string;
  name: string;
  data: string;
  size: number;
  created: number;
}

class SnapshotManager {
  create(name: string, data: string): string;
  restore(id: string): string;
  delete(id: string): boolean;
  getStats(): { snapshots: number; totalRestores: number; totalSize: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/snm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/snm/__tests__/SnapshotManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v455-snapshot-manager` 分支