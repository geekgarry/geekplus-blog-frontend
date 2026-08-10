/**
 * Element UI 扩展包（表格 / 树 / 日期 / 上传 / 菜单 / 轮播等）
 * - 管理端 Layout 同步引入
 * - 博客侧个别页面按需引入（文章移动端菜单、轮播封装、简历等）
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
  DescriptionsItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Breadcrumb,
  BreadcrumbItem,
  Slider,
  Progress,
  Badge,
  Carousel,
  CarouselItem,
  Collapse,
  CollapseItem,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  PageHeader,
  InputNumber
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'

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
  DescriptionsItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Breadcrumb,
  BreadcrumbItem,
  Slider,
  Progress,
  Badge,
  Carousel,
  CarouselItem,
  Collapse,
  CollapseItem,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  PageHeader,
  InputNumber,
  CollapseTransition
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
