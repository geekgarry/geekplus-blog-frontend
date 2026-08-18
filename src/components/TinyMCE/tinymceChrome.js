/**
 * TinyMCE 皮肤 / 表情包配置（使用 public 原有资源，不新增精简包文件）
 */
export const TINYMCE_SKIN_OPTIONS = [
  { id: "oxide", label: "浅色 Oxide", skin: "oxide", content: "default" },
  { id: "oxide-dark", label: "深色 Oxide", skin: "oxide-dark", content: "dark" },
  { id: "tinymce-5", label: "TinyMCE 5", skin: "tinymce-5", content: "tinymce-5" },
  { id: "tinymce-5-dark", label: "TinyMCE 5 深色", skin: "tinymce-5-dark", content: "tinymce-5-dark" },
  { id: "document", label: "文档风", skin: "oxide", content: "document" },
  { id: "writer", label: "写作风", skin: "oxide", content: "writer" },
];

export const TINYMCE_EMOJI_OPTIONS = [
  {
    id: "min",
    label: "表情（压缩版）",
    url: "/tinymce/plugins/emoticons/js/emojis.min.js",
  },
  {
    id: "full",
    label: "表情（源文件）",
    url: "/tinymce/plugins/emoticons/js/emojis.js",
  },
];

const SKIN_KEY = "tinymce-skin-id";
const EMOJI_KEY = "tinymce-emoji-pack";

export function loadSkinId() {
  try {
    const id = localStorage.getItem(SKIN_KEY);
    if (id && TINYMCE_SKIN_OPTIONS.some((o) => o.id === id)) return id;
  } catch (e) { /* ignore */ }
  return "oxide";
}

export function loadEmojiPackId() {
  try {
    const id = localStorage.getItem(EMOJI_KEY);
    // 兼容曾用过的 lite，回退到压缩版
    if (id === "lite" || id === "full-min") return "min";
    if (id && TINYMCE_EMOJI_OPTIONS.some((o) => o.id === id)) return id;
  } catch (e) { /* ignore */ }
  return "min";
}

export function saveSkinId(id) {
  try { localStorage.setItem(SKIN_KEY, id); } catch (e) { /* ignore */ }
}

export function saveEmojiPackId(id) {
  try { localStorage.setItem(EMOJI_KEY, id); } catch (e) { /* ignore */ }
}

export function resolveSkin(id) {
  return TINYMCE_SKIN_OPTIONS.find((o) => o.id === id) || TINYMCE_SKIN_OPTIONS[0];
}

export function resolveEmoji(id) {
  return TINYMCE_EMOJI_OPTIONS.find((o) => o.id === id) || TINYMCE_EMOJI_OPTIONS[0];
}

export function skinUrls(id) {
  const s = resolveSkin(id);
  return {
    skin_url: "/tinymce/skins/ui/" + s.skin,
    content_css: "/tinymce/skins/content/" + s.content + "/content.css",
  };
}

export function emojiDatabaseUrl(id) {
  return resolveEmoji(id).url;
}
