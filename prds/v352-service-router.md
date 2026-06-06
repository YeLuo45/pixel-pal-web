# PRD: PixelPal V352 — Nanobot Service Router (Direction B Iteration 33)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-185 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v352-service-router |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 33 = Service Router**，来源：nanobot-design。

本迭代实现服务路由：服务注册、路由匹配、流量统计、路由报告。

## 功能规格

### 1. 服务路由架构

```
ServiceRegistrar → RouteMatcher → TrafficCounter → RouteReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sr/ServiceRouter.ts` | 服务路由 |
| `src/sr/__tests__/ServiceRouter.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface ServiceRoute {
  id: string;
  path: string;
  target: string;
  hits: number;
}

class ServiceRouter {
  register(path: string, target: string): string;
  route(path: string): string | null;
  getStats(): { routes: number; totalHits: number; avgHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sr/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sr/__tests__/ServiceRouter.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v352-service-router` 分支