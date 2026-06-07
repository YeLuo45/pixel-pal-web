# PRD: PixelPal V570 — Claude Code Resolver Engine (Direction A Iteration 77)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-272 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v570-resolver-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 77 = Resolver Engine**，来源：claude-code-design。

本迭代实现解析器引擎：添加、解析、统计（3 种模式：strict/lenient/default）。

## 功能规格

### 1. 解析器引擎架构

```
ResolverAdder → Resolver → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rse/ResolverEngine.ts` | 解析器引擎 |
| `src/rse/__tests__/ResolverEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ResolveMode = 'strict' | 'lenient' | 'default';

class ResolverEngine {
  add(key: string, value: string, mode: ResolveMode): string;
  resolve(id: string): string | null;
  remove(id: string): boolean;
  getStats(): { resolves: number; totalAdded: number; totalResolved: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rse/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rse/__tests__/ResolverEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v570-resolver-engine` 分支