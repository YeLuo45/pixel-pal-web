# PRD: PixelPal V337 — Nanobot State Sync (Direction B Iteration 30)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-144 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v337-state-sync |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 30 = State Sync**，来源：nanobot-design。

本迭代实现状态同步器：节点注册、状态发布、状态同步、状态报告。

## 功能规格

### 1. 状态同步器架构

```
NodeRegistrar → StatePublisher → StateSyncer → StateReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sync/StateSync.ts` | 状态同步器 |
| `src/sync/__tests__/StateSync.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface NodeState {
  id: string;
  nodeId: string;
  state: unknown;
  version: number;
  synced: boolean;
}

class StateSync {
  registerNode(nodeId: string): string;
  publish(nodeId: string, state: unknown): boolean;
  sync(): number;
  getStats(): { nodes: number; total: number; synced: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sync/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sync/__tests__/StateSync.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v337-state-sync` 分支