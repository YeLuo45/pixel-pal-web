# PRD: PixelPal V287 — Nanobot Service Registry (Direction B Iteration 20)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-165 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v287-service-registry |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 20 = Service Registry**，来源：nanobot-design。

本迭代实现服务注册表：服务注册、服务发现、健康检查、版本管理。

## 功能规格

### 1. 服务注册表架构

```
ServiceRegistrar → ServiceDiscovery → HealthChecker → VersionManager
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/svc/ServiceRegistry.ts` | 服务注册表 |
| `src/svc/__tests__/ServiceRegistry.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Service {
  id: string;
  name: string;
  url: string;
  version: string;
  healthy: boolean;
  metadata: Record<string, string>;
}

class ServiceRegistry {
  register(service: Omit<Service, 'healthy'>): string;
  unregister(id: string): boolean;
  find(name: string): Service | null;
  setHealth(id: string, healthy: boolean): boolean;
  setVersion(id: string, version: string): boolean;
  listByVersion(version: string): Service[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/svc/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/svc/__tests__/ServiceRegistry.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v287-service-registry` 分支