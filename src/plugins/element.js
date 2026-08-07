/**
 * Element UI 按需注册（博客首屏 + 全局服务）
 * 重型组件见 element-admin.js，由管理端壳 / 用到的业务页再引入。
 *
 * 依赖 babel-plugin-component：普通组件从 'element-ui' 具名导入即可自动带样式。
 * Loading / Message / MessageBox / Notification / InfiniteScroll 须直连 lib，
 * 否则 babel-plugin-component 会把绑定改成 _Loading 等导致运行时 ReferenceError。
 */
import Vue from 'vue'
import { _getCookie } from '@/utils/storage'
import i18n from '@/lang'

import {
  Pagination,
  Dialog,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Popover,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  Alert,
  Slider,
  Icon,
  Row,
  Col,
  Progress,
  Badge,
  Card,
  Carousel,
  CarouselItem,
  Collapse,
  CollapseItem,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  Link,
  Divider,
  Image,
  Avatar,
  Drawer,
  Empty,
  PageHeader,
  Scrollbar
} from 'element-ui'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition'

import Loading from 'element-ui/lib/loading'
import MessageBox from 'element-ui/lib/message-box'
import Message from 'element-ui/lib/message'
import Notification from 'element-ui/lib/notification'
import InfiniteScroll from 'element-ui/lib/infinite-scroll'
import 'element-ui/lib/theme-chalk/loading.css'
import 'element-ui/lib/theme-chalk/message-box.css'
import 'element-ui/lib/theme-chalk/message.css'
import 'element-ui/lib/theme-chalk/notification.css'

import 'element-ui/lib/theme-chalk/display.css'
import '@/styles/element-icons-font-display.css'
// input/textarea 覆盖必须在 theme-chalk/input.css 之后，否则按需引入会盖掉站点样式
// import '@/styles/element-input-overrides.css'

const components = [
  Pagination,
  Dialog,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Popover,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  Alert,
  Slider,
  Icon,
  Row,
  Col,
  Progress,
  Badge,
  Card,
  Carousel,
  CarouselItem,
  Collapse,
  CollapseItem,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  Link,
  Divider,
  Image,
  Avatar,
  Drawer,
  Empty,
  PageHeader,
  Scrollbar,
  CollapseTransition
]

let installed = false

export function setupElement() {
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

  Vue.use(InfiniteScroll)
  Vue.use(Loading.directive)

  Vue.prototype.$loading = Loading.service
  Vue.prototype.$msgbox = MessageBox
  Vue.prototype.$alert = MessageBox.alert
  Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$notify = Notification
  Vue.prototype.$message = Message

  // 对齐全量 Vue.use(ElementUI, { size, i18n })
  Vue.prototype.$ELEMENT = {
    size: _getCookie('size') || 'medium',
    zIndex: 2000,
    i18n: (key, value) => i18n.t(key, value)
  }
}

export default setupElement
