# PRD: PixelPal V604 — Thunderbolt Routing Engine (Direction E Iteration 83)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-052 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v604-routing-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 83 = Routing Engine**，来源：thunderbolt-design。

本迭代实现路由引擎：添加路由、匹配、统计（5 种 method：GET/POST/PUT/DELETE/PATCH），支持通配符 `*`。

## 功能规格

### 1. 路由引擎架构

```
RouteAdder → Matcher → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rte2/RoutingEngine.ts` | 路由引擎 |
| `src/rte2/__tests__/RoutingEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type RouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

class RoutingEngine {
  addRoute(pattern: string, method: RouteMethod): string;
  match(id: string, path: string): boolean;
  remove(id: string): boolean;
  getStats(): { routes: number; totalAdded: number; totalMatched: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rte2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rte2/__tests__/RoutingEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v604-routing-engine` 分支