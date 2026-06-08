# PRD: PixelPal V606 — Nanobot Lease Engine (Direction B Iteration 84)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-055 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v606-lease-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 84 = Lease Engine**，来源：nanobot-design。

本迭代实现租约引擎：租用、续约、释放、统计（4 种 state：available/leased/expired/revoked）。

## 功能规格

### 1. 租约引擎架构

```
LeaseAdder → Renewer → Releaser
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/lee/LeaseEngine.ts` | 租约引擎 |
| `src/lee/__tests__/LeaseEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type LeaseState = 'available' | 'leased' | 'expired' | 'revoked';

class LeaseEngine {
  add(resource: string, holder: string, duration: number): string;
  renew(id: string, extraDuration: number): boolean;
  release(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { leases: number; totalAdded: number; totalRenewed: number; totalReleased: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/lee/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/lee/__tests__/LeaseEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v606-lease-engine` 分支