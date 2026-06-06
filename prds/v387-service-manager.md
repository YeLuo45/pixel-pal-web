# PRD: PixelPal V387 — Nanobot Service Manager (Direction B Iteration 40)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-314 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v387-service-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 40 = Service Manager**，来源：nanobot-design。

本迭代实现服务管理器：服务注册、服务调用、服务统计。

## 功能规格

### 1. 服务管理器架构

```
ServiceRegistrar → ServiceInvoker → ServiceMonitor → ServiceReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/svcm/ServiceManager.ts` | 服务管理器 |
| `src/svcm/__tests__/ServiceManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface ManagedService {
  id: string;
  name: string;
  version: string;
  calls: number;
}

class ServiceManager {
  register(name: string, version: string): string;
  call(id: string): boolean;
  getStats(): { services: number; totalCalls: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/svcm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/svcm/__tests__/ServiceManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v387-service-manager` 分支