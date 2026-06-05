# PRD: PixelPal V297 — Nanobot Shard Manager (Direction B Iteration 22)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-020 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v297-shard-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 22 = Shard Manager**，来源：nanobot-design。

本迭代实现分片管理器：分片创建、数据分片、分片查询、分片迁移。

## 功能规格

### 1. 分片管理器架构

```
ShardCreator → DataSharder → ShardQuerier → ShardMigrator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/shard/ShardManager.ts` | 分片管理器 |
| `src/shard/__tests__/ShardManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Shard {
  id: string;
  name: string;
  size: number;
  keys: string[];
  active: boolean;
}

class ShardManager {
  createShard(name: string): string;
  assign(shardId: string, key: string): boolean;
  query(key: string): Shard | null;
  migrate(fromShard: string, toShard: string, key: string): boolean;
  getStats(): { shards: number; totalKeys: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/shard/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/shard/__tests__/ShardManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v297-shard-manager` 分支