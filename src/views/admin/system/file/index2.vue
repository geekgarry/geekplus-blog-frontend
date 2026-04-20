<template>
  <div class="file-manager-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <!-- 前进/后退按钮 (移动端隐藏) -->
      <div class="nav-buttons hidden-xs-only">
        <el-button
          size="small"
          icon="el-icon-arrow-left"
          circle
          :disabled="historyIndex <= 0"
          @click="goBack"
          title="后退"
        ></el-button>
        <el-button
          size="small"
          icon="el-icon-arrow-right"
          circle
          :disabled="historyIndex >= history.length - 1"
          @click="goForward"
          title="前进"
        ></el-button>
        <el-button
          size="small"
          icon="el-icon-top"
          circle
          :disabled="currentPath === '/'"
          @click="goUp"
          title="返回上一级"
        ></el-button>
      </div>

      <!-- 路径地址栏 -->
      <div class="path-input-container hidden-xs-only">
        <el-input
          size="small"
          v-model="inputPath"
          @keyup.enter.native="jumpToPath"
          placeholder="输入路径并回车跳转，例如: /images/2023"
        >
          <template slot="prepend"><i class="el-icon-folder-opened"></i></template>
        </el-input>
      </div>

      <!-- 面包屑 (移动端显示，PC端作为辅助) -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>
            <a @click="navigateTo('/')"><i class="el-icon-s-home"></i> 根目录</a>
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-for="(folder, index) in breadcrumbs"
            :key="index">
            <a @click="navigateTo(folder.path)">{{ folder.name }}</a>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-upload
          class="upload-btn"
          action="/sys/file-manager/upload"
          :data="{ path: currentPath }"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :headers="uploadHeaders"
        >
          <el-button type="primary" size="small" icon="el-icon-upload" :loading="uploading"><span class="hidden-xs-only">上传</span></el-button>
        </el-upload>
        <el-button size="small" icon="el-icon-refresh" @click="fetchFiles(currentPath, false)"><span class="hidden-xs-only">刷新</span></el-button>
      </div>
    </div>

    <!-- 文件列表表格 -->
    <el-table
      v-loading="loading"
      :data="fileList"
      style="width: 100%"
      height="calc(100vh - 220px)"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      :default-sort="{prop: 'isDirectory', order: 'descending'}">

      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column prop="name" label="名称" sortable="custom" min-width="250">
        <template slot-scope="scope">
          <div class="file-name-cell" @click="handleItemClick(scope.row)">
            <i :class="getFileIcon(scope.row)" :style="{ color: getIconColor(scope.row) }"></i>
            <span class="name-text">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="type" label="类型" sortable="custom" width="140">
        <template slot-scope="scope">
          {{ scope.row.isDirectory ? '文件夹' : (scope.row.type + ' 文件').toUpperCase() }}
        </template>
      </el-table-column>

      <el-table-column prop="size" label="大小" sortable="custom" show-overflow-tooltip width="160">
        <template slot-scope="scope">
          {{ scope.row.isDirectory ? '-' : formatSize(scope.row.size) }}
        </template>
      </el-table-column>

      <el-table-column prop="updateTime" label="修改时间" sortable="custom" show-overflow-tooltip width="180">
        <template slot-scope="scope">
          {{ formatDate(scope.row.updateTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="220" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" icon="el-icon-download" @click="downloadFile(scope.row)">下载</el-button>
          <el-button type="text" size="small" icon="el-icon-edit" @click="openRenameDialog(scope.row)">重命名</el-button>
          <el-button type="text" size="small" icon="el-icon-delete" class="danger-text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 重命名弹窗 -->
    <el-dialog title="重命名" :visible.sync="renameDialogVisible" :close-on-click-modal="false" append-to-body>
      <el-input v-model="newName" placeholder="请输入新名称" @keyup.enter.native="submitRename"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="renameDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRename">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 媒体/文档预览弹窗 -->
    <el-dialog
      :title="previewFileObj ? previewFileObj.name : '预览'"
      :visible.sync="previewDialogVisible"
      width="80%"
      top="5vh"
      custom-class="preview-dialog"
      @close="closePreview"
      append-to-body
    >
      <div class="preview-content" v-loading="previewLoading">
        <!-- 图片预览 -->
        <el-image
          v-if="previewType === 'image'"
          :src="previewUrl"
          fit="contain"
          style="width: 100%; height: 60vh;"
          :preview-src-list="[previewUrl]"
        >
          <div slot="error" class="image-slot">加载失败</div>
        </el-image>

        <!-- 视频预览 -->
        <video
          v-else-if="previewType === 'video'"
          :src="previewUrl"
          controls
          style="width: 100%; max-height: 60vh; outline: none;"
        >
          您的浏览器不支持视频播放。
        </video>

        <!-- 音频预览 -->
        <audio
          v-else-if="previewType === 'audio'"
          :src="previewUrl"
          controls
          style="width: 100%; margin-top: 0;"
        >
          您的浏览器不支持音频播放。
        </audio>

        <!-- PDF/文本预览 (使用 iframe) -->
        <iframe
          v-else-if="previewType === 'document'"
          :src="previewUrl"
          frameborder="0"
          style="width: 100%; height: 65vh;"
        ></iframe>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import axios from 'axios';
import { list_file, delete_file, rename_file, upload_file } from '@/api/system/file-manager';

export default {
  name: 'FileManager',
  props: {
    // 允许父组件传入初始路径
    initialPath: {
      type: String,
      default: '/'
    }
  },
  data() {
    return {
      currentPath: '/',
      inputPath: '/', // 地址栏绑定的值
      fileList: [],
      loading: false,
      uploading: false,

      // 历史记录导航
      history: ['/'],
      historyIndex: 0,

      // 重命名
      renameDialogVisible: false,
      currentRow: null,
      newName: '',

      // 预览相关
      prefixUrl: '/profile', // 预览地址前缀 (如果有)根据后端的文件访问映射路径调整
      previewDialogVisible: false,
      previewFileObj: null,
      previewUrl: '',
      previewType: '', // 'image', 'video', 'audio', 'document'
      previewLoading: false,

      uploadHeaders: {
        // Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    };
  },
  computed: {
    breadcrumbs() {
      if (this.currentPath === '/') return [];
      const parts = this.currentPath.split('/').filter(p => p);
      let pathAcc = '';
      return parts.map(part => {
        pathAcc += '/' + part;
        return { name: part, path: pathAcc };
      });
    }
  },
  created() {
    const initial = this.initialPath.trim() || '/';
    this.fetchFiles(initial, false);
  },
  methods: {
    // 获取文件列表 (pushHistory 决定是否记录到历史栈中)
    async fetchFiles(path, pushHistory = true) {
      // 格式化路径，确保以 / 开头，且不以 / 结尾 (除非是根目录)
      let targetPath = path.trim();
      if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
      if (targetPath.length > 1 && targetPath.endsWith('/')) targetPath = targetPath.slice(0, -1);

      this.loading = true;
      try {
        // const res = await axios.get('/api/file-manager/list', { params: { path: targetPath } });
        const res = await list_file({ path: targetPath });
        if (res.code === 200) {
          this.fileList = res.data;
          this.currentPath = targetPath;
          this.inputPath = targetPath; // 同步更新地址栏
          this.sortFiles('isDirectory', 'descending');

          // 处理历史记录
          if (pushHistory) {
            // 如果在历史中间进行了新的跳转，截断后面的历史
            if (this.historyIndex < this.history.length - 1) {
              this.history = this.history.slice(0, this.historyIndex + 1);
            }
            // 避免连续重复记录
            if (this.history[this.history.length - 1] !== targetPath) {
              this.history.push(targetPath);
              this.historyIndex = this.history.length - 1;
            }
          }
        } else {
          this.$message.error(res.data.msg || '路径不存在或无权限');
          // 如果路径错误，恢复地址栏显示
          this.inputPath = this.currentPath;
        }
      } catch (error) {
        this.$message.error('获取文件列表失败');
        this.inputPath = this.currentPath;
      } finally {
        this.loading = false;
      }
    },

    // ---------------- 导航与地址栏 ----------------
    goBack() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.fetchFiles(this.history[this.historyIndex], false);
      }
    },
    goForward() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.fetchFiles(this.history[this.historyIndex], false);
      }
    },
    goUp() {
      if (this.currentPath === '/') return;
      const parts = this.currentPath.split('/').filter(p => p);
      parts.pop(); // 移除最后一级
      const parentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
      this.navigateTo(parentPath);
    },
    jumpToPath() {
      if (this.inputPath !== this.currentPath) {
        this.navigateTo(this.inputPath);
      }
    },
    navigateTo(path) {
      this.fetchFiles(path, true);
    },

    // ---------------- 批量操作与剪贴板 ----------------
    handleSelectionChange(items) {
      // console.log('当前选中：', this.selectedFiles);
      if (items.length === 0) {
        // 如果没有选中任何文件，不触发事件但传递空数组
        return;
      }
      const selectedWithFullPath = items.map(f => ({ ...f, fullPath: this.prefixUrl + (this.currentPath === '/' ? '' : this.currentPath) + f.path }));
      //console.log('当前选中改变增加全文路径：', selectedWithFullPath);
      this.$emit('select-file', selectedWithFullPath); // 触发一个名为 'select-file' 的事件，返回给引用的父组件并传递数据
    },

    // ---------------- 点击行处理 (预览/下载/进入) ----------------
    handleItemClick(row) {
      if (row.isDirectory) {
        this.navigateTo(row.path);
      } else {
        this.handleFileAction(row);
      }
    },

    handleFileAction(row) {
      const type = row.type ? row.type.toLowerCase() : '';

      // 1. 判断是否为图片
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(type)) {
        this.openPreview(row, 'image');
      }
      // 2. 判断是否为视频
      else if (['mp4', 'webm', 'ogg'].includes(type)) {
        this.openPreview(row, 'video');
      }
      // 3. 判断是否为音频
      else if (['mp3', 'wav', 'ogg', 'flac'].includes(type)) {
        this.openPreview(row, 'audio');
      }
      // 4. 判断是否为文档 (PDF或纯文本)
      else if (['pdf', 'txt', 'json', 'xml', 'md', 'js', 'css', 'html', 'java', 'py'].includes(type)) {
        this.openPreview(row, 'document');
      }
      // 5. 其他类型，直接触发下载
      else {
        this.downloadFile(row);
      }
    },

    // ---------------- 预览与下载逻辑 ----------------
    openPreview(row, previewType) {
      this.previewFileObj = row;
      this.previewType = previewType;
      // 拼接预览地址 (preview=true)
      //this.previewUrl = `/sys/file-manager/download?path=${encodeURIComponent(row.path)}&preview=true`;
      this.previewUrl = `${this.prefixUrl}${row.path}`;
      this.previewDialogVisible = true;
    },
    closePreview() {
      // 关闭弹窗时清空 URL，停止音视频播放
      this.previewUrl = '';
      this.previewFileObj = null;
      this.previewType = '';
    },
    downloadFile(row) {
      const baseUrl = process.env.VUE_APP_BASE_API; // 获取当前站点的基础 URL
      const url = baseUrl+`/sys/file-manager/download?path=${encodeURIComponent(row.path)}&preview=false`;
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', row.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.$message.success(`开始下载: ${row.name}`);
    },

    // ---------------- 上传相关 ----------------
    beforeUpload(file) {
      this.uploading = true;
      return true;
    },
    handleUploadSuccess(res, file) {
      this.uploading = false;
      if (res.code === 200) {
        this.$message.success('上传成功');
        this.fetchFiles(this.currentPath, false);
      } else {
        this.$message.error(res.msg || '上传失败');
      }
    },
    handleUploadError(err, file) {
      this.uploading = false;
      this.$message.error('上传请求异常');
    },

    // ---------------- 排序与操作 ----------------
    handleSortChange({ prop, order }) {
      this.sortFiles(prop, order);
    },
    sortFiles(prop, order) {
      if (!order) return;
      this.fileList.sort((a, b) => {
        let valA = a[prop];
        let valB = b[prop];
        if (prop !== 'isDirectory') {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
        }
        if (valA < valB) return order === 'ascending' ? -1 : 1;
        if (valA > valB) return order === 'ascending' ? 1 : -1;
        return 0;
      });
    },
    handleDelete(row) {
      const typeStr = row.isDirectory ? '文件夹' : '文件';
      this.$confirm(`确定要删除${typeStr} "${row.name}" 吗？`, '警告', { type: 'warning' }).then(async () => {
        //const res = await axios.post(`/api/file-manager/delete?path=${encodeURIComponent(row.path)}`);
        const res = await delete_file({ path: row.path });
        if (res.code === 200) {
          this.$message.success('删除成功');
          this.fetchFiles(this.currentPath, false);
        }
      }).catch(() => {});
    },
    openRenameDialog(row) {
      this.currentRow = row;
      this.newName = row.name;
      this.renameDialogVisible = true;
    },
    async submitRename() {
      if (!this.newName || this.newName === this.currentRow.name) {
        this.renameDialogVisible = false;
        return;
      }
      // const res = await axios.post('/api/file-manager/rename', null, {
      //   params: { path: this.currentRow.path, newName: this.newName }
      // });
      const res = await rename_file({ path: this.currentRow.path, newName: this.newName });
      if (res.code === 200) {
        this.$message.success('重命名成功');
        this.renameDialogVisible = false;
        this.fetchFiles(this.currentPath, false);
      }
    },

    // ---------------- UI 工具方法 ----------------
    getFileIcon(row) {
      if (row.isDirectory) return 'el-icon-folder';
      const type = row.type ? row.type.toLowerCase() : '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) return 'el-icon-picture-outline';
      if (['mp4', 'webm', 'avi', 'mkv'].includes(type)) return 'el-icon-video-camera';
      if (['mp3', 'wav', 'ogg', 'flac'].includes(type)) return 'el-icon-headset';
      if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'md'].includes(type)) return 'el-icon-document';
      if (['zip', 'rar', 'tar', 'gz', '7z'].includes(type)) return 'el-icon-collection';
      return 'el-icon-document';
    },
    getIconColor(row) {
      if (row.isDirectory) return '#E6A23C';
      const type = row.type ? row.type.toLowerCase() : '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) return '#67C23A';
      if (['mp4', 'webm', 'avi'].includes(type)) return '#F56C6C';
      if (['mp3', 'wav', 'ogg'].includes(type)) return '#E6A23C';
      if (['pdf', 'doc', 'docx'].includes(type)) return '#409EFF';
      if (['zip', 'rar', '7z'].includes(type)) return '#909399';
      return '#606266';
    },
    formatSize(size) {
      if (size === 0) return '0 B';
      const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(size) / Math.log(k));
      return (size / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0'), h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}`;
    }
  }
};
</script>

