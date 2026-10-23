<template>
  <div class="attachment-panel" v-if="files && files.length">
    <div v-for="(f, i) in files" :key="f.id || f.fileId || i" class="attach-row">
      <div class="attach-thumb-wrap" @click="openPreview(f)">
        <el-image
          v-if="isImage(f)"
          :src="fileSrc(f)"
          fit="cover"
          class="attach-thumb"
        />
        <div v-else-if="isPdf(f)" class="attach-icon pdf">
          <i class="el-icon-document"></i>
          <span>PDF</span>
        </div>
        <div v-else class="attach-icon file">
          <i class="el-icon-folder-opened"></i>
        </div>
      </div>

      <div class="attach-meta">
        <div class="attach-name" :title="f.name" @click="openPreview(f)">
          {{ f.name || f.id || '附件' }}
        </div>
        <div class="attach-sub">
          <span v-if="f.size">{{ formatSize(f.size) }}</span>
          <span v-if="f.nodeName"> · {{ f.nodeName }}</span>
          <span v-if="f.uploadedByName"> · {{ f.uploadedByName }}</span>
          <span v-if="f.uploadedAt"> · {{ formatTime(f.uploadedAt) }}</span>
          <el-tag v-if="f.purpose === 'SIGNED'" size="mini" type="success" style="margin-left:4px">已签署</el-tag>
          <el-tag v-else-if="f.purpose === 'EVIDENCE'" size="mini" type="info" style="margin-left:4px">证明材料</el-tag>
        </div>
      </div>

      <div class="attach-actions">
        <el-button
          v-if="isPreviewable(f)"
          type="text"
          size="mini"
          icon="el-icon-view"
          @click="openPreview(f)"
        >查看</el-button>
        <el-button
          type="text"
          size="mini"
          icon="el-icon-download"
          @click="download(f)"
        >下载</el-button>
        <!--
          电子签预留入口：默认隐藏。接入签署 SDK 后设 enableSign=true，
          监听 @sign-request，完成签署后把新文件以 purpose:'SIGNED' 上传并携带到下一步。
        -->
        <el-button
          v-if="enableSign && isPdf(f) && f.purpose !== 'SIGNED'"
          type="text"
          size="mini"
          icon="el-icon-edit-outline"
          @click="requestSign(f)"
        >签署</el-button>
        <el-button
          v-if="removable"
          type="text"
          size="mini"
          style="color:#f56c6c"
          icon="el-icon-delete"
          @click="removeFile(f)"
        >删除</el-button>
      </div>
    </div>

    <!-- PDF / 图片预览弹窗 -->
    <el-dialog
      :visible.sync="previewVisible"
      :title="previewTitle"
      width="80%"
      top="5vh"
      append-to-body
      class="attach-preview-dialog"
      @closed="onPreviewClosed"
    >
      <div v-if="previewFile" class="preview-body">
        <iframe
          v-if="isPdf(previewFile)"
          :src="previewSrc"
          class="preview-iframe"
          frameborder="0"
        />
        <div v-else-if="isImage(previewFile)" class="preview-image-wrap">
          <img :src="previewSrc" :alt="previewFile.name" class="preview-image" />
        </div>
        <div v-else class="preview-fallback">
          <p>该文件类型暂不支持在线预览，请下载后查看。</p>
          <el-button type="primary" size="small" @click="download(previewFile)">下载文件</el-button>
        </div>
      </div>
      <div slot="footer">
        <el-button size="small" @click="previewVisible = false">关闭</el-button>
        <el-button size="small" type="primary" icon="el-icon-download" @click="download(previewFile)">下载</el-button>
        <el-button
          v-if="enableSign && previewFile && isPdf(previewFile) && previewFile.purpose !== 'SIGNED'"
          size="small"
          type="warning"
          icon="el-icon-edit-outline"
          @click="requestSign(previewFile)"
        >在线签署</el-button>
      </div>
    </el-dialog>
  </div>
  <div v-else-if="showEmpty" class="attach-empty">暂无附件</div>
</template>

<script>
import { fileUrl, deleteFile } from '@/api/oa/files'

/**
 * 流程附件面板：列表 + PDF/图片预览 + 下载。
 *
 * 电子签扩展约定（暂不实现，仅预留）：
 * 1. 附件元数据可带 purpose / signStatus / replacesFileId / signedAt / signedBy
 * 2. enableSign=true 时展示「签署」按钮，触发 sign-request 事件
 * 3. 父组件接入 eSign SDK / 合同平台，签署完成后 upload 新 PDF，
 *    以 purpose:'SIGNED'、replacesFileId:原文件id 写入本步骤 attachments，
 *    原文件保留在 attachmentHistory 中便于回溯
 */
