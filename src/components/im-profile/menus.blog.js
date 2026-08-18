/**
 * 可移植「个人中心 / IM 我的」菜单配置。
 * 新产品只需换一份 menus，组装 MeBadge + ProfileShell + ProfileEditForm。
 */
export function blogProfileMenus({ isAdmin } = {}) {
  return [
    {
      title: '我的互动',
      items: [
        {
          key: 'comments',
          label: '留言管理',
          desc: isAdmin ? '网站留言与文章评论（管理员可看全站）' : '查看自己的网站留言与文章评论',
          icon: 'el-icon-chat-dot-round',
          to: '/user/comments'
        },
        {
          key: 'article-comments',
          label: '文章评论',
          desc: '按文章浏览评论，一键跳转定位',
          icon: 'el-icon-document',
          to: '/user/comments?tab=article'
        },
        {
          key: 'leave-word',
          label: '留言板',
          desc: '公开留言区',
          icon: 'el-icon-edit-outline',
          to: '/leave-word'
        }
      ]
    },
    {
      title: '常用功能',
      items: [
        { key: 'write', label: '去投稿', icon: 'el-icon-edit', to: '/write' },
        { key: 'transfer', label: '文件中转', icon: 'el-icon-folder-opened', to: '/tool/file-transfer' },
        { key: 'im', label: '在线沟通', icon: 'el-icon-phone-outline', to: '/im' },
        { key: 'ai', label: 'AI 助手', icon: 'el-icon-cpu', href: '/chat', external: true },
        { key: 'admin', label: '后台管理', icon: 'el-icon-setting', to: '/admin', adminOnly: true }
      ]
    },
    {
      title: '浏览与工具',
      items: [
        { key: 'categories', label: '分类浏览', icon: 'el-icon-menu', to: '/categories' },
        { key: 'tags', label: '热门标签', icon: 'el-icon-collection-tag', to: '/tags' },
        { key: 'search', label: '搜索文章', icon: 'el-icon-search', to: '/search' },
        { key: 'resume', label: '简历生成', icon: 'el-icon-notebook-2', to: '/tool/resumeGenerator' }
      ]
    },
    {
      title: '账户',
      items: [
        {
          key: 'admin-profile',
          label: '后台资料',
          desc: '管理端完善更多资料',
          icon: 'el-icon-setting',
          to: '/admin/user/profile',
          adminOnly: true
        }
      ].filter((it) => !it.adminOnly || isAdmin)
    }
  ].filter((g) => g.items && g.items.length)
}
