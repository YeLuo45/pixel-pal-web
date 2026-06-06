# PRD: PixelPal V465 — Claude Code Path Engine (Direction A Iteration 56)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-041 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v465-path-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 56 = Path Engine**，来源：claude-code-design。

本迭代实现路径引擎：路径添加、路径解析、路径规范化、统计。

## 功能规格

### 1. 路径引擎架构

```
PathAdder → PathResolver → PathNormalizer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pe/PathEngine.ts` | 路径引擎 |
| `src/pe/__tests__/PathEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
class PathEngine {
  add(path: string): string;
  resolve(id: string): string;
  resolveWith(id: string, ext: string): string;
  getStats(): { paths: number; totalResolves: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pe/__tests__/PathEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v465-path-engine` 分支