# 一套菜单数据，两种皮肤：BlogNavMenu 桌面横排 + 移动抽屉

> 系列第 6 篇（第二版）
> 关键词：desktop / drawer、placePanel、backdrop-filter、溢出更多  
> 源码：`src/components/BlogNavMenu/index.vue`、`layout/blog/vertical/index.vue`

---

## 以前最烦的事

桌面顶栏一份菜单数组，手机抽屉又手写一份。  
栏目改名了，总有一边忘改；子栏目展开逻辑还不一致。

现在约定：

> **数据只来自 `addMenuRoutes`（再拼固定项）；UI 用 `mode` 切换。**

---

## 一、组件合同（Props）

```js
props: {
  mode: {
    type: String,
    default: 'desktop',
    validator: (v) => ['desktop', 'drawer'].includes(v)
  },
  menus: { type: Array, default: () => [] },
  showAdminEntry: { type: Boolean, default: false } // 抽屉里「管理中心」
}
```

`allItems` 计算属性：

```text
首页
+ 动态栏目（menus）
+ 文件中转
+ 给我留言
+ 关于本站
```

导航统一 `navigate(path)`：关面板 → `$emit('navigate')` → `$router.push`。

---

## 二、两种 mode 各自干什么

### desktop

- 横排按钮  
- 有 children 的项点开 **自定义下拉**（不是 el-dropdown）  
- 装不下进「更多」（算法见第 2 篇）  
- 下拉用 **fixed + JS 定位**

### drawer

- 竖排列表  
- `openIndexes` 控制手风琴  
- 可显示管理中心入口  
- 不跑溢出算法  

Vertical 布局里两处引用：

```vue
<blog-nav-menu mode="desktop" :menus="addNavMenuRoutes" @navigate="onNavMenuNavigate" />
<blog-nav-menu mode="drawer" :menus="addNavMenuRoutes" :show-admin-entry="!!username" />
```

---

## 三、实现步骤建议

1. 先保证 `navMenu` 数据干净（叶子无空 `children:[]`，见第 0 篇）  
2. 抽出 `allItems` / `childPath` / `navigate`  
3. 桌面模板 + 抽屉模板分两块，别用一堆 `v-if` 缠在同一个 li 上到不可读  
4. 桌面下拉改 fixed，写 `placePanel`  
5. 再接入溢出折叠  
6. 最后把顶栏 blur 层拆出去（下一节）  

---

## 四、下拉被裁切：我们是怎么发现的

症状：点有子菜单的项，下拉只显示顶栏高度里那一截，下面像被刀切了。

两层原因：

1. 列表 `overflow: hidden`（曾经为了「不换行」设的）  
2. 顶栏 `backdrop-filter` 让子元素的 `fixed` **containing block 变成顶栏**，坐标锁死在 60px 里  

### 解法 A：模糊层独立

```html
<div class="navbar-content">
  <div class="navbar-content__bg" aria-hidden="true"></div>
  <div class="navbar-container">...</div>
</div>
```

内容层不再背 filter。

### 解法 B：面板 fixed 贴按钮

```js
placePanel(trigger, alignRight) {
  const rect = trigger.getBoundingClientRect()
  const top = Math.round(rect.bottom + 4)
  if (alignRight) {
    this.panelStyle = {
      top: top + 'px',
      right: Math.max(8, window.innerWidth - rect.right) + 'px',
      left: 'auto',
      transform: 'none'
    }
  } else {
    this.panelStyle = {
      top: top + 'px',
      left: Math.round(rect.left + rect.width / 2) + 'px',
      transform: 'translateX(-50%)'
    }
  }
}
```

「更多」面板建议右对齐，避免贴右边缘出屏。  
点击外部 `document` 监听关闭；`Esc` 也可关。

这和侧栏收起态 flyout（第 1 篇）是同一门课：**要逃逸的浮层，远离 transform / filter / overflow 祖先。**

---

## 五、和 BlogShell / 溢出折叠的配合

- 用 **top 布局**时，用户主要碰 BlogNavMenu  
- 用 **side 布局**时，菜单在 Horizontal 侧栏，BlogNavMenu 桌面模式可能不出现，但抽屉逻辑仍可复用在其它入口  
- 溢出折叠只对 `mode=desktop` 有意义  

---

## 六、验收

- [ ] 改一个栏目名，桌面和抽屉同时变  
- [ ] 子栏目桌面可完整点选，不被顶栏裁切  
- [ ] 窄屏桌面出现「更多」，抽屉仍是完整列表  
- [ ] 打开抽屉时背景不可滚（Vertical 里对 body overflow 的处理）  

---

## 七、小结

导航组件最贵的是「两套数据两套 bug」。  
BlogNavMenu 把贵的部分收成一份 `menus`，便宜的部分用 `mode` 分叉。  
再配上 fixed 面板，顶栏终于肯把子菜单完整还给用户。

---



---

## 八、childPath 怎么拼才不容易 404

栏目树常见两种配法：

- 子 path 是相对段：`personalEssay`  
- 子 path 已是绝对：`/timeEssay/personalEssay`

组件里要兼容：

```js
childPath(parent, child) {
  const pRaw = parent.path || (parent.raw && parent.raw.path)
  if (!pRaw) return '/'
  if (!child || !child.path) return pRaw
  if (String(child.path).startsWith('/')) return child.path
  const p = String(pRaw).replace(/\/$/, '')
  const c = String(child.path).replace(/^\//, '')
  return p + '/' + c
}
```

和第 0 篇路由生成保持同一套规则，避免「菜单能点、路由表是另一套拼接」。

### 活跃态

```js
isActive(path) {
  if (path === '/') return this.$route.path === '/'
  return this.$route.path === path || this.$route.path.startsWith(path + '/')
}
```

首页要用全等，否则所有页都 `startsWith('/')` 亮成首页。

### 抽屉与桌面的职责切分再强调

| 能力 | desktop | drawer |
|------|---------|--------|
| 溢出更多 | ✅ | ❌（本身可滚动） |
| fixed 下拉 | ✅ | ❌（手风琴） |
| 管理中心入口 | 一般在用户菜单 | ✅ showAdminEntry |
| 测量 / RO | ✅ | ❌ |

不要在 drawer 模式跑 recompute，白耗电。

### 回归用例（发版前 3 分钟）

1. 桌面点带子菜单的栏目，下拉完整可见  
2. 缩到一半宽，「更多」出现且子项可进  
3. 手机开抽屉，展开子级，跳转后抽屉关闭  
4. 改一个栏目名（或 mock menus），两端文案一致  


**系列导航**  
[← PlusCarousel](./05-PlusCarousel自研轮播.md) ｜ 下一篇：暂无（可回到 [第 0 篇](./00-双重动态路由与守卫.md) 打底）

*第二版完｜极客普拉斯前端实践系列*
