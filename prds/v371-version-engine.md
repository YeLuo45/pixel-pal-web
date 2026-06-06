# PRD: PixelPal V371 — Claude Code Version Engine (Direction A Iteration 37)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-243 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v371-version-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 37 = Version Engine**，来源：claude-code-design。

本迭代实现版本引擎：版本创建、版本比较、版本回滚、版本统计。

## 功能规格

### 1. 版本引擎架构

```
VersionCreator → VersionComparer → VersionRollbacker → VersionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ve/VersionEngine.ts` | 版本引擎 |
| `src/ve/__tests__/VersionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Version {
  id: string;
  name: string;
  semver: string;
  current: boolean;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
}

class VersionEngine {
  create(name: string, semver: string): string;
  setCurrent(id: string): boolean;
  compare(id1: string, id2: string): number;
  rollback(): string | null;
  getStats(): { versions: number; current: string | null; totalHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ve/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ve/__tests__/VersionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v371-version-engine` 分支