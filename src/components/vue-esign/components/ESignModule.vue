<template>
  <div class="esign-page" style="overscroll-behavior: contain">
    <div class="esign-page__card">
      <header class="esign-page__header">
        <div class="esign-page__header-inner">
          <span class="esign-page__logo">✍</span>
          <div>
            <h1 class="esign-page__title">在线电子签名</h1>
            <p class="esign-page__subtitle">
              多签名连续签署 · 可拖动缩放位置 · 导入 PDF/图片
            </p>
          </div>
        </div>
      </header>

      <div class="esign-page__body">
        <SignaturePad
          :key="padKey"
          root-class="esign-page__pad"
          @change="upsertCurrentSignature"
        />

        <aside class="esign-side">
          <div class="esign-side__block">
            <div class="esign-side__row" style="margin-bottom: 8px">
              <h3 class="esign-side__h" style="margin: 0">当前签名</h3>
              <button
                type="button"
                class="esign-btn esign-btn--primary"
                style="margin-top: 0; padding: 4px 8px"
                @click="startNextSignature"
              >
                ＋ 签下一个
              </button>
            </div>
            <div class="esign-side__preview">
              <img
                v-if="activeImage"
                :src="activeImage"
                alt="签名预览"
                class="esign-side__preview-img"
              />
              <span v-else class="esign-muted">暂无签名</span>
            </div>
            <button
              type="button"
              class="esign-btn esign-btn--block"
              :disabled="!activeImage"
              @click="downloadSignatureImage"
            >
              仅下载当前签名图片
            </button>
          </div>

          <div v-if="signatureRecords.length" class="esign-side__block">
            <div class="esign-side__row">
              <h3 class="esign-side__h">签名记录</h3>
              <span class="esign-muted">{{ signatureRecords.length }} 个（刷新后清空）</span>
            </div>
            <ul class="esign-sig-list">
              <li
                v-for="r in signatureRecords"
                :key="r.id"
                class="esign-sig-list__item"
                :class="{ 'esign-sig-list__item--on': activeSignatureId === r.id }"
                @click="selectSignatureRecord(r.id)"
              >
                <img :src="r.image" alt="" class="esign-sig-list__thumb" />
                <input
                  class="esign-input"
                  style="padding: 4px 6px; font-size: 12px"
                  :value="r.name"
                  @click.stop
                  @input="renameSignatureRecord(r.id, $event.target.value)"
                />
                <button
                  type="button"
                  class="esign-link-danger"
                  @click.stop="removeSignatureRecord(r.id)"
                >
                  ✕
                </button>
              </li>
            </ul>
          </div>

          <div class="esign-side__block">
            <h3 class="esign-side__h">导入待签文档</h3>
            <input
              ref="fileInput"
              type="file"
              accept="application/pdf,.pdf,image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp"
              class="esign-hidden"
              @change="handleFileUpload"
            />
            <button
              type="button"
              class="esign-btn esign-btn--dark esign-btn--block"
              :disabled="loading"
              @click="$refs.fileInput.click()"
            >
              ⬆ 上传 PDF / 图片
            </button>
            <div class="esign-side__url-row">
              <input
                v-model="urlInput"
                type="url"
                class="esign-input"
                placeholder="在线 PDF / 图片链接"
              />
              <button
                type="button"
                class="esign-btn esign-btn--sky"
                :disabled="loading"
                title="加载在线文档"
                @click="handleLoadFromUrl"
              >
                🔗
              </button>
            </div>
            <button
              v-if="hasDocument"
              type="button"
              class="esign-btn esign-btn--danger esign-btn--block"
              :disabled="loading"
              @click="clearDocument"
            >
              清空文档
            </button>
          </div>

          <div v-if="statusMsg" class="esign-status">
            <span v-if="loading" class="esign-spin">⟳</span>
            <span>{{ statusMsg }}</span>
          </div>

          <div v-if="hasDocument" class="esign-side__block esign-side__block--border">
            <div class="esign-side__row">
              <h3 class="esign-side__h">签名位置</h3>
              <span class="esign-muted">共 {{ placements.length }} 处</span>
            </div>
            <div class="esign-side__chips">
              <button
                type="button"
                class="esign-chip"
                :class="{ 'esign-chip--on': manualMode }"
                @click="enableManualMode"
              >
                手动选点
              </button>
              <button
                v-if="manualMode"
                type="button"
                class="esign-chip"
                @click="cancelManualMode"
              >
                取消选点
              </button>
              <button
                type="button"
                class="esign-chip"
                :disabled="detectedSlots.length === 0"
                @click="applyAutoSlots"
              >
                应用识别结果 ({{ detectedSlots.length }})
              </button>
              <button type="button" class="esign-chip" @click="clearPlacements">
                清空位置
              </button>
            </div>
            <p v-if="manualMode" class="esign-tip">
              手动模式：点击预览放置；已放置签名可拖动，右下角可缩放；可点「取消选点」。
            </p>
            <ul v-if="placements.length" class="esign-place-list">
              <li
                v-for="p in placements"
                :key="p.id"
                class="esign-place-list__item"
                :class="{ 'esign-place-list__item--on': selectedPlacementId === p.id }"
                @click="selectPlacement(p)"
              >
                <span>
                  第 {{ p.pageIndex + 1 }} 页 · {{ signatureName(p.signatureId) }} ·
                  {{ p.source === 'auto' ? '自动' : '手动' }}
                </span>
                <button
                  type="button"
                  class="esign-link-danger"
                  @click.stop="removePlacement(p.id)"
                >
                  ✕
                </button>
              </li>
            </ul>
          </div>

          <div class="esign-side__footer">
            <button
              type="button"
              class="esign-btn esign-btn--success esign-btn--lg esign-btn--block"
              :disabled="!canDownload"
              @click="downloadSignedPdf"
            >
              {{ exporting ? '导出中…' : '⬇ 下载已签署 PDF' }}
            </button>
          </div>
        </aside>
      </div>

      <div v-if="hasDocument" class="esign-doc">
        <div class="esign-doc__bar">
          <div class="esign-doc__name">{{ pdfFileName }}</div>
          <div class="esign-doc__pager">
            <button
              type="button"
              class="esign-btn esign-btn--icon"
              :disabled="currentPage <= 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              ‹
            </button>
            <span class="esign-muted">{{ currentPage }} / {{ pageCount }}</span>
            <button
              type="button"
              class="esign-btn esign-btn--icon"
              :disabled="currentPage >= pageCount"
              @click="currentPage = Math.min(pageCount, currentPage + 1)"
            >
              ›
            </button>
            <button
              type="button"
              class="esign-btn esign-btn--icon"
              title="刷新预览"
              @click="refreshPage"
            >
              ↻
            </button>
          </div>
        </div>

        <div
          ref="previewBox"
          class="esign-doc__preview"
          :class="{ 'esign-doc__preview--manual': manualMode }"
          :style="previewAspectStyle"
          @click="handlePreviewClick"
        >
          <img
            :src="pageImageUrl"
            :alt="'第 ' + currentPage + ' 页'"
            class="esign-doc__page-img"
            draggable="false"
          />
          <div
            v-for="p in currentPagePlacements"
            :key="p.id"
            class="esign-doc__sig"
            :class="{ 'esign-doc__sig--selected': selectedPlacementId === p.id }"
            :style="{
              left: p.x * 100 + '%',
              top: p.y * 100 + '%',
              width: p.width * 100 + '%',
              height: p.height * 100 + '%'
            }"
            @click.stop
            @pointerdown="onPlacementPointerDown($event, p, 'move')"
          >
            <img :src="p.image" alt="" class="esign-doc__sig-img" draggable="false" />
            <span
              v-if="selectedPlacementId === p.id"
              class="esign-doc__resize"
              @pointerdown.stop="onPlacementPointerDown($event, p, 'resize')"
            />
          </div>
        </div>
        <p class="esign-doc__hint">点击签名可选中；拖动移动位置，右下角拖动调整大小</p>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ESignModule.vue — 多签名 / 取消选点 / 拖动缩放（Vue2 Options API，可升 Vue3）
 */
