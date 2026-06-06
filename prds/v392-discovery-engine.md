# PRD: PixelPal V392 — Nanobot Discovery Engine (Direction B Iteration 41)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-331 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v392-discovery-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 41 = Discovery Engine**，来源：nanobot-design。

本迭代实现发现引擎：节点发现、节点查询、节点统计。

## 功能规格

### 1. 发现引擎架构

```
NodeDiscoverer → NodeQuerier → DiscoveryReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/de2/DiscoveryEngine.ts` | 发现引擎 |
| `src/de2/__tests__/DiscoveryEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface DiscoveredNode {
  id: string;
  host: string;
  port: number;
  healthy: boolean;
}

class DiscoveryEngine {
  discover(host: string, port: number, healthy: boolean): string;
  queryByHealth(healthy: boolean): DiscoveredNode[];
  getStats(): { discovered: number; healthy: number; unhealthy: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/de2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/de2/__tests__/DiscoveryEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v392-discovery-engine` 分支