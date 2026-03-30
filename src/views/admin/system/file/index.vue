<template>
  <div class="file-manager-container">
    <!-- 顶部导航与搜索栏 -->
    <div class="nav-bar">
      <div class="nav-buttons hidden-xs-only">
        <el-button size="small" icon="el-icon-arrow-left" circle :disabled="historyIndex <= 0" @click="goBack" title="后退"></el-button>
        <el-button size="small" icon="el-icon-arrow-right" circle :disabled="historyIndex >= history.length - 1" @click="goForward" title="前进"></el-button>
        <el-button size="small" icon="el-icon-top" circle :disabled="currentPath === '/'" @click="goUp" title="返回上一级"></el-button>
      </div>

      <div class="path-input-container hidden-xs-only">
        <el-input size="small" v-model="inputPath" @keyup.enter.native="jumpToPath" placeholder="输入路径并回车跳转">
          <template slot="prepend"><i class="el-icon-folder-opened"></i></template>
        </el-input>
      </div>

      <div class="search-container">
        <el-input size="small" v-model="searchKeyword" placeholder="搜索当前目录..." @keyup.enter.native="handleSearch" clearable @clear="fetchFiles(currentPath)">
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <div class="toolbar">
      <div class="breadcrumb-container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item><a @click="navigateTo('/')"><i class="el-icon-s-home"></i> 根目录</a></el-breadcrumb-item>
          <el-breadcrumb-item v-for="(folder, index) in breadcrumbs" :key="index">
            <a @click="navigateTo(folder.path)">{{ folder.name }}</a>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="actions">
        <el-button v-if="clipboard.length > 0" type="warning" size="small" icon="el-icon-document-checked" @click="handlePaste">
          粘贴 ({{ clipboard.length }})
        </el-button>

        <template v-if="selectedFiles.length > 0">
          <el-button size="small" circle icon="el-icon-document-copy" @click="handleCopy" title="复制"></el-button>
          <el-button size="small" circle icon="el-icon-scissors" @click="handleCut" title="剪切"></el-button>
          <el-button size="small" circle icon="el-icon-box" @click="openCompressDialog" title="压缩"></el-button>
          <el-button type="danger" size="small" circle icon="el-icon-delete" @click="openDeleteDialog" title="删除"></el-button>
        </template>

        <!-- 新增：新建下拉菜单 -->
        <el-dropdown @command="handleCreateCommand" style="margin-right: 10px;">
          <el-button type="success" size="small">
            新建 <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="folder" icon="el-icon-folder-add">新建文件夹</el-dropdown-item>
            <el-dropdown-item command="file" icon="el-icon-document-add">新建文件</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-upload
          ref="uploadRef"
          class="upload-btn"
          action="#"
          :show-file-list="false"
          :multiple="true"
          :on-success="handleUploadSuccess"
          :on-error="handleError"
          :limit="1"
          :on-exceed="handleExceed"
          :before-upload="beforeUpload"
        >
          <el-button type="primary" size="small" circle icon="el-icon-upload" :loading="uploading" title="上传"></el-button>
        </el-upload>

        <!-- 新增：回收站按钮 -->
        <el-button type="info" size="small" icon="el-icon-delete-solid" @click="openRecycleBin">回收站</el-button>
        <el-button size="small" circle icon="el-icon-refresh" @click="fetchFiles(currentPath, false)" title="刷新"></el-button>
      </div>
    </div>

    <!-- 文件列表表格 -->
    <el-table
      v-loading="loading"
      :data="fileList"
      style="width: 100%"
      height="calc(100vh - 260px)"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      :default-sort="{prop: 'isDirectory', order: 'descending'}">

      <el-table-column type="selection" width="55" align="center"></el-table-column>

      <el-table-column prop="name" label="名称" sortable="custom" min-width="250" show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="file-name-cell">
            <i :class="getFileIcon(scope.row)" :style="{ color: getIconColor(scope.row) }"></i>
            <el-button size="mini" v-show="!scope.row.isDirectory" icon="el-icon-document-copy" class="i-btn" circle @click="handleCopyPath(scope.row)" title="复制"></el-button>
            <span class="name-text" @click="handleItemClick(scope.row)">{{ scope.row.name }}</span>
            <el-tag v-if="isSearchMode" size="mini" type="info" style="margin-left: 10px">{{ scope.row.path }}</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="type" label="类型" sortable="custom" width="125" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.isDirectory ? '文件夹' : (scope.row.type + ' 文件').toUpperCase() }}</template>
      </el-table-column>

      <el-table-column prop="size" label="大小" sortable="custom" width="135" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.isDirectory ? '-' : formatSize(scope.row.size) }}</template>
      </el-table-column>

      <el-table-column prop="updateTime" label="修改时间" sortable="custom" width="160" show-overflow-tooltip>
        <template slot-scope="scope">{{ formatDate(scope.row.updateTime) }}</template>
      </el-table-column>

      <el-table-column label="操作" min-width="165">
        <template slot-scope="scope">
          <!-- <el-button type="text" size="small" icon="el-icon-delete" class="danger-text" @click="handleDelete(scope.row)">删除</el-button> -->
          <el-button type="text" size="small" icon="el-icon-edit" @click="openRenameDialog(scope.row)">重命名</el-button>
          <el-button type="text" size="small" icon="el-icon-download" v-if="!scope.row.isDirectory" @click="downloadFile(scope.row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      :page-sizes="[20, 50, 100, 200]"
      @pagination="fetchFiles(currentPath, false)"
    />

    <!-- 回收站弹窗 -->
    <el-dialog title="回收站" :visible.sync="recycleDialogVisible" width="600px" top="5vh" append-to-body>
      <div style="margin-bottom: 15px; display: flex; gap: 10px;">
        <el-button type="success" size="small" icon="el-icon-refresh-left" :disabled="selectedRecycleFiles.length === 0" @click="restoreRecycleBatch">还原选中</el-button>
        <el-button type="danger" size="small" icon="el-icon-delete" :disabled="selectedRecycleFiles.length === 0" @click="hardDeleteRecycleBatch">彻底删除选中</el-button>
      </div>

      <el-table
        :data="recycleList"
        v-loading="recycleLoading"
        @selection-change="handleRecycleSelectionChange"
        height="55vh"
        style="width: 100%">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="originalName" label="原文件名" min-width="200">
          <template slot-scope="scope">
            <i :class="getFileIcon(scope.row)" :style="{ color: getIconColor(scope.row), marginRight: '8px' }"></i>
            {{ scope.row.originalName }}
          </template>
        </el-table-column>
        <el-table-column prop="originalPath" label="原路径" min-width="250" show-overflow-tooltip></el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template slot-scope="scope">{{ scope.row.isDirectory ? '-' : formatSize(scope.row.size) }}</template>
        </el-table-column>
        <el-table-column prop="deleteTime" label="删除时间" width="160" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatDate(scope.row.deleteTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="restoreRecycle([scope.row.recycleName])">还原</el-button>
            <el-button type="text" size="small" v-if="!scope.row.isDirectory" @click="downloadRecycle(scope.row)">下载</el-button>
            <el-button type="text" size="small" class="danger-text" @click="hardDeleteRecycle([scope.row.recycleName])">彻底删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog title="确认删除" :visible.sync="deleteDialogVisible" width="400px" append-to-body>
      <div style="margin-bottom: 20px;">
        <i class="el-icon-warning" style="color: #E6A23C; font-size: 24px; vertical-align: middle; margin-right: 10px;"></i>
        <span style="vertical-align: middle;">确定要删除选中的 {{ selectedFiles.length }} 项吗？</span>
      </div>
      <el-checkbox v-model="hardDelete">彻底删除 (不放入回收站)</el-checkbox>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="submitDelete" :loading="actionLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 压缩确认弹窗 -->
    <el-dialog title="压缩文件" :visible.sync="compressDialogVisible" width="400px" append-to-body>
      <el-input v-model="zipName" placeholder="请输入压缩包名称 (如: archive.zip)">
        <template slot="append">.zip</template>
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="compressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCompress" :loading="actionLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 重命名弹窗 -->
    <el-dialog title="重命名" :visible.sync="renameDialogVisible" width="400px" append-to-body>
      <el-input v-model="newName" placeholder="请输入新的名称" @keyup.enter.native="submitRename"></el-input>
      <!-- <el-checkbox v-model="renameForm.isDirectory">这是一个文件夹</el-checkbox> -->
      <!-- 这里不需要用户选择是文件还是文件夹，直接根据 currentRow.isDirectory 来判断即可 -->
      <!-- <span style="margin-left: 10px; color: #888;">(当前是 {{ currentRow && currentRow.isDirectory ? '文件夹' : '文件' }})</span> -->
      <!-- 也可以在输入框下方显示当前类型提示 -->
      <div style="margin-top: 10px; color: #888;" v-if="currentRow">
        当前类型是 {{ currentRow.isDirectory ? '文件夹' : '文件' }}
      </div>
      <!-- 这里不需要用户选择是文件还是文件夹，直接根据 currentRow.isDirectory 来判断即可 -->
      <span slot="footer">
        <el-button @click="renameDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRename">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog :title="previewFileObj ? previewFileObj.name : '预览'" :visible.sync="previewDialogVisible" top="5vh" @close="closePreview" append-to-body>
      <div class="preview-content" v-loading="previewLoading">
        <el-image v-if="previewType === 'image'" :src="previewUrl" fit="contain" style="width: 100%; height: 60vh;" :preview-src-list="[previewUrl]"></el-image>
        <video v-else-if="previewType === 'video'" :src="previewUrl" controls style="width: 100%; max-height: 60vh;"></video>
        <audio v-else-if="previewType === 'audio'" :src="previewUrl" controls style="width: 100%; margin-top: 0px;"></audio>
        <iframe v-else-if="previewType === 'document'" :src="previewUrl" frameborder="0" style="width: 100%; height: 65vh;"></iframe>
      </div>
    </el-dialog>

    <!-- 在最底部（其他 dialog 旁边）新增：新建文件/文件夹弹窗 -->
    <el-dialog
      :title="createForm.isFolder ? '新建文件夹' : '新建文件'"
      :visible.sync="createDialogVisible"
      width="400px"
      append-to-body
    >
      <el-input
        v-model="createForm.name"
        :placeholder="createForm.isFolder ? '请输入文件夹名称' : '请输入文件名称 (如: index.html)'"
        @keyup.enter.native="submitCreate"
        ref="createInput"
      ></el-input>
      <span slot="footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCreate" :loading="actionLoading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import axios from 'axios';
import { list_file, search_file, delete_batch_file, delete_file, rename_file, upload_file, create_file, copy_file, move_file, compress_file, list_recycle_file, restore_recycle_file, delete_recycle_file } from '@/api/system/file-manager';
import { copyToClipboard } from '@/utils/clipboard';

export default {
  name: 'FileManager',
  props: {
    // 可选：允许父组件传入初始路径
    initialPath: {
      type: String,
      default: '/'
    }
  },
  data() {
    return {
      currentPath: '/',
      inputPath: '/',
      searchKeyword: '',
      isSearchMode: false,
      fileList: [],
      loading: false,
      uploading: false,
      actionLoading: false,

      history: ['/'],
      historyIndex: 0,

      // 批量操作与剪贴板
      selectedFiles: [],
      clipboard: [],
      clipboardAction: '',

      // 回收站相关
      recycleDialogVisible: false,
      recycleList: [],
      recycleLoading: false,
      selectedRecycleFiles: [],

      // 弹窗控制
      deleteDialogVisible: false,
      hardDelete: false,
      compressDialogVisible: false,
      zipName: 'archive',
      renameDialogVisible: false,
      currentRow: null,
      newName: '',
      // 预览相关
      prefixUrl: '/profile', // 预览地址前缀 (如果有)根据后端的文件访问映射路径调整
      previewDialogVisible: false,
      previewFileObj: null,
      previewUrl: '',
      previewType: '',
      previewLoading: false,
      base_url: process.env.VUE_APP_BASE_API,

      // 新建功能相关状态
      createDialogVisible: false,
      createForm: {
        name: '',
        isFolder: true
      },

      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 100
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
    // ---------------- 基础列表与搜索 ----------------
    async fetchFiles(path, pushHistory = true) {
      this.isSearchMode = false;
      this.searchKeyword = '';
      let targetPath = path.trim();
      if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
      if (targetPath.length > 1 && targetPath.endsWith('/')) targetPath = targetPath.slice(0, -1);

      this.loading = true;
      try {
        // const res = await axios.get('/xxx/xxx', { params: { path: targetPath } });
        this.queryParams.path = targetPath;
        const res = await list_file(this.queryParams);
        if (res.code === 200) {
          this.total = res.total || 0;
          this.fileList = res.data;
          this.currentPath = targetPath;
          this.inputPath = targetPath;
          this.sortFiles('isDirectory', 'descending');

          if (pushHistory) {
            if (this.historyIndex < this.history.length - 1) this.history = this.history.slice(0, this.historyIndex + 1);
            if (this.history[this.history.length - 1] !== targetPath) {
              this.history.push(targetPath);
              this.historyIndex = this.history.length - 1;
            }
          }
        }
      } finally {
        this.loading = false;
      }
    },
    async handleSearch() {
      if (!this.searchKeyword.trim()) return this.fetchFiles(this.currentPath, false);
      this.loading = true;
      this.isSearchMode = true;
      this.queryParams.path = this.currentPath;
      this.queryParams.keyword = this.searchKeyword.trim();
      try {
        const res = await search_file(this.queryParams);
        if (res.code === 200) this.fileList = res.data;
      } finally {
        this.loading = false;
      }
    },

    // ---------------- 回收站功能 ----------------
    async openRecycleBin() {
      this.recycleDialogVisible = true;
      this.fetchRecycleList();
    },
    async fetchRecycleList() {
      this.recycleLoading = true;
      try {
        const res = await list_recycle_file();
        if (res.code === 200) this.recycleList = res.data;
      } finally {
        this.recycleLoading = false;
      }
    },
    handleRecycleSelectionChange(val) {
      this.selectedRecycleFiles = val;
    },
    restoreRecycleBatch() {
      const names = this.selectedRecycleFiles.map(f => f.recycleName);
      this.restoreRecycle(names);
    },
    async restoreRecycle(names) {
      try {
        //const res = await axios.post('/api/file/recycle/restore', names);
        const res = await restore_recycle_file(names);
        if (res.code === 200) {
          this.$message.success('还原成功');
          this.fetchRecycleList();
          this.fetchFiles(this.currentPath, false); // 刷新主列表
        } else {
          this.$message.error(res.msg);
        }
      } catch (error) {
        this.$message.error('还原请求失败');
      }
    },
    //直接删除耽搁文件夹/文件，不放入回收站
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
    hardDeleteRecycleBatch() {
      this.$confirm('确定要彻底删除选中的文件吗？此操作不可恢复！', '警告', { type: 'warning' }).then(() => {
        const names = this.selectedRecycleFiles.map(f => f.recycleName);
        this.hardDeleteRecycle(names);
      }).catch(() => {});
    },
    async hardDeleteRecycle(names) {
      try {
        const res = await delete_recycle_file(names);

        if (res.code === 200) {
          this.$message.success('彻底删除成功');
          this.fetchRecycleList();
        } else {
          this.$message.error(res.msg);
        }
      } catch (error) {
        this.$message.error('删除请求失败');
      }
    },
    downloadRecycle(row) {
      const baseUrl = this.base_url; // 获取当前站点的基础 URL
      const url = baseUrl + `/sys/file-manager/recycle/download?recycleName=${encodeURIComponent(row.recycleName)}`;
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', row.originalName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    handleCopyPath(row) {
      const fullPath = this.prefixUrl + row.path;
      copyToClipboard(fullPath);
    },
    // ---------------- 批量操作与剪贴板 ----------------
    handleSelectionChange(val) {
      this.selectedFiles = val;
      // console.log('当前选中：', this.selectedFiles);
      if (this.selectedFiles.length === 0) {
        // 如果没有选中任何文件，不触发事件但传递空数组
        return;
      }
      const selectedWithFullPath = this.selectedFiles.map(f => ({ ...f, fullPath: this.prefixUrl + (this.currentPath === '/' ? '' : this.currentPath) + f.path }));
      //console.log('当前选中改变增加全文路径：', selectedWithFullPath);
      this.$emit('select-file', selectedWithFullPath); // 触发一个名为 'select-file' 的事件，返回给引用的父组件并传递数据
    },
    handleCopy() {
      this.clipboard = this.selectedFiles.map(f => f.path);
      this.clipboardAction = 'copy';
      this.$message.success(`已复制 ${this.clipboard.length} 项，请前往目标文件夹点击粘贴`);
      this.$refs.multipleTable.clearSelection();
    },
    handleCut() {
      this.clipboard = this.selectedFiles.map(f => f.path);
      this.clipboardAction = 'move';
      this.$message.success(`已剪切 ${this.clipboard.length} 项，请前往目标文件夹点击粘贴`);
      this.$refs.multipleTable.clearSelection();
    },
    async handlePaste() {
      if (this.clipboard.length === 0) return;
      this.loading = true;
      const isCopy = this.clipboardAction === 'copy';
      try {
        const res = isCopy ? await copy_file({ paths: this.clipboard, destPath: this.currentPath }) : await move_file({ paths: this.clipboard, destPath: this.currentPath });
        if (res.code === 200) {
          this.$message.success('粘贴成功');
          if (this.clipboardAction === 'move') this.clipboard = [];
          this.fetchFiles(this.currentPath, false);
        } else {
          this.$message.error(res.msg);
        }
      } finally {
        this.loading = false;
      }
    },

    // ---------------- 删除与压缩 ----------------
    openDeleteDialog() { this.hardDelete = false; this.deleteDialogVisible = true; },
    async submitDelete() {
      this.actionLoading = true;
      try {
        const paths = this.selectedFiles.map(f => f.path);
        const res = await delete_batch_file({ paths: paths, hardDelete: this.hardDelete });
        if (res.code === 200) {
          this.$message.success('删除成功');
          this.deleteDialogVisible = false;
          this.fetchFiles(this.currentPath, false);
        }
      } finally {
        this.actionLoading = false;
      }
    },
    openCompressDialog() { this.zipName = 'archive'; this.compressDialogVisible = true; },
    async submitCompress() {
      if (!this.zipName) return this.$message.warning('请输入压缩包名称');
      this.actionLoading = true;
      try {
        const paths = this.selectedFiles.map(f => f.path);
        const res = await compress_file({ paths: paths, destPath: this.currentPath, zipName: this.zipName });
        if (res.code === 200) {
          this.$message.success('压缩成功');
          this.compressDialogVisible = false;
          this.fetchFiles(this.currentPath, false);
        }
      } finally {
        this.actionLoading = false;
      }
    },

    // ---------------- 导航、预览、下载等基础方法 ----------------
    goBack() { if (this.historyIndex > 0) { this.historyIndex--; this.fetchFiles(this.history[this.historyIndex], false); } },
    goForward() { if (this.historyIndex < this.history.length - 1) { this.historyIndex++; this.fetchFiles(this.history[this.historyIndex], false); } },
    goUp() { if (this.currentPath === '/') return; const parts = this.currentPath.split('/').filter(p => p); parts.pop(); this.navigateTo(parts.length === 0 ? '/' : '/' + parts.join('/')); },
    jumpToPath() { if (this.inputPath !== this.currentPath) this.navigateTo(this.inputPath); },
    //跳转到指定路径，后端接口会优先使用 pageNum 并计算原始全部数据分页的值判断pageNum是否超出分页范围进行分页查询，前端不需要计算分页参数了
    navigateTo(path) { this.fetchFiles(path, true); },

    handleItemClick(row) { row.isDirectory ? this.navigateTo(row.path) : this.handleFileAction(row); },
    handleFileAction(row) {
      const type = row.type ? row.type.toLowerCase() : '';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'jpe', 'jfi', 'jfif', 'bmp', 'svg', 'heif', 'heifs', 'heic', 'heics', 'avci', 'avcs', 'avif', 'avifs'].includes(type)) this.openPreview(row, 'image');
      else if (['mp4', 'webm', 'mov', 'f4v', 'avi', 'mkv', 'flv', 'wmv', 'm4v', '3gp', 'rmvb', 'webb', 'm2p'].includes(type)) this.openPreview(row, 'video');
      else if (['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'ape', 'weba'].includes(type)) this.openPreview(row, 'audio');
      else if (['pdf', 'txt', 'json', 'md', 'js', 'html', 'java'].includes(type)) this.openPreview(row, 'document');
      else this.downloadFile(row);
    },
    openPreview(row, type) {
      this.previewFileObj = row; this.previewType = type;
      // this.previewUrl = `/api/file-manager/download?path=${encodeURIComponent(row.path)}&preview=true`;
      this.previewUrl = `${this.prefixUrl}${row.path}`;
      this.previewDialogVisible = true;
    },
    closePreview() { this.previewUrl = ''; this.previewFileObj = null; this.previewType = ''; },
    downloadFile(row) {
      const baseUrl = this.base_url; // 获取当前站点的基础 URL
      const url = baseUrl + `/sys/file-manager/download?path=${encodeURIComponent(row.path)}&preview=false`;
      const link = document.createElement('a'); link.style.display = 'none'; link.href = url; link.setAttribute('download', row.name);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    },
    // 上传成功
    handleSuccess() {
      this.$refs.uploadRef.clearFiles()
      this.$message({
        message: '上传成功',
        type: 'success'
      })
    },
    // 上传失败
    handleError() {
      this.uploading = false;
      this.$message({
        message: '上传失败',
        type: 'error'
      })
    },
    // 上传文件数超过限制
    handleExceed() {
      this.$message({
        message: '最大上传文件个数为1',
        type: 'error'
      })
    },
    handleUploadSuccess(res) {
      this.uploading = false;
      this.$message.success('上传成功');
      this.fetchFiles(this.currentPath, false);
    },
    beforeUpload(file) {
      this.uploading = true;
      // 这里可以自定义上传前的逻辑，例如显示加载动画、校验文件类型等
      // console.log('Uploading', file.name);
      // 返回 false 可以阻止默认的上传行为
      // 返回一个 Promise 可以控制上传的流程
      return new Promise((resolve, reject) => {
        // 例如，你可以在这里使用 axios 或其他方法上传文件到你的服务器
        // 例如：axios.post('/your-upload-url', file).then(response => resolve(response)).catch(error => reject(error));
        // 为了示例，我们这里模拟一个成功的上传
        // setTimeout(() => {
        //   resolve(true); // 表示上传成功，可以继续后续操作
        // }, 1000);
        upload_file({ file: file, path: this.currentPath }).then(res => {
          if (res.code === 200) resolve(true);
          else reject(new Error(res.msg || '上传失败'));
         }).catch(err => reject(err));
      });
    },
    openRenameDialog(row) { this.currentRow = row; this.newName = row.name; this.renameDialogVisible = true; },
    async submitRename() {
      if (!this.newName || this.newName === this.currentRow.name) return (this.renameDialogVisible = false);
      // const res = await axios.post('/api/file-manager/rename', null, { params: { path: this.currentRow.path, newName: this.newName } });
      const res = await rename_file({ path: this.currentRow.path, newName: this.newName });
      if (res.code === 200) { this.$message.success('重命名成功'); this.renameDialogVisible = false; this.fetchFiles(this.currentPath, false); }
    },
    handleSortChange({ prop, order }) { this.sortFiles(prop, order); },
    sortFiles(prop, order) {
      if (!order) return;
      this.fileList.sort((a, b) => {
        let valA = a[prop], valB = b[prop];
        if (prop !== 'isDirectory') {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
        }
        if (valA < valB) return order === 'ascending' ? -1 : 1;
        if (valA > valB) return order === 'ascending' ? 1 : -1;
        return 0;
      });
    },
    getFileIcon(row) {
      if (row.isDirectory) return 'el-icon-folder';
      const type = row.type ? row.type.toLowerCase() : '';
      if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) return 'el-icon-picture-outline';
      if (['mp4', 'avi'].includes(type)) return 'el-icon-video-camera';
      if (['zip', 'rar'].includes(type)) return 'el-icon-collection';
      return 'el-icon-document';
    },
    getIconColor(row) { return row.isDirectory ? '#E6A23C' : '#606266'; },
    formatSize(size) {
      if (size === 0) return '0 B';
      const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(size) / Math.log(k));
      return (size / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    // ---------------- 新建功能 ----------------
    // 处理下拉菜单点击
    handleCreateCommand(command) {
      this.createForm.isFolder = (command === 'folder');
      this.createForm.name = '';
      this.createDialogVisible = true;

      // 弹窗打开后自动聚焦输入框
      this.$nextTick(() => {
        if (this.$refs.createInput) {
          this.$refs.createInput.focus();
        }
      });
    },

    // 提交创建请求
    async submitCreate() {
      const name = this.createForm.name.trim();
      if (!name) {
        return this.$message.warning('名称不能为空');
      }

      // 简单校验：新建文件时最好带有后缀名提示（可选）
      if (!this.createForm.isFolder && !name.includes('.')) {
        this.$message.info('建议为文件添加后缀名，例如 .txt, .md');
      }

      this.actionLoading = true;
      try {
        const res = await create_file({
          path: this.currentPath,
          name: name,
          isFolder: this.createForm.isFolder
        });

        if (res.code === 200) {
          this.$message.success(this.createForm.isFolder ? '文件夹创建成功' : '文件创建成功');
          this.createDialogVisible = false;
          // 刷新当前目录列表
          this.fetchFiles(this.currentPath, false);
        } else {
          this.$message.error(res.msg || '创建失败');
        }
      } catch (error) {
        this.$message.error('请求异常');
      } finally {
        this.actionLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.file-manager-container { padding: 20px; /* background: #fff; */ border-radius: 4px; }
.nav-bar { display: flex; flex-wrap: wrap; align-items: center; margin-bottom: 10px; padding: 10px; /* background: #f5f7fa; */ border-radius: 4px; gap: 15px; }
.nav-buttons { display: flex; gap: 5px; }
.path-input-container { flex: 1; max-width: 400px; }
.search-container { width: 250px; }
.toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 10px; }
.breadcrumb-container { flex: 1 auto; margin: 5px auto; }
.actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.upload-btn { display: inline-block; }
.file-name-cell { display: flex; align-items: center; cursor: pointer; }
.file-name-cell:hover .name-text { color: #409EFF; text-decoration: underline; }
.file-name-cell i { font-size: 20px; margin-right: 5px; }
.file-name-cell .i-btn { margin-right: 5px; border: none; background: none; padding: 3px; }
.name-text { font-size: 14px; user-select: none; }
.danger-text { color: #F56C6C; }
.preview-content { display: flex; justify-content: center; /* background-color: #f8f9fa; align-items: center; */ min-height: 100px; border-radius: 4px; overflow: hidden; }

/*.file-name-cell @media only screen and (max-width: 767px) {
  .hidden-xs-only { display: none !important; }
  .nav-bar { flex-wrap: wrap; }
  .search-container { width: 100%; }
  .toolbar { flex-direction: column; align-items: flex-start; gap: 10px; }
} */
</style>
