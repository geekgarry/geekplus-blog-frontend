<template>
  <div>
    <!-- header：个人信息头不受「模块表头」样式约束，仍跟主题色 -->
    <div v-if="block.type === 'header'">
      <div
        v-if="isTwoColumn && isSidebar"
        :key="block.id"
        class="mb-6 flex flex-col items-center text-center border-b-2 pb-6"
        :style="{ borderColor: themeColor }"
      >
        <img
          v-if="data.basics.avatar"
          :src="data.basics.avatar"
          alt="Avatar"
          class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full shadow-sm mb-4"
        />
        <div>
          <h1 class="text-xl md:text-2xl font-bold mb-2" :style="{ color: themeColor }">{{ data.basics.name || '姓名' }}</h1>
          <div class="flex flex-col gap-1 md:gap-2 text-xs md:text-sm" :style="{ opacity: 0.8 }">
            <span v-if="data.basics.gender || data.basics.age">{{ genderAgeLine }}</span>
            <span v-if="data.basics.phone">{{ data.basics.phone }}</span>
            <span v-if="data.basics.email" class="break-all">{{ data.basics.email }}</span>
            <span v-if="data.basics.residence">{{ data.basics.residence }}</span>
            <span v-if="data.basics.workYears">{{ data.basics.workYears }}</span>
          </div>
        </div>
      </div>
      <div
        v-else
        :key="block.id"
        class="mb-6 flex border-b-2 pb-6"
        :class="isTwoColumn ? 'flex-col items-center text-center' : 'flex-row items-center gap-4 md:gap-6'"
        :style="{ borderColor: themeColor }"
      >
        <img
          v-if="data.basics.avatar"
          :src="data.basics.avatar"
          alt="Avatar"
          class="object-cover shadow-sm"
          :class="isTwoColumn ? 'w-24 h-24 md:w-32 md:h-32 rounded-full mb-4' : 'w-20 h-28 md:w-24 md:h-32 rounded-lg shrink-0'"
        />
        <div :class="isTwoColumn ? '' : 'text-left flex-1'">
          <h1
            class="font-bold mb-2"
            :class="isTwoColumn ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'"
            :style="{ color: themeColor }"
          >
            {{ data.basics.name || '姓名' }}
          </h1>
          <div
            class="flex gap-2 md:gap-4 text-xs md:text-sm"
            :class="isTwoColumn ? 'flex-col items-center' : 'flex-wrap justify-start'"
            :style="{ opacity: 0.8 }"
          >
            <span v-if="data.basics.gender || data.basics.age">{{ genderAgeLine }}</span>
            <span v-if="data.basics.phone">{{ data.basics.phone }}</span>
            <span v-if="data.basics.email" class="break-all">{{ data.basics.email }}</span>
            <span v-if="data.basics.residence">{{ data.basics.residence }}</span>
            <span v-if="data.basics.workYears">{{ data.basics.workYears }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- summary -->
    <section
      v-else-if="block.type === 'summary' && data.basics.summary"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        个人总结
      </h2>
      <div class="resume-dyn-body" :style="bodyStyle">
        <p class="leading-relaxed text-sm" :style="{ opacity: 0.9 }">{{ data.basics.summary }}</p>
      </div>
    </section>

    <!-- work -->
    <section
      v-else-if="block.type === 'work' && visibleWork.length"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        工作经历
      </h2>
      <div class="resume-dyn-body space-y-4" :style="bodyStyle">
        <div v-for="w in visibleWork" :key="w.id" class="text-sm">
          <div class="flex justify-between font-bold" :style="{ opacity: 0.95 }">
            <span>{{ w.company }} - {{ w.position }}</span>
            <span :style="{ opacity: 0.7 }">{{ w.duration }}</span>
          </div>
          <p class="mt-1 whitespace-pre-wrap" :style="{ opacity: 0.85 }">{{ w.description }}</p>
        </div>
      </div>
    </section>

    <!-- projects -->
    <section
      v-else-if="block.type === 'projects' && visibleProjects.length"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        项目经验
      </h2>
      <div class="resume-dyn-body space-y-4" :style="bodyStyle">
        <div v-for="p in visibleProjects" :key="p.id" class="text-sm">
          <div class="flex justify-between font-bold" :style="{ opacity: 0.95 }">
            <span>{{ p.name }}</span>
            <span :style="{ opacity: 0.7 }">{{ p.duration }}</span>
          </div>
          <div class="mb-1" :style="{ opacity: 0.8 }">角色: {{ p.role }} | 技术栈: {{ p.technologies }}</div>
          <p class="whitespace-pre-wrap" :style="{ opacity: 0.85 }">{{ p.description }}</p>
        </div>
      </div>
    </section>

    <!-- education -->
    <section
      v-else-if="block.type === 'education' && data.education.length"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        教育经历
      </h2>
      <div class="resume-dyn-body space-y-2" :style="bodyStyle">
        <div v-for="e in data.education" :key="e.id" class="flex justify-between text-sm">
          <span class="font-bold" :style="{ opacity: 0.95 }">{{ e.school }}</span>
          <span :style="{ opacity: 0.9 }">{{ e.degree }}</span>
          <span :style="{ opacity: 0.7 }">{{ e.year }}</span>
        </div>
      </div>
    </section>

    <!-- skills -->
    <section
      v-else-if="block.type === 'skills' && (data.skills || data.hobbies)"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        技能与爱好
      </h2>
      <div class="resume-dyn-body text-sm space-y-2" :style="[bodyStyle, { opacity: 0.9 }]">
        <div v-if="data.skills"><strong :style="{ opacity: 1 }">技能：</strong><span class="whitespace-pre-wrap">{{ data.skills }}</span></div>
        <div v-if="data.hobbies"><strong :style="{ opacity: 1 }">爱好：</strong>{{ data.hobbies }}</div>
      </div>
    </section>

    <!-- jobIntention -->
    <section
      v-else-if="block.type === 'jobIntention' && hasJobIntention"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        求职意向
      </h2>
      <div class="resume-dyn-body flex flex-wrap gap-4 text-sm" :style="[bodyStyle, { opacity: 0.9 }]">
        <div v-if="data.jobIntention.targetJob"><strong :style="{ opacity: 1 }">目标职业：</strong>{{ data.jobIntention.targetJob }}</div>
        <div v-if="data.jobIntention.targetCity"><strong :style="{ opacity: 1 }">意向城市：</strong>{{ data.jobIntention.targetCity }}</div>
        <div v-if="data.jobIntention.expectedSalary"><strong :style="{ opacity: 1 }">期望薪资：</strong>{{ data.jobIntention.expectedSalary }}</div>
      </div>
    </section>

    <!-- awards -->
    <section
      v-else-if="block.type === 'awards' && visibleAwards.length"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        获奖情况
      </h2>
      <div class="resume-dyn-body space-y-3" :style="bodyStyle">
        <div v-for="a in visibleAwards" :key="a.id" class="text-sm resume-item">
          <div class="flex justify-between mb-1">
            <span class="font-bold" :style="{ opacity: 0.95 }">{{ a.name }}</span>
            <span :style="{ opacity: 0.7 }">{{ a.date }}</span>
          </div>
          <div v-if="a.description" class="mt-1" :style="{ opacity: 0.85 }">{{ a.description }}</div>
        </div>
      </div>
    </section>

    <!-- certifications -->
    <section
      v-else-if="block.type === 'certifications' && visibleCertifications.length"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        资格证书
      </h2>
      <div class="resume-dyn-body space-y-3" :style="bodyStyle">
        <div v-for="c in visibleCertifications" :key="c.id" class="text-sm resume-item">
          <div class="flex justify-between mb-1">
            <span class="font-bold" :style="{ opacity: 0.95 }">{{ c.name }}</span>
            <span :style="{ opacity: 0.7 }">{{ c.date }}</span>
          </div>
          <div v-if="c.description" class="mt-1" :style="{ opacity: 0.85 }">{{ c.description }}</div>
        </div>
      </div>
    </section>

    <!-- portfolio -->
    <section
      v-else-if="block.type === 'portfolio' && visiblePortfolio.length"
      :key="block.id"
      class="resume-dyn-section mb-6"
      :style="sectionWrapStyle"
    >
      <h2 class="resume-dyn-title" :class="titleClass" :style="titleStyle">
        <span v-if="headerStyle === 'dot'" class="resume-dyn-dot" :style="{ backgroundColor: titleAccent }" />
        作品集
      </h2>
      <div class="resume-dyn-body space-y-3" :style="bodyStyle">
        <div v-for="p in visiblePortfolio" :key="p.id" class="text-sm resume-item">
          <div class="flex justify-between mb-1">
            <span class="font-bold" :style="{ opacity: 0.95 }">{{ p.title }}</span>
            <a
              v-if="p.link"
              :href="p.link"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-500 hover:underline break-all ml-2"
            >{{ p.link }}</a>
          </div>
          <div v-if="p.description" class="mt-1" :style="{ opacity: 0.85 }">{{ p.description }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'DynamicTemplateBlock',
  props: {
    block: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    themeColor: {
      type: String,
      required: true,
    },
    layoutType: {
      type: String,
      required: true,
    },
    sidebarBlockIds: {
      type: Array,
      default: () => [],
    },
    styleConfig: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    isTwoColumn() {
      return this.layoutType === 'two-column';
    },
    isSidebar() {
      return this.sidebarBlockIds.includes(this.block.id);
    },
    genderAgeLine() {
      return [this.data.basics.gender, this.data.basics.age].filter(Boolean).join(' · ');
    },
    visibleWork() {
      return (this.data.work || []).filter((w) => !w.isHidden);
    },
    visibleProjects() {
      return (this.data.projects || []).filter((p) => !p.isHidden);
    },
    visibleAwards() {
      return (this.data.awards || []).filter((a) => !a.isHidden);
    },
    visibleCertifications() {
      return (this.data.certifications || []).filter((c) => !c.isHidden);
    },
    visiblePortfolio() {
      return (this.data.portfolio || []).filter((p) => !p.isHidden);
    },
    hasJobIntention() {
      const j = this.data.jobIntention;
      return j && (j.targetJob || j.targetCity || j.expectedSalary);
    },
    headerStyle() {
      return (this.styleConfig && this.styleConfig.headerStyle) || 'dot';
    },
    titleAccent() {
      return (this.styleConfig && this.styleConfig.sectionHeaderColor) || this.themeColor;
    },
    titleClass() {
      return ['hs-' + this.headerStyle];
    },
    titleStyle() {
      const cfg = this.styleConfig || {};
      const style = {
        color: cfg.sectionHeaderColor || this.themeColor,
        backgroundColor: cfg.sectionHeaderBg || 'transparent',
      };
      if (this.headerStyle === 'bar') {
        style.borderLeftColor = this.titleAccent;
      }
      if (this.headerStyle === 'underline') {
        style.borderBottomColor = this.titleAccent;
      }
      return style;
    },
    sectionWrapStyle() {
      const cfg = this.styleConfig || {};
      const radius = typeof cfg.sectionRadius === 'number' ? cfg.sectionRadius : 0;
      const border = cfg.sectionBorderColor && cfg.sectionBorderColor !== 'transparent'
        ? `1px solid ${cfg.sectionBorderColor}`
        : 'none';
      return {
        borderRadius: radius + 'px',
        border,
        overflow: 'hidden',
      };
    },
    bodyStyle() {
      const cfg = this.styleConfig || {};
      const pad = typeof cfg.sectionPadding === 'number' ? cfg.sectionPadding : 0;
      return {
        backgroundColor: cfg.sectionBodyBg || 'transparent',
        padding: pad ? pad + 'px' : undefined,
      };
    },
  },
};
</script>

<style scoped>
.resume-dyn-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  padding: 6px 10px;
  line-height: 1.3;
}

.resume-dyn-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.resume-dyn-title.hs-bar {
  border-left: 4px solid currentColor;
  padding-left: 10px;
}

.resume-dyn-title.hs-underline {
  border-bottom: 2px solid currentColor;
  border-radius: 0;
  padding-bottom: 6px;
}

.resume-dyn-title.hs-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 14px;
  margin-bottom: 0.75rem;
}

.resume-dyn-title.hs-block {
  width: 100%;
  box-sizing: border-box;
}

.resume-dyn-title.hs-slash {
  clip-path: polygon(0 0, 100% 0, 94% 100%, 0 100%);
  padding-right: 18px;
}

.resume-dyn-body {
  box-sizing: border-box;
}
</style>