<style scoped>
.file-manager-container {
  padding: 20px;
  /* background: #fff; */
  border-radius: 4px;
}

/* 顶部导航栏样式 */
.nav-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  /* background: #f5f7fa; */
  border-radius: 4px;
  gap: 15px;
}

.nav-buttons {
  display: flex;
  gap: 5px;
}

.path-input-container {
  flex: 1;
  max-width: 400px;
}

.breadcrumb-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-btn {
  display: inline-block;
}

/* 表格内文件名样式 */
.file-name-cell {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.file-name-cell:hover .name-text {
  color: #409EFF;
  text-decoration: underline;
}
.file-name-cell i {
  font-size: 20px;
  margin-right: 10px;
}
.name-text {
  font-size: 14px;
  user-select: none;
}
.danger-text {
  color: #F56C6C;
}

/* 预览弹窗样式 */
.preview-content {
  display: flex;
  justify-content: center;
  /* align-items: center;
  background-color: #f8f9fa; */
  min-height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

/* 响应式隐藏 (Element UI 默认提供 hidden-xs-only 类，如果没有引入 display.css，可以手动添加) */
/* @media only screen and (max-width: 767px) {
  .hidden-xs-only {
    display: none !important;
  }
  .nav-bar {
    flex-wrap: wrap;
  }
  .breadcrumb-container {
    width: 100%;
    margin-bottom: 10px;
  }
} */
</style>
<!-- 如果你没有在全局引入 element-ui 的 display.css，上面的媒体查询会生效 -->
