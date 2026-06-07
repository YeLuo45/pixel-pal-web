# PRD: PixelPal V567 — Chatdev Translation Engine (Direction C Iteration 76)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-269 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v567-translation-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 76 = Translation Engine**，来源：chatdev-design。

本迭代实现翻译引擎：添加、翻译、统计（6 种语言：en/zh/ja/es/fr/de）。

## 功能规格

### 1. 翻译引擎架构

```
TranslationAdder → Translator → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tre/TranslationEngine.ts` | 翻译引擎 |
| `src/tre/__tests__/TranslationEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type LangCode = 'en' | 'zh' | 'ja' | 'es' | 'fr' | 'de';

class TranslationEngine {
  add(key: string, source: string, sourceLang: LangCode, targetLang: LangCode): string;
  translate(id: string, newSource: string): boolean;
  remove(id: string): boolean;
  getStats(): { translations: number; totalAdded: number; totalTranslated: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tre/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tre/__tests__/TranslationEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v567-translation-engine` 分支