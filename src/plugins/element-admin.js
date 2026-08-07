/**
 * Element UI 重型组件（表格 / 树 / 日期 / 上传 / 取色等）
 * - 管理端 Layout 同步引入
 * - 博客侧个别页面按需引入
 * 可重复 import，仅安装一次。
 */
import Vue from 'vue'

import {
  Table,
  TableColumn,
  DatePicker,
  TimeSelect,
  TimePicker,
  Tree,
  Upload,
  Cascader,
  ColorPicker,
  Calendar,
  Rate,
  Autocomplete,
  Descriptions,
  DescriptionsItem
} from 'element-ui'

const components = [
  Table,
  TableColumn,
  DatePicker,
  TimeSelect,
  TimePicker,
  Tree,
  Upload,
  Cascader,
  ColorPicker,
  Calendar,
  Rate,
  Autocomplete,
  Descriptions,
  DescriptionsItem
]

let installed = false

export function setupElementAdmin() {
  if (installed) return
  installed = true
  components.forEach((comp) => {
    if (!comp) return
    if (typeof comp.install === 'function') {
      Vue.use(comp)
    } else if (comp.name) {
      Vue.component(comp.name, comp)
    }
  })
}

setupElementAdmin()

export default setupElementAdmin