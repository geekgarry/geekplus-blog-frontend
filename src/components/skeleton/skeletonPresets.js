/**
 * 骨架屏常用版块模板（复杂站点布局）。
 * apply 时深拷贝节点，避免污染预设源。
 */
import { createSkeletonNode, cloneSkeletonNode } from './skeletonSchema'

function build(nodes) {
  return nodes.map((n) => cloneSkeletonNode(n))
}

/** 头像 | 文案 */
function presetAvatarText() {
  const stack = createSkeletonNode('stack', {
    flex: 1,
    children: [
      createSkeletonNode('line', { width: '65%', height: 16 }),
      createSkeletonNode('line', { width: '40%', height: 12 }),
    ],
  })
  return build([
    createSkeletonNode('row', {
      align: 'center',
      gap: 12,
      children: [createSkeletonNode('circle', { size: 52 }), stack],
    }),
  ])
}

/** 顶栏导航 + 内容区 */
function presetNavContent() {
  return build([
    createSkeletonNode('row', {
      align: 'center',
      justify: 'space-between',
      gap: 16,
      children: [
        createSkeletonNode('block', { width: '28%', height: 28, radius: 6, flex: '' }),
        createSkeletonNode('row', {
          width: '55%',
          gap: 10,
          align: 'center',
          justify: 'flex-end',
          children: [
            createSkeletonNode('line', { width: 48, height: 12, radius: 4 }),
            createSkeletonNode('line', { width: 48, height: 12, radius: 4 }),
            createSkeletonNode('line', { width: 48, height: 12, radius: 4 }),
            createSkeletonNode('circle', { size: 28 }),
          ],
        }),
      ],
    }),
    createSkeletonNode('gap', { height: 16 }),
    createSkeletonNode('block', { height: 160, radius: 10 }),
    createSkeletonNode('gap', { height: 12 }),
    createSkeletonNode('lines', { count: 3 }),
  ])
}

/** 侧栏 + 主内容（后台常见） */
function presetSidebarMain() {
  return build([
    createSkeletonNode('row', {
      align: 'stretch',
      gap: 14,
      children: [
        createSkeletonNode('stack', {
          width: '28%',
          flex: '',
          gap: 10,
          children: [
            createSkeletonNode('block', { height: 36, radius: 6 }),
            createSkeletonNode('line', { width: '90%', height: 12 }),
            createSkeletonNode('line', { width: '80%', height: 12 }),
            createSkeletonNode('line', { width: '85%', height: 12 }),
            createSkeletonNode('line', { width: '70%', height: 12 }),
            createSkeletonNode('gap', { height: 8 }),
            createSkeletonNode('line', { width: '88%', height: 12 }),
            createSkeletonNode('line', { width: '75%', height: 12 }),
          ],
        }),
        createSkeletonNode('stack', {
          flex: 1,
          gap: 12,
          children: [
            createSkeletonNode('row', {
              gap: 10,
              children: [
                createSkeletonNode('block', { height: 72, radius: 8, flex: 1 }),
                createSkeletonNode('block', { height: 72, radius: 8, flex: 1 }),
                createSkeletonNode('block', { height: 72, radius: 8, flex: 1 }),
              ],
            }),
            createSkeletonNode('block', { height: 180, radius: 8 }),
          ],
        }),
      ],
    }),
  ])
}

/** 文章详情：标题 / 元信息 / 封面 / 正文 */
function presetArticleDetail() {
  return build([
    createSkeletonNode('line', { width: '88%', height: 22, radius: 4 }),
    createSkeletonNode('gap', { height: 8 }),
    createSkeletonNode('row', {
      gap: 10,
      align: 'center',
      children: [
        createSkeletonNode('circle', { size: 28 }),
        createSkeletonNode('line', { width: 80, height: 12 }),
        createSkeletonNode('line', { width: 64, height: 12 }),
      ],
    }),
    createSkeletonNode('gap', { height: 14 }),
    createSkeletonNode('block', { height: 180, radius: 10 }),
    createSkeletonNode('gap', { height: 14 }),
    createSkeletonNode('lines', { count: 5, height: 12, gap: 10, lastWidth: '72%' }),
  ])
}

