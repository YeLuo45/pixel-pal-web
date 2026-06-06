# PRD: PixelPal V407 — Nanobot Service Manager v2 (Direction B Iteration 44)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-376 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v407-service-manager-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 44 = Service Manager v2**，来源：nanobot-design。

本迭代实现服务管理器 v2：服务版本、负载均衡、状态跟踪、统计。

## 功能规格

### 1. 服务管理器 v2 架构

```
ServiceVersioner → LoadBalancer → StatusTracker → StatsReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/svcm2/ServiceManagerV2.ts` | 服务管理器 v2 |
| `src/svcm2/__tests__/ServiceManagerV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface V2Service {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'draining' | 'stopped';
  load: number;
  calls: number;
}

class ServiceManagerV2 {
  register(name: string, version: string): string;
  setStatus(id: string, status: 'active' | 'draining' | 'stopped'): boolean;
  call(id: string, load: number): boolean;
  getStats(): { services: number; active: number; draining: number; stopped: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/svcm2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/svcm2/__tests__/ServiceManagerV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v407-service-manager-v2` 分支