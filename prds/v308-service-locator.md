# PRD: PixelPal V308 — Chatdev Service Locator (Direction C Iteration 24)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-046 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v308-service-locator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 24 = Service Locator**，来源：chatdev-design。

本迭代实现服务定位器：服务注册、服务查找、服务依赖、服务缓存。

## 功能规格

### 1. 服务定位器架构

```
ServiceRegistrar → ServiceFinder → ServiceDependency → ServiceCache
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/locator/ServiceLocator.ts` | 服务定位器 |
| `src/locator/__tests__/ServiceLocator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Service {
  id: string;
  name: string;
  instance: unknown;
  dependencies: string[];
}

class ServiceLocator {
  register(service: Service): boolean;
  find(id: string): Service | null;
  resolve(id: string): unknown;
  getStats(): { services: number; resolutions: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/locator/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/locator/__tests__/ServiceLocator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v308-service-locator` 分支