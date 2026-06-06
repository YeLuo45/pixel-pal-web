# PRD: PixelPal V423 — Chatdev Thread Engine (Direction C Iteration 47)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-466 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v423-thread-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 47 = Thread Engine**，来源：chatdev-design。

本迭代实现线程引擎：线程创建、消息发送、线程统计。

## 功能规格

### 1. 线程引擎架构

```
ThreadCreator → MessageDispatcher → ThreadReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/te4/ThreadEngine.ts` | 线程引擎 |
| `src/te4/__tests__/ThreadEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Thread {
  id: string;
  title: string;
  participants: string[];
  messages: number;
  locked: boolean;
}

class ThreadEngine {
  create(title: string, participants: string[]): string;
  post(id: string): boolean;
  lock(id: string): boolean;
  unlock(id: string): boolean;
  getStats(): { threads: number; totalMessages: number; locked: number; unlocked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/te4/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/te4/__tests__/ThreadEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v423-thread-engine` 分支