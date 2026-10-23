<template>
<!-- 简约通用 -->
<div class="p-6 md:p-10 bg-white text-gray-800 font-sans w-full max-w-[800px] min-h-[800px] md:min-h-[1131px] mx-auto shadow-lg print:shadow-none print:m-0 break-words">
      <!-- 页眉底部分割线：偏黑实线，与正文区块分开 -->
      <header class="t1-header pb-4 mb-5 flex flex-row justify-between items-center text-left">
        <div class="flex-1">
          <h1 class="text-3xl md:text-4xl font-bold mb-3 tracking-wider">{{ data.basics.name || '姓名' }}</h1>
          <div class="text-xs md:text-sm text-gray-600 flex flex-wrap justify-start gap-x-4 gap-y-1">
            <span v-if="data.basics.gender">{{ data.basics.gender }}</span>
            <span v-if="data.basics.age">{{ data.basics.age }}</span>
            <span v-if="data.basics.phone">📞 {{ data.basics.phone }}</span>
            <span v-if="data.basics.email" class="break-all">✉️ {{ data.basics.email }}</span>
            <span v-if="data.basics.residence">📍 {{ data.basics.residence }}</span>
            <span v-if="data.basics.workYears">经验：{{ data.basics.workYears }}</span>
          </div>
        </div>
        <div v-if="data.basics.avatar">
          <div class="ml-4 md:ml-6 shrink-0">
            <img :src="data.basics.avatar" alt="Avatar" class="w-20 h-28 md:w-24 md:h-32 object-cover border border-gray-200 shadow-sm" />
          </div>
        </div>
      </header>
      <!-- 个人总结 -->
      <div v-if="data.basics.summary">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            个人总结
          </h2>
          <p class="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{{ data.basics.summary }}</p>
        </section>
