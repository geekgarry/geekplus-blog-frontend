/**
 * IE11 CSS 变量兜底（css-vars-ponyfill）
 * 现代浏览器 onlyLegacy 下几乎不做事。
 */
function isIe() {
  if (typeof navigator === "undefined") return false;
  var ua = navigator.userAgent || "";
  return ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
}

function refreshCssVars() {
  if (typeof window === "undefined" || typeof window.__gpCssVars !== "function") return;
  try {
    window.__gpCssVars();
  } catch (e) {
    /* ignore */
  }
}

function observeThemeDom(run) {
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;
  var timer = null;
  var schedule = function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      run();
    }, 50);
  };
  try {
    if (document.documentElement) {
      new MutationObserver(schedule).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["style", "class", "data-theme"],
      });
    }
    var startBody = function () {
      if (!document.body) return;
      new MutationObserver(schedule).observe(document.body, {
        attributes: true,
        attributeFilter: ["theme-mode", "style", "class"],
      });
    };
    if (document.body) startBody();
    else document.addEventListener("DOMContentLoaded", startBody);
  } catch (e) {
    /* ignore */
  }
}

export function initCssVarsPonyfill() {
  if (typeof window === "undefined") return;
  window.__gpRefreshCssVars = refreshCssVars;

  // 现代浏览器不必加载；仅 IE 需要
  if (!isIe()) return;

  return import("css-vars-ponyfill").then(function (mod) {
    var cssVars = mod && (mod.default || mod);
    if (typeof cssVars !== "function") return;

    var run = function () {
      cssVars({
        onlyLegacy: true,
        watch: true,
        variables: window.__gpBootTheme
          ? {
              "theme-color": window.__gpBootTheme.themeColor,
              "gp-boot-bg": window.__gpBootTheme.bg,
            }
          : undefined,
      });
    };

    window.__gpCssVars = run;
    run();
    observeThemeDom(run);
  });
}

export { isIe, refreshCssVars };
