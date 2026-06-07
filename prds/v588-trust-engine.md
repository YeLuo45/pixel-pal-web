# PRD: PixelPal V588 — Generic-Agent Trust Engine (Direction D Iteration 80)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-005 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v588-trust-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 80 = Trust Engine**，来源：generic-agent-design。

本迭代实现信任引擎：添加实体、信任、不信任、统计（5 种级别：untrusted/low/medium/high/absolute）。

## 功能规格

### 1. 信任引擎架构

```
EntityAdder → Truster → Distruster
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tte/TrustEngine.ts` | 信任引擎 |
| `src/tte/__tests__/TrustEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type TrustLevel = 'untrusted' | 'low' | 'medium' | 'high' | 'absolute';

class TrustEngine {
  addEntity(name: string, initialLevel?: TrustLevel, initialScore?: number): string;
  trust(id: string, amount: number): boolean;
  distrust(id: string, amount: number): boolean;
  remove(id: string): boolean;
  getStats(): { entities: number; totalAdded: number; totalTrust: number; totalDistrust: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tte/__tests__/TrustEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v588-trust-engine` 分支