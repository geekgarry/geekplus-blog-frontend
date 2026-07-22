<template>
  <div class="flex bg-white text-gray-800 font-sans w-full max-w-[800px] min-h-[800px] md:min-h-[1131px] mx-auto shadow-lg print:shadow-none print:m-0 break-words">
    <div class="w-1/3 bg-slate-800 text-white p-4 md:p-8 flex flex-col break-words">
      <div class="flex flex-col items-center mb-8">
        <img
          v-if="data.basics.avatar"
          :src="data.basics.avatar"
          alt="Avatar"
          class="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover border-2 md:border-4 border-slate-600 mb-4 shadow-md"
        />
        <div
          v-else
          class="w-20 h-20 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-slate-600 mb-4 bg-slate-700 flex items-center justify-center text-slate-400 text-2xl md:text-4xl font-bold"
        >
          {{ nameInitial }}
        </div>
        <h1 class="text-xl md:text-2xl font-bold text-center tracking-wide">{{ data.basics.name || '姓名' }}</h1>
      </div>

      <div class="mb-8 space-y-3 text-xs md:text-sm text-slate-300">
        <h2 class="text-base md:text-lg font-bold border-b border-slate-600 mb-3 pb-1 uppercase tracking-wider text-white">联系方式</h2>
        <div v-if="data.basics.phone" class="flex items-center gap-2"><span>📞</span> {{ data.basics.phone }}</div>
        <div v-if="data.basics.email" class="flex items-center gap-2 break-all"><span>✉️</span> {{ data.basics.email }}</div>
        <div v-if="data.basics.gender || data.basics.age" class="flex items-center gap-2">
          <span>👤</span>
          {{ [data.basics.gender, data.basics.age].filter(Boolean).join(' · ') }}
        </div>
        <div v-if="data.basics.residence" class="flex items-center gap-2"><span>📍</span> {{ data.basics.residence }}</div>
        <div v-if="data.basics.workYears" class="flex items-center gap-2"><span>💼</span> {{ data.basics.workYears }}</div>
      </div>

      <div v-if="data.education.length" class="mb-8">
        <h2 class="text-base md:text-lg font-bold border-b border-slate-600 mb-3 pb-1 uppercase tracking-wider text-white">教育背景</h2>
        <div class="space-y-4">
          <div v-for="edu in data.education" :key="edu.id" class="text-xs md:text-sm">
            <div class="font-bold text-white">{{ edu.school }}</div>
            <div class="text-slate-300">{{ edu.degree }}</div>
            <div class="text-slate-400 text-[10px] md:text-xs mt-1">{{ edu.year }}</div>
          </div>
        </div>
      </div>

      <div v-if="hasJobIntention" class="mb-8">
        <h2 class="text-base md:text-lg font-bold border-b border-slate-600 mb-3 pb-1 uppercase tracking-wider text-white">求职意向</h2>
        <div class="space-y-2 text-xs md:text-sm text-slate-300">
          <div v-if="data.jobIntention.targetJob"><strong class="text-white">目标职业：</strong>{{ data.jobIntention.targetJob }}</div>
          <div v-if="data.jobIntention.targetCity"><strong class="text-white">目标城市：</strong>{{ data.jobIntention.targetCity }}</div>
          <div v-if="data.jobIntention.expectedSalary"><strong class="text-white">期望薪资：</strong>{{ data.jobIntention.expectedSalary }}</div>
        </div>
      </div>

      <div v-if="data.skills" class="mb-8">
        <h2 class="text-base md:text-lg font-bold border-b border-slate-600 mb-3 pb-1 uppercase tracking-wider text-white">专业技能</h2>
        <p class="text-xs md:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{{ data.skills }}</p>
      </div>

      <div v-if="data.hobbies" class="mb-8 mt-auto">
        <h2 class="text-base md:text-lg font-bold border-b border-slate-600 mb-3 pb-1 uppercase tracking-wider text-white">爱好</h2>
        <p class="text-xs md:text-sm text-slate-300 whitespace-pre-wrap">{{ data.hobbies }}</p>
      </div>
    </div>

    <div class="w-2/3 p-4 md:p-8 bg-slate-50 break-words">
      <section v-if="data.basics.summary" class="mb-8">
        <h2 class="text-lg md:text-xl font-bold text-slate-800 border-b-2 border-slate-200 mb-3 pb-1 uppercase tracking-wider flex items-center gap-2">
          <span class="text-slate-400">👤</span> 个人总结
        </h2>
        <p class="text-xs md:text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{{ data.basics.summary }}</p>
      </section>

      <section v-if="visibleWork.length" class="mb-8">
        <h2 class="text-xl font-bold text-slate-800 border-b-2 border-slate-200 mb-4 pb-1 uppercase tracking-wider flex items-center gap-2">
          <span class="text-slate-400">💼</span> 工作经历
        </h2>
        <div class="space-y-6">
          <div v-for="w in visibleWork" :key="w.id" class="text-sm relative pl-4 border-l-2 border-slate-300">
            <div class="absolute w-2.5 h-2.5 bg-slate-400 rounded-full -left-[6px] top-1.5 border-2 border-slate-50" />
            <div class="font-bold text-lg text-slate-800">{{ w.position }}</div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-slate-500 mb-2 font-medium gap-1 sm:gap-0">
              <span class="text-slate-700">{{ w.company }}</span>
              <span class="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 self-start sm:self-auto">{{ w.duration }}</span>
            </div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ w.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleProjects.length" class="mb-8">
        <h2 class="text-xl font-bold text-slate-800 border-b-2 border-slate-200 mb-4 pb-1 uppercase tracking-wider flex items-center gap-2">
          <span class="text-slate-400">🚀</span> 项目经验
        </h2>
        <div class="space-y-6">
          <div v-for="p in visibleProjects" :key="p.id" class="text-sm relative pl-4 border-l-2 border-slate-300">
            <div class="absolute w-2.5 h-2.5 bg-slate-400 rounded-full -left-[6px] top-1.5 border-2 border-slate-50" />
            <div class="font-bold text-lg text-slate-800">{{ p.name }}</div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center text-slate-500 mb-1 font-medium gap-1 sm:gap-0">
              <span class="text-slate-700">{{ p.role }}</span>
              <span class="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 self-start sm:self-auto">{{ p.duration }}</span>
            </div>
            <div v-if="p.technologies" class="mb-2 text-xs text-slate-500">
              <span class="font-medium text-slate-600">技术栈：</span>{{ p.technologies }}
            </div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleAwards.length" class="mb-8">
        <h2 class="text-xl font-bold text-slate-800 border-b-2 border-slate-200 mb-4 pb-1 uppercase tracking-wider flex items-center gap-2">
          <span class="text-slate-400">🏆</span> 获奖情况
        </h2>
        <div class="space-y-6">
          <div v-for="a in visibleAwards" :key="a.id" class="text-sm relative pl-4 border-l-2 border-slate-300">
            <div class="absolute w-2.5 h-2.5 bg-slate-400 rounded-full -left-[6px] top-1.5 border-2 border-slate-50" />
            <div class="font-bold text-lg text-slate-800">{{ a.name }}</div>
            <div class="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 self-start mt-1">{{ a.date }}</div>
            <p v-if="a.description" class="text-gray-600 whitespace-pre-wrap leading-relaxed mt-2">{{ a.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleCertifications.length" class="mb-8">
        <h2 class="text-xl font-bold text-slate-800 border-b-2 border-slate-200 mb-4 pb-1 uppercase tracking-wider flex items-center gap-2">
          <span class="text-slate-400">📜</span> 资格证书
        </h2>
        <div class="space-y-6">
          <div v-for="c in visibleCertifications" :key="c.id" class="text-sm relative pl-4 border-l-2 border-slate-300">
            <div class="absolute w-2.5 h-2.5 bg-slate-400 rounded-full -left-[6px] top-1.5 border-2 border-slate-50" />
            <div class="font-bold text-lg text-slate-800">{{ c.name }}</div>
            <div class="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 self-start mt-1">{{ c.date }}</div>
            <p v-if="c.description" class="text-gray-600 whitespace-pre-wrap leading-relaxed mt-2">{{ c.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visiblePortfolio.length" class="mb-8">
        <h2 class="text-xl font-bold text-slate-800 border-b-2 border-slate-200 mb-4 pb-1 uppercase tracking-wider flex items-center gap-2">
          <span class="text-slate-400">🎨</span> 作品集
        </h2>
        <div class="space-y-6">
          <div v-for="p in visiblePortfolio" :key="p.id" class="text-sm relative pl-4 border-l-2 border-slate-300">
            <div class="absolute w-2.5 h-2.5 bg-slate-400 rounded-full -left-[6px] top-1.5 border-2 border-slate-50" />
            <div class="font-bold text-lg text-slate-800">{{ p.title }}</div>
            <a v-if="p.link" :href="p.link" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline break-all mt-1 block">{{ p.link }}</a>
            <p v-if="p.description" class="text-gray-600 whitespace-pre-wrap leading-relaxed mt-2">{{ p.description }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';

export default {
  name: 'Template2',
  mixins: [resumeTemplateMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>
