# PRD: PixelPal V557 — Chatdev Attachment Engine (Direction C Iteration 74)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-225 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v557-attachment-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 74 = Attachment Engine**，来源：chatdev-design。

本迭代实现附件引擎：添加、列表、删除、统计（5 种类型：image/video/audio/document/other）。

## 功能规格

### 1. 附件引擎架构

```
AttachmentAdder → Lister → Remover
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ate2/AttachmentEngine.ts` | 附件引擎 |
| `src/ate2/__tests__/AttachmentEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type AttachType = 'image' | 'video' | 'audio' | 'document' | 'other';

class AttachmentEngine {
  add(name: string, type: AttachType, size: number): string;
  list(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { attachments: number; totalAdded: number; totalListed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ate2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ate2/__tests__/AttachmentEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v557-attachment-engine` 分支