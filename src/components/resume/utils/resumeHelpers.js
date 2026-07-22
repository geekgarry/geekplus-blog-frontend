/**
 * @param {string} [skills]
 * @returns {string[]}
 */
export function parseSkillTagList(skills) {
  return (skills || '')
    .split(/[,，、;；\n|/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {import('../types').EducationItem[]} education
 * @returns {string}
 */
export function eduDegreeFromEducation(education) {
  const list = education || [];
  const found = list.find((e) => !e.isHidden);
  return found ? found.degree : '';
}

/**
 * @param {import('../types').EducationItem[]} education
 * @returns {string}
 */
export function highestDegreeFromEducation(education) {
  const list = education || [];
  const visible = list.filter((e) => !e.isHidden);
  return visible[0]?.degree || '';
}
