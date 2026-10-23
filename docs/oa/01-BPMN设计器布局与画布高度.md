# OA · BPMN 设计器布局与画布高度

> 页面：`src/views/admin/oa/designer/index.vue`  
> 相关：`src/styles/oa-theme.css`、`src/utils/oaBpmnBrand.js`

本文记录 BPMN 设计器（bpmn-js）在管理端中的**布局契约**与**画布高度优化方法**，避免再次出现「外层跟视口绑死 / 左下工具栏底部被裁切」类回归。

---

## 1. 结构分层

```
.designer                         ← 最外层：高度随内容，不绑 100vh
├── .toolbar                      ← 顶栏（可换行）
└── .designer-workspace
    ├── .designer-side--left      ← 节点面板（≥md 常驻；<md 左侧抽屉）
    ├── .designer-canvas-wrap
    │   ├── .compact-panel-toggles  ← 仅 <md
    │   └── .canvas-card
    │       ├── header「流程画布」
    │       └── .canvas-container   ← bpmn-js 挂载点（绝对铺满 body）
    │           └── .djs-palette    ← 内置工具栏（左下）
    └── .designer-side--right     ← 属性面板（≥md 常驻；<md 右侧抽屉）
```

断点：Element **md**，`max-width: 991px` 进入 `is-compact` 抽屉布局。

---

## 2. 高度原则（务必遵守）

| 场景 | 策略 | 原因 |
|------|------|------|
| **桌面 ≥md** | `.designer` = `calc(100vh - 84px)`，三栏 `flex` 填满剩余区，**不**用大 `min-height` | 与窗口对齐，避免整页比视口还高、左右与画布被一起撑得过高 |
| **窄屏 &lt;md** | `.designer` = `height: auto`；画布用 `--oa-canvas-*` 保底/动态抬高；`app-main` 可滚 | 工具栏换行后剩余视口不够，需按内容撑开才能露出左下 palette |
| `.el-card__body` / 绝对定位 `.canvas-container` | 桌面靠父级 flex 高度；窄屏 `min-height: var(--oa-canvas-body-min)` | 绝对定位子节点不撑开父级 |

窄屏默认兜底（未测到 palette 前）：

- `--oa-canvas-body-min: 588px`
- `--oa-canvas-card-min: 640px`

`ensurePaletteFitsCanvas()`：**仅 `isCompact` 时写入变量**；桌面会 `removeProperty`，防止残留大 min 把桌面撑高。

---

## 3. 左下工具栏（`.djs-palette`）完整显示

### 问题

bpmn-js 两列 palette 实际高度常超过 300px，锚定在 `bottom`。若画布 body 过矮，或外层 `overflow: hidden` + 视口锁高，**底边工具会被裁掉**。

### 优化方法（当前实现）

1. **静态保底（仅窄屏）**：CSS 变量给出不低于 ~588px 的 body 高度。  
2. **动态抬高（仅窄屏）**：`ensurePaletteFitsCanvas()` 测量 `.djs-palette` 高度后写入 `--oa-canvas-*`。  
3. **始终两列**：桌面吃满视口后，bpmn-js `_needsCollapse` 为 false 会改成**单列**；本页在 `resized` 后调用 `forcePaletteTwoColumn()`（`palette._toggleState({ open: true, twoColumn: true })`）强制保持原来的两列。  
4. **极端矮屏兜底**：窄屏下 palette `max-height` + 内部滚动。  
5. **尺寸同步**：`ResizeObserver` → `canvas.resized()` → 再强制两列；初始化时可 `fit-viewport`。

### 不要做的事

- 不要把 `.designer` 设回 `height/max-height: 100vh`「填满窗口」。  
- 不要在窄屏用 `display:none` 藏掉 `.djs-palette`（除非产品明确改用侧栏替代且已验收）。  
- 不要只给 `.canvas-card` 设 min-height 而忽略 `.el-card__body`（绝对定位子节点不参与撑开）。

---

## 4. 响应式抽屉

- `< md`：左右侧栏 `position: fixed` + `transform` 滑出；画布占满。  
- 顶栏「节点 / 属性」打开对应抽屉；选中节点时自动打开属性抽屉。  
- 侧栏标签用普通 `div.designer-side`，避免语义 aside 与样式耦合。

---

## 5. 主题与品牌

- 外壳走 Token（`oa-theme.css`）；**画布保持浅色原色**，不随暗色主题改图元对比度。  
- bpmn.io 角标：`localStorage` + `body.hide-bpmn-brand`；默认隐藏。见 `src/utils/oaBpmnBrand.js`。

---

## 6. 验收清单

1. 桌面：左下 palette 最后一排图标完整可见，不被卡片底边裁切。  
2. 窄屏（&lt;992）：外层高度 ≈ 工具栏 + ≥640 画布区；`app-main` 可纵向滚动到底看到 palette。  
3. 切换断点 / 旋转屏幕后 palette 仍完整（变量被重新测量）。  
4. 暗色主题下画布仍为白底，侧栏/工具栏跟主题。

---

## 7. 相关路径速查

| 能力 | 路径 |
|------|------|
| 设计器页 | `src/views/admin/oa/designer/index.vue` |
| OA 主题 | `src/styles/oa-theme.css` |
| 品牌开关 | `src/utils/oaBpmnBrand.js` |
| 工作台入口 | `src/views/admin/oa/workbench/index.vue` |
| 隐藏路由 | `src/router/local-routes.js` |