import SignaturePad from './SignaturePad.vue'
import {
  ensurePdfWorker,
  imageBytesToPdf,
  detectSignatureSlots,
  guessNameFromUrl,
  renderPdfPageToDataUrl,
  buildSignedPdfBlob,
  pdfjsLib,
  IMAGE_EXT,
  PDF_EXT,
  DEFAULT_SIG_W,
  DEFAULT_SIG_H,
  readFileAsArrayBuffer
} from '../utils/esignPdf.js'

var MIN_SIG_W = 0.06
var MIN_SIG_H = 0.03

function uid(prefix) {
  return (
    prefix +
    '_' +
    Date.now() +
    '_' +
    Math.random()
      .toString(36)
      .slice(2, 7)
  )
}

export default {
  name: 'ESignModule',
  components: { SignaturePad: SignaturePad },
  props: {
    pdfWorkerUrl: { type: String, default: '' }
  },
  data: function () {
    return {
      signatureImage: null,
      signatureRecords: [],
      activeSignatureId: null,
      padKey: 0,
      pdfBytes: null,
      pdfFileName: 'document.pdf',
      pdfDoc: null,
      pageCount: 0,
      currentPage: 1,
      pageImageUrl: null,
      pageSize: { width: 0, height: 0 },
      urlInput: '',
      loading: false,
      statusMsg: '',
      placements: [],
      selectedPlacementId: null,
      manualMode: false,
      detectedSlots: [],
      exporting: false,
      _drag: null
    }
  },
  computed: {
    hasDocument: function () {
      return !!(this.pdfBytes && this.pageImageUrl)
    },
    activeImage: function () {
      if (this.signatureImage) return this.signatureImage
      var rec = this.signatureRecords.filter(function (r) {
        return r.id === this.activeSignatureId
      }, this)[0]
      return rec ? rec.image : null
    },
    canDownload: function () {
      return !!(this.pdfBytes && this.placements.length && !this.exporting)
    },
    currentPagePlacements: function () {
      var page = this.currentPage - 1
      return this.placements.filter(function (p) {
        return p.pageIndex === page
      })
    },
    previewAspectStyle: function () {
      if (this.pageSize.width && this.pageSize.height) {
        return {
          aspectRatio: this.pageSize.width + ' / ' + this.pageSize.height
        }
      }
      return { aspectRatio: '210 / 297' }
    }
  },
  watch: {
    currentPage: function () {
      if (this.pdfDoc) this.refreshPage()
    }
  },
  mounted: function () {
    var self = this
    this._onMove = function (e) {
      self.onGlobalPointerMove(e)
    }
    this._onUp = function () {
      self._drag = null
    }
    window.addEventListener('pointermove', this._onMove)
    window.addEventListener('pointerup', this._onUp)
  },
  beforeDestroy: function () {
    window.removeEventListener('pointermove', this._onMove)
    window.removeEventListener('pointerup', this._onUp)
  },
  beforeUnmount: function () {
    window.removeEventListener('pointermove', this._onMove)
    window.removeEventListener('pointerup', this._onUp)
  },
  methods: {
    signatureName: function (id) {
      var rec = this.signatureRecords.filter(function (r) {
        return r.id === id
      })[0]
      return rec ? rec.name : '签名'
    },
    upsertCurrentSignature: function (url) {
      this.signatureImage = url
      if (!url) return
      var aid = this.activeSignatureId
      if (aid) {
        var updated = false
        this.signatureRecords = this.signatureRecords.map(function (r) {
          if (r.id !== aid) return r
          updated = true
          return Object.assign({}, r, { image: url })
        })
        if (updated) return
      }
      var id = uid('sig')
      this.activeSignatureId = id
      this.signatureRecords = this.signatureRecords.concat([
        { id: id, image: url, name: '签名' + (this.signatureRecords.length + 1) }
      ])
    },
    startNextSignature: function () {
      this.statusMsg = '已保存当前签名。请书写下一个名字，完成后手动选点放置。'
      this.activeSignatureId = null
      this.signatureImage = null
      this.padKey += 1
    },
    selectSignatureRecord: function (id) {
      var rec = this.signatureRecords.filter(function (r) {
        return r.id === id
      })[0]
      if (!rec) return
      this.activeSignatureId = id
      this.signatureImage = rec.image
      this.statusMsg = '已选用「' + rec.name + '」，可手动选点放置到文档。'
    },
    removeSignatureRecord: function (id) {
      this.signatureRecords = this.signatureRecords.filter(function (r) {
        return r.id !== id
      })
      this.placements = this.placements.filter(function (p) {
        return p.signatureId !== id
      })
      if (this.activeSignatureId === id) {
        this.activeSignatureId = null
        this.signatureImage = null
        this.padKey += 1
      }
    },
    renameSignatureRecord: function (id, name) {
      this.signatureRecords = this.signatureRecords.map(function (r) {
        if (r.id !== id) return r
        return Object.assign({}, r, { name: name || r.name })
      })
    },
    downloadSignatureImage: function () {
      var img = this.activeImage
      if (!img) return
      var link = document.createElement('a')
      link.download = 'signature_' + Date.now() + '.png'
      link.href = img
      link.click()
    },
    refreshPage: function () {
      var self = this
      if (!this.pdfDoc) return
      renderPdfPageToDataUrl(this.pdfDoc, this.currentPage, 1.5)
        .then(function (res) {
          self.pageSize = { width: res.width, height: res.height }
          self.pageImageUrl = res.dataUrl
        })
        .catch(function (err) {
          console.error(err)
        })
    },
    loadPdfFromBytes: function (bytes, fileName) {
      var self = this
      this.loading = true
      this.statusMsg = '正在加载文档…'
      return ensurePdfWorker(this.pdfWorkerUrl || undefined)
        .then(function () {
          var copyForPdfJs = bytes.slice(0)
          var copyForDetect = bytes.slice(0)
          return pdfjsLib.getDocument({ data: copyForPdfJs }).promise.then(function (doc) {
            self.pdfBytes = bytes
            self.pdfFileName = fileName
            self.pdfDoc = doc
            self.pageCount = doc.numPages
            self.currentPage = 1
            self.placements = []
            self.selectedPlacementId = null
            self.manualMode = false
            return renderPdfPageToDataUrl(doc, 1, 1.5).then(function (res) {
              self.pageSize = { width: res.width, height: res.height }
              self.pageImageUrl = res.dataUrl
              self.statusMsg = '正在识别签名位置…'
              return detectSignatureSlots(
                copyForDetect,
                self.pdfWorkerUrl || undefined
              ).then(function (slots) {
                self.detectedSlots = slots
                if (slots.length > 0) {
                  self.currentPage = slots[0].pageIndex + 1
                  self.statusMsg =
                    '已识别到 ' +
                    slots.length +
                    ' 处签名位置。请先完成签名，再点「应用识别结果」或手动选点。'
                } else {
                  self.statusMsg = '未识别到签名位置，请完成签名后开启手动选点。'
                }
              })
            })
          })
        })
        .catch(function (err) {
          console.error(err)
          self.statusMsg = (err && err.message) || '文档加载失败'
          alert('文档加载失败，请确认文件格式正确（PDF / 图片）。')
        })
        .then(function () {
          self.loading = false
        })
    },
    loadImageAsPdf: function (bytes, fileName, mime) {
      var self = this
      this.loading = true
      this.statusMsg = '正在转换图片为可签署文档…'
      return imageBytesToPdf(bytes, fileName, mime)
        .then(function (pdfUint8) {
          var pdfName = fileName.replace(IMAGE_EXT, '') + '.pdf'
          var ab = pdfUint8.buffer.slice(
            pdfUint8.byteOffset,
            pdfUint8.byteOffset + pdfUint8.byteLength
          )
          return self.loadPdfFromBytes(ab, pdfName)
        })
        .catch(function (err) {
          console.error(err)
          self.loading = false
          self.statusMsg = ''
          alert('图片处理失败：' + ((err && err.message) || '未知错误'))
        })
    },
    handleFileUpload: function (e) {
      var self = this
      var file = e.target.files && e.target.files[0]
      if (!file) return
      var name = file.name
      var type = file.type || ''
      ;(file.arrayBuffer ? file.arrayBuffer() : readFileAsArrayBuffer(file)).then(
        function (bytes) {
          if (type === 'application/pdf' || PDF_EXT.test(name)) {
            return self.loadPdfFromBytes(bytes, name)
          }
          if (type.indexOf('image/') === 0 || IMAGE_EXT.test(name)) {
            return self.loadImageAsPdf(bytes, name, type)
          }
          alert('暂支持 PDF、PNG、JPG、WEBP、GIF 等图片文档')
        }
      )
      e.target.value = ''
    },
    handleLoadFromUrl: function () {
      var self = this
      var url = (this.urlInput || '').trim()
      if (!url) {
        alert('请输入在线文档地址（PDF 或图片）')
        return
      }
      this.loading = true
      this.statusMsg = '正在从网络加载文档…'
      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('请求失败：' + res.status)
          var contentType = res.headers.get('content-type') || ''
          return res.arrayBuffer().then(function (bytes) {
            return { bytes: bytes, contentType: contentType }
          })
        })
        .then(function (pack) {
          var name = guessNameFromUrl(url)
          var contentType = pack.contentType
          var bytes = pack.bytes
          if (
            contentType.indexOf('pdf') >= 0 ||
            PDF_EXT.test(name) ||
            (contentType.indexOf('application/octet-stream') >= 0 && PDF_EXT.test(url))
          ) {
            return self.loadPdfFromBytes(bytes, PDF_EXT.test(name) ? name : name + '.pdf')
          }
          if (
            contentType.indexOf('image/') === 0 ||
            IMAGE_EXT.test(name) ||
            IMAGE_EXT.test(url)
          ) {
            return self.loadImageAsPdf(bytes, name, contentType)
          }
          return self
            .loadPdfFromBytes(bytes, PDF_EXT.test(name) ? name : name + '.pdf')
            .catch(function () {
              return self.loadImageAsPdf(bytes, name, contentType)
            })
        })
        .catch(function (err) {
          console.error(err)
          self.statusMsg = ''
          self.loading = false
          alert(
            '在线文档加载失败：' +
              ((err && err.message) || '未知错误') +
              '。请确认地址可访问且允许跨域，或改为本地上传。'
          )
        })
    },
    enableManualMode: function () {
      if (!this.activeImage || !this.activeSignatureId) {
        alert('请先完成电子签名')
        return
      }
      this.manualMode = true
      this.statusMsg = '手动选点已开启：点击预览放置；可点「取消选点」退出。'
    },
    cancelManualMode: function () {
      this.manualMode = false
      this.statusMsg = '已取消手动选点。'
    },
    handlePreviewClick: function (e) {
      if (!this.manualMode || !this.$refs.previewBox || this._drag) return
      if (!this.activeImage || !this.activeSignatureId) {
        alert('请先完成电子签名')
        return
      }
      var rect = this.$refs.previewBox.getBoundingClientRect()
      var relX = (e.clientX - rect.left) / rect.width
      var relY = (e.clientY - rect.top) / rect.height
      var placement = {
        id: uid('place'),
        signatureId: this.activeSignatureId,
        image: this.activeImage,
        pageIndex: this.currentPage - 1,
        x: Math.max(0, Math.min(relX - DEFAULT_SIG_W / 2, 1 - DEFAULT_SIG_W)),
        y: Math.max(0, Math.min(relY - DEFAULT_SIG_H / 2, 1 - DEFAULT_SIG_H)),
        width: DEFAULT_SIG_W,
        height: DEFAULT_SIG_H,
        source: 'manual'
      }
      this.placements = this.placements.concat([placement])
      this.selectedPlacementId = placement.id
      this.statusMsg =
        '已放置签名。可拖动/缩放调整；也可点「签下一个」继续签不同名字。'
    },
    selectPlacement: function (p) {
      this.selectedPlacementId = p.id
      this.currentPage = p.pageIndex + 1
    },
    removePlacement: function (id) {
      this.placements = this.placements.filter(function (p) {
        return p.id !== id
      })
      if (this.selectedPlacementId === id) this.selectedPlacementId = null
    },
    clearPlacements: function () {
      this.placements = []
      this.selectedPlacementId = null
      this.statusMsg = '已清空签名位置。'
    },
    clearDocument: function () {
      this.pdfBytes = null
      this.pdfDoc = null
      this.pdfFileName = 'document.pdf'
      this.pageCount = 0
      this.currentPage = 1
      this.pageImageUrl = null
      this.pageSize = { width: 0, height: 0 }
      this.placements = []
      this.selectedPlacementId = null
      this.detectedSlots = []
      this.manualMode = false
      this.urlInput = ''
      this.statusMsg = '已清空文档，可重新导入。'
      if (this.$refs.fileInput) this.$refs.fileInput.value = ''
    },
    applyAutoSlots: function () {
      if (!this.activeImage || !this.activeSignatureId) {
        alert('请先完成电子签名，再应用识别结果')
        return
      }
      if (!this.detectedSlots.length) {
        this.manualMode = true
        this.statusMsg = '没有可应用的自动识别结果，请手动选择位置。'
        return
      }
      var sigId = this.activeSignatureId
      var img = this.activeImage
      var next = this.detectedSlots.map(function (s) {
        return {
          id: uid('place'),
          signatureId: sigId,
          image: img,
          pageIndex: s.pageIndex,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          source: 'auto'
        }
      })
      this.placements = this.placements.concat(next)
      this.manualMode = false
      this.statusMsg = '已应用 ' + next.length + ' 处识别位置，可拖动调整。'
    },
    onPlacementPointerDown: function (e, p, type) {
      e.preventDefault()
      e.stopPropagation()
      this.selectedPlacementId = p.id
      this.manualMode = false
      this._drag = {
        type: type,
        id: p.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: p.x,
        origY: p.y,
        origW: p.width,
        origH: p.height
      }
      if (e.target && e.target.setPointerCapture) {
        try {
          e.target.setPointerCapture(e.pointerId)
        } catch (err) {}
      }
    },
    onGlobalPointerMove: function (e) {
      var drag = this._drag
      var box = this.$refs.previewBox
      if (!drag || !box) return
      var rect = box.getBoundingClientRect()
      var dx = (e.clientX - drag.startX) / rect.width
      var dy = (e.clientY - drag.startY) / rect.height
      this.placements = this.placements.map(function (p) {
        if (p.id !== drag.id) return p
        if (drag.type === 'move') {
          return Object.assign({}, p, {
            x: Math.max(0, Math.min(drag.origX + dx, 1 - p.width)),
            y: Math.max(0, Math.min(drag.origY + dy, 1 - p.height))
          })
        }
        return Object.assign({}, p, {
          width: Math.max(MIN_SIG_W, Math.min(drag.origW + dx, 1 - drag.origX)),
          height: Math.max(MIN_SIG_H, Math.min(drag.origH + dy, 1 - drag.origY))
        })
      })
    },
    downloadSignedPdf: function () {
      var self = this
      if (!this.pdfBytes) {
        alert('请先导入文档')
        return
      }
      if (!this.placements.length) {
        alert('请先指定至少一个签名位置')
        return
      }
      this.exporting = true
      buildSignedPdfBlob(this.pdfBytes, this.placements)
        .then(function (blob) {
          var link = document.createElement('a')
          var baseName = self.pdfFileName.replace(/\.pdf$/i, '')
          link.download = baseName + '_signed.pdf'
          link.href = URL.createObjectURL(blob)
          link.click()
          URL.revokeObjectURL(link.href)
          self.statusMsg = '已签署文档已下载。'
        })
        .catch(function (err) {
          console.error(err)
          alert('导出失败：' + ((err && err.message) || '未知错误'))
        })
        .then(function () {
          self.exporting = false
        })
    }
  }
}
</script>

<style src="../styles/esign.css"></style>
