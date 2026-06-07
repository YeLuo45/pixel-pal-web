# PRD: PixelPal V595 — Claude Code Alias Engine (Direction A Iteration 82)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-026 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v595-alias-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 82 = Alias Engine**，来源：claude-code-design。

本迭代实现别名引擎：定义、解析、删除、统计（4 种 type：shortcut/macro/redirect/symlink）。

## 功能规格

### 1. 别名引擎架构

```
AliasDefiner → Resolver → Remover
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ale/AliasEngine.ts` | 别名引擎 |
| `src/ale/__tests__/AliasEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type AliasType = 'shortcut' | 'macro' | 'redirect' | 'symlink';

class AliasEngine {
  define(name: string, target: string, type: AliasType): string;
  resolve(id: string): string | null;
  remove(id: string): boolean;
  getStats(): { aliases: number; totalAdded: number; totalResolved: number; totalRemoved: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ale/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ale/__tests__/AliasEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v595-alias-engine` 分支