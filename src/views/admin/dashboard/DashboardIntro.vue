<template>
  <div class="dashboard-intro">
    <el-alert
      type="success"
      show-icon
      :closable="false"
      class="intro-banner"
      title="GeekPlus Blog · 极客普拉斯"
      description="基于 Spring Boot + Vue 2 的一体化博客与后台：BlogShell 双布局前台、Element 管理端、双重动态路由、主题 Token 与请求调度层。"
    />

    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="intro-card">
          <div slot="header" class="card-head">项目架构</div>
          <p>
            本仓库为<strong>博客前台 + 管理后台 SPA</strong>：访客可读文章流/栏目/留言，运营可在后台配置菜单权限、内容、站点信息与工具模块。
            路由守卫分前台栏目（<code>navMenu</code>）与后台权限（<code>permission</code>）两路动态挂载；请求层统一走
            <code>utils/request</code> + 切后台静默续传。
          </p>
          <p class="arch-block">
            browser → Vue 2 SPA<br>
            ├─ BlogShell（top / side / workbench）<br>
            ├─ Admin Layout + 动态权限路由<br>
            └─ API（/dev-api | /pro-api）→ GeekPlus-Blog-API
          </p>
          <p><b>当前版本：</b> v{{ version }}</p>
          <el-tag type="success" size="small">开源免费</el-tag>
          <div class="intro-actions">
            <el-button type="primary" size="small" icon="el-icon-link" @click="openDoc('docs/v2/README.md')">
              实践文档 v2
            </el-button>
            <el-button size="small" icon="el-icon-notebook-2" @click="openDoc('docs/lowcode/README.md')">
              低代码手册
            </el-button>
            <el-button size="small" icon="el-icon-s-home" @click="goTarget('/')">
              访问博客
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="intro-card">
          <div slot="header" class="card-head">技术选型</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <h4>后端技术</h4>
              <ul class="tech-list">
                <li>Spring Boot</li>
                <li>Apache Shiro / JWT 会话</li>
                <li>Redis（会话 / 缓存）</li>
                <li>MyBatis + PageHelper</li>
                <li>Druid 连接池</li>
              </ul>
            </el-col>
            <el-col :span="12">
              <h4>前端技术</h4>
              <ul class="tech-list">
                <li>Vue 2.7 + Vue Router + Vuex</li>
                <li>Element UI（管理端）</li>
                <li>gp-* 组件 + CSS Token（博客）</li>
                <li>ECharts 5</li>
                <li>Axios + PWA（可选）</li>
              </ul>
            </el-col>
          </el-row>
          <p class="doc-hint">
            详细架构见仓库 <code>README.md</code>「技术架构」与
            <code>docs/v2/07-前后台一体架构与脚手架拆分.md</code>；后端契约见兄弟仓 <code>GeekPlus-Blog-API/docs</code>。
          </p>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="intro-row">
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="intro-card">
          <div slot="header" class="card-head">二维码生成</div>
          <el-input
            v-model="qrText"
            placeholder="输入文本生成二维码"
            clearable
            @keyup.enter.native="genQr"
          >
            <el-button slot="append" icon="el-icon-s-promotion" @click="genQr">生成</el-button>
          </el-input>
          <div class="qr-preview">
            <el-image v-if="qrImg" :src="qrImg" :preview-src-list="[qrImg]" fit="contain" />
            <div v-else class="qr-empty">
              <i class="el-icon-picture-outline"></i>
              <span>暂无二维码</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="intro-card" v-loading="noticeLoading">
          <div slot="header" class="card-head">系统公告</div>
          <el-empty v-if="!noticeList.length" description="暂无公告" :image-size="72" />
          <div v-for="(item, idx) in noticeList" :key="idx" class="notice-item">
            <el-link :href="item.noticeUrl || '#'" target="_blank" type="primary">
              <i class="el-icon-s-promotion"></i> {{ item.noticeTitle }}
            </el-link>
            <div class="notice-content" v-html="item.noticeContent" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="intro-card">
          <div slot="header" class="card-head">更新日志</div>
          <el-collapse accordion>
            <el-collapse-item
              v-for="log in updateLogs"
              :key="log.key"
              :title="log.title"
              :name="log.key"
            >
              <ol class="changelog-list">
                <li v-for="(line, i) in log.items" :key="i">{{ line }}</li>
              </ol>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listNotice } from '@/api/system/notice'
