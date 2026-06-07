# PRD: PixelPal V587 — Chatdev Block Engine (Direction C Iteration 80)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-002 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v587-block-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 80 = Block Engine**，来源：chatdev-design。

本迭代实现黑名单引擎：添加、屏蔽、取消屏蔽、统计（4 种原因：spam/abuse/inappropriate/other）。

## 功能规格

### 1. 黑名单引擎架构

```
BlockAdder → Blocker → Unblocker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bke/BlockEngine.ts` | 黑名单引擎 |
| `src/bke/__tests__/BlockEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BlockReason = 'spam' | 'abuse' | 'inappropriate' | 'other';

class BlockEngine {
  add(blocker: string, blocked: string, reason: BlockReason): string;
  block(id: string): boolean;
  unblock(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { blocks: number; totalAdded: number; totalBlocked: number; totalUnblocked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bke/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bke/__tests__/BlockEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v587-block-engine` 分支