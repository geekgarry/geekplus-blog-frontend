import { getDownloadUrl } from "@/api/system/file-manager";

/** 文件管理列表行 → 可回填的访问地址 */
export function fileUrlFromRow(row) {
  if (!row) return "";
  if (row.url) return row.url;
  const p = row.path || row.fullPath || "";
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const base = process.env.VUE_APP_BASE_API || "";
  return `${base}${getDownloadUrl(p, true)}`;
}
