# PRD: PixelPal V262 — Nanobot Discovery Service (Direction B Iteration 15)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-099 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v262-discovery-service |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 15 = Discovery Service**，来源：nanobot-design。

本迭代实现发现服务：服务注册、服务发现、健康检查、服务公告。

## 功能规格

### 1. 发现服务架构

```
ServiceRegistry → ServiceDiscovery → HealthChecker → ServiceAnnouncer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/discover/DiscoveryService.ts` | 发现服务 |
| `src/discover/__tests__/DiscoveryService.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface ServiceEntry {
  id: string;
  name: string;
  url: string;
  healthy: boolean;
  registered: number;
}

class DiscoveryService {
  register(entry: ServiceEntry): void;
  discover(name: string): ServiceEntry[];
  checkHealth(id: string): boolean;
  announce(): ServiceEntry[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/discover/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/discover/__tests__/DiscoveryService.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v262-discovery-service` 分支