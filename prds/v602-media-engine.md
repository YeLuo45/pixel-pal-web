# PRD: PixelPal V602 — Chatdev Media Engine (Direction C Iteration 83)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-050 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v602-media-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 83 = Media Engine**，来源：chatdev-design。

本迭代实现媒体引擎：添加、附加、分离、统计（5 种 kind：image/video/audio/doc/embed）。

## 功能规格

### 1. 媒体引擎架构

```
MediaAdder → Attacher → Detacher
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mme/MediaEngine.ts` | 媒体引擎 |
| `src/mme/__tests__/MediaEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type MediaKind = 'image' | 'video' | 'audio' | 'doc' | 'embed';

class MediaEngine {
  add(name: string, kind: MediaKind, url: string, size?: number): string;
  attach(id: string): boolean;
  detach(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { media: number; totalAdded: number; totalAttached: number; totalDetached: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mme/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mme/__tests__/MediaEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v602-media-engine` 分支