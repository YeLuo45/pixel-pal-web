# PRD: PixelPal V303 — Chatdev API Gateway (Direction C Iteration 23)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-037 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v303-api-gateway |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 23 = API Gateway**，来源：chatdev-design。

本迭代实现API网关：路由注册、请求处理、响应缓存、限流配置。

## 功能规格

### 1. API网关架构

```
RouteRegistrar → RequestProcessor → ResponseCache → RateLimiter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/gw/APIGateway.ts` | API网关 |
| `src/gw/__tests__/APIGateway.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Route {
  method: string;
  path: string;
  handler: () => unknown;
}

class APIGateway {
  addRoute(method: string, path: string, handler: () => unknown): boolean;
  handle(method: string, path: string): unknown;
  getStats(): { routes: number; requests: number; cacheHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/gw/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/gw/__tests__/APIGateway.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v303-api-gateway` 分支