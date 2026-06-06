# PRD: PixelPal V479 — Thunderbolt Circuit Engine (Direction E Iteration 58)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-104 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v479-circuit-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 58 = Circuit Engine**，来源：thunderbolt-design。

本迭代实现熔断器引擎：熔断器创建、失败记录、自动开启、关闭、半开、统计。

## 功能规格

### 1. 熔断器引擎架构

```
CircuitCreator → FailureRecorder → StateController
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cie/CircuitEngine.ts` | 熔断器引擎 |
| `src/cie/__tests__/CircuitEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitEngine {
  create(name: string, threshold: number): string;
  recordFailure(id: string): boolean;
  open(id: string): boolean;
  close(id: string): boolean;
  halfOpen(id: string): boolean;
  canPass(id: string): boolean;
  getStats(): { circuits: number; closed: number; open: number; halfOpen: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cie/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cie/__tests__/CircuitEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v479-circuit-engine` 分支