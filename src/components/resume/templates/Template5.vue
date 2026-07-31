<template>
  <div class="bg-white text-gray-800 font-sans w-full max-w-[800px] min-h-[800px] md:min-h-[1131px] mx-auto shadow-lg print:shadow-none print:m-0 break-words overflow-hidden">
    <header class="bg-[#1e3a5f] text-white px-6 md:px-10 py-7 flex items-center gap-5">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl md:text-3xl font-bold tracking-wide mb-2">{{ data.basics.name || '姓名' }}</h1>
        <div class="text-xs md:text-sm text-blue-100/90 mb-3 flex flex-wrap gap-x-2">
          <span v-if="data.basics.gender">{{ data.basics.gender }}</span>
          <span v-if="data.basics.age">{{ data.basics.age }}</span>
          <span v-if="eduDegree">{{ eduDegree }}</span>
          <span v-if="data.basics.workYears">{{ data.basics.workYears }}</span>
          <template v-if="data.jobIntention && data.jobIntention.targetCity">
            <span>|</span>
            <span>{{ data.jobIntention.targetCity }}</span>
          </template>
        </div>
        <div class="space-y-1 text-xs md:text-sm text-blue-50">
          <div v-if="data.basics.phone">☎ {{ data.basics.phone }}</div>
          <div v-if="data.basics.email" class="break-all">✉ {{ data.basics.email }}</div>
          <div v-if="data.basics.residence">📍 {{ data.basics.residence }}</div>
          <div v-else-if="data.jobIntention && data.jobIntention.targetCity">
            📍 {{ data.jobIntention.targetCity }}
          </div>
        </div>
      </div>
      <img
        v-if="data.basics.avatar"
        :src="data.basics.avatar"
        alt="Avatar"
        class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-white/40 shrink-0"
      />
      <div
        v-else
        class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/15 flex items-center justify-center text-2xl font-bold shrink-0"
      >
        {{ nameInitial }}
      </div>
    </header>

    <div class="px-6 md:px-10 py-6 space-y-5">
      <section v-if="hasJobIntention">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">求职期望</h2>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          <span v-if="data.jobIntention.targetJob">期望：{{ data.jobIntention.targetJob }}</span>
          <span v-if="data.jobIntention.targetCity">城市：{{ data.jobIntention.targetCity }}</span>
          <span v-if="data.jobIntention.expectedSalary">薪资：{{ data.jobIntention.expectedSalary }}</span>
        </div>
      </section>

      <section v-if="visibleWork.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">工作经历</h2>
        <div class="space-y-4">
          <div v-for="w in visibleWork" :key="w.id" class="text-sm">
            <div class="flex flex-wrap justify-between gap-1 font-bold mb-1">
              <span>{{ w.duration }}</span>
              <span>{{ w.company }}</span>
              <span>{{ w.position }}</span>
            </div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ w.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleEducation.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">教育经历</h2>
        <div class="space-y-2">
          <div
            v-for="e in visibleEducation"
            :key="e.id"
            class="flex flex-wrap justify-between gap-2 text-sm font-medium"
          >
            <span>{{ e.year }}</span>
            <span>{{ e.school }}</span>
            <span class="text-gray-600">{{ e.degree }}</span>
          </div>
        </div>
      </section>

      <section v-if="skillTagList.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">技能标签</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in skillTagList"
            :key="tag"
            class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
          >{{ tag }}</span>
        </div>
      </section>

      <section v-if="data.basics.summary">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">个人亮点</h2>
        <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ data.basics.summary }}</p>
      </section>

      <section v-if="visibleProjects.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">项目经验</h2>
        <div class="space-y-4">
          <div v-for="p in visibleProjects" :key="p.id" class="text-sm">
            <div class="flex flex-wrap justify-between gap-1 font-bold mb-1">
              <span>{{ p.duration }}</span>
              <span>{{ p.name }}</span>
              <span>{{ p.role }}</span>
            </div>
            <div v-if="p.technologies" class="text-gray-500 mb-1">技术栈：{{ p.technologies }}</div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleAwards.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">获奖情况</h2>
        <div class="space-y-2 text-sm">
          <div v-for="a in visibleAwards" :key="a.id">
            <div class="flex justify-between font-bold">
              <span>{{ a.name }}</span>
              <span class="text-gray-500 font-medium">{{ a.date }}</span>
            </div>
            <p v-if="a.description" class="text-gray-600 whitespace-pre-wrap mt-1">{{ a.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleCertifications.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">资格证书</h2>
        <div class="space-y-2 text-sm">
          <div v-for="c in visibleCertifications" :key="c.id" class="flex justify-between">
            <span class="font-bold">{{ c.name }}</span>
            <span class="text-gray-500">{{ c.date }}</span>
          </div>
        </div>
      </section>

      <section v-if="visiblePortfolio.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">作品集</h2>
        <div class="space-y-2 text-sm">
          <div v-for="p in visiblePortfolio" :key="p.id">
            <div class="font-bold">{{ p.title }}</div>
            <a
              v-if="p.link"
              :href="p.link"
              class="text-blue-600 break-all"
              target="_blank"
              rel="noopener noreferrer"
            >{{ p.link }}</a>
            <p v-if="p.description" class="text-gray-600 mt-1 whitespace-pre-wrap">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="data.hobbies && !skillTagList.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">兴趣爱好</h2>
        <p class="text-sm text-gray-700">{{ data.hobbies }}</p>
      </section>

      <p v-if="data.hobbies && skillTagList.length" class="text-sm text-gray-600">
        <span class="font-bold text-gray-800">兴趣爱好：</span>{{ data.hobbies }}
      </p>

      <section v-if="data.skills && !skillTagList.length">
        <h2 class="inline-block bg-[#1e3a5f] text-white text-sm font-bold px-4 py-1.5 rounded-r-xl mb-3">专业技能</h2>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ data.skills }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';

export default {
  name: 'Template6',
  mixins: [resumeTemplateMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>
