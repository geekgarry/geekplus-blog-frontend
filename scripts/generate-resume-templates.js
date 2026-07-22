/* eslint-disable */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../src/components/resume/templates');
const tsx = fs.readFileSync(
  '/Users/MyProjectBase/Vue/geekplus-tool-app/ai-resume-builder-app/src/components/ResumePreview.tsx',
  'utf8'
);

function extractRenderBody(fnName) {
  if (fnName === 'renderTemplate3') {
    const start = tsx.indexOf(`const ${fnName} = () => {`);
    const ret = tsx.indexOf('return (', start);
    let i = tsx.indexOf('(', ret);
    let depth = 0;
    for (let j = i; j < tsx.length; j++) {
      if (tsx[j] === '(') depth++;
      else if (tsx[j] === ')') {
        depth--;
        if (!depth) return tsx.slice(i + 1, j).trim();
      }
    }
  }
  const start = tsx.indexOf(`const ${fnName} = () => (`);
  let i = tsx.indexOf('(', start);
  let depth = 0;
  for (let j = i; j < tsx.length; j++) {
    if (tsx[j] === '(') depth++;
    else if (tsx[j] === ')') {
      depth--;
      if (!depth) return tsx.slice(i + 1, j).trim();
    }
  }
  throw new Error('extract fail ' + fnName);
}

function convertAvatarTernary(s) {
  return s.replace(
    /\{data\.basics\.avatar \?\s*\(\s*<img([\s\S]*?)\/>\s*\)\s*:\s*\(\s*(<div[\s\S]*?<\/div>)\s*\)\}/g,
    '<img v-if="data.basics.avatar"$1/><div v-else$2</div>'
  );
}

