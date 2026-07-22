/**
 * @typedef {Object} ResumeBasics
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} summary
 * @property {string} [avatar]
 * @property {string} [age]
 * @property {string} [residence]
 * @property {string} [gender]
 * @property {string} [workYears]
 */

/**
 * @typedef {Object} JobIntention
 * @property {string} targetJob
 * @property {string} targetCity
 * @property {string} expectedSalary
 */

/**
 * @typedef {Object} EducationItem
 * @property {string} id
 * @property {string} school
 * @property {string} degree
 * @property {string} year
 * @property {boolean} [isHidden]
 */

/**
 * @typedef {Object} WorkItem
 * @property {string} id
 * @property {string} company
 * @property {string} position
 * @property {string} duration
 * @property {string} description
 * @property {boolean} [isHidden]
 */

/**
 * @typedef {Object} ProjectItem
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} technologies
 * @property {string} duration
 * @property {string} description
 * @property {boolean} [isHidden]
 */

/**
 * @typedef {Object} AwardItem
 * @property {string} id
 * @property {string} name
 * @property {string} date
 * @property {string} description
 * @property {boolean} [isHidden]
 */

/**
 * @typedef {Object} CertificationItem
 * @property {string} id
 * @property {string} name
 * @property {string} [issuer]
 * @property {string} date
 * @property {string} description
 * @property {boolean} [isHidden]
 */

/**
 * @typedef {Object} PortfolioItem
 * @property {string} id
 * @property {string} title
 * @property {string} link
 * @property {string} description
 * @property {boolean} [isHidden]
 */

/**
 * @typedef {Object} ResumeData
 * @property {ResumeBasics} basics
 * @property {JobIntention} [jobIntention]
 * @property {EducationItem[]} education
 * @property {WorkItem[]} work
 * @property {ProjectItem[]} projects
 * @property {AwardItem[]} [awards]
 * @property {CertificationItem[]} [certifications]
 * @property {PortfolioItem[]} [portfolio]
 * @property {string} skills
 * @property {string} hobbies
 */

/**
 * @typedef {'header'|'summary'|'jobIntention'|'work'|'projects'|'education'|'awards'|'certifications'|'portfolio'|'skills'} BlockType
 */

/**
 * @typedef {Object} TemplateBlock
 * @property {string} id
 * @property {BlockType} type
 */

/**
 * @typedef {'single'|'two-column'} LayoutType
 */

/**
 * @typedef {Object} TemplateLayout
 * @property {string} themeColor
 * @property {string} fontColor
 * @property {string} backgroundColor
 * @property {string} [sidebarBackgroundColor]
 * @property {LayoutType} layoutType
 * @property {'left'|'right'} [sidebarPosition]
 * @property {TemplateBlock[]} mainBlocks
 * @property {TemplateBlock[]} sidebarBlocks
 * @property {TemplateBlock[]} [blocks]
 */

/**
 * @typedef {Object} ResumeTemplate
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} isVip
 * @property {string} [thumbnail]
 * @property {TemplateLayout} [layoutData]
 * @property {boolean} readonly
 */

/** @returns {ResumeData} */
export function createEmptyResumeData() {
  return {
    basics: {
      name: '',
      email: '',
      phone: '',
      summary: '',
      avatar: '',
      age: '',
      residence: '',
      gender: '',
      workYears: '',
    },
    jobIntention: { targetJob: '', targetCity: '', expectedSalary: '' },
    education: [],
    work: [],
    projects: [],
    awards: [],
    certifications: [],
    portfolio: [],
    skills: '',
    hobbies: '',
  };
}

/** @type {ResumeTemplate[]} */
export const DEFAULT_TEMPLATES = [
  {
    id: 'template1',
    name: '简约通用',
    description: '适合所有行业的标准排版，清晰明了。',
    isVip: false,
    readonly: true,
  },
  {
    id: 'template2',
    name: '现代专业',
    description: '带有侧边栏的现代设计，适合互联网/设计行业。',
    isVip: true,
    readonly: true,
  },
  {
    id: 'template3',
    name: '表格样式',
    description: '传统的表格布局，适合展示详细信息。',
    isVip: false,
    readonly: true,
  },
  {
    id: 'template4',
    name: 'PPT风格',
    description: 'PPT风格的简历模板。',
    isVip: true,
    readonly: true,
  },
  {
    id: 'template6',
    name: '商务蓝调',
    description: '深蓝头图与圆角色块标题，适合互联网求职展示。',
    isVip: false,
    readonly: true,
  },
  {
    id: 'template7',
    name: '清新卡片',
    description: '浅蓝背景白卡片，斜杠标题线，清爽现代。',
    isVip: false,
    readonly: true,
  },
  {
    id: 'template8',
    name: '图标专业',
    description: '圆形图标章节与侧边丝带，专业稳重。',
    isVip: false,
    readonly: true,
  },
  {
    id: 'template9',
    name: '斜切标签',
    description: '居中头像卡片与斜切色块标题，辨识度高。',
    isVip: true,
    readonly: true,
  },
];
