<template>
  <div class="bg-white text-gray-800 font-sans w-full max-w-[800px] min-h-[800px] md:min-h-[1131px] mx-auto shadow-lg print:shadow-none print:m-0 break-words relative overflow-hidden">
    <div class="absolute right-0 top-0 w-10 md:w-12 bg-[#2563eb] text-white text-center py-3 text-xs font-bold tracking-widest writing-vertical-rl" :style="{ writingMode: 'vertical-rl', width: 'fit-content' }">
      简历
    </div>

    <header class="px-6 md:px-10 pt-7 pb-5 flex items-center gap-5 border-b border-gray-100 pr-14">
      <img
        v-if="data.basics.avatar"
        :src="data.basics.avatar"
        alt="Avatar"
        class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-[#2563eb]/30 shrink-0"
      />
      <div
        v-else
        class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#eff6ff] text-[#2563eb] flex items-center justify-center text-2xl font-bold shrink-0"
      >
        {{ nameInitial }}
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl md:text-3xl font-bold mb-2">{{ data.basics.name || '姓名' }}</h1>
        <div class="text-xs text-gray-500 mb-2 flex flex-wrap gap-x-2">
          <span v-if="data.basics.gender">{{ data.basics.gender }}</span>
          <span v-if="data.basics.age">{{ data.basics.age }}</span>
          <span v-if="eduDegree">{{ eduDegree }}</span>
          <span v-if="data.basics.workYears">| {{ data.basics.workYears }}</span>
          <span v-if="data.basics.residence">| {{ data.basics.residence }}</span>
          <span v-if="!data.basics.residence && data.jobIntention?.targetCity">| {{ data.jobIntention.targetCity }}</span>
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span v-if="data.basics.phone">☎ {{ data.basics.phone }}</span>
          <span v-if="data.basics.email" class="break-all">✉ {{ data.basics.email }}</span>
        </div>
      </div>
    </header>

    <div class="px-6 md:px-10 py-6 space-y-5 pr-14">
      <section v-if="hasJobIntention">
        <IconTitle icon="◎" title="求职期望" />
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          <span v-if="data.jobIntention.targetJob">期望：{{ data.jobIntention.targetJob }}</span>
          <span v-if="data.jobIntention.targetCity">城市：{{ data.jobIntention.targetCity }}</span>
          <span v-if="data.jobIntention.expectedSalary">薪资：{{ data.jobIntention.expectedSalary }}</span>
        </div>
      </section>

      <section v-if="visibleWork.length">
        <IconTitle icon="▣" title="工作经历" />
        <div class="space-y-4">
          <div v-for="w in visibleWork" :key="w.id" class="text-sm">
            <div class="flex flex-wrap justify-between gap-1 font-bold mb-1">
              <span class="text-[#2563eb]">{{ w.duration }}</span>
              <span>{{ w.company }}</span>
              <span>{{ w.position }}</span>
            </div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ w.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleEducation.length">
        <IconTitle icon="🎓" title="教育经历" />
        <div class="space-y-2">
          <div v-for="e in visibleEducation" :key="e.id" class="flex flex-wrap justify-between gap-2 text-sm">
            <span class="font-bold text-[#2563eb]">{{ e.year }}</span>
            <span class="font-bold">{{ e.school }}</span>
            <span class="text-gray-600">{{ e.degree }}</span>
          </div>
        </div>
      </section>

      <section v-if="skillTagList.length || data.skills">
        <IconTitle icon="★" title="技能标签" />
        <div v-if="skillTagList.length" class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700">
          <div v-for="tag in skillTagList" :key="tag" class="py-1">{{ tag }}</div>
        </div>
        <p v-else class="text-sm text-gray-700 whitespace-pre-wrap">{{ data.skills }}</p>
      </section>

      <section v-if="data.basics.summary">
        <IconTitle icon="♥" title="个人亮点" />
        <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ data.basics.summary }}</p>
      </section>

      <section v-if="visibleProjects.length">
        <IconTitle icon="◆" title="项目经验" />
        <div class="space-y-4">
          <div v-for="p in visibleProjects" :key="p.id" class="text-sm">
            <div class="flex flex-wrap justify-between gap-1 font-bold mb-1">
              <span class="text-[#2563eb]">{{ p.duration }}</span>
              <span>{{ p.name }}</span>
              <span>{{ p.role }}</span>
            </div>
            <div v-if="p.technologies" class="text-gray-500 text-xs mb-1">技术栈：{{ p.technologies }}</div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleAwards.length">
        <IconTitle icon="🏅" title="获奖情况" />
        <div class="space-y-2 text-sm">
          <div v-for="a in visibleAwards" :key="a.id">
            <div class="flex justify-between font-bold"><span>{{ a.name }}</span><span class="text-gray-500 font-medium">{{ a.date }}</span></div>
            <p v-if="a.description" class="text-gray-600 mt-1 whitespace-pre-wrap">{{ a.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleCertifications.length">
        <IconTitle icon="📜" title="资格证书" />
        <div class="space-y-1 text-sm">
          <div v-for="c in visibleCertifications" :key="c.id" class="flex justify-between">
            <span class="font-bold">{{ c.name }}</span><span class="text-gray-500">{{ c.date }}</span>
          </div>
        </div>
      </section>

      <section v-if="visiblePortfolio.length">
        <IconTitle icon="🖼" title="作品集" />
        <div class="space-y-2 text-sm">
          <div v-for="p in visiblePortfolio" :key="p.id">
            <div class="font-bold">{{ p.title }}</div>
            <a v-if="p.link" :href="p.link" class="text-[#2563eb] break-all" target="_blank" rel="noopener noreferrer">{{ p.link }}</a>
            <p v-if="p.description" class="text-gray-600 mt-1 whitespace-pre-wrap">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="data.hobbies">
        <IconTitle icon="♫" title="兴趣爱好" />
        <p class="text-sm text-gray-700">{{ data.hobbies }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import IconTitle from './IconTitle.vue';
import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';

export default {
  name: 'Template8',
  mixins: [resumeTemplateMixin],
  components: { IconTitle },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>
