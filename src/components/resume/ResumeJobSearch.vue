<template>
  <div class="resume-job-search gp-tool-app">
    <section class="rjs-card gp-tool-panel">
      <h2 class="rjs-title gp-tool-panel__title"><i class="el-icon-search"></i> 岗位信息查询</h2>
      <p class="rjs-desc">
        按职位/行业/城市检索，并可一键引用简历里的求职目标。聚合主流招聘平台深链与 AI 市场洞察。
      </p>

      <el-form :inline="!isMobile" label-width="72px" size="small" class="rjs-form">
        <el-form-item label="职位">
          <el-input v-model="form.keyword" clearable placeholder="如：前端开发 / Java" style="width: 200px" />
        </el-form-item>
        <el-form-item label="行业">
          <el-input v-model="form.industry" clearable placeholder="如：互联网 / 智能硬件" style="width: 180px" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="form.city" clearable placeholder="如：上海" style="width: 140px" />
        </el-form-item>
        <el-form-item label="经验">
          <el-select v-model="form.experience" clearable placeholder="不限" style="width: 120px">
            <el-option label="不限" value="" />
            <el-option label="应届" value="应届" />
            <el-option label="1-3年" value="1-3年" />
            <el-option label="3-5年" value="3-5年" />
            <el-option label="5年以上" value="5年以上" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="search">搜索</el-button>
          <el-button
            plain
            icon="el-icon-document"
            :disabled="!hasJobIntention"
            @click="fillFromResume"
          >用求职目标填充</el-button>
        </el-form-item>
      </el-form>
    </section>

    <div v-loading="loading" class="rjs-body">
      <section v-if="insight" class="rjs-card gp-tool-panel">
        <h3 class="rjs-sub gp-tool-panel__title">市场洞察</h3>
        <div class="rjs-insight" v-html="insightHtml" />
      </section>

      <section class="rjs-card gp-tool-panel" v-if="platformLinks.length">
        <h3 class="rjs-sub gp-tool-panel__title">到招聘平台查看实时岗位</h3>
        <div class="rjs-links">
          <a
            v-for="item in platformLinks"
            :key="item.name"
            class="rjs-link"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>{{ item.name }}</strong>
            <span>{{ item.hint }}</span>
          </a>
        </div>
      </section>

      <section class="rjs-card gp-tool-panel" v-if="jobs.length">
        <h3 class="rjs-sub gp-tool-panel__title">推荐岗位参考（{{ jobs.length }}）</h3>
        <ul class="rjs-jobs">
          <li v-for="(job, idx) in jobs" :key="idx" class="rjs-job">
            <div class="rjs-job__hd">
              <strong>{{ job.title }}</strong>
              <span v-if="job.salary" class="rjs-salary">{{ job.salary }}</span>
            </div>
            <p class="rjs-job__meta">
              <span>{{ job.company || '公司待确认' }}</span>
              <span v-if="job.city"> · {{ job.city }}</span>
              <span v-if="job.source"> · {{ job.source }}</span>
            </p>
            <p v-if="job.summary" class="rjs-job__sum">{{ job.summary }}</p>
            <div class="rjs-job__acts">
              <el-button
                v-if="job.url"
                type="text"
                size="mini"
                @click="openUrl(job.url)"
              >查看原文</el-button>
              <el-button type="text" size="mini" @click="useAsJd(job)">用作分析 JD</el-button>
            </div>
          </li>
        </ul>
      </section>

      <p v-if="!loading && searched && !jobs.length && !insight" class="rjs-empty">
        未找到结果，请换关键词重试。
      </p>
    </div>
  </div>
</template>

<script>
import { searchJobsAI } from '@/api/resume'

const marked = require('marked')

