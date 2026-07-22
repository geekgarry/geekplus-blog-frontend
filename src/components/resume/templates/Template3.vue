<template>
  <div class="table-resume-tpl bg-white text-black font-serif w-full max-w-[800px] min-h-[1131px] mx-auto p-8 shadow-lg print:shadow-none print:m-0">
    <h1 class="text-3xl font-bold text-center mb-6 tracking-widest">个人简历</h1>

    <div class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">基础信息</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr>
            <td class="p-3 font-bold bg-gray-100 w-[18%] text-center">姓名</td>
            <td class="p-3 w-[22%]">{{ data.basics.name }}</td>
            <td class="p-3 font-bold bg-gray-100 w-[18%] text-center">性别</td>
            <td class="p-3 w-[22%]">{{ data.basics.gender || '' }}</td>
            <td class="p-2 w-[20%] text-center align-middle" rowspan="5">
              <img
                v-if="data.basics.avatar"
                :src="data.basics.avatar"
                alt="Avatar"
                class="w-24 h-32 object-cover mx-auto"
              />
              <div
                v-else
                class="w-24 h-32 bg-gray-100 mx-auto flex items-center justify-center text-gray-400"
              >
                照片
              </div>
            </td>
          </tr>
          <tr>
            <td class="p-3 font-bold bg-gray-100 text-center">年龄</td>
            <td class="p-3">{{ data.basics.age || '' }}</td>
            <td class="p-3 font-bold bg-gray-100 text-center">电话</td>
            <td class="p-3">{{ data.basics.phone }}</td>
          </tr>
          <tr>
            <td class="p-3 font-bold bg-gray-100 text-center">工作经验</td>
            <td class="p-3">{{ data.basics.workYears || '' }}</td>
            <td class="p-3 font-bold bg-gray-100 text-center">最高学历</td>
            <td class="p-3">{{ highestDegree }}</td>
          </tr>
          <tr>
            <td class="p-3 font-bold bg-gray-100 text-center">常住地</td>
            <td class="p-3" colspan="3">{{ data.basics.residence || '' }}</td>
          </tr>
          <tr>
            <td class="p-3 font-bold bg-gray-100 text-center">邮箱</td>
            <td class="p-3 break-all" colspan="3">{{ data.basics.email }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="data.basics.summary" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">个人介绍</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr>
            <td class="p-3 whitespace-pre-wrap leading-relaxed">{{ data.basics.summary }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="data.education.length" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">教育经历</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr v-for="edu in data.education" :key="edu.id">
            <td class="p-3 w-1/3">{{ edu.year }}</td>
            <td class="p-3 font-bold w-1/3">{{ edu.school }}</td>
            <td class="p-3 w-1/3">{{ edu.degree }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="hasJobIntention" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">求职意向</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr v-if="data.jobIntention.targetJob">
            <td class="p-3 font-bold bg-gray-100 w-24 text-center">目标职业</td>
            <td class="p-3">{{ data.jobIntention.targetJob }}</td>
          </tr>
          <tr v-if="data.jobIntention.targetCity">
            <td class="p-3 font-bold bg-gray-100 w-24 text-center">意向城市</td>
            <td class="p-3">{{ data.jobIntention.targetCity }}</td>
          </tr>
          <tr v-if="data.jobIntention.expectedSalary">
            <td class="p-3 font-bold bg-gray-100 w-24 text-center">期望薪资</td>
            <td class="p-3">{{ data.jobIntention.expectedSalary }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="visibleWork.length" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">工作经历</h2>
      <table class="w-full text-sm">
        <tbody>
          <template v-for="w in visibleWork">
          <tr :key="w.id+'-1'">
            <td class="p-3 w-1/4 align-top">{{ w.duration }}</td>
            <td class="p-3 w-1/4 align-top font-bold">{{ w.company }}</td>
            <td class="p-3 w-1/4 align-top">{{ w.position }}</td>
          </tr>
          <tr :key="w.id+'-2'">
            <td class="p-3 w-1/4 align-top whitespace-pre-wrap" colspan="3">{{ w.description }}</td>
          </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="visibleProjects.length" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">项目经验</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr v-for="p in visibleProjects" :key="p.id">
            <td class="p-3 w-1/4 align-top">{{ p.duration }}</td>
            <td class="p-3 w-3/4 align-top">
              <div class="font-bold mb-1">
                {{ p.name }} <span class="font-normal text-gray-600">({{ p.role }})</span>
              </div>
              <div class="mb-1 text-xs text-gray-600">技术栈: {{ p.technologies }}</div>
              <div class="whitespace-pre-wrap">{{ p.description }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="data.skills || data.hobbies" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">附加信息</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr v-if="data.skills">
            <td class="p-3 font-bold bg-gray-100 w-24 text-center">专业技能</td>
            <td class="p-3 whitespace-pre-wrap">{{ data.skills }}</td>
          </tr>
          <tr v-if="data.hobbies">
            <td class="p-3 font-bold bg-gray-100 w-24 text-center">兴趣爱好</td>
            <td class="p-3 whitespace-pre-wrap">{{ data.hobbies }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="visibleAwards.length" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">获奖情况</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr v-for="a in visibleAwards" :key="a.id">
            <td class="p-3 w-1/4 align-top">{{ a.date }}</td>
            <td class="p-3 w-3/4 align-top">
              <div class="font-bold mb-1">{{ a.name }}</div>
              <div v-if="a.description" class="whitespace-pre-wrap">{{ a.description }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="visibleCertifications.length" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">资格证书</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr v-for="c in visibleCertifications" :key="c.id">
            <td class="p-3 w-1/4 align-top">{{ c.date }}</td>
            <td class="p-3 w-3/4 align-top">
              <div class="font-bold mb-1">{{ c.name }}</div>
              <div v-if="c.description" class="whitespace-pre-wrap">{{ c.description }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="visiblePortfolio.length" class="mb-6">
      <h2 class="table-section-title text-lg tracking-widest">个人作品</h2>
      <table class="w-full text-sm">
        <tbody>
          <tr v-for="p in visiblePortfolio" :key="p.id">
            <td class="p-3 w-1/4 align-top">{{ p.title }}</td>
            <td class="p-3 w-3/4 align-top">
              <a
                v-if="p.link"
                :href="p.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline break-all mb-1 block"
              >{{ p.link }}</a>
              <div v-if="p.description" class="whitespace-pre-wrap">{{ p.description }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';

export default {
  name: 'Template3',
  mixins: [resumeTemplateMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>
