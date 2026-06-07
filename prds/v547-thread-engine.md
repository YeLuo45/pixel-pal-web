# PRD: PixelPal V547 — Chatdev Thread Engine (Direction C Iteration 72)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-168 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v547-thread-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 72 = Thread Engine**，来源：chatdev-design。

本迭代实现线程引擎：创建、回复、关闭、归档、重新打开、统计（3 种状态：open/closed/archived）。

## 功能规格

### 1. 线程引擎架构

```
ThreadCreator → Replier → Closer/Archiver
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/the2/ThreadEngine.ts` | 线程引擎 |
| `src/the2/__tests__/ThreadEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ThreadStatus = 'open' | 'closed' | 'archived';

class ThreadEngine {
  create(title: string, author: string): string;
  reply(id: string): boolean;
  close(id: string): boolean;
  archive(id: string): boolean;
  reopen(id: string): boolean;
  getStats(): { threads: number; totalCreated: number; totalReplied: number; totalClosed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/the2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/the2/__tests__/ThreadEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v547-thread-engine` 分支