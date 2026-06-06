# PRD: PixelPal V396 — Claude Code Schema Engine (Direction A Iteration 42)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-336 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v396-schema-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 42 = Schema Engine**，来源：claude-code-design。

本迭代实现模式引擎：模式定义、模式验证、模式统计。

## 功能规格

### 1. 模式引擎架构

```
SchemaDefiner → SchemaValidator → SchemaReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/se2/SchemaEngine.ts` | 模式引擎 |
| `src/se2/__tests__/SchemaEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Schema {
  id: string;
  name: string;
  fields: string[];
  valid: number;
  invalid: number;
}

class SchemaEngine {
  define(name: string, fields: string[]): string;
  validate(id: string, valid: boolean): boolean;
  getStats(): { schemas: number; totalValid: number; totalInvalid: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/se2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/se2/__tests__/SchemaEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v396-schema-engine` 分支