/** 卡片信息流（双列卡片） */
function presetCardFeed() {
  const card = () =>
    createSkeletonNode('stack', {
      flex: 1,
      gap: 8,
      children: [
        createSkeletonNode('block', { height: 100, radius: 8 }),
        createSkeletonNode('line', { width: '80%', height: 14 }),
        createSkeletonNode('line', { width: '55%', height: 11 }),
      ],
    })
  return build([
    createSkeletonNode('row', { gap: 12, children: [card(), card()] }),
    createSkeletonNode('gap', { height: 12 }),
    createSkeletonNode('row', { gap: 12, children: [card(), card()] }),
  ])
}

/** 电商商品网格（三列） */
function presetProductGrid() {
  const item = () =>
    createSkeletonNode('stack', {
      flex: 1,
      gap: 8,
      children: [
        createSkeletonNode('block', { height: 110, radius: 8 }),
        createSkeletonNode('line', { width: '90%', height: 12 }),
        createSkeletonNode('line', { width: '40%', height: 14 }),
      ],
    })
  return build([
    createSkeletonNode('row', {
      gap: 10,
      children: [
        createSkeletonNode('line', { width: '40%', height: 28, radius: 6 }),
        createSkeletonNode('block', { width: 72, height: 28, radius: 6 }),
      ],
    }),
    createSkeletonNode('gap', { height: 12 }),
    createSkeletonNode('row', { gap: 10, children: [item(), item(), item()] }),
    createSkeletonNode('gap', { height: 10 }),
    createSkeletonNode('row', { gap: 10, children: [item(), item(), item()] }),
  ])
}

/** 数据看板：统计卡 + 表格行 */
function presetDashboard() {
  const stat = () => createSkeletonNode('block', { height: 64, radius: 8, flex: 1 })
  const tableRow = () =>
    createSkeletonNode('row', {
      gap: 8,
      children: [
        createSkeletonNode('line', { width: '18%', height: 12, flex: '' }),
        createSkeletonNode('line', { width: '28%', height: 12, flex: '' }),
        createSkeletonNode('line', { width: '22%', height: 12, flex: '' }),
        createSkeletonNode('line', { width: '18%', height: 12, flex: '' }),
      ],
    })
  return build([
    createSkeletonNode('row', { gap: 10, children: [stat(), stat(), stat(), stat()] }),
    createSkeletonNode('gap', { height: 14 }),
    createSkeletonNode('block', { height: 28, radius: 4, width: '35%' }),
    createSkeletonNode('gap', { height: 10 }),
    tableRow(),
    createSkeletonNode('gap', { height: 8 }),
    tableRow(),
    createSkeletonNode('gap', { height: 8 }),
    tableRow(),
    createSkeletonNode('gap', { height: 8 }),
    tableRow(),
  ])
}

/** 评论列表 */
function presetCommentList() {
  const comment = () =>
    createSkeletonNode('row', {
      align: 'flex-start',
      gap: 10,
      children: [
        createSkeletonNode('circle', { size: 40 }),
        createSkeletonNode('stack', {
          flex: 1,
          gap: 8,
          children: [
            createSkeletonNode('line', { width: '35%', height: 12 }),
            createSkeletonNode('lines', { count: 2, height: 11, lastWidth: '70%' }),
          ],
        }),
      ],
    })
  return build([
    comment(),
    createSkeletonNode('gap', { height: 14 }),
    comment(),
    createSkeletonNode('gap', { height: 14 }),
    comment(),
  ])
}

