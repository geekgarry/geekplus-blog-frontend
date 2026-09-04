module.exports = {

  title: 'GeekPlus Blog',

  /**
   * 网站置灰
   */
  webGrey: false,

  /**
   * 管理后台页面水印（仅 admin Layout）
   */
  adminWatermark: false,

  /**
   * 整站控件圆角（px）：--gp-border-radius-base（管理端 Element / TagsView 等）
   */
  borderRadius: 4,

  /**
   * 博客前台表面圆角（px）：--gp-surface-radius（卡片/轮播等）；--gp-surface-radius-sm = surface - 4
   * 默认 14，与历史 color.css 一致
   */
  blogSurfaceRadius: 14,

  /**
   * 是否系统布局配置
   */
  showSettings: false,

  /**
   * 切换顶部导航菜单布局（后台管理）
   */
  leftMenuBar: true,

  /**
   * 博客前台布局：top=顶栏导航 | side=侧栏导航
   * （历史 workbench 已废弃，读入时迁回 top）
   */
  blogLayout: 'top',

  /**
   * 管理端菜单形式：sidebar=侧栏 | topbar=顶栏
   * （后台图标工作台尚未落地；历史 workbench 读入迁回 sidebar。前台博客 /workbench 另论）
   */
  adminMenuLayout: 'sidebar',

  /**
   * 是否显示 tagsView
   */
  tagsView: true,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: true,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: true,

  errorLog: 'production'
}
