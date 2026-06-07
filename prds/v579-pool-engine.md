# PRD: PixelPal V579 — Thunderbolt Pool Engine (Direction E Iteration 78)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-316 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v579-pool-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 78 = Pool Engine**，来源：thunderbolt-design。

本迭代实现连接池引擎：添加、获取、释放、关闭、统计（3 种状态：idle/in-use/closed）。

## 功能规格

### 1. 连接池引擎架构

```
PoolAdder → Acquirer → Releaser → Closer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/poe/PoolEngine.ts` | 连接池引擎 |
| `src/poe/__tests__/PoolEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PoolState = 'idle' | 'in-use' | 'closed';

class PoolEngine {
  add(name: string): string;
  acquire(id: string, user: string): boolean;
  release(id: string): boolean;
  close(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { resources: number; totalAdded: number; totalAcquired: number; totalReleased: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/poe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/poe/__tests__/PoolEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v579-pool-engine` 分支