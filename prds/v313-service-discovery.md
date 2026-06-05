# PRD: PixelPal V313 — Chatdev Service Discovery (Direction C Iteration 25)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-066 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v313-service-discovery |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 25 = Service Discovery**，来源：chatdev-design。

本迭代实现服务发现：服务注册、服务发现、健康检查、负载均衡。

## 功能规格

### 1. 服务发现架构

```
ServiceRegistrar → ServiceDiscoverer → HealthChecker → LoadBalancer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/disc/ServiceDiscovery.ts` | 服务发现 |
| `src/disc/__tests__/ServiceDiscovery.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface DiscoveryEntry {
  id: string;
  name: string;
  url: string;
  healthy: boolean;
  load: number;
}

class ServiceDiscovery {
  register(entry: Omit<DiscoveryEntry, 'healthy' | 'load'>): boolean;
  discover(name: string): DiscoveryEntry[];
  pick(name: string): DiscoveryEntry | null;
  getStats(): { entries: number; healthy: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/disc/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/disc/__tests__/ServiceDiscovery.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v313-service-discovery` 分支