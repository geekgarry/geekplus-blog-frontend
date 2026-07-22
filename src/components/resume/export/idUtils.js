/** Tiny id helper — keep out of exportUtils to avoid pulling jspdf/html-to-image into form editor. */
export function createResumeId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
