// mixin for lazy loading highlight.js and v-viewer
export default {
  async mounted() {
    // Check if directives are already registered
    if (!this.$options.directives || !this.$options.directives.highlight) {
      try {
        const hljs = await import('highlight.js');
        const hljsInstance = hljs.default;
        import('highlight.js/styles/monokai-sublime.css');

        // Import language modules
        const javascript = (await import("highlight.js/lib/languages/javascript")).default;
        const java = (await import("highlight.js/lib/languages/java")).default;
        const sql = (await import("highlight.js/lib/languages/sql")).default;
        const xml = (await import("highlight.js/lib/languages/xml")).default;
        const html = (await import("highlight.js/lib/languages/vbscript-html")).default;
        const json = (await import("highlight.js/lib/languages/json")).default;
        const yaml = (await import("highlight.js/lib/languages/yaml")).default;

        // Register languages
        hljsInstance.registerLanguage("javascript", javascript);
        hljsInstance.registerLanguage("java", java);
        hljsInstance.registerLanguage("yaml", yaml);
        hljsInstance.registerLanguage("json", json);
        hljsInstance.registerLanguage("sql", sql);
        hljsInstance.registerLanguage("xml", xml);
        hljsInstance.registerLanguage("html", html);

        hljsInstance.initHighlightingOnLoad();

        function highlightCodeAndShowLineNumbers(el, binding) {
          let blocks = el.querySelectorAll("pre");
          if (blocks) {
            blocks.forEach(block => {
              if (block.querySelector("code") && !block.querySelector("code ol")) {
                if (block.classList) {
                  block.classList.add("hljs");
                } else {
                  block.className += ' ' + "hljs";
                }
                var tempBlock = block.querySelector("code");
                hljsInstance.highlightBlock(tempBlock);
                if (binding) {
                  tempBlock.innerHTML = `<ol><li class="line">${tempBlock.innerHTML.replace(
                    /\n/g,
                    `</li><li class="line">`
                  )}</li></ol>`;
                }
              } else if (!block.querySelector("ol")) {
                hljsInstance.highlightBlock(block);
                if (binding) {
                  block.innerHTML = `<ol><li class="line">${block.innerHTML.replace(
                    /\n/g,
                    `</li><li class="line">`
                  )}</li></ol>`;
                }
              }
            });
          }
        }

        // Register directive locally
        this.$options.directives = this.$options.directives || {};
        this.$options.directives.highlight = {
          inserted(el, binding) {
            highlightCodeAndShowLineNumbers(el, binding);
          },
          bind(el, binding) {
            highlightCodeAndShowLineNumbers(el, binding);
          },
          update(el, binding) {
            highlightCodeAndShowLineNumbers(el, binding);
          },
          componentUpdated(el, binding) {
            highlightCodeAndShowLineNumbers(el, binding);
          }
        };
      } catch (error) {
        console.error('Failed to load highlight.js:', error);
      }
    }

    // Load v-viewer
    if (!this.$options.directives || !this.$options.directives.viewer) {
      try {
        const vViewer = await import('v-viewer');
        // const VueViewer = vViewer.default;
        const viewerDirective = vViewer.directive;
        await import('viewerjs/dist/viewer.css');

        // Register directive locally
        this.$options.directives = this.$options.directives || {};
        this.$options.directives.viewer = viewerDirective({
          defaultOptions: {
            toolbar: {
              zoomIn: 0,
              zoomOut: 0,
              oneToOne: 1,
              reset: 1,
              prev: { show: 1 },
              play: 1,
              next: { show: 1 },
              rotateLeft: 0,
              rotateRight: 0,
              flipHorizontal: 0,
              flipVertical: 0,
            },
            zoomRatio: 0.3
          }
        });
      } catch (error) {
        console.error('Failed to load v-viewer:', error);
      }
    }
  }
};