export default {
  name: 'AttachmentPanel',
  props: {
    files: { type: Array, default: () => [] },
    showEmpty: { type: Boolean, default: false },
    /** 预留：是否展示电子签入口 */
    enableSign: { type: Boolean, default: false },
    /** 是否展示删除（会调 deleteFile 后 emit remove） */
    removable: { type: Boolean, default: false }
  },
  data() {
    return {
      previewVisible: false,
      previewFile: null
    }
  },
  computed: {
    previewTitle() {
      return (this.previewFile && this.previewFile.name) || '文件预览'
    },
    previewSrc() {
      if (!this.previewFile) return ''
      const base = this.fileSrc(this.previewFile)
      // PDF 加 #toolbar=1 便于浏览器内置查看器
      if (this.isPdf(this.previewFile)) {
        return base + (base.includes('?') ? '&' : '?') + 'preview=1#toolbar=1'
      }
      return base
    }
  },
  methods: {
    fileSrc(f) {
      if (!f) return ''
      return fileUrl(f.url || (f.id ? '/oa/files/' + f.id : ''))
    },
    isImage(f) {
      if (!f) return false
      if (f.isImage === true) return true
      const ct = (f.contentType || '').toLowerCase()
      if (ct.startsWith('image/')) return true
      return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || f.url || '')
    },
    isPdf(f) {
      if (!f) return false
      const ct = (f.contentType || '').toLowerCase()
      if (ct === 'application/pdf') return true
      return /\.pdf$/i.test(f.name || f.url || '')
    },
    isPreviewable(f) {
      return this.isImage(f) || this.isPdf(f)
    },
    openPreview(f) {
      if (!this.isPreviewable(f)) {
        this.download(f)
        return
      }
      this.previewFile = f
      this.previewVisible = true
      this.$emit('preview', f)
    },
    onPreviewClosed() {
      this.previewFile = null
    },
    download(f) {
      if (!f) return
      const url = this.fileSrc(f)
      const a = document.createElement('a')
      a.href = url + (url.includes('?') ? '&' : '?') + 'name=' + encodeURIComponent(f.name || 'file')
      a.target = '_blank'
      a.rel = 'noopener'
      a.download = f.name || ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      this.$emit('download', f)
    },
    requestSign(f) {
      // 预留：父组件 / 签署中间件监听后调起签署组件
      this.$emit('sign-request', {
        file: f,
        // 签署完成后建议调用：callback({ signedFileMeta })
        onSigned: (signedMeta) => {
          this.$emit('signed', { original: f, signed: signedMeta })
        }
      })
    },
    removeFile(f) {
      if (!f) return
      const fileId = f.id || f.fileId
      this.$confirm('确定删除「' + (f.name || fileId || '附件') + '」吗？', '删除附件', {
        type: 'warning',
        confirmButtonText: '删除'
      }).then(async () => {
        try {
          if (fileId) await deleteFile(fileId)
          this.$emit('remove', f)
          this.$message.success('已删除')
        } catch (e) {
          this.$message.error('删除失败: ' + (e.response?.data?.message || e.message))
        }
      }).catch(() => {})
    },
    formatSize(bytes) {
      const n = Number(bytes)
      if (!n || n < 0) return ''
      if (n < 1024) return n + ' B'
      if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
      return (n / (1024 * 1024)).toFixed(1) + ' MB'
    },
    formatTime(t) {
      if (!t) return ''
      try {
        return new Date(t).toLocaleString()
      } catch (e) {
        return String(t)
      }
    }
  }
}
</script>

<style scoped>
.attach-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 6px;
  background: var(--background-2, #fafafa);
  margin-bottom: 8px;
}

.attach-row:last-child {
  margin-bottom: 0;
}

.attach-thumb-wrap {
  cursor: pointer;
  flex-shrink: 0;
}

.attach-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}

.attach-icon {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #fff;
}

.attach-icon.pdf {
  background: #e74c3c;
}

.attach-icon.file {
  background: #909399;
}

.attach-icon i {
  font-size: 18px;
  margin-bottom: 2px;
}

.attach-meta {
  flex: 1;
  min-width: 0;
}

.attach-name {
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attach-name:hover {
  text-decoration: underline;
}

.attach-sub {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attach-actions {
  flex-shrink: 0;
  white-space: nowrap;
}

.attach-empty {
  color: #c0c4cc;
  font-size: 13px;
  padding: 8px 0;
}

.preview-body {
  min-height: 60vh;
}

.preview-iframe {
  width: 100%;
  height: 70vh;
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 4px;
  background: #525659;
}

.preview-image-wrap {
  text-align: center;
  max-height: 70vh;
  overflow: auto;
  background: var(--background-1, #f5f7fa);
  border-radius: 4px;
  padding: 12px;
}

.preview-image {
  max-width: 100%;
  max-height: 68vh;
  object-fit: contain;
}

.preview-fallback {
  text-align: center;
  padding: 48px 16px;
  color: #606266;
}
</style>
