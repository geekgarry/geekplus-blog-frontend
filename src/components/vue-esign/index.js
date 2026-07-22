/**
 * vue-esign 入口
 *
 * Vue2:
 *   import ESignModule from '@/vue-esign'
 *   // 或
 *   import { ESignModule, SignaturePad } from '@/vue-esign'
 *
 * Vue3: 同样用法，Options API 组件无需改动即可使用
 */
import ESignModule from './components/ESignModule.vue'
import SignaturePad from './components/SignaturePad.vue'

export { ESignModule, SignaturePad }
export default ESignModule
