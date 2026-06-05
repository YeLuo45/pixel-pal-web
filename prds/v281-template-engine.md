# PRD: PixelPal V281 — Claude Code Template Engine (Direction A Iteration 19)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-143 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v281-template-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 19 = Template Engine**，来源：claude-code-design。

本迭代实现模板引擎：模板定义、变量替换、条件渲染、模板继承。

## 功能规格

### 1. 模板引擎架构

```
TemplateDefiner → VariableReplacer → ConditionalRenderer → TemplateInheritor
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tpl/TemplateEngine.ts` | 模板引擎 |
| `src/tpl/__tests__/TemplateEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Template {
  id: string;
  content: string;
  variables: string[];
  parent?: string;
}

interface RenderContext {
  [key: string]: unknown;
}

class TemplateEngine {
  register(template: Template): void;
  render(id: string, context: RenderContext): string;
  hasTemplate(id: string): boolean;
  listTemplates(): string[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tpl/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tpl/__tests__/TemplateEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v281-template-engine` 分支