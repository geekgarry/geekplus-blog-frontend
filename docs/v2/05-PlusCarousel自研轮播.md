# 首页轮播不想绑死 Element：PlusCarousel 无缝 loop 实践

> 系列第 5 篇
> 关键词：无缝轮播、首尾克隆、touch、mouse-drag  
> 源码：`src/components/PlusCarousel/index.vue`、`ElCarouselBanner`、`desktop/IndexView.vue`

---

## 为啥要自研一个轮播

Element UI 的 `el-carousel` 能用，而且我们留了 `ElCarouselBanner` 封装当备用。  
但前台这阵子在做几件事：

- 少绑 Element，样式跟莫兰迪主题走 `gp-*`  
- 桌面要滚轮 / 拖拽跟手，移动要 touch 跟手  
- 接口慢时不能整块空白  

于是首页主路径换成 **PlusCarousel**。

---

## 一、无缝 loop 的直觉版解释

用户从最后一张再往后滑，应该「接着滑到第一张」，而不是瞬移。

做法和很多轮播库一样：

```text
真实 slides:  A B C

轨道渲染:    [C'] A B C [A']
              ↑克隆      ↑克隆
```

- 动画滑到 `C'` 或 `A'` 后，在 `transitionend` **关掉过渡，瞬间跳回真实 A/C**  
- 眼睛看起来是连续的，DOM 上只是作弊跳了一下  

组件里叫 `loopTrack`，索引用 `trackIndex`，逻辑页用 `current`。

---

## 二、接入步骤

### 步骤 1：首页放组件

```vue
<div class="index-carousel-wrapper" :class="{ 'skeleton-loading': carouselLoading }">
  <plus-carousel
    mode="desktop"
    :items="carouselList"
    :height="280"
    :interval="3500"
    :touch="false"
    :mouse-drag="true"
    :mouse-wheel="true"
  />
</div>
```

移动端 Index 把 `mode` / `touch` 反过来即可。

### 步骤 2：默认图兜底

`data` 里先塞 3 张本地封面。  
`getCarousel()` 成功再替换；失败或空数组**保留默认**，别 `carouselList = []` 把首屏挖空。

### 步骤 3：字段兼容

后台可能是 `carouselImg / carouselTitle / carouselLink`，组件内部归一成 `img / title / link`。

### 步骤 4：注意首帧

`mounted`：先 `measure()` 拿到轨道宽，再 `resetToStart()`。  
宽度还是 0 就开动画，容易白一下。

### 步骤 5：坏图

`@error="onImgError"`，单张挂了不拖垮整轨。

---

## 三、交互矩阵

| 能力 | 桌面 | 移动 |
|------|------|------|
| 自动播放 | ✅ interval | ✅ |
| 左右箭头 | hover 显示 | 可关 |
| 指示点 | ✅ | ✅ |
| 触摸跟手 | 可选 | ✅ |
| 鼠标拖拽 | ✅ | — |
| 滚轮切页 | ✅ | — |

拖拽时加 `is-dragging`，避免和 `<a>` 点击抢事件；跟手位移写在 track 的 transform 上。

---

## 四、和 ElCarouselBanner 的分工

| 组件 | 何时用 |
|------|--------|
| PlusCarousel | 博客首页、要统一触控体验 |
| ElCarouselBanner | 仍依赖 Element 行为 / 管理端预览 |

两者并存，迁移可以一页一页换，不必大爆炸。

---

## 五、验收

- [ ] 末张→首张视觉连续  
- [ ] 接口失败仍有默认图  
- [ ] skeleton 与真实轮播切换不猛跳高度  
- [ ] 手机左右滑不误触成页面滚动（按你 touch 配置）  

---

## 六、小结

轮播的「高级感」多半来自无缝和跟手，不来自依赖库牌子。  
PlusCarousel 把 loop 原理摊开写在注释里，后来人改起来不害怕。

---



---

## 七、无缝跳回时的两个细节

1. **跳回时禁止 transition**  
   否则用户会看到「滑到克隆 → 又滑回真实页」的二次动画，穿帮。  
2. **自动播放与拖拽互斥**  
   拖拽中清 interval，松手后再启动；hover 桌面暂停也是常见体验。

### 数据层骨架

```js
// IndexView data 示意
carouselList: [
  { img: require('@/assets/...'), title: '', link: '' },
  // ...
],
carouselLoading: true

// created
this.getIndexViewCarousel().finally(() => {
  this.carouselLoading = false
})
```

接口映射时做一次 normalize，别把后端字段直接扔进组件然后组件里写五种 if。

### 无障碍与语义

- 箭头按钮要有 `aria-label`  
- 指示点用 button，别用纯 div  
- 自动播放对前庭敏感用户可能不适，进阶可做「减少动态效果」开关（与系统 `prefers-reduced-motion` 联动）——有余力再做  

### 性能

大图记得压缩；首屏轮播图可适当 `fetchpriority`（视浏览器支持）。  
不要在每帧 `measure`；只在 resize / 图片加载完成时量。


**系列导航**  
[← 分享卡片](./04-Canvas文章分享卡片.md) ｜ [下一篇：BlogNavMenu →](./06-BlogNavMenu桌面与抽屉一体.md)
