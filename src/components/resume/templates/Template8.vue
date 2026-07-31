<template>
  <div class="tpl9 bg-white text-gray-800 font-sans w-full max-w-[800px] min-h-[800px] md:min-h-[1131px] mx-auto shadow-lg print:shadow-none print:m-0 break-words overflow-hidden">
    <div class="tpl9-banner">
      <div class="tpl9-card-wrap">
        <div class="tpl9-avatar-wrap">
          <img
            v-if="data.basics.avatar"
            :src="data.basics.avatar"
            alt="Avatar"
            class="tpl9-avatar"
          />
          <div v-else class="tpl9-avatar tpl9-avatar--placeholder">
            {{ nameInitial }}
          </div>
        </div>
        <div class="tpl9-info-card">
          <h1 class="tpl9-name">{{ data.basics.name || '姓名' }}</h1>
          <div class="tpl9-meta">
            <span v-if="data.basics.gender">{{ data.basics.gender }}</span>
            <span v-if="data.basics.age">{{ data.basics.age }}</span>
            <span v-if="eduDegree">{{ eduDegree }}</span>
            <span v-if="data.basics.workYears">| {{ data.basics.workYears }}</span>
          </div>
          <div class="tpl9-contact">
            <div v-if="data.basics.phone">☎ {{ data.basics.phone }}</div>
            <div v-if="data.basics.email" class="break-all">✉ {{ data.basics.email }}</div>
            <div v-if="data.basics.residence || (data.jobIntention && data.jobIntention.targetCity)">
              📍 {{ data.basics.residence || data.jobIntention.targetCity }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tpl9-body">
      <section v-if="hasJobIntention">
        <CutTab title="求职期望" />
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          <span v-if="data.jobIntention.targetJob">期望：{{ data.jobIntention.targetJob }}</span>
          <span v-if="data.jobIntention.targetCity">城市：{{ data.jobIntention.targetCity }}</span>
          <span v-if="data.jobIntention.expectedSalary">薪资：{{ data.jobIntention.expectedSalary }}</span>
        </div>
      </section>

      <section v-if="visibleWork.length">
        <CutTab title="工作经历" />
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
        <CutTab title="教育经历" />
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
        <CutTab title="技能标签" />
        <div v-if="skillTagList.length" class="flex flex-wrap gap-2">
          <span
            v-for="tag in skillTagList"
            :key="tag"
            class="px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-xs"
          >{{ tag }}</span>
        </div>
        <p v-else class="text-sm text-gray-700 whitespace-pre-wrap">{{ data.skills }}</p>
      </section>

      <section v-if="data.basics.summary">
        <CutTab title="个人亮点" />
        <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ data.basics.summary }}</p>
      </section>

      <section v-if="visibleProjects.length">
        <CutTab title="项目经验" />
        <div class="space-y-4">
          <div v-for="p in visibleProjects" :key="p.id" class="text-sm">
            <div class="flex flex-wrap justify-between gap-1 font-bold mb-1">
              <span>{{ p.duration }}</span>
              <span>{{ p.name }}</span>
              <span>{{ p.role }}</span>
            </div>
            <div v-if="p.technologies" class="text-gray-500 text-xs mb-1">技术栈：{{ p.technologies }}</div>
            <p class="text-gray-600 whitespace-pre-wrap leading-relaxed">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleAwards.length">
        <CutTab title="获奖情况" />
        <div class="space-y-2 text-sm">
          <div v-for="a in visibleAwards" :key="a.id">
            <div class="flex justify-between font-bold">
              <span>{{ a.name }}</span>
              <span class="text-gray-500 font-medium">{{ a.date }}</span>
            </div>
            <p v-if="a.description" class="text-gray-600 mt-1 whitespace-pre-wrap">{{ a.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="visibleCertifications.length">
        <CutTab title="资格证书" />
        <div class="space-y-1 text-sm">
          <div v-for="c in visibleCertifications" :key="c.id" class="flex justify-between">
            <span class="font-bold">{{ c.name }}</span>
            <span class="text-gray-500">{{ c.date }}</span>
          </div>
        </div>
      </section>

      <section v-if="visiblePortfolio.length">
        <CutTab title="作品集" />
        <div class="space-y-2 text-sm">
          <div v-for="p in visiblePortfolio" :key="p.id">
            <div class="font-bold">{{ p.title }}</div>
            <a
              v-if="p.link"
              :href="p.link"
              class="text-[#1a2744] break-all"
              target="_blank"
              rel="noopener noreferrer"
            >{{ p.link }}</a>
            <p v-if="p.description" class="text-gray-600 mt-1 whitespace-pre-wrap">{{ p.description }}</p>
          </div>
        </div>
      </section>

      <section v-if="data.hobbies">
        <CutTab title="兴趣爱好" />
        <p class="text-sm text-gray-700">{{ data.hobbies }}</p>
      </section>
    </div>
  </div>
</template>

<script>
import CutTab from './CutTab.vue';
import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';

export default {
  name: 'Template9',
  mixins: [resumeTemplateMixin],
  components: { CutTab },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.tpl9-banner {
  background: #1a2744;
  min-height: 7rem;
  padding: 2.5rem 1rem 0;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.tpl9-card-wrap {
  width: 90%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: -5.5rem;
  position: relative;
  z-index: 2;
}

.tpl9-avatar-wrap {
  position: relative;
  z-index: 3;
}

.tpl9-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
  background: #fff;
}

@media (min-width: 768px) {
  .tpl9-banner {
    min-height: 8rem;
  }
  .tpl9-avatar {
    width: 6rem;
    height: 6rem;
  }
}

.tpl9-avatar--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a2744;
}

.tpl9-info-card {
  width: 100%;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  margin-top: -2.5rem;
  padding: 3rem 1.25rem 1rem;
  text-align: center;
  box-sizing: border-box;
}

.tpl9-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

@media (min-width: 768px) {
  .tpl9-name {
    font-size: 1.5rem;
  }
}

.tpl9-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.tpl9-contact {
  font-size: 0.75rem;
  color: #4b5563;
  line-height: 1.6;
}

@media (min-width: 768px) {
  .tpl9-contact {
    font-size: 0.875rem;
  }
}

.tpl9-body {
  padding: 7rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .tpl9-body {
    padding: 7.5rem 2.5rem 1.5rem;
  }
}

.tpl9-body > section {
  width: 100%;
}
</style>
