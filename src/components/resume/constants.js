/**
 * 简历工具常量：会话/本地缓存键、上传限制。
 * Analysis / PPT / Editor 共用，避免魔法字符串漂移。
 */
export const RESUME_ANALYSIS_SESSION_KEY = 'resume_last_analysis_v1'
/** @deprecated PPT 已独立；兼容旧本地键，新键见 ppt/pptThemes.js PPT_LOCAL_KEY */
export const RESUME_PPT_LOCAL_KEY = 'resume_ppt_local_v1'
export const RESUME_EDITOR_CACHE_KEY = 'resume_editor_cache_v2'

export const RESUME_UPLOAD_MAX_BYTES = 10 * 1024 * 1024

export const RESUME_UPLOAD_ACCEPT =
  '.pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*'

export const RESUME_UPLOAD_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
]
