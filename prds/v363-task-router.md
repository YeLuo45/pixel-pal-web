# PRD: PixelPal V363 — Chatdev Task Router (Direction C Iteration 35)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-227 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v363-task-router |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 35 = Task Router**，来源：chatdev-design。

本迭代实现任务路由器：路由定义、路由匹配、路由优先级、路由统计。

## 功能规格

### 1. 任务路由器架构

```
RouteDefiner → RouteMatcher → RoutePrioritizer → RouteReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/trouter/TaskRouter.ts` | 任务路由器 |
| `src/trouter/__tests__/TaskRouter.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface TaskRoute {
  id: string;
  pattern: string;
  handler: string;
  priority: number;
  hits: number;
}

class TaskRouter {
  add(pattern: string, handler: string, priority: number): string;
  route(task: string): string | null;
  getStats(): { routes: number; totalHits: number; avgHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/trouter/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/trouter/__tests__/TaskRouter.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v363-task-router` 分支