function jsxToVue(html) {
  let s = html;
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  s = s.replace(/className=/g, 'class=');
  s = s.replace(/rowSpan=\{(\d+)\}/g, 'rowspan="$1"');
  s = s.replace(/colSpan=\{(\d+)\}/g, 'colspan="$1"');
  s = s.replace(/style=\{\{([^}]+)\}\}/g, ':style="{ $1 }"');

  const repl = [
    [/data\.work\.filter\(\(w\) => !w\.isHidden\)\.length > 0/g, 'visibleWork.length > 0'],
    [/data\.work\.filter\(w => !w\.isHidden\)\.length > 0/g, 'visibleWork.length > 0'],
    [/data\.work\.filter\(\(w\) => !w\.isHidden\)/g, 'visibleWork'],
    [/data\.work\.filter\(w => !w\.isHidden\)/g, 'visibleWork'],
    [/data\.projects && data\.projects\.filter\(p => !p\.isHidden\)\.length > 0/g, 'visibleProjects.length > 0'],
    [/data\.projects\.filter\(\(p\) => !p\.isHidden\)\.length > 0/g, 'visibleProjects.length > 0'],
    [/data\.projects\.filter\(p => !p\.isHidden\)\.length > 0/g, 'visibleProjects.length > 0'],
    [/data\.projects\.filter\(\(p\) => !p\.isHidden\)/g, 'visibleProjects'],
    [/data\.projects\.filter\(p => !p\.isHidden\)/g, 'visibleProjects'],
    [/data\.education\.filter\(\(e\) => !e\.isHidden\)\.length > 0/g, 'visibleEducation.length > 0'],
    [/data\.education\.filter\(\(e\) => !e\.isHidden\)/g, 'visibleEducation'],
    [/data\.awards && data\.awards\.filter\(\(a\) => !a\.isHidden\)\.length > 0/g, 'visibleAwards.length > 0'],
    [/data\.awards && data\.awards\.filter\(a => !a\.isHidden\)\.length > 0/g, 'visibleAwards.length > 0'],
    [/data\.awards\.filter\(a => !a\.isHidden\)/g, 'visibleAwards'],
    [/data\.certifications && data\.certifications\.filter\(\(c\) => !c\.isHidden\)\.length > 0/g, 'visibleCertifications.length > 0'],
    [/data\.certifications && data\.certifications\.filter\(c => !c\.isHidden\)\.length > 0/g, 'visibleCertifications.length > 0'],
    [/data\.certifications\.filter\(c => !c\.isHidden\)/g, 'visibleCertifications'],
    [/data\.portfolio && data\.portfolio\.filter\(\(p\) => !p\.isHidden\)\.length > 0/g, 'visiblePortfolio.length > 0'],
    [/data\.portfolio && data\.portfolio\.filter\(p => !p\.isHidden\)\.length > 0/g, 'visiblePortfolio.length > 0'],
    [/data\.portfolio\.filter\(p => !p\.isHidden\)/g, 'visiblePortfolio'],
    [/data\.education\.filter\(\(e\) => !e\.isHidden\)\[0\]\?\.degree \|\| ''/g, 'highestDegree'],
    [/eduDegree\(\)/g, 'eduDegree'],
  ];
  for (const [re, to] of repl) s = s.replace(re, to);

  s = convertAvatarTernary(s);

  const condMap = [
    ['data.jobIntention && (data.jobIntention.targetJob || data.jobIntention.targetCity || data.jobIntention.expectedSalary)', 'hasJobIntention'],
    ['data.basics.summary', 'data.basics.summary'],
    ['data.basics.avatar', 'data.basics.avatar'],
    ['data.skills', 'data.skills'],
    ['data.hobbies', 'data.hobbies'],
    ['data.education.length > 0', 'data.education.length > 0'],
    ['(data.skills || data.hobbies)', 'data.skills || data.hobbies'],
    ['data.skills && skillTagList.length === 0', 'data.skills && skillTagList.length === 0'],
    ['data.hobbies && !skillTagList.length', 'data.hobbies && !skillTagList.length'],
    ['data.hobbies && skillTagList.length > 0', 'data.hobbies && skillTagList.length > 0'],
    ['skillTagList.length > 0', 'skillTagList.length > 0'],
    ['skillTagList.length > 0 || data.skills', 'skillTagList.length > 0 || data.skills'],
    ['(data.basics.gender || data.basics.age)', 'data.basics.gender || data.basics.age'],
    ['(data.basics.residence || data.jobIntention?.targetCity)', 'data.basics.residence || data.jobIntention?.targetCity'],
    ['!data.basics.residence && data.jobIntention?.targetCity', '!data.basics.residence && data.jobIntention?.targetCity'],
    ['data.basics.gender', 'data.basics.gender'],
    ['data.basics.age', 'data.basics.age'],
    ['data.basics.phone', 'data.basics.phone'],
    ['data.basics.email', 'data.basics.email'],
    ['data.basics.residence', 'data.basics.residence'],
    ['data.basics.workYears', 'data.basics.workYears'],
    ['data.jobIntention.targetJob', 'data.jobIntention.targetJob'],
    ['data.jobIntention.targetCity', 'data.jobIntention.targetCity'],
    ['data.jobIntention.expectedSalary', 'data.jobIntention.expectedSalary'],
    ['p.role', 'p.role'],
    ['p.technologies', 'p.technologies'],
    ['p.link', 'p.link'],
    ['a.description', 'a.description'],
    ['c.description', 'c.description'],
  ];

  for (const [from, to] of condMap) {
    const esc = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`\\{${esc} && \\(`, 'g'), `<template v-if="${to}">`);
  }
  s = s.replace(/\{visibleWork\.length > 0 && \(/g, '<template v-if="visibleWork.length > 0">');
  s = s.replace(/\{visibleProjects\.length > 0 && \(/g, '<template v-if="visibleProjects.length > 0">');
  s = s.replace(/\{visibleAwards\.length > 0 && \(/g, '<template v-if="visibleAwards.length > 0">');
  s = s.replace(/\{visibleCertifications\.length > 0 && \(/g, '<template v-if="visibleCertifications.length > 0">');
  s = s.replace(/\{visiblePortfolio\.length > 0 && \(/g, '<template v-if="visiblePortfolio.length > 0">');
  s = s.replace(/\{visibleEducation\.length > 0 && \(/g, '<template v-if="visibleEducation.length > 0">');

  s = s.replace(/\)\}/g, '</template>');

  s = s.replace(/\{data\.education\.map\(\(?(edu|e)\)? => \(/g, '<div v-for="edu in data.education" :key="edu.id"');
  s = s.replace(/\{visibleEducation\.map\(\(e\) => \(/g, '<div v-for="e in visibleEducation" :key="e.id"');
  s = s.replace(/\{visibleWork\.map\(\(w\) => \(/g, '<div v-for="w in visibleWork" :key="w.id"');
  s = s.replace(/\{visibleWork\.map\(w => \(/g, '<div v-for="w in visibleWork" :key="w.id"');
  s = s.replace(/\{visibleProjects\.map\(\(p\) => \(/g, '<div v-for="p in visibleProjects" :key="p.id"');
  s = s.replace(/\{visibleProjects\.map\(p => \(/g, '<div v-for="p in visibleProjects" :key="p.id"');
  s = s.replace(/\{visibleAwards\.filter\(a => !a\.isHidden\)\.map\(a => \(/g, '<div v-for="a in visibleAwards" :key="a.id"');
  s = s.replace(/\{visibleAwards\.map\(\(a\) => \(/g, '<div v-for="a in visibleAwards" :key="a.id"');
  s = s.replace(/\{visibleCertifications\.filter\(c => !c\.isHidden\)\.map\(c => \(/g, '<div v-for="c in visibleCertifications" :key="c.id"');
  s = s.replace(/\{visibleCertifications\.map\(\(c\) => \(/g, '<div v-for="c in visibleCertifications" :key="c.id"');
  s = s.replace(/\{visiblePortfolio\.filter\(p => !p\.isHidden\)\.map\(p => \(/g, '<div v-for="p in visiblePortfolio" :key="p.id"');
  s = s.replace(/\{visiblePortfolio\.map\(\(p\) => \(/g, '<div v-for="p in visiblePortfolio" :key="p.id"');
  s = s.replace(/\{skillTagList\.map\(\(tag\) => \(/g, '<span v-for="tag in skillTagList" :key="tag"');
  s = s.replace(/\{data\.jobIntention\.targetJob && \(/g, '<tr v-if="data.jobIntention.targetJob">');
  s = s.replace(/\{data\.jobIntention\.targetCity && \(/g, '<tr v-if="data.jobIntention.targetCity">');
  s = s.replace(/\{data\.jobIntention\.expectedSalary && \(/g, '<tr v-if="data.jobIntention.expectedSalary">');

  s = s.replace(/ key=\{[\w.]+\}/g, '');

  s = s.replace(/\{\[data\.basics\.gender, data\.basics\.age\]\.filter\(Boolean\)\.join\(' · '\)\}/g, "{{ [data.basics.gender, data.basics.age].filter(Boolean).join(' · ') }}");
  s = s.replace(/\{\(data\.basics\.name \|\| '名'\)\[0\]\}/g, '{{ nameInitial }}');
  s = s.replace(/\{data\.basics\.name \|\| '姓名'\}/g, "{{ data.basics.name || '姓名' }}");

  s = s.replace(/\{([^{}]+)\}/g, (m, expr) => {
    expr = expr.trim();
    if (/^(data\.|w\.|p\.|a\.|c\.|edu\.|e\.|tag|highestDegree|eduDegree|nameInitial|visible)/.test(expr)) {
      return `{{ ${expr} }}`;
    }
    return m;
  });

  s = s.replace(/<SectionSlash title="([^"]+)" \/>/g, '<SectionSlash title="$1" />');
  s = s.replace(/<IconTitle icon="([^"]+)" title="([^"]+)" \/>/g, '<IconTitle icon="$1" title="$2" />');
  s = s.replace(/<CutTab title="([^"]+)" \/>/g, '<CutTab title="$1" />');

  return s;
}

const map = {
  renderTemplate1: 'Template1',
  renderTemplate2: 'Template2',
  renderTemplate3: 'Template3',
  renderTemplate4: 'Template4',
  renderTemplate6: 'Template6',
  renderTemplate7: 'Template7',
  renderTemplate8: 'Template8',
  renderTemplate9: 'Template9',
};

const extraImports = {
  Template7: "import SectionSlash from './SectionSlash.vue';",
  Template8: "import IconTitle from './IconTitle.vue';",
  Template9: "import CutTab from './CutTab.vue';",
};
const extraComponents = {
  Template7: 'SectionSlash',
  Template8: 'IconTitle',
  Template9: 'CutTab',
};

for (const [fn, name] of Object.entries(map)) {
  let body = extractRenderBody(fn);
  if (fn === 'renderTemplate3') {
    body = body.replace(/const highestDegree =[\s\S]*?'';\s*\n\s*\n\s*return \(/, '');
    body = body.replace(/^\(/, '').replace(/\)\s*$/, '');
  }
  if (fn === 'renderTemplate7') body = body.replace(/const SectionSlash = \(\{ title \}[\s\S]*?\);\s*\n\s*/, '');
  if (fn === 'renderTemplate8') body = body.replace(/const IconTitle = \(\{ icon, title \}[\s\S]*?\);\s*\n\s*/, '');
  if (fn === 'renderTemplate9') body = body.replace(/const CutTab = \(\{ title \}[\s\S]*?\);\s*\n\s*/, '');

  const tpl = jsxToVue(body);
  const imp = extraImports[name] ? extraImports[name] + '\n' : '';
  const comp = extraComponents[name] ? `\n  components: { ${extraComponents[name]} },` : '';
  const vue = `<template>\n${tpl}\n</template>\n\n<script>\n${imp}import resumeTemplateMixin from '../mixins/resumeTemplateMixin.js';\n\nexport default {\n  name: '${name}',\n  mixins: [resumeTemplateMixin],${comp}\n  props: {\n    data: {\n      type: Object,\n      required: true,\n    },\n  },\n};\n</script>\n`;
  fs.writeFileSync(path.join(outDir, name + '.vue'), vue);
  const bad = (tpl.match(/\{[^{]/g) || []).length;
  console.log(name, 'left-braces', bad);
}
