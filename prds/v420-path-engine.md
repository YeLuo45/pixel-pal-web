# PRD: PixelPal V420 — Thunderbolt Path Engine (Direction E Iteration 46)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-437 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v420-path-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 46 = Path Engine**，来源：thunderbolt-design。

本迭代实现路径引擎：路径注册、路径导航、路径统计。

## 功能规格

### 1. 路径引擎架构

```
PathRegistrar → PathNavigator → PathReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pe6/PathEngine.ts` | 路径引擎 |
| `src/pe6/__tests__/PathEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Path {
  id: string;
  name: string;
  segments: string[];
  visited: number;
}

class PathEngine {
  register(name: string, segments: string[]): string;
  visit(id: string, segment: string): boolean;
  getCurrentSegment(id: string): string;
  getStats(): { paths: number; totalVisits: number; totalSegments: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pe6/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pe6/__tests__/PathEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v420-path-engine` 分支