</div>

      <div v-if="data.education.length">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            教育经历
          </h2>
          <div class="space-y-3">
            <div v-for="edu in data.education" :key="edu.id">
              <div class="flex flex-col sm:flex-row sm:justify-between text-sm gap-1 sm:gap-0">
                <div class="flex flex-col sm:flex-row sm:gap-4">
                  <span class="font-bold sm:w-48">{{ edu.school }}</span>
                  <span class="text-gray-700">{{ edu.degree }}</span>
                </div>
                <div class="text-gray-500 font-medium">{{ edu.year }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-if="hasJobIntention">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            求职意向
          </h2>
          <div class="flex flex-wrap gap-4 text-sm text-gray-700">
            <div v-if="data.jobIntention.targetJob"><strong>目标职业：</strong>{{ data.jobIntention.targetJob }}</div>
            <div v-if="data.jobIntention.targetCity"><strong>意向城市：</strong>{{ data.jobIntention.targetCity }}</div>
            <div v-if="data.jobIntention.expectedSalary"><strong>期望薪资：</strong>{{ data.jobIntention.expectedSalary }}</div>
          </div>
        </section>
</div>

      <div v-if="visibleWork.length">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            工作经历
          </h2>
          <div class="space-y-5">
            <div v-for="w in visibleWork" :key="w.id">
              <div class="text-sm">
                <div class="flex flex-col sm:flex-row sm:justify-between font-bold mb-1 text-base gap-1 sm:gap-0">
                  <span>{{ w.company }}</span>
                  <span class="text-gray-600 font-medium text-sm">{{ w.duration }}</span>
                </div>
                <div class="font-medium text-gray-700 mb-2">职位：{{ w.position }}</div>
                <!-- 工作描述：左侧引用块竖线，与项目经验一致 -->
                <p class="t1-quote text-gray-600 whitespace-pre-wrap leading-relaxed">{{ w.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-if="visibleProjects.length">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            项目经验
          </h2>
          <div class="space-y-5">
            <div v-for="p in visibleProjects" :key="p.id">
              <div class="text-sm">
                <div class="flex flex-col sm:flex-row sm:justify-between font-bold mb-1 text-base gap-1 sm:gap-0">
                  <span>{{ p.name }}</span>
                  <span class="text-gray-600 font-medium text-sm">{{ p.duration }}</span>
                </div>
                <div class="flex flex-col sm:flex-row gap-1 sm:gap-4 mb-2 text-gray-700">
                  <span v-if="p.role"><span class="font-medium">角色：</span>{{ p.role }}</span>
                  <span v-if="p.technologies"><span class="font-medium">技术栈：</span>{{ p.technologies }}</span>
                </div>
                <!-- 项目描述：blockquote 风格左边竖线 -->
                <p class="t1-quote text-gray-600 whitespace-pre-wrap leading-relaxed">{{ p.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-if="data.skills || data.hobbies">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            其他信息
          </h2>
          <div v-if="data.skills" class="text-sm mb-3">
            <div class="font-bold mb-1">专业技能：</div>
            <p class="whitespace-pre-wrap text-gray-700 leading-relaxed">{{ data.skills }}</p>
          </div>
          <div v-if="data.hobbies" class="text-sm">
            <span class="font-bold">兴趣爱好：</span>
            <span class="text-gray-700">{{ data.hobbies }}</span>
          </div>
        </section>
      </div>

      
      <div v-if="visibleAwards.length">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            获奖情况
          </h2>
          <div class="space-y-5">
            <div v-for="a in visibleAwards" :key="a.id">
              <div class="text-sm">
                <div class="flex flex-col sm:flex-row sm:justify-between font-bold mb-1 text-base gap-1 sm:gap-0">
                  <span>{{ a.name }}</span>
                  <span class="text-gray-600 font-medium text-sm">{{ a.date }}</span>
                </div>
                <p v-if="a.description" class="text-gray-600 whitespace-pre-wrap leading-relaxed pl-4 border-l-2 border-gray-200">{{ a.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      
      <div v-if="visibleCertifications.length">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            资格证书
          </h2>
          <div class="space-y-5">
            <div v-for="c in visibleCertifications" :key="c.id">
              <div class="text-sm">
                <div class="flex flex-col sm:flex-row sm:justify-between font-bold mb-1 text-base gap-1 sm:gap-0">
                  <span>{{ c.name }}</span>
                  <span class="text-gray-600 font-medium text-sm">{{ c.date }}</span>
                </div>
                <p v-if="c.description" class="text-gray-600 whitespace-pre-wrap leading-relaxed pl-4 border-l-2 border-gray-200">{{ c.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      
      <div v-if="visiblePortfolio.length">
        <section class="mb-6">
          <h2 class="t1-section-title text-lg font-bold mb-3 pb-1 flex items-center">
            <span class="bg-gray-800 w-1.5 h-4 mr-2 inline-block"></span>
            作品集
          </h2>
          <div class="space-y-5">
            <div v-for="p in visiblePortfolio" :key="p.id">
              <div class="text-sm">
                <div class="flex flex-col sm:flex-row sm:justify-between font-bold mb-1 text-base gap-1 sm:gap-0">
                  <span>{{ p.title }}</span>
                  <a v-if="p.link" :href="p.link" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline break-all ml-2">{{ p.link }}</a>
                </div>
                <p v-if="p.description" class="text-gray-600 whitespace-pre-wrap leading-relaxed pl-4 border-l-2 border-gray-200">{{ p.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
</template>

<script>
import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';

export default {
  name: 'Template1',
  mixins: [resumeTemplateMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
/* 页眉底部偏黑横线：比原先 Tailwind gray-800 更实，打印时也保留 */
.t1-header {
  border-bottom: 2px solid #1f1f1f;
}

/* 各分节标题（个人总结、工作经历等）下方分割线，与页眉同色系但略细 */
.t1-section-title {
  border-bottom: 1.5px solid #d4d4d4;
}

/* 工作经历 / 项目经验描述：HTML 引用块式左边竖线 */
.t1-quote {
  padding-left: 12px;
  border-left: 1.5px solid #e4e4e4;
}
</style>
