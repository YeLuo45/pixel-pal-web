# PRD: PixelPal V502 — Chatdev Note Engine (Direction C Iteration 63)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-203 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v502-note-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 63 = Note Engine**，来源：chatdev-design。

本迭代实现笔记引擎：笔记添加、更新、置顶、删除、统计。

## 功能规格

### 1. 笔记引擎架构

```
NoteAdder → NoteUpdater → NotePinner
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/nte2/NoteEngine.ts` | 笔记引擎 |
| `src/nte2/__tests__/NoteEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
class NoteEngine {
  add(title: string, content: string, author: string): string;
  update(id: string, content: string): boolean;
  pin(id: string): boolean;
  unpin(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { notes: number; totalAdded: number; totalUpdated: number; totalDeleted: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/nte2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/nte2/__tests__/NoteEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v502-note-engine` 分支