/** 登录 / 表单卡片居中 */
function presetAuthCard() {
  return build([
    createSkeletonNode('gap', { height: 24 }),
    createSkeletonNode('stack', {
      width: '100%',
      gap: 12,
      children: [
        createSkeletonNode('line', { width: '40%', height: 20, radius: 4 }),
        createSkeletonNode('gap', { height: 8 }),
        createSkeletonNode('field', { height: 40 }),
        createSkeletonNode('field', { height: 40 }),
        createSkeletonNode('textarea', { height: 72 }),
        createSkeletonNode('gap', { height: 4 }),
        createSkeletonNode('field', { height: 44, radius: 8 }),
      ],
    }),
  ])
}

/** 帖子/文章内容列表：封面或头像 + 标题摘要，纵向多条 */
function presetPostList() {
  const postItem = (i) =>
    createSkeletonNode('row', {
      align: 'flex-start',
      gap: 12,
      children: [
        createSkeletonNode('block', {
          width: '30%',
          height: 72,
          radius: 8,
          flex: '',
        }),
        createSkeletonNode('stack', {
          flex: 1,
          gap: 8,
          children: [
            createSkeletonNode('line', { width: i % 2 === 0 ? '85%' : '70%', height: 15 }),
            createSkeletonNode('lines', { count: 2, height: 11, lastWidth: '50%' }),
            createSkeletonNode('row', {
              gap: 8,
              align: 'center',
              children: [
                createSkeletonNode('circle', { size: 18 }),
                createSkeletonNode('line', { width: 56, height: 10 }),
                createSkeletonNode('line', { width: 40, height: 10 }),
              ],
            }),
          ],
        }),
      ],
    })
  return build([
    createSkeletonNode('row', {
      gap: 10,
      align: 'center',
      children: [
        createSkeletonNode('field', { flex: 1, height: 36 }),
        createSkeletonNode('field', { width: 72, height: 36, radius: 8, flex: '' }),
      ],
    }),
    createSkeletonNode('gap', { height: 12 }),
    postItem(0),
    createSkeletonNode('gap', { height: 14 }),
    postItem(1),
    createSkeletonNode('gap', { height: 14 }),
    postItem(2),
  ])
}

export const SKELETON_PRESETS = [
  {
    id: 'avatar-text',
    name: '头像 | 文案',
    desc: '个人资料行：左圆右文',
    build: presetAvatarText,
  },
  {
    id: 'nav-content',
    name: '顶栏 + 内容',
    desc: '站点顶栏导航与主视觉',
    build: presetNavContent,
  },
  {
    id: 'sidebar-main',
    name: '侧栏 + 主区',
    desc: '后台/文档常见左右栏',
    build: presetSidebarMain,
  },
  {
    id: 'article',
    name: '文章详情',
    desc: '标题、作者、封面、正文',
    build: presetArticleDetail,
  },
  {
    id: 'card-feed',
    name: '双列卡片流',
    desc: '资讯/专题卡片栅格',
    build: presetCardFeed,
  },
  {
    id: 'product-grid',
    name: '商品三列',
    desc: '电商商品网格',
    build: presetProductGrid,
  },
  {
    id: 'dashboard',
    name: '数据看板',
    desc: '统计卡 + 表格行',
    build: presetDashboard,
  },
  {
    id: 'comments',
    name: '评论列表',
    desc: '头像 + 多行评论',
    build: presetCommentList,
  },
  {
    id: 'auth-card',
    name: '登录表单卡',
    desc: '输入框/文本域占位',
    build: presetAuthCard,
  },
  {
    id: 'post-list',
    name: '帖子内容列表',
    desc: '搜索栏 + 左图右文多条帖子',
    build: presetPostList,
  },
]

export function applySkeletonPreset(presetId, mode) {
  const preset = SKELETON_PRESETS.find((p) => p.id === presetId)
  if (!preset) return null
  const nodes = preset.build()
  return { nodes, mode: mode || 'replace' }
}
