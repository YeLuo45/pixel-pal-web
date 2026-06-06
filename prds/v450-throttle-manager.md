# PRD: PixelPal V450 — Thunderbolt Throttle Manager (Direction E Iteration 52)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-560 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v450-throttle-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 52 = Throttle Manager**，来源：thunderbolt-design。

本迭代实现节流管理器：节流创建、节流获取、节流释放、节流统计。

## 功能规格

### 1. 节流管理器架构

```
ThrottleCreator → ThrottleAcquirer → ThrottleReleaser
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/thm/ThrottleManager.ts` | 节流管理器 |
| `src/thm/__tests__/ThrottleManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Throttle {
  id: string;
  name: string;
  limit: number;
  acquired: number;
  active: boolean;
}

class ThrottleManager {
  create(name: string, limit: number): string;
  acquire(id: string): boolean;
  release(id: string): boolean;
  getStats(): { throttles: number; totalAcquired: number; totalReleased: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/thm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/thm/__tests__/ThrottleManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v450-throttle-manager` 分支