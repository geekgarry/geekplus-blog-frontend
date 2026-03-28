import Vue from 'vue'
import Clipboard from 'clipboard'

function clipboardSuccess() {
  Vue.prototype.$message({
    message: 'Copy successfully',
    type: 'success',
    duration: 1500
  })
}

function clipboardError() {
  Vue.prototype.$message({
    message: 'Copy failed',
    type: 'error'
  })
}

export default function handleClipboard(text, event) {
  const clipboard = new Clipboard(event.target, {
    text: () => text
  })
  clipboard.on('success', () => {
    clipboardSuccess()
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    clipboardError()
    clipboard.destroy()
  })
  clipboard.onClick(event)
}

// 兼容非安全域的剪贴板复制函数
export function copyToClipboard(text) {
  // 安全域下使用现代API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      // console.log('复制成功（现代API）');
    }).catch(err => {
      // console.error('复制失败:', err);
      fallbackCopy(text); // 降级方案
    });
  } else {
    fallbackCopy(text); // 直接使用降级方案
  }
}

// 降级方案：使用document.execCommand
export function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const success = document.execCommand('copy');
    // console.log(success ? '复制成功（降级方案）' : '复制失败');
  } catch (err) {
    // console.error('降级方案复制失败:', err);
  } finally {
    document.body.removeChild(textarea);
  }
}
