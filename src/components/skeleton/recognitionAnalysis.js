/**
 * 在线识别 URL / 图片 / 布局文件 → 骨架 Schema（已按 P1→P2→P3 落地）。
 *
 * 实现入口：
 * - P1：`skeletonImport.js` + 工作室「识别导入」粘贴/文件
 * - P2：`POST /api/skeleton/fetch-url` + 前端同套 HTML 启发式
 * - P3：`POST /api/skeleton/from-image` + AI Schema JSON
 */

export const SKELETON_RECOGNITION_ANALYSIS = {
  urlHtml: {
    feasible: true,
    needNewNpm: false,
    implemented: true,
    approach: [
      '跨域：后端 Jsoup 代理拉取 HTML',
      '解析：前端 DOMParser 启发式映射到 Schema',
      '映射：header/nav → row；img/avatar → circle|block；p/h* → line/lines；input → field；列表 → stack',
    ],
    limits: '动态 SPA 不执行 JS 会漏结构；复杂页需人工微调',
  },
  image: {
    feasible: true,
    needNewNpmFrontend: false,
    implemented: true,
    approach: [
      '前端 Canvas 压缩 JPEG base64',
      '后端 AiService.chat + 多模态 mediaData',
      'Prompt 约束返回 Skeleton Schema JSON',
    ],
    limits: '自由布局准确率有限，适合粗骨架再拖拽微调',
  },
  layoutFile: {
    feasible: true,
    needNewNpm: false,
    implemented: true,
    approach: [
      '粘贴/上传：Schema JSON、HTML、Vue SFC template',
      'JSON 直接 load；HTML/SFC 用 DOMParser',
    ],
  },
  recommendedPhases: [
    'P1：粘贴 HTML / 上传 Schema JSON / 布局文件（已实现）',
    'P2：URL 后端抓取 + 前端启发式（已实现）',
    'P3：截图 → AI Schema（已实现）',
  ],
}
