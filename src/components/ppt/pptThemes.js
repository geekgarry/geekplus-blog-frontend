/**
 * 独立 PPT 工作室常量与主题 / 设置预设（颜色对齐 color.css Token）。
 */
export const PPT_LOCAL_KEY = 'gp_ppt_studio_v1'
export const PPT_SETTINGS_KEY = 'gp_ppt_settings_v1'

/** 设置面板「主题风格」预设：五套配色差异明显，对齐站点莫兰迪体系 */
export const PPT_STYLE_PRESETS = [
  {
    id: 'modern',
    name: '现代',
    // 冷雾青：科技简报、偏冷静专业
    primaryColor: '#5f7d80',
    secondaryColor: '#3d6b6f',
    backgroundColor: '#eef3f4',
    titleColor: '#1a2e32',
    fontColor: '#3d4f52',
  },
  {
    id: 'fresh',
    name: '清新',
    // 草木绿：自然、轻快
    primaryColor: '#4a9b6e',
    secondaryColor: '#7bc89a',
    backgroundColor: '#edf8f1',
    titleColor: '#1a4d32',
    fontColor: '#2d5c42',
  },
  {
    id: 'minimal',
    name: '简约',
    // 黑白灰：极简、高对比
    primaryColor: '#2c2a28',
    secondaryColor: '#9a9590',
    backgroundColor: '#ffffff',
    titleColor: '#111111',
    fontColor: '#5c5a57',
  },
  {
    id: 'dusk',
    name: '暮色',
    // 暖陶赭：夕照、人文叙事
    primaryColor: '#c4785a',
    secondaryColor: '#d9a66b',
    backgroundColor: '#faf0e6',
    titleColor: '#5c3018',
    fontColor: '#6b4f3a',
  },
  {
    id: 'ink',
    name: '墨色',
    // 深墨底 + 青金点缀：夜间阅读
    primaryColor: '#7eb8bc',
    secondaryColor: '#c9b08a',
    backgroundColor: '#1a1816',
    titleColor: '#f5f0ea',
    fontColor: '#b5aea4',
  },
]

export const PPT_FONTS = [
  { id: 'system', name: '系统默认', stack: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif' },
  { id: 'inter', name: 'Inter', stack: 'Inter, "Helvetica Neue", Arial, sans-serif' },
  { id: 'pingfang', name: '苹方 / 微软雅黑', stack: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { id: 'song', name: '宋体阅读', stack: '"Songti SC", "Noto Serif SC", serif' },
  { id: 'mono', name: '等宽', stack: '"SF Mono", Menlo, Consolas, monospace' },
]

export function defaultPptSettings() {
  const p = PPT_STYLE_PRESETS[0]
  return {
    stylePreset: p.id,
    primaryColor: p.primaryColor,
    secondaryColor: p.secondaryColor,
    backgroundColor: p.backgroundColor,
    titleColor: p.titleColor,
    fontColor: p.fontColor,
    fontFamily: 'inter',
    transition: 'fade',
    autoPlayInterval: 5,
    showControls: true,
    showProgress: true,
    showPageNum: true,
  }
}

export function loadPptSettings() {
  try {
    const raw = localStorage.getItem(PPT_SETTINGS_KEY)
    if (!raw) return defaultPptSettings()
    return { ...defaultPptSettings(), ...JSON.parse(raw) }
  } catch (e) {
    return defaultPptSettings()
  }
}

export function savePptSettings(settings) {
  localStorage.setItem(PPT_SETTINGS_KEY, JSON.stringify(settings))
}

export function fontStackById(id) {
  const f = PPT_FONTS.find((x) => x.id === id)
  return (f && f.stack) || 'inherit'
}

export const PPT_THEMES = [
  {
    id: 'mist',
    name: '雾青纸感',
    background: 'linear-gradient(145deg, var(--theme-color) 0%, var(--plus-grey-4) 55%, var(--theme-color-soft) 120%)',
    text: 'var(--white)',
    accent: 'var(--lightYellow)',
    solidBg: '#5f7d80',
    solidText: '#faf9f7',
    solidAccent: '#e8dfd0',
  },
  {
    id: 'paper',
    name: '暖灰纸白',
    background: 'linear-gradient(160deg, var(--background-origin) 0%, var(--background-1) 50%, var(--lightYellow) 100%)',
    text: 'var(--text-color-2)',
    accent: 'var(--theme-color)',
    solidBg: '#fffcf8',
    solidText: '#1f1e1d',
    solidAccent: '#5f7d80',
  },
  {
    id: 'dusk',
    name: '暮色暖陶',
    background: 'linear-gradient(135deg, var(--orangeRed) 0%, var(--red) 55%, var(--plus-grey-4) 120%)',
    text: 'var(--white)',
    accent: 'var(--lightYellow)',
    solidBg: '#c49a7c',
    solidText: '#faf9f7',
    solidAccent: '#e8dfd0',
  },
  {
    id: 'ink',
    name: '墨色阅读',
    background: 'linear-gradient(150deg, var(--black) 0%, var(--plus-grey-4) 60%, var(--theme-color) 130%)',
    text: 'var(--navbarFont)',
    accent: 'var(--theme-color-soft)',
    solidBg: '#2c2a28',
    solidText: '#f0ece6',
    solidAccent: '#8aa0a2',
  },
  {
    id: 'coral',
    name: '浅赤点缀',
    background: 'linear-gradient(140deg, var(--maxLightRed) 0%, var(--orangeRed) 45%, var(--lightYellow) 100%)',
    text: 'var(--black)',
    accent: 'var(--red)',
    solidBg: '#c98b86',
    solidText: '#2c2a28',
    solidAccent: '#b56a6a',
  },
]

export const PPT_TRANSITIONS = [
  { id: 'fade', name: '淡入淡出' },
  { id: 'slide', name: '滑入' },
  { id: 'zoom', name: '缩放' },
  { id: 'none', name: '无' },
]

export const PPT_LAYOUTS = [
  { id: 'title', name: '封面标题' },
  { id: 'bullets', name: '要点列表' },
  { id: 'two-column', name: '双栏' },
  { id: 'quote', name: '金句' },
  { id: 'section', name: '章节页' },
]

export function getThemeById(id) {
  return PPT_THEMES.find((t) => t.id === id) || PPT_THEMES[0]
}

export function getStylePresetById(id) {
  return PPT_STYLE_PRESETS.find((p) => p.id === id) || PPT_STYLE_PRESETS[0]
}

/** 从全局设置提取幻灯片默认色（生成后灌入各页，避免被 theme.solidAccent 盖掉用户配色） */
export function deckColorDefaults(settings) {
  const s = settings || defaultPptSettings()
  return {
    backgroundColor: s.backgroundColor || '',
    textColor: s.fontColor || '',
    accentColor: s.primaryColor || '',
  }
}

/**
 * 拼进 AI prompt：合并「风格要求」输入框与设置面板配色/字体
 * @param {string} extraPrompt 生成来源区用户手输
 * @param {object} settings 设置抽屉
 */
export function buildPptGeneratePrompt(extraPrompt, settings) {
  const set = settings || defaultPptSettings()
  const preset = getStylePresetById(set.stylePreset)
  const parts = []
  if (extraPrompt && String(extraPrompt).trim()) {
    parts.push(String(extraPrompt).trim())
  }
  parts.push(
    `视觉风格「${preset.name}」；背景${set.backgroundColor}；标题色${set.titleColor}；正文${set.fontColor}；主色${set.primaryColor}；辅助色${set.secondaryColor}`
  )
  return parts.join('；')
}
