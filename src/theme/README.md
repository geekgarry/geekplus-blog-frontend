# 主题色模块（`src/theme`）

与 **HTTP 层**（`src/utils/http`）同样：**公共 API 在本目录，引擎在 `utils/elementTheme.js`**。  
拆成「仅博客 SPA / 仅管理端 SPA / 一体 SPA」时，只要复制本目录 + 引擎 + 契约即可复用换肤链路。

## 三条链路

| 类型 | 调用 | 谁需要 |
|------|------|--------|
| **用户改色** | `commitUserThemeColor(store, hex)` | 管理端 ThemePicker（经 Settings） |
| **冷启动** | `initSiteTheme(store, { isDay })` | 任意 SPA 根 `App.created` |
| **维护** | `refreshAfterModeChange()` / `refreshAfterElementCss()` | 博客深浅色 / 管理端 Layout |

消费端（博客页、组件）**只读** `var(--theme-color)`，不要 `setProperty`。

## 一体 SPA（当前仓库）

```
main.js → App.created
  initSiteTheme(store)
Settings → ThemePicker → commitUserThemeColor
store settings/changeSetting (themeColor) → applyThemeColor
BlogShell / 博客 layout → 只读 CSS 变量；changeColor → refreshAfterModeChange
layout/index + element-admin → refreshAfterElementCss
```

## 仅博客 SPA

最小集：

1. 复制 `src/theme/`、`src/utils/elementTheme.js`
2. 引入 `src/assets/css/color.css`（静态 fallback）
3. `public/index.html` 内联 `--theme-color` 占位（可选 FOUC）
4. Vuex：`settings` 模块含 `themeColor` + `changeSetting` 中对 `themeColor` 调 `applyThemeColor`（见 `store/modules/settings.js`）
5. 根组件：`initSiteTheme(this.$store)`
6. 博客顶栏/侧栏深浅色：`refreshAfterModeChange()`

**不需要** ThemePicker、管理端 Layout、element-admin。

## 仅管理端 SPA

最小集：

1. 同上 1～4
2. 根组件：`initSiteTheme(this.$store)`
3. 设置抽屉：`ThemePicker` + `commitUserThemeColor`
4. `layout/index` mounted：`refreshAfterElementCss()`；按需 `import '@/plugins/element-admin'`

**不需要** BlogShell、博客 layout。

## Vuex 契约（可复制）

```javascript
// store/modules/settings.js 片段
import { applyThemeColor, DEFAULT_THEME, THEME_SETTING_KEY } from '@/theme'

state: {
  [THEME_SETTING_KEY]: localStorage.getItem(THEME_SETTING_KEY) || DEFAULT_THEME
},
actions: {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
    if (data.key === THEME_SETTING_KEY && typeof data.value === 'string') {
      applyThemeColor(data.value, { defer: false })
    }
  }
}
```

## 与业务内 themeColor 的区别

简历模板、PPT 等组件内的 `themeColor` 是**模块局部色**，与全站 `--theme-color` 无关。
