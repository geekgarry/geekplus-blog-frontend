<template>
  <div id="resume-print-area" class="w-full overflow-x-auto bg-gray-200 print:p-0 print:bg-white">
    <DynamicTemplate
      v-if="template && template.layoutData"
      :data="data"
      :layout-data="template.layoutData"
    />
    <component v-else :is="activeTemplateComponent" :data="data" />
  </div>
</template>

<script>
import DynamicTemplate from './templates/DynamicTemplate.vue';
import Template1 from './templates/Template1.vue';
import Template2 from './templates/Template2.vue';
import Template3 from './templates/Template3.vue';
import Template4 from './templates/Template4.vue';
import Template6 from './templates/Template6.vue';
import Template7 from './templates/Template7.vue';
import Template8 from './templates/Template8.vue';
import Template9 from './templates/Template9.vue';
import './styles/resume-print.css';

const TEMPLATE_MAP = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
  template6: Template6,
  template7: Template7,
  template8: Template8,
  template9: Template9,
};

export default {
  name: 'ResumePreview',
  components: {
    DynamicTemplate,
    Template1,
    Template2,
    Template3,
    Template4,
    Template6,
    Template7,
    Template8,
    Template9,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    templateId: {
      type: String,
      default: 'template1',
    },
    template: {
      type: Object,
      default: null,
    },
  },
  computed: {
    activeTemplateComponent() {
      return TEMPLATE_MAP[this.templateId] || Template1;
    },
  },
};
</script>
