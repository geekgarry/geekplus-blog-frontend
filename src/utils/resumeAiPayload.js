/**
 * 简历 AI 响应统一解包 / JSON 解析 / 合并，消除 FormEditor、Analysis、PPT、Editor 四处复制。
 */

import { createResumeId } from '@/components/resume/export/idUtils'
import { createEmptyResumeData } from '@/components/resume/types'

/** 从 Result / 裸字符串中取出业务载荷 */
export function extractAiPayload(res) {
  if (res == null) return null
  if (typeof res === 'string') return res
  if (typeof res.data === 'string' || (typeof res.data === 'object' && res.data !== null)) {
    return res.data
  }
  if (typeof res.msg === 'string' && res.code === 200) {
    return res.msg
  }
  return res
}

/**
 * 解析 AI 返回的 JSON 文本：去 ```json 围栏，必要时截取首尾花括号。
 * @returns {object|null}
 */
export function parseAiJson(text) {
  if (typeof text !== 'string') {
    return text && typeof text === 'object' ? text : null
  }
  let trimmed = text.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('```')) {
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object') return parsed
  } catch (err) {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start !== -1 && end > start) {
      try {
        const parsed = JSON.parse(trimmed.slice(start, end + 1))
        if (parsed && typeof parsed === 'object') return parsed
      } catch (innerErr) {
        /* ignore */
      }
    }
  }
  return null
}

export function normalizeListItems(list) {
  if (!Array.isArray(list)) return list
  return list.map((item) => ({
    ...item,
    id: item.id || createResumeId(),
    isHidden: !!item.isHidden,
  }))
}

/** 将 AI 生成结果深合并进当前简历（含列表 id 规范化） */
export function mergeResumeData(current, generated) {
  const base = current || createEmptyResumeData()
  if (!generated || typeof generated !== 'object') {
    return base
  }
  const merged = {
    ...base,
    ...generated,
    basics: {
      ...base.basics,
      ...(generated.basics || {}),
    },
    jobIntention: {
      ...(base.jobIntention || createEmptyResumeData().jobIntention),
      ...(generated.jobIntention || {}),
    },
    skills: generated.skills != null ? generated.skills : base.skills,
    hobbies: generated.hobbies != null ? generated.hobbies : base.hobbies,
  }
  if (generated.education) merged.education = normalizeListItems(generated.education)
  if (generated.work) merged.work = normalizeListItems(generated.work)
  if (generated.projects) merged.projects = normalizeListItems(generated.projects)
  if (generated.awards) merged.awards = normalizeListItems(generated.awards)
  if (generated.certifications) {
    merged.certifications = normalizeListItems(generated.certifications)
  }
  if (generated.portfolio) merged.portfolio = normalizeListItems(generated.portfolio)
  return merged
}

/** extract + parse 一步到位（常用于 generate 接口） */
export function unwrapAiJson(res) {
  const payload = extractAiPayload(res)
  if (payload == null || payload === '') return null
  if (typeof payload === 'object') return payload
  return parseAiJson(payload)
}
