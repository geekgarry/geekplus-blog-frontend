import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Cookies from 'js-cookie'
import store from '@/store'

// ElementUI 国际化
import elementLocale from 'element-ui/lib/locale'
import elementEnLocale from 'element-ui/lib/locale/lang/en' // element-ui lang
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'// element-ui lang
import elementEsLocale from 'element-ui/lib/locale/lang/es'
import elementJaLocale from 'element-ui/lib/locale/lang/ja'
import elementKoLocale from 'element-ui/lib/locale/lang/ko'
import elementTwLocale from 'element-ui/lib/locale/lang/zh-TW'

// 工程本地 国际化
import enLocale from './en'
import zhLocale from './zh'
import twLocale from './tw'
import esLocale from './es'
import jaLocale from './ja'
import koLocale from './ko'

Vue.use(VueI18n)

const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale
  },
  zh: {
    ...zhLocale,
    ...elementZhLocale
  },
  es: {
    ...esLocale,
    ...elementEsLocale
  },
  ja: {
    ...jaLocale,
    ...elementJaLocale
  },
  ko: {
    ...koLocale,
    ...elementKoLocale
  },
  tw: {
    ...twLocale,
    ...elementTwLocale
  }
}
export function getLanguage() {
  const chooseLanguage = store.state.app.language
  if (chooseLanguage) return chooseLanguage

  // if has not choose language
  const language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'zh'
}
const i18n = new VueI18n({
  // set locale
  // options: en | zh | es
  locale: getLanguage(),
  // set locale messages
  messages,
  globalInjection: true
})
// 为了实现element插件的多语言切换
elementLocale.i18n((key, value) => i18n.t(key, value))
export default i18n
