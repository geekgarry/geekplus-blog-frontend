<template>
  <div class="bg-slate-900 text-white font-sans w-full overflow-hidden max-w-[960px] mx-auto p-10 shadow-2xl print:shadow-none print:m-0 relative flex flex-col">
    <div class="absolute top-0 right-[-5%] w-[50%] h-full bg-gradient-to-bl from-blue-600/30 to-purple-600/10 transform rotate-12 skew-x-12 pointer-events-none"></div>
    <div class="absolute bottom-[-5%] left-[-10%] w-[40%] h-[60%] bg-gradient-to-tr from-teal-500/20 to-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="flex items-center gap-8 mb-8 relative z-10 border-b border-white/20 pb-6">
      <img
        v-if="data.basics.avatar"
        :src="data.basics.avatar"
        alt="Avatar"
        class="w-32 h-32 rounded-full border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] object-cover"
      />
      <div
        v-else
        class="w-32 h-32 rounded-full border-4 border-blue-500 bg-slate-800 flex items-center justify-center text-4xl font-bold text-blue-400"
      >
        {{ nameInitial }}
      </div>
      <div class="flex-1">
        <h1 class="text-5xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          {{ data.basics.name || '姓名' }}
        </h1>
        <div class="flex gap-6 text-blue-200 text-sm font-medium">
          <span v-if="data.basics.phone" class="flex items-center gap-2">📱 {{ data.basics.phone }}</span>
          <span v-if="data.basics.email" class="flex items-center gap-2">✉️ {{ data.basics.email }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-8 flex-1 relative z-10">
      <div class="w-1/2 flex flex-col gap-6 pr-4">
        <section v-if="data.basics.summary">
          <h2 class="text-xl font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-white rounded"></span> Profile
          </h2>
          <p class="text-sm text-gray-100 leading-relaxed bg-white/10 p-4 rounded-lg border border-white/20">
            {{ data.basics.summary }}
          </p>
        </section>

        <section v-if="hasJobIntention">
          <h2 class="text-xl font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-white rounded"></span> Job Intention
          </h2>
          <div class="bg-white/10 p-4 rounded-lg border border-white/20">
            <div v-if="data.jobIntention.targetJob">
              <strong class="text-blue-300">Target Job:</strong> {{ data.jobIntention.targetJob }}
            </div>
            <div v-if="data.jobIntention.targetCity">
              <strong class="text-blue-300">Target City:</strong> {{ data.jobIntention.targetCity }}
            </div>
            <div v-if="data.jobIntention.expectedSalary">
              <strong class="text-blue-300">Expected Salary:</strong> {{ data.jobIntention.expectedSalary }}
            </div>
          </div>
        </section>

        <section v-if="visibleWork.length">
          <h2 class="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-blue-500 rounded"></span> Experience
          </h2>
          <div class="space-y-4">
            <div
              v-for="w in visibleWork"
              :key="w.id"
              class="bg-white/5 p-4 rounded-lg border border-white/10 border-l-4 border-l-blue-500"
            >
              <div class="flex justify-between items-start mb-1">
                <h3 class="font-bold text-lg text-white">{{ w.position }}</h3>
                <span class="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">{{ w.duration }}</span>
              </div>
              <div class="text-white text-sm mb-2">{{ w.company }}</div>
              <p class="text-sm text-gray-200">{{ w.description }}</p>
            </div>
          </div>
        </section>

        <section v-if="data.skills">
          <h2 class="text-xl font-bold text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-emerald-500 rounded"></span> Skills
          </h2>
          <div class="bg-white/5 p-4 rounded-lg border border-white/10">
            <p class="text-sm text-gray-300">{{ data.skills }}</p>
          </div>
        </section>

        <section v-if="visibleAwards.length">
          <h2 class="text-xl font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-white rounded"></span> Awards
          </h2>
          <div class="space-y-4">
            <div
              v-for="a in visibleAwards"
              :key="a.id"
              class="bg-white/5 p-4 rounded-lg border border-white/10 border-l-4 border-l-yellow-500"
            >
              <div class="flex justify-between items-start mb-1">
                <h3 class="font-bold text-lg text-white">{{ a.name }}</h3>
                <span class="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">{{ a.date }}</span>
              </div>
              <p v-if="a.description" class="text-xs text-gray-400 line-clamp-3">{{ a.description }}</p>
            </div>
          </div>
        </section>
      </div>

      <div class="w-1/2 flex flex-col gap-6 pr-4">
        <section v-if="data.education.length">
          <h2 class="text-xl font-bold text-teal-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-teal-500 rounded"></span> Education
          </h2>
          <div class="space-y-3">
            <div
              v-for="edu in data.education"
              :key="edu.id"
              class="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10"
            >
              <div>
                <div class="font-bold text-white">{{ edu.school }}</div>
                <div class="text-teal-300 text-sm">{{ edu.degree }}</div>
              </div>
              <span class="text-xs text-gray-400">{{ edu.year }}</span>
            </div>
          </div>
        </section>

        <section v-if="visibleProjects.length">
          <h2 class="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-purple-500 rounded"></span> Projects
          </h2>
          <div class="space-y-3">
            <div
              v-for="p in visibleProjects"
              :key="p.id"
              class="bg-white/5 p-3 rounded-lg border border-white/10 border-l-4 border-l-purple-500"
            >
              <div class="font-bold text-white mb-1">{{ p.name }}</div>
              <div class="text-xs text-purple-300 mb-1">{{ p.technologies }}</div>
              <p class="text-xs text-gray-300 h-auto">{{ p.description }}</p>
            </div>
          </div>
        </section>

        <section v-if="visibleCertifications.length">
          <h2 class="text-xl font-bold text-green-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-green-500 rounded"></span> Certifications
          </h2>
          <div class="space-y-3">
            <div
              v-for="c in visibleCertifications"
              :key="c.id"
              class="bg-white/5 p-3 rounded-lg border border-white/10 border-l-4 border-l-green-500"
            >
              <div class="font-bold text-white mb-1">{{ c.name }}</div>
              <div class="text-xs text-green-300 mb-1">{{ c.date }}</div>
              <p v-if="c.description" class="text-xs text-gray-400 line-clamp-3">{{ c.description }}</p>
            </div>
          </div>
        </section>

        <section v-if="visiblePortfolio.length">
          <h2 class="text-xl font-bold text-pink-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
            <span class="w-8 h-1 bg-pink-500 rounded"></span> Portfolio
          </h2>
          <div class="space-y-3">
            <div
              v-for="p in visiblePortfolio"
              :key="p.id"
              class="bg-white/5 p-3 rounded-lg border border-white/10 border-l-4 border-l-pink-500"
            >
              <div class="font-bold text-white mb-1">{{ p.title }}</div>
              <a
                v-if="p.link"
                :href="p.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-pink-300 text-sm hover:underline break-all"
              >{{ p.link }}</a>
              <p v-if="p.description" class="text-xs text-gray-400 line-clamp-3 mt-1">{{ p.description }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';

export default {
  name: 'Template4',
  mixins: [resumeTemplateMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>
