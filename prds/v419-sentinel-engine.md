# PRD: PixelPal V419 — Generic-Agent Sentinel Engine (Direction D Iteration 46)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-435 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v419-sentinel-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 46 = Sentinel Engine**，来源：generic-agent-design。

本迭代实现哨兵引擎：哨兵注册、哨兵守卫、哨兵统计。

## 功能规格

### 1. 哨兵引擎架构

```
SentinelRegistrar → SentinelGuard → SentinelReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/se5/SentinelEngine.ts` | 哨兵引擎 |
| `src/se5/__tests__/SentinelEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Sentinel {
  id: string;
  name: string;
  watching: boolean;
  alerts: number;
}

class SentinelEngine {
  register(name: string): string;
  watch(id: string): boolean;
  alert(id: string): boolean;
  getStats(): { sentinels: number; watching: number; idle: number; totalAlerts: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/se5/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/se5/__tests__/SentinelEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v419-sentinel-engine` 分支