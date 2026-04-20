<template>
  <el-dropdown trigger="click" @command="changeLanguage" class="header-language">
    <div class="language-btn">
      <svg-icon icon-class="language" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="zh" :disabled="'zh'=== language">{{ $i18n.messages[language].lang.zh }}</el-dropdown-item>
      <el-dropdown-item command="tw" :disabled="'tw'=== language">{{ $i18n.messages[language].lang.tw }}</el-dropdown-item>
      <el-dropdown-item command="en" :disabled="'en'=== language">{{ $i18n.messages[language].lang.en }}</el-dropdown-item>
      <el-dropdown-item command="ja" :disabled="'ja'=== language">{{ $i18n.messages[language].lang.ja }}</el-dropdown-item>
      <el-dropdown-item command="ko" :disabled="'ko'=== language">{{ $i18n.messages[language].lang.ko }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import {mapMutations } from 'vuex'

export default {
  name: 'Langs',
  data(){
    return {
      lang:{
        zh: '中文简体',
        tw: '中文繁体',
        en: '英文',
        ja: '日语'
      }
    }
  },
  methods: {
    ...mapMutations('app', [
          'SET_LANGUAGE'
    ]),
    changeLanguage(lang) {
      this.$i18n.locale = lang // 设置给本地的i18n插件
      this.SET_LANGUAGE(lang);
      this.$message.success(this.$t('switchLangMsg') || '切换多语言成功');//this.msgSuccess
    }
  },
  computed: {
    language() {
      return this.$store.getters.language
    }
  }
}
</script>
<style scoped>
.header-language{
  font-size: 20px !important;
  margin: 0 auto;
  display: flex;
}
.language-btn{
  align-content: center;
  align-items: center;
}
.icon{
  vertical-align: middle;
}
</style>
