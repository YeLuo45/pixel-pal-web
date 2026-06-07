# PRD: PixelPal V552 — Chatdev Comment Engine (Direction C Iteration 73)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-176 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v552-comment-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 73 = Comment Engine**，来源：chatdev-design。

本迭代实现评论引擎：添加、回复、置顶、取消置顶、隐藏、统计（3 种状态：visible/hidden/deleted）。

## 功能规格

### 1. 评论引擎架构

```
CommentAdder → Replier → Pinner/Unpinner → Hider
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/coe/CommentEngine.ts` | 评论引擎 |
| `src/coe/__tests__/CommentEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type CommentStatus = 'visible' | 'hidden' | 'deleted';

class CommentEngine {
  add(text: string, author: string, parent: string): string;
  reply(id: string, text: string, author: string): string;
  pin(id: string): boolean;
  unpin(id: string): boolean;
  hide(id: string): boolean;
  getStats(): { comments: number; totalAdded: number; totalReplied: number; totalPinned: number; totalHidden: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/coe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/coe/__tests__/CommentEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v552-comment-engine` 分支