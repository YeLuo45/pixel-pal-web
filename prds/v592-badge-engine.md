# PRD: PixelPal V592 — Chatdev Badge Engine (Direction C Iteration 81)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-017 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v592-badge-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 81 = Badge Engine**，来源：chatdev-design。

本迭代实现徽章引擎：定义、授予、撤销、统计（5 种 tier：bronze/silver/gold/platinum/diamond）。

## 功能规格

### 1. 徽章引擎架构

```
BadgeDefiner → Awarder → Revoker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/bge/BadgeEngine.ts` | 徽章引擎 |
| `src/bge/__tests__/BadgeEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

class BadgeEngine {
  define(name: string, tier: BadgeTier): string;
  award(id: string): boolean;
  revoke(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { badges: number; totalAdded: number; totalAwarded: number; totalRevoked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/bge/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/bge/__tests__/BadgeEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v592-badge-engine` 分支