export default {
  name: 'ResumeJobSearch',
  props: {
    resumeData: { type: Object, default: null },
  },
  data() {
    return {
      form: {
        keyword: '',
        industry: '',
        city: '',
        experience: '',
      },
      loading: false,
      searched: false,
      insight: '',
      jobs: [],
      platformLinks: [],
      isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
    }
  },
  computed: {
    hasJobIntention() {
      const j = (this.resumeData && this.resumeData.jobIntention) || {}
      return !!(j.targetJob || j.targetCity)
    },
    insightHtml() {
      if (!this.insight) return ''
      try {
        return marked.parse(String(this.insight))
      } catch (e) {
        return String(this.insight).replace(/\n/g, '<br/>')
      }
    },
  },
  created() {
    this.fillFromResume(false)
  },
  methods: {
    fillFromResume(showTip = true) {
      const j = (this.resumeData && this.resumeData.jobIntention) || {}
      if (j.targetJob) this.form.keyword = j.targetJob
      if (j.targetCity) this.form.city = j.targetCity
      if (showTip) {
        if (j.targetJob || j.targetCity) {
          this.$message.success('已填入求职目标')
        } else {
          this.$message.info('简历中暂无求职目标，请先在编辑页填写')
        }
      }
    },
    openUrl(url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    useAsJd(job) {
      const text = [
        job.title,
        job.company,
        job.city,
        job.salary,
        job.summary,
        job.requirements,
      ]
        .filter(Boolean)
        .join('\n')
      this.$emit('use-jd', text)
      this.$message.success('已带到「岗位分析」，可切换页签继续分析')
    },
    async search() {
      if (!this.form.keyword.trim() && !this.form.industry.trim()) {
        this.$message.warning('请输入职位或行业关键词')
        return
      }
      this.loading = true
      this.searched = true
      try {
        const res = await searchJobsAI({
          ...this.form,
          resumeData: this.resumeData || undefined,
        })
        const data = (res && res.data) || res || {}
        this.insight = data.insight || data.marketInsight || ''
        this.jobs = Array.isArray(data.jobs) ? data.jobs : []
        this.platformLinks = Array.isArray(data.platformLinks)
          ? data.platformLinks
          : []
      } catch (err) {
        this.$message.error((err && err.message) || '搜索失败')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.resume-job-search {
  padding: 4px 0 16px;
}
.rjs-card {
  background: var(--background-origin, #fff);
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: var(--gp-surface-radius, 12px);
  padding: 16px 18px;
  margin-bottom: 14px;
  box-shadow: var(--gp-surface-shadow);
}
.rjs-title {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 700;
  color: var(--gp-surface-title, var(--theme-color));
}
.rjs-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--muted-1-color, #909399);
}
.rjs-sub {
  margin: 0 0 10px;
  font-size: 15px;
  color: var(--text-color-2);
}
.rjs-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}
.rjs-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color-2, #e4e7ed);
  text-decoration: none;
  color: var(--text-color-2, #303133);
  background: var(--background-2);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.rjs-link:hover {
  border-color: var(--theme-color);
  box-shadow: var(--gp-surface-shadow-hover);
}
.rjs-link span {
  font-size: 12px;
  color: var(--muted-1-color, #909399);
}
.rjs-jobs {
  list-style: none;
  margin: 0;
  padding: 0;
}
.rjs-job {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}
.rjs-job:last-child {
  border-bottom: none;
}
.rjs-job__hd {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: baseline;
}
.rjs-salary {
  color: var(--red, #f56c6c);
  font-weight: 600;
  font-size: 13px;
}
.rjs-job__meta {
  margin: 4px 0;
  font-size: 12px;
  color: var(--muted-1-color, #909399);
}
.rjs-job__sum {
  margin: 0;
  font-size: 13px;
  color: var(--text-color, #606266);
  line-height: 1.55;
}
.rjs-job__acts {
  margin-top: 4px;
}
.rjs-insight {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-color-2);
}
.rjs-empty {
  text-align: center;
  color: var(--muted-1-color, #c0c4cc);
  padding: 24px;
}
</style>