import { getQRCodeImg } from '@/api/common'
import { DASHBOARD_UPDATE_LOGS, DASHBOARD_VERSION } from './dashboardMeta'

export default {
  name: 'DashboardIntro',
  data() {
    return {
      version: DASHBOARD_VERSION,
      noticeLoading: false,
      noticeList: [],
      qrText: '',
      qrImg: '',
      /** 与 README「变更记录」同步摘要，见 dashboardMeta.js */
      updateLogs: DASHBOARD_UPDATE_LOGS
    }
  },
  created() {
    this.loadNotices()
  },
  methods: {
    loadNotices() {
      this.noticeLoading = true
      listNotice({ pageNum: 1, pageSize: 5, status: 0 })
        .then((res) => {
          this.noticeList = res.rows || []
        })
        .catch(() => {
          this.noticeList = []
        })
        .finally(() => {
          this.noticeLoading = false
        })
    },
    genQr() {
      if (!this.qrText) {
        this.$message.warning('请输入要生成的文本')
        return
      }
      getQRCodeImg(this.qrText).then((res) => {
        this.qrImg = 'data:image/gif;base64,' + res.data
      })
    },
    goTarget(href) {
      window.open(href, '_blank')
    },
    /** 文档在仓库内，开发时可从 IDE 打开；此处提示路径 */
    openDoc(path) {
      this.$message.info(`请在本仓库查看：${path}`)
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-intro {
  .intro-banner {
    margin-bottom: 20px;
    border-radius: var(--gp-surface-radius-sm, 10px);
  }
  .intro-row {
    margin-top: 20px;
  }
  .intro-card {
    margin-bottom: 20px;
    border-radius: var(--gp-surface-radius, 14px);
    border: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.07));
  }
  .card-head {
    font-weight: 600;
    color: var(--gp-surface-title, var(--theme-color));
  }
  p {
    margin: 0 0 12px;
    line-height: 1.65;
    color: var(--text-color, #4f4c48);
    font-size: 14px;
  }
  .arch-block {
    padding: 12px 14px;
    background: var(--gp-surface-bg, #faf9f7);
    border-radius: var(--gp-surface-radius-sm, 10px);
    font-family: ui-monospace, monospace;
    font-size: 12px;
    line-height: 1.7;
  }
  code {
    font-size: 12px;
    padding: 0 4px;
    border-radius: 4px;
    background: var(--lightGray, #e4e0db);
  }
  .intro-actions {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--maxGreyFont, #4f4c48);
  }
  .tech-list {
    padding-left: 18px;
    margin: 0;
    color: var(--text-color, #676a6c);
    font-size: 13px;
    line-height: 1.9;
  }
  .doc-hint {
    margin-top: 12px;
    font-size: 12px;
    color: var(--greyFont, #7a7672);
  }
  .qr-preview {
    margin-top: 16px;
    min-height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gp-surface-bg, #faf9f7);
    border-radius: var(--gp-surface-radius-sm, 10px);
    padding: 12px;
  }
  .qr-preview .el-image {
    max-width: 160px;
    max-height: 160px;
  }
  .qr-empty {
    color: var(--greyFont, #7a7672);
    text-align: center;
    i {
      font-size: 36px;
      display: block;
      margin-bottom: 8px;
    }
  }
  .notice-item {
    margin-bottom: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--gp-surface-border, rgba(44, 42, 40, 0.07));
    &:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }
  .notice-content {
    margin-top: 6px;
    font-size: 12px;
    color: var(--greyFont, #7a7672);
    line-height: 1.5;
  }
  .changelog-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.75;
    color: var(--text-color, #676a6c);
  }
}
</style>
