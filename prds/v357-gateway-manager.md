# PRD: PixelPal V357 — Nanobot Gateway Manager (Direction B Iteration 34)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-200 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v357-gateway-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 34 = Gateway Manager**，来源：nanobot-design。

本迭代实现网关管理器：网关注册、流量路由、流量限制、网关报告。

## 功能规格

### 1. 网关管理器架构

```
GatewayRegistrar → FlowRouter → FlowLimiter → GatewayReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/gw/GatewayManager.ts` | 网关管理器 |
| `src/gw/__tests__/GatewayManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Gateway {
  id: string;
  name: string;
  endpoint: string;
  rateLimit: number;
  requests: number;
}

class GatewayManager {
  register(name: string, endpoint: string, rateLimit: number): string;
  forward(id: string): boolean;
  getStats(): { gateways: number; totalRequests: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/gw/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/gw/__tests__/GatewayManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v357-gateway-manager` 分支