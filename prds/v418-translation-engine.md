# PRD: PixelPal V418 — Chatdev Translation Engine (Direction C Iteration 46)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-432 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v418-translation-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 46 = Translation Engine**，来源：chatdev-design。

本迭代实现翻译引擎：翻译注册、翻译执行、翻译统计。

## 功能规格

### 1. 翻译引擎架构

```
TranslationRegistrar → TranslationExecutor → TranslationReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/te3/TranslationEngine.ts` | 翻译引擎 |
| `src/te3/__tests__/TranslationEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Translation {
  id: string;
  source: string;
  target: string;
  text: string;
  translated: string;
}

class TranslationEngine {
  add(source: string, target: string, text: string, translated: string): string;
  getByLang(source: string, target: string): Translation[];
  getStats(): { translations: number; uniqueLanguages: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/te3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/te3/__tests__/TranslationEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v418-translation-engine` 分支