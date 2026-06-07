# PRD: PixelPal V529 — Thunderbolt Timeout Engine (Direction E Iteration 68)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-082 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v529-timeout-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 68 = Timeout Engine**，来源：thunderbolt-design。

本迭代实现超时引擎：超时设置、检查、取消、清除、统计（3 种状态：pending/expired/cancelled）。

## 功能规格

### 1. 超时引擎架构

```
TimeoutSetter → TimeoutChecker → Canceller
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/toe2/TimeoutEngine.ts` | 超时引擎 |
| `src/toe2/__tests__/TimeoutEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type TimeoutStatus = 'pending' | 'expired' | 'cancelled';

class TimeoutEngine {
  set(name: string, duration: number): string;
  check(id: string, amount: number): TimeoutStatus;
  cancel(id: string): boolean;
  clear(id: string): boolean;
  getStats(): { timeouts: number; totalSet: number; totalExpired: number; totalCancelled: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/toe2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/toe2/__tests__/TimeoutEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v529-timeout-engine` 分支