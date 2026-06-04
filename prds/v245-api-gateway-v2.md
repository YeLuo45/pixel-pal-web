# PRD: PixelPal V245 — Thunderbolt API Gateway v2 (Direction E Iteration 11)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-059 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v245-api-gateway-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 11 = API Gateway v2**，来源：thunderbolt-design。

本迭代实现API网关v2：路由注册、限流控制、认证授权、API聚合。

## 功能规格

### 1. API网关v2架构

```
RouteRegistry → RateLimiter → AuthManager → APIAggregator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/gateway/ApiGatewayV2.ts` | API网关v2 |
| `src/gateway/__tests__/ApiGatewayV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Route {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: string;
  authRequired: boolean;
  rateLimit: number;
}

class ApiGatewayV2 {
  registerRoute(route: Route): void;
  request(method: string, path: string, token?: string): { status: number; body: string };
  getRoutes(): Route[];
  getMetrics(): { total: number; allowed: number; blocked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/gateway/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/gateway/__tests__/ApiGatewayV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v245-api-gateway-v2` 分支