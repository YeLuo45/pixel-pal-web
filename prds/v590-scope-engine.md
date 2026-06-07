# PRD: PixelPal V590 — Claude Code Scope Engine (Direction A Iteration 81)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-011 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v590-scope-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 81 = Scope Engine**，来源：claude-code-design。

本迭代实现作用域引擎：添加、进入、退出、深度、统计（4 种 type：function/block/module/global）。

## 功能规格

### 1. 作用域引擎架构

```
ScopeAdder → Enterer → Exiter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sce3/ScopeEngine.ts` | 作用域引擎 |
| `src/sce3/__tests__/ScopeEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ScopeType = 'function' | 'block' | 'module' | 'global';

class ScopeEngine {
  add(name: string, type: ScopeType): string;
  enter(id: string): boolean;
  exit(id: string): boolean;
  depth(id: string): number;
  remove(id: string): boolean;
  getStats(): { scopes: number; totalAdded: number; totalEntered: number; totalExited: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sce3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sce3/__tests__/ScopeEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v590-scope-engine` 分支