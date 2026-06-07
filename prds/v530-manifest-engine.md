# PRD: PixelPal V530 — Claude Code Manifest Engine (Direction A Iteration 69)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-083 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v530-manifest-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 69 = Manifest Engine**，来源：claude-code-design。

本迭代实现清单引擎：清单创建、签名、验证、统计（3 种格式：json/yaml/xml）。

## 功能规格

### 1. 清单引擎架构

```
ManifestCreator → Signer → Verifier
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mfe/ManifestEngine.ts` | 清单引擎 |
| `src/mfe/__tests__/ManifestEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ManifestFormat = 'json' | 'yaml' | 'xml';

class ManifestEngine {
  create(name: string, version: string, content: string, format: ManifestFormat): string;
  sign(id: string): boolean;
  verify(id: string): boolean;
  getStats(): { manifests: number; totalCreated: number; totalSigned: number; totalVerified: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mfe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mfe/__tests__/ManifestEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v530-manifest-engine` 分支