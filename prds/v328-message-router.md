# PRD: PixelPal V328 — Chatdev Message Router (Direction C Iteration 28)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-101 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v328-message-router |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 28 = Message Router**，来源：chatdev-design。

本迭代实现消息路由器：路由注册、路由匹配、消息分发、路由统计。

## 功能规格

### 1. 消息路由器架构

```
RouteRegistrar → RouteMatcher → MessageDispatcher → RouteReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/route/MessageRouter.ts` | 消息路由器 |
| `src/route/__tests__/MessageRouter.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Route {
  id: string;
  pattern: string;
  destination: string;
  hits: number;
}

class MessageRouter {
  register(pattern: string, destination: string): string;
  route(message: string): string | null;
  getStats(): { routes: number; totalHits: number; avgHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/route/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/route/__tests__/MessageRouter.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v328-message-router` 分支