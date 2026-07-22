import { parseSkillTagList, eduDegreeFromEducation, highestDegreeFromEducation } from '../utils/resumeHelpers';

export default {
  computed: {
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
    visibleEducation() {
      return (this.data.education || []).filter((e) => !e.isHidden);
    },
    hasJobIntention() {
      const j = this.data.jobIntention;
      return j && (j.targetJob || j.targetCity || j.expectedSalary);
    },
    skillTagList() {
      return parseSkillTagList(this.data.skills);
    },
    eduDegree() {
      return eduDegreeFromEducation(this.data.education);
    },
    highestDegree() {
      return highestDegreeFromEducation(this.data.education);
    },
    nameInitial() {
      return (this.data.basics.name || '名')[0];
    },
  },
};
