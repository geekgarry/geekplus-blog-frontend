import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

function getPrintElement() {
  const container =
    document.getElementById('resume-print-area') ||
    document.getElementById('preview-container');
  if (!container) return null;
  return container.firstElementChild || container;
}

async function prepareElementForCapture(element) {
  const originalScrollX = window.scrollX;
  const originalScrollY = window.scrollY;
  window.scrollTo(0, 0);

  const parentNodes = [];
  let currentNode = element.parentElement;
  while (currentNode && currentNode !== document.body) {
    parentNodes.push({
      el: currentNode,
      overflow: currentNode.style.overflow,
    });
    currentNode.style.overflow = 'visible';
    currentNode = currentNode.parentElement;
  }

  const originalStyles = {
    overflow: element.style.overflow,
    width: element.style.width,
    minWidth: element.style.minWidth,
    maxWidth: element.style.maxWidth,
    height: element.style.height,
    maxHeight: element.style.maxHeight,
    transform: element.style.transform,
    backgroundColor: element.style.backgroundColor,
  };

  const computedBackground = window.getComputedStyle(element).backgroundColor;
  if (computedBackground && computedBackground !== 'rgba(0, 0, 0, 0)') {
    element.style.backgroundColor = computedBackground;
  } else {
    element.style.backgroundColor = '#ffffff';
  }

  element.style.overflow = 'visible';
  element.style.width = '800px';
  element.style.minWidth = '800px';
  element.style.maxWidth = '800px';
  element.style.height = 'max-content';
  element.style.maxHeight = 'none';
  element.style.transform = 'none';

  const images = element.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) return resolve();
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 1000);
        })
    )
  );

  const targetHeight = element.scrollHeight;

  return {
    targetHeight,
    restore() {
      Object.assign(element.style, originalStyles);
      parentNodes.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
      window.scrollTo(originalScrollX, originalScrollY);
    },
  };
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Desktop: browser print dialog, only the resume preview area (#resume-print-area).
 */
export function printResumeArea() {
  const area = document.getElementById('resume-print-area');
  if (!area) throw new Error('找不到简历预览区域');

  document.body.classList.add('resume-printing');

  const cleanup = () => {
    document.body.classList.remove('resume-printing');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);

  // Fallback cleanup if afterprint is not fired (some browsers)
  setTimeout(cleanup, 60 * 1000);

  window.print();
}

/**
 * Mobile PDF: html-to-image + worker (paginated / single long page).
 * @param {'single'|'paginated'} mode
 * @param {string} fileName
 */
export async function exportIntelligentPDF(mode = 'paginated', fileName) {
  const element = getPrintElement();
  if (!element) throw new Error('找不到简历预览区域');

  const { targetHeight, restore } = await prepareElementForCapture(element);

  try {
    const canvas = await htmlToImage.toCanvas(element, {
      pixelRatio: 3,
      backgroundColor: element.style.backgroundColor || '#ffffff',
      width: 800,
      height: targetHeight,
      style: {
        transform: 'none',
        width: '800px',
        height: `${targetHeight}px`,
        maxHeight: 'none',
        overflow: 'visible',
      },
    });

    restore();

    const imgData = canvas.toDataURL('image/png');
    const name = fileName || `简历-${Date.now()}.pdf`;

    const worker = new Worker(
      new URL('./pdfWorker.js', import.meta.url)
    );

    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        if (e.data.status === 'success') {
          downloadBlob(e.data.blob, e.data.fileName);
          worker.terminate();
          resolve();
        } else {
          worker.terminate();
          reject(new Error(e.data.error || '导出 PDF 失败'));
        }
      };
      worker.onerror = (err) => {
        worker.terminate();
        reject(err);
      };
      worker.postMessage({
        imgData,
        pdfWidth: 210,
        pdfHeight: 297,
        marginY: 10,
        isPaginated: mode === 'paginated',
        fileName: name,
      });
    });
  } catch (err) {
    restore();
    // Fallback without OffscreenCanvas worker
    return exportPdfMainThreadFallback(mode, fileName);
  }
}

