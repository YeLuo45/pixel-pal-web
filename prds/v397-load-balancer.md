# PRD: PixelPal V397 — Nanobot Load Balancer (Direction B Iteration 42)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-335 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v397-load-balancer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 42 = Load Balancer**，来源：nanobot-design。

本迭代实现负载均衡器：节点注册、请求分发、负载统计。

## 功能规格

### 1. 负载均衡器架构

```
NodeRegistrar → RequestDispatcher → LoadReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/lb/LoadBalancer.ts` | 负载均衡器 |
| `src/lb/__tests__/LoadBalancer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Backend {
  id: string;
  name: string;
  weight: number;
  requests: number;
}

class LoadBalancer {
  add(name: string, weight: number): string;
  distribute(): string;
  complete(id: string): boolean;
  getStats(): { backends: number; totalRequests: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/lb/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/lb/__tests__/LoadBalancer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v397-load-balancer` 分支