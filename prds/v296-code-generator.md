# PRD: PixelPal V296 — Claude Code Code Generator (Direction A Iteration 22)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-019 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v296-code-generator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 22 = Code Generator**，来源：claude-code-design。

本迭代实现代码生成器：模板加载、变量填充、代码生成、代码缓存。

## 功能规格

### 1. 代码生成器架构

```
TemplateLoader → VariableFiller → CodeGenerator → CodeCache
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/gen/CodeGenerator.ts` | 代码生成器 |
| `src/gen/__tests__/CodeGenerator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface GenTemplate {
  id: string;
  language: string;
  template: string;
}

interface GeneratedCode {
  id: string;
  templateId: string;
  code: string;
  timestamp: number;
}

class CodeGenerator {
  addTemplate(template: GenTemplate): boolean;
  generate(templateId: string, vars: Record<string, string>): string | null;
  getStats(): { templates: number; generated: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/gen/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/gen/__tests__/CodeGenerator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v296-code-generator` 分支