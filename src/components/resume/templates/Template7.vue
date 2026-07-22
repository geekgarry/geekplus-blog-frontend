<template>
  <div class="bg-[#c8d6f0] text-gray-800 font-sans w-full max-w-[800px] min-h-[800px] md:min-h-[1131px] mx-auto shadow-lg print:shadow-none print:m-0 break-words pb-1">
    <div class="px-5 md:px-8 pt-6 pb-3 flex items-start gap-4 relative overflow-hidden">
      <div class="absolute right-4 top-8 text-5xl md:text-7xl font-black text-white/40 tracking-widest select-none pointer-events-none">
        RESUME
      </div>
      <div class="flex-1 relative z-10">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{{ data.basics.name || '姓名' }}</h1>
        <div class="h-px bg-gray-400/50 mb-3 max-w-xs" />
        <div class="text-xs text-gray-600 mb-3 flex flex-wrap gap-x-2">
          <span v-if="data.basics.gender">{{ data.basics.gender }}</span>
          <span v-if="data.basics.age">{{ data.basics.age }}</span>
          <span v-if="eduDegree">{{ eduDegree }}</span>
          <span v-if="data.basics.workYears">| {{ data.basics.workYears }}</span>
          <span v-if="data.jobIntention && data.jobIntention.targetJob">| {{ data.jobIntention.targetJob }}</span>
        </div>
        <div class="space-y-1.5 text-sm text-gray-700">
          <div v-if="data.basics.phone" class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] flex items-center justify-center shrink-0">☎</span>
            {{ data.basics.phone }}
          </div>
          <div v-if="data.basics.email" class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] flex items-center justify-center shrink-0">✉</span>
            <span class="break-all">{{ data.basics.email }}</span>
          </div>
          <div
            v-if="data.basics.residence || (data.jobIntention && data.jobIntention.targetCity)"
            class="flex items-center gap-2"
          >
            <span class="w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] flex items-center justify-center shrink-0">📍</span>
            {{ data.basics.residence || data.jobIntention.targetCity }}
          </div>
        </div>
      </div>
      <img
        v-if="data.basics.avatar"
        :src="data.basics.avatar"
        alt="Avatar"
        class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow relative z-10 shrink-0"
      />
      <div
        v-else
        class="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white shadow flex items-center justify-center text-2xl font-bold text-[#3b82f6] relative z-10 shrink-0"
      >
        {{ nameInitial }}
      </div>
    </div>

    <div class="mx-3 md:mx-5 mb-5 bg-white rounded-2xl p-5 md:p-7 shadow-sm space-y-5">
      <section v-if="hasJobIntention">
        <SectionSlash title="求职期望" />
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          <span v-if="data.jobIntention.targetJob">{{ data.jobIntention.targetJob }}</span>
          <span v-if="data.jobIntention.targetCity">{{ data.jobIntention.targetCity }}</span>
          <span v-if="data.jobIntention.expectedSalary">{{ data.jobIntention.expectedSalary }}</span>
        </div>
      </section>

      <section v-if="visibleWork.length">
        <SectionSlash title="工作经历" />
        <div class="space-y-4">
          <div v-for="w in visibleWork" :key="w.id" class="text-sm">
            <div class="flex flex-wrap justify-between gap-1 font-bold text-gray-900 mb-1">
              <span>{{ w.duration }}</span>
              <span>{{ w.company }}</span>
              <span>{{ w.position }}</span>
            </div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ w.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleEducation.length">
        <SectionSlash title="教育经历" />
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

      <section v-if="skillTagList.length || data.skills">
        <SectionSlash title="技能标签" />
        <div v-if="skillTagList.length" class="flex flex-wrap gap-2">
          <span
            v-for="tag in skillTagList"
            :key="tag"
            class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
          >{{ tag }}</span>
        </div>
        <p v-else class="text-sm text-gray-700 whitespace-pre-wrap">{{ data.skills }}</p>
      </section>

      <section v-if="data.basics.summary">
        <SectionSlash title="个人亮点" />
        <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ data.basics.summary }}</p>
      </section>

      <section v-if="visibleProjects.length">
        <SectionSlash title="项目经验" />
        <div class="space-y-4">
          <div v-for="p in visibleProjects" :key="p.id" class="text-sm">
            <div class="flex flex-wrap justify-between gap-1 font-bold mb-1">
              <span>{{ p.duration }}</span>
              <span>{{ p.name }}</span>
              <span>{{ p.role }}</span>
            </div>
            <div v-if="p.technologies" class="text-[#3b82f6] text-xs mb-1">{{ p.technologies }}</div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleAwards.length">
        <SectionSlash title="获奖情况" />
        <div class="space-y-2 text-sm">
          <div v-for="a in visibleAwards" :key="a.id">
            <div class="flex justify-between font-bold">
              <span>{{ a.name }}</span>
              <span class="font-medium text-gray-500">{{ a.date }}</span>
            </div>
            <p v-if="a.description" class="text-gray-600 mt-1 whitespace-pre-wrap">{{ a.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleCertifications.length">
        <SectionSlash title="资格证书" />
        <div class="space-y-1 text-sm">
          <div v-for="c in visibleCertifications" :key="c.id" class="flex justify-between">
            <span class="font-bold">{{ c.name }}</span>
            <span class="text-gray-500">{{ c.date }}</span>
          </div>
        </div>
      </section>

      <section v-if="visiblePortfolio.length">
        <SectionSlash title="作品集" />
        <div class="space-y-2 text-sm">
          <div v-for="p in visiblePortfolio" :key="p.id">
            <div class="font-bold">{{ p.title }}</div>
            <a
              v-if="p.link"
              :href="p.link"
              class="text-[#3b82f6] break-all"
              target="_blank"
              rel="noopener noreferrer"
            >{{ p.link }}</a>
            <p v-if="p.description" class="text-gray-600 mt-1 whitespace-pre-wrap">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="data.hobbies">
        <SectionSlash title="兴趣爱好" />
        <p class="text-sm text-gray-700">{{ data.hobbies }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import SectionSlash from './SectionSlash.vue';
import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';

export default {
  name: 'Template7',
  mixins: [resumeTemplateMixin],
  components: { SectionSlash },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>
