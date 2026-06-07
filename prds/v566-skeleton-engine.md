# PRD: PixelPal V566 — Nanobot Skeleton Engine (Direction B Iteration 76)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-269 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v566-skeleton-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 76 = Skeleton Engine**，来源：nanobot-design。

本迭代实现骨架引擎：添加、添加字段、构建、统计（5 种字段类型：string/number/boolean/date/object）。

## 功能规格

### 1. 骨架引擎架构

```
SkeletonAdder → FieldAdder → Builder
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ske/SkeletonEngine.ts` | 骨架引擎 |
| `src/ske/__tests__/SkeletonEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object';

class SkeletonEngine {
  add(name: string): string;
  addField(id: string, fieldName: string, type: FieldType): boolean;
  build(id: string): boolean;
  getStats(): { skeletons: number; totalAdded: number; totalBuilt: number; totalFields: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ske/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ske/__tests__/SkeletonEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v566-skeleton-engine` 分支