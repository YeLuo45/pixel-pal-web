# PRD: PixelPal V472 — Chatdev Thread Engine (Direction C Iteration 57)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-083 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v472-thread-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 57 = Thread Engine**，来源：chatdev-design。

本迭代实现主题引擎：主题创建、回复、置顶、关闭、归档、统计。

## 功能规格

### 1. 主题引擎架构

```
ThreadCreator → PostReplier → Pinner → Closer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tte/ThreadEngine.ts` | 主题引擎 |
| `src/tte/__tests__/ThreadEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ThreadStatus = 'open' | 'closed' | 'archived';

class ThreadEngine {
  create(title: string, author: string): string;
  reply(id: string, author: string, content: string): string;
  pin(id: string): boolean;
  close(id: string): boolean;
  archive(id: string): boolean;
  getStats(): { threads: number; totalReplies: number; pinned: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tte/__tests__/ThreadEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v472-thread-engine` 分支