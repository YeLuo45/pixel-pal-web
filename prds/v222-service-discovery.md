# PRD: PixelPal V222 — Nanobot Service Discovery (Direction B Iteration 7/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-022 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v222-service-discovery |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 7/9 = Service Discovery**，来源：nanobot-design。

本迭代实现服务发现：服务注册、健康检查、动态发现、负载均衡。

## 功能规格

### 1. 服务发现架构

```
ServiceRegistry → HealthChecker → DiscoveryEngine → LoadBalancer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/discovery/ServiceDiscovery.ts` | 服务发现引擎 |
| `src/discovery/__tests__/ServiceDiscovery.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface ServiceInstance {
  id: string;
  name: string;
  url: string;
  healthy: boolean;
  load: number;
  lastHeartbeat: number;
}

class ServiceDiscovery {
  register(instance: ServiceInstance): void;
  deregister(id: string): boolean;
  discover(name: string): ServiceInstance[];
  heartbeat(id: string): boolean;
  select(name: string): ServiceInstance | null;
  cleanup(maxAge: number): number;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/discovery/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/discovery/__tests__/ServiceDiscovery.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v222-service-discovery` 分支