/**
 * Element UI 首屏核心（博客壳 + 登录/表单/消息）
 * 表格/日期/上传/菜单/轮播等见 element-admin.js，由管理端或业务页再引入。
 *
 * Loading / Message / MessageBox / Notification / InfiniteScroll 须直连 lib，
 * 否则 babel-plugin-component 会改成 _Loading 等导致 ReferenceError。
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
  Input,
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
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  Alert,
  Icon,
  Row,
  Col,
  Card,
  Link,
  Divider,
  Image,
  Avatar,
  Drawer,
  Empty,
  Scrollbar
} from 'element-ui'

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

const components = [
  Pagination,
  Dialog,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Input,
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
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  Alert,
  Icon,
  Row,
  Col,
  Card,
  Link,
  Divider,
  Image,
  Avatar,
  Drawer,
  Empty,
  Scrollbar
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

  Vue.prototype.$ELEMENT = {
    size: _getCookie('size') || 'medium',
    zIndex: 2000,
    i18n: (key, value) => i18n.t(key, value)
  }
}

export default setupElement