/** Main-thread fallback when Worker / OffscreenCanvas unavailable */
export async function exportPdfMainThreadFallback(mode = 'paginated', fileName) {
  const element = getPrintElement();
  if (!element) throw new Error('找不到简历预览区域');

  const { targetHeight, restore } = await prepareElementForCapture(element);
  try {
    const canvas = await htmlToImage.toCanvas(element, {
      pixelRatio: 2,
      backgroundColor: element.style.backgroundColor || '#ffffff',
      width: 800,
      height: targetHeight,
    });
    restore();

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = 210;
    const name = fileName || `简历-${Date.now()}.pdf`;

    if (mode === 'single') {
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, Math.max(pdfHeight, 297)],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(name);
      return;
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pdfTotalHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = pdfTotalHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfTotalHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfTotalHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(name);
  } catch (e) {
    restore();
    throw e;
  }
}

/**
 * 把 CSS 里的相对 url(...) 转成绝对地址，避免导出后 file:// 打不开字体/背景图
 */
function absolutizeCssUrls(cssText, baseHref) {
  if (!cssText || !baseHref) return cssText || '';
  return cssText.replace(
    /url\(\s*(['"]?)(?!data:|https?:|blob:|\/\/)([^)'"]+)\1\s*\)/gi,
    (match, quote, rawUrl) => {
      try {
        const abs = new URL(rawUrl.trim(), baseHref).href;
        const q = quote || '"';
        return `url(${q}${abs}${q})`;
      } catch (e) {
        return match;
      }
    }
  );
}

/**
 * 收集当前页全部样式并内联为 <style>。
 * 旧实现里 link 用 fetch 却未 await，导出 HTML/Word 几乎没有外链 CSS（Tailwind 等），
 * 打开后版式错乱；Word 也无法加载页面上的相对路径样式表。
 */
async function collectPageStyles() {
  const cssChunks = [];
  const seen = new Set();
  const handledHrefs = new Set();

  const pushCss = (cssText, baseHref) => {
    const normalized = absolutizeCssUrls((cssText || '').trim(), baseHref);
    if (!normalized || seen.has(normalized)) return;
    // 用长度+头尾做轻量去重，避免超大字符串全量 Set 占内存
    const sig =
      normalized.length +
      ':' +
      normalized.slice(0, 64) +
      ':' +
      normalized.slice(-64);
    if (seen.has(sig)) return;
    seen.add(sig);
    seen.add(normalized);
    cssChunks.push(normalized);
  };

  // 只走 styleSheets：已包含页面上的 <style> 与同域 <link>
  for (const sheet of Array.from(document.styleSheets)) {
    const href = sheet.href || (typeof location !== 'undefined' ? location.href : '');
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (!rules) continue;
      let cssText = '';
      for (let i = 0; i < rules.length; i++) {
        cssText += rules[i].cssText + '\n';
      }
      pushCss(cssText, href);
      if (sheet.href) handledHrefs.add(sheet.href);
    } catch (e) {
      // 跨域样式表读不到 cssRules，改为 fetch 文本再内联
      if (sheet.href && !handledHrefs.has(sheet.href)) {
        handledHrefs.add(sheet.href);
        try {
          const res = await fetch(sheet.href, { credentials: 'same-origin' });
          if (res.ok) pushCss(await res.text(), sheet.href);
        } catch (err) {
          console.warn('[resume-export] 无法内联样式表:', sheet.href, err);
        }
      }
    }
  }

  // 兜底：极少数环境 styleSheets 为空时，直接读 <style> / 拉取 <link>
  if (cssChunks.length === 0) {
    document.querySelectorAll('style').forEach((el) => {
      pushCss(el.textContent || '', typeof location !== 'undefined' ? location.href : '');
    });
    for (const link of Array.from(document.querySelectorAll('link[rel="stylesheet"]'))) {
      const href = link.href;
      if (!href || handledHrefs.has(href)) continue;
      handledHrefs.add(href);
      try {
        const res = await fetch(href, { credentials: 'same-origin' });
        if (res.ok) pushCss(await res.text(), href);
      } catch (e) {
        console.warn('[resume-export] 无法拉取样式:', href);
      }
    }
  }

  // 导出文档专用：保证预览区基础排版（不依赖页面上的 print 媒体查询）
  pushCss(
    `
#resume-print-area-wrapper, #resume-print-area, .resume-export-root {
  box-sizing: border-box;
}
#resume-print-area-wrapper *, #resume-print-area *, .resume-export-root * {
  box-sizing: border-box;
}
#resume-print-area img, .resume-export-root img { max-width: 100%; }
`.trim(),
    typeof location !== 'undefined' ? location.href : ''
  );

  return cssChunks.map((css) => `<style type="text/css">\n${css}\n</style>`).join('\n');
}

/** 克隆预览节点，并把图片转成 data URL，保证离线打开可用 */
async function cloneResumeElementWithInlineImages() {
  const container = document.getElementById('resume-print-area');
  if (!container) throw new Error('找不到简历预览区域');

  // 包一层与页面一致的 id，便于套用 #resume-print-area 相关选择器
  const wrapper = document.createElement('div');
  wrapper.id = 'resume-print-area';
  wrapper.className = 'resume-export-root w-full';
  const inner = (container.firstElementChild || container).cloneNode(true);
  wrapper.appendChild(inner);

  const images = wrapper.querySelectorAll('img');
  for (const img of Array.from(images)) {
    try {
      const src = img.getAttribute('src') || img.src;
      if (!src || src.startsWith('data:')) continue;
      const res = await fetch(src, { credentials: 'same-origin' });
      const blob = await res.blob();
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      img.setAttribute('src', base64);
      img.src = base64;
    } catch (e) {
      // 保留原 src
    }
  }

  return wrapper;
}

/**
 * 生成带完整内联样式的独立 HTML（HTML 下载 / Word 共用）
 * @param {'html'|'word'} mode
 */
async function buildStandaloneHtml(resumeName, mode = 'html') {
  const [styles, element] = await Promise.all([
    collectPageStyles(),
    cloneResumeElementWithInlineImages(),
  ]);

  const title = resumeName || '简历';

  if (mode === 'word') {
    // Word 打开 HTML 形 .doc：必须全部内联 <style>，外链无效
    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word"
 xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta charset="UTF-8">
<title>${title}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
${styles}
<style type="text/css">
  /* Word 对 flex/grid 支持差，尽量给根节点固定宽度 */
  body { margin: 0; padding: 0; font-family: "Microsoft YaHei", SimSun, Arial, sans-serif; }
  #resume-print-area { width: 800px; max-width: 800px; margin: 0 auto; background: #fff; }
  img { max-width: 100%; }
</style>
</head>
<body>
${element.outerHTML}
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - resume</title>
${styles}
<style type="text/css">
  body {
    background-color: #525659;
    display: flex;
    justify-content: center;
    padding: 40px 0;
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  #resume-print-area-wrapper {
    background-color: white;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    overflow: hidden;
    width: 800px;
    min-height: 1131px;
    margin: 0 auto;
  }
</style>
</head>
<body>
<div id="resume-print-area-wrapper">
  ${element.outerHTML}
</div>
</body>
</html>`;
}

export async function exportHTML(resumeName) {
  const htmlContent = await buildStandaloneHtml(resumeName, 'html');
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${resumeName || '简历'}-${Date.now()}.html`);
  return htmlContent;
}

/**
 * Word 下载：HTML 包装为 .doc（application/msword），样式必须全部内联。
 */
export async function exportWordDoc(resumeName) {
  const htmlContent = await buildStandaloneHtml(resumeName, 'word');
  // 带 BOM，降低 Word 打开中文乱码概率
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  saveAs(blob, `${resumeName || '简历'}-resume.doc`);
}

export { createResumeId } from './idUtils';
