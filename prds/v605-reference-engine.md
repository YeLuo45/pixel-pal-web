# PRD: PixelPal V605 — Claude Code Reference Engine (Direction A Iteration 84)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-053 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v605-reference-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 84 = Reference Engine**，来源：claude-code-design。

本迭代实现参考引用引擎：添加、引用、统计（6 种 kind：book/paper/article/web/doc/note）。

## 功能规格

### 1. 参考引擎架构

```
RefAdder → Citer → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rfe/ReferenceEngine.ts` | 参考引擎 |
| `src/rfe/__tests__/ReferenceEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ReferenceKind = 'book' | 'paper' | 'article' | 'web' | 'doc' | 'note';

class ReferenceEngine {
  add(title: string, author: string, kind: ReferenceKind, year: number): string;
  cite(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { references: number; totalAdded: number; totalCited: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rfe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rfe/__tests__/ReferenceEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v605-reference-engine` 分支