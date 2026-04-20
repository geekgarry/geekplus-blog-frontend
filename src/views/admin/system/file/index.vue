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
          :on-error="handleUploadError"
          :limit="1"
          :on-exceed="handleUploadExceed"
          :before-upload="beforeUpload"
          :http-request="httpRequestUpload"
        >
          <el-button type="primary" size="small" circle icon="el-icon-upload" :loading="uploading" title="上传"></el-button>
        </el-upload>

        <!-- 新增：回收站按钮 -->
        <el-button type="info" size="small" icon="el-icon-delete-solid" @click="openRecycleBin">回收站</el-button>
        <el-button class="hidden-xs-only" :type="viewMode === 'table' ? 'primary' : 'default'" size="small" icon="el-icon-tickets" @click="toggleView('table')" title="表格视图"></el-button>
        <el-button class="hidden-xs-only" :type="viewMode === 'icons' ? 'primary' : 'default'" size="small" icon="el-icon-s-grid" @click="toggleView('icons')" title="图标视图"></el-button>
        <el-button size="small" circle icon="el-icon-refresh" @click="fetchFiles(currentPath, false)" title="刷新"></el-button>
      </div>
    </div>

    <!-- 文件列表表格 -->
    <div v-if="viewMode === 'table'">
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

        <el-table-column label="操作" min-width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" icon="el-icon-edit" @click="openRenameDialog(scope.row)">重命名</el-button>
            <el-button type="text" size="small" icon="el-icon-download" v-if="!scope.row.isDirectory" @click="downloadFile(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 图标 icon 视图 -->
    <div v-else class="icon-view" v-loading="loading" @click="hideContextMenu">
      <div v-if="fileList.length === 0" class="empty-icon-view">当前目录没有文件</div>
      <div class="icon-layout">
        <div class="icon-grid" @dragover.prevent @drop="onDrop">
          <div class="icon-card" v-for="(row, index) in fileList" :key="row.path" :class="{ selected: isSelected(row) }" @dblclick="handleItemClick(row)" @click="handleIconSelection(row, index, $event)" @contextmenu.stop="showContextMenu(row, index, $event)" draggable="true" @dragstart="onDragStart(row, $event)">
            <div class="icon-checkbox">
              <el-checkbox :value="isSelected(row)" @change="handleIconSelection(row, index, { shiftKey: false, ctrlKey: true })" @click.stop></el-checkbox>
            </div>
            <div class="icon-preview">
              <template v-if="row.isDirectory">
                <i class="el-icon-folder" style="font-size: 40px; color: #E6A23C"></i>
              </template>
              <template v-else-if="isImageType(row)">
                <el-image v-show="previewSrc(row)" :lazy="true" :src="previewSrc(row)" alt="img" ></el-image>
                <i v-show="previewSrc(row) === ''" class="el-icon-picture-outline" style="font-size: 40px; color: #609EAF"></i>
              </template>
              <template v-else-if="isVideoType(row)">
                <i class="el-icon-video-camera" style="font-size: 40px; color: #409EFF"></i>
              </template>
              <template v-else-if="isAudioType(row)">
                <i class="el-icon-video-play" style="font-size: 40px; color: #67C23A"></i>
                <!-- 显示一个可以暂停播放音频的按钮 -->
                <!-- <div class="media-action" @click.stop="audioMediaPlayback(row)">
                  <i :class="isActiveMedia(row) ? 'el-icon-video-pause' : 'el-icon-video-play'" style="font-size: 18px; color: #fff;"></i>
                </div> -->
              </template>
              <template v-else>
                <i class="el-icon-document" style="font-size: 40px; color: #909399"></i>
              </template>
              <div class="media-action" v-if="(isVideoType(row) || isAudioType(row)) && previewSrc(row)" @click.stop="toggleMediaPlayback(row)">
                <i :class="isActiveMedia(row) ? 'el-icon-video-pause' : 'el-icon-video-play'" style="font-size: 18px; color: #fff;"></i>
              </div>
            </div>
            <div class="icon-meta">
              <span class="icon-name" :title="row.name">{{ row.name }}</span>
              <span class="icon-type">{{ row.isDirectory ? '文件夹' : uppercaseType(row.type) }}</span>
              <span class="icon-size">{{ row.isDirectory ? '-' : formatSize(row.size) }}</span>
              <div v-if="isDocumentType(row)" class="icon-snippet" @mouseenter="loadTextSnippet(row)">{{ textSnippetCache[row.path] || '悬停载入预览...' }}</div>
              <div class="icon-actions">
                <el-button type="text" icon="el-icon-document-copy" size="mini" @click.stop="handleCopyPath(row)" title="复制路径"></el-button>
                <el-button type="text" icon="el-icon-edit" size="mini" @click.stop="openRenameDialog(row)" title="重命名"></el-button>
                <el-button type="text" size="mini" icon="el-icon-download" v-if="!row.isDirectory" @click.stop="downloadFile(row)" title="下载"></el-button>
              </div>
            </div>
            <video v-if="isActiveMedia(row) && isVideoType(row)" :src="previewSrc(row)" controls :style="{ width: '100%', marginTop: '6px' }"></video>
            <audio v-if="isActiveMedia(row) && isAudioType(row)" :src="previewSrc(row)" controls :style="{ width: '100%', marginTop: '6px', minHeight: '30px' }"></audio>
          </div>
        </div>

        <div class="icon-side-panel" v-if="sideInfoRow">
          <div class="side-panel-header">
            <i :class="getFileIcon(sideInfoRow)" :style="{ fontSize: '32px', color: getIconColor(sideInfoRow), marginRight: '12px' }"></i>
            <div class="side-panel-header-text">
              <div class="side-panel-title">{{ sideInfoRow.name }}</div>
              <div class="side-panel-subtitle">{{ sideInfoRow.isDirectory ? '文件夹' : (uppercaseType(sideInfoRow.type) + ' 文件') }}</div>
            </div>
            <i class="el-icon-close side-panel-close" @click.stop="sideInfoRow = null" title="关闭"></i>
          </div>
          <div class="side-panel-actions">
            <el-button type="primary" size="mini" @click="handleItemClick(sideInfoRow)">打开</el-button>
            <el-button type="warning" size="mini" @click="openRenameDialog(sideInfoRow)">重命名</el-button>
            <el-button type="info" size="mini" @click="handleCopyPath(sideInfoRow)">复制路径</el-button>
            <el-button type="success" size="mini" v-if="!sideInfoRow.isDirectory" @click="downloadFile(sideInfoRow)">下载</el-button>
            <el-button type="text" size="mini" @click="openDetailDialog(sideInfoRow)">更多信息</el-button>
          </div>
          <div class="side-panel-row"><span>路径</span><span>{{ sideInfoRow.path }}</span></div>
          <div class="side-panel-row"><span>大小</span><span>{{ sideInfoRow.isDirectory ? '-' : formatSize(sideInfoRow.size) }}</span></div>
          <div class="side-panel-row"><span>修改时间</span><span>{{ formatDate(sideInfoRow.updateTime) }}</span></div>
          <div class="side-panel-row"><span>是否文件夹</span><span>{{ sideInfoRow.isDirectory ? '是' : '否' }}</span></div>
          <div v-if="isDocumentType(sideInfoRow)" class="side-panel-snippet">
            <div class="side-panel-snippet-label">预览片段</div>
            <div>{{ textSnippetCache[sideInfoRow.path] || '悬停加载预览...' }}</div>
          </div>
        </div>
      </div>
      <div v-if="contextMenuVisible" class="context-menu" :style="contextMenuStyle" @click.stop>
        <ul>
          <li @click="contextMenuAction('open')">打开</li>
          <li @click="contextMenuAction('rename')">重命名</li>
          <li @click="contextMenuAction('copy')">复制路径</li>
          <li v-if="contextMenuRow && !contextMenuRow.isDirectory" @click="contextMenuAction('download')">下载</li>
          <li @click="contextMenuAction('sidebar')">侧边信息</li>
          <li @click="contextMenuAction('info')">查看信息</li>
        </ul>
      </div>
    </div>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      :page-sizes="[20, 50, 100, 200]"
      @pagination="fetchFiles(currentPath, false)"
    />

    <!-- 进度条提示弹窗 (通用：上传/下载) -->
    <el-dialog :title="progressTitle" :visible.sync="progressVisible" width="400px" :close-on-click-modal="false" :show-close="true">
      <div style="text-align: center; font-size: 14px; margin-bottom: 10px;">{{ progressDesc }}</div>
      <el-progress :text-inside="true" :stroke-width="20" :percentage="progressPercent" :status="progressPercent === 100 ? 'success' : 'exception'"></el-progress>
    </el-dialog>

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
    <el-dialog :title="previewFileObj ? previewFileObj.name : '预览'" :visible.sync="previewDialogVisible" top="5vh" @close="closePreview" append-to-body width="900px">
      <div class="preview-content" v-loading="previewLoading">
        <el-image v-if="previewType === 'image'" :lazy="true" :src="previewUrl" fit="contain" style="width: 100%; height: 60vh;" :preview-src-list="[previewUrl]"></el-image>
        <video v-else-if="previewType === 'video'" :src="previewUrl" controls style="width: 100%; max-height: 60vh;"></video>
        <audio v-else-if="previewType === 'audio'" :src="previewUrl" controls style="width: 100%; margin-top: 0px;"></audio>
        <iframe v-else-if="previewType === 'document'" :src="previewUrl" frameborder="0" style="width: 100%; height: 65vh;"></iframe>
        <div v-else-if="previewType === 'text'" style="width: 100%;">
          <el-input
            type="textarea"
            :rows="20"
            v-model="previewText"
            placeholder="正在加载文本内容..."
            style="width: 100%; min-height: 60vh;"
          ></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer" v-if="previewType === 'text'">
        <el-button @click="closePreview">取 消</el-button>
        <el-button type="primary" :loading="previewSaveLoading" @click="savePreviewText">保存</el-button>
      </span>
    </el-dialog>

    <!-- 详情信息弹窗 -->
    <el-dialog title="文件信息" :visible.sync="detailDialogVisible" width="520px" append-to-body>
      <div class="detail-panel" v-if="contextMenuRow">
        <div class="detail-header">
          <i :class="getFileIcon(contextMenuRow)" :style="{ fontSize: '32px', color: getIconColor(contextMenuRow), marginRight: '12px' }"></i>
          <div>
            <div class="detail-title">{{ contextMenuRow.name }}</div>
            <div class="detail-subtitle">{{ contextMenuRow.isDirectory ? '文件夹' : (uppercaseType(contextMenuRow.type) + ' 文件') }}</div>
          </div>
        </div>
        <div class="detail-row"><span>路径：</span><span>{{ contextMenuRow.path }}</span></div>
        <div class="detail-row"><span>大小：</span><span>{{ contextMenuRow.isDirectory ? '-' : formatSize(contextMenuRow.size) }}</span></div>
        <div class="detail-row"><span>修改时间：</span><span>{{ formatDate(contextMenuRow.updateTime) }}</span></div>
        <div class="detail-row"><span>是否文件夹：</span><span>{{ contextMenuRow.isDirectory ? '是' : '否' }}</span></div>
        <div v-if="isDocumentType(contextMenuRow)" class="detail-snippet">
          <div class="detail-snippet-label">预览片段</div>
          <div class="detail-snippet-content">{{ textSnippetCache[contextMenuRow.path] || '悬停文件列表时自动加载预览' }}</div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
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
import { list_file, search_file, delete_batch_file, delete_file, rename_file, upload_file, create_file, copy_file, move_file, compress_file, list_recycle_file, restore_recycle_file, delete_recycle_file, check_exist, read_text_file, save_text_file, downloadRecycleFile, downloadCommonFile, getDownloadUrl } from '@/api/system/file-manager';
import { copyToClipboard } from '@/utils/clipboard';
import { downloadFileByProgress } from "@/utils/downloadZip"
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
      previewDialogVisible: false,
      previewFileObj: null,
      previewUrl: '',
      previewType: '',
      previewText: '',
      previewSaveLoading: false,
      previewLoading: false,
      baseAPI: process.env.VUE_APP_BASE_API,

      // 新建功能相关状态
      createDialogVisible: false,
      createForm: {
        name: '',
        isFolder: true
      },

      // 列表显示模式：table / icons
      viewMode: 'table',
      textSnippetCache: {},
      activeMediaPath: '',

      // 图标视图选择相关
      lastSelectedIndex: -1,

      // 右键菜单与详情弹窗
      contextMenuVisible: false,
      contextMenuStyle: {
        left: '0px',
        top: '0px'
      },
      contextMenuRow: null,
      detailDialogVisible: false,
      sideInfoRow: null,

      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 100
      },

      // 进度条控制 (上传与下载复用)
      progressVisible: false,
      progressTitle: '',
      progressDesc: '',
      progressPercent: 0,

      // swRegistered: false, // Service Worker 状态

      //重命名后的上传文件
      renamedFile: null
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
    },
    swRegistered() {
      return this.$store.getters.swRegistered;
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
      } catch (error) {
        this.$message.error(error || '文件不存在');
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
      } catch (error) {
        this.$message.error(error || '搜索文件不存在');
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
      // const baseUrl = this.baseAPI; // 获取当前站点的基础 URL
      // const url = baseUrl + `/sys/file-manager/recycle/download?recycleName=${encodeURIComponent(row.recycleName)}`;
      // const link = document.createElement('a');
      // link.style.display = 'none';
      // link.href = url;
      // link.setAttribute('download', row.originalName);
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      downloadRecycleFile(row.recycleName);
    },

    handleCopyPath(row) {
      var fullPath = row.url;
      if(url === null || url === undefined) {
        fullPath = row.path;
      }
      copyToClipboard(fullPath);
    },
    // ---------------- 批量操作与剪贴板 ----------------
    handleSelectionChange(val) {
      this.selectedFiles = val;
      // console.log('当前选中：', this.selectedFiles);
      var selectedWithFullPath = this.selectedFiles.map(f => ({ ...f, fullPath: f.url || f.path }));
      if (this.selectedFiles.length === 0) {
        // 如果没有选中任何文件，不触发事件但传递空数组
        selectedWithFullPath = []; // 确保传递一个空数组而不是 undefined
        return;
      }
      //console.log('当前选中改变增加全文路径：', selectedWithFullPath);
      this.$emit('select-file', selectedWithFullPath); // 触发一个名为 'select-file' 的事件，返回给引用的父组件并传递数据
    },
    handleCopy() {
      this.clipboard = this.selectedFiles.map(f => f.path);
      this.clipboardAction = 'copy';
      this.$message.success(`已复制 ${this.clipboard.length} 项，请前往目标文件夹点击粘贴`);
      this.$refs.multipleTable.clearSelection();
    },
    isTextEditableType(row) {
      const type = row.type ? row.type.toLowerCase() : '';
      return ['txt', 'json', 'md', 'js', 'html', 'java', 'log', 'xml', 'yml', 'yaml', 'csv', 'properties', 'sh'].includes(type);
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
      else if (['pdf'].includes(type)) this.openPreview(row, 'document');
      else if (this.isTextEditableType(row)) this.openPreview(row, 'text');
      else this.downloadFile(row);
    },
    async openPreview(row, type) {
      this.previewFileObj = row;
      this.previewType = type;
      this.previewText = '';
      this.previewSaveLoading = false;
      this.previewUrl = '';
      this.previewLoading = false;
      this.previewDialogVisible = true;

      if (type === 'text') {
        this.previewLoading = true;
        try {
          const res = await read_text_file({ path: row.fullPath });
          this.previewText = res.data || '';
        } catch (error) {
          this.$message.error(error.msg || '读取文本内容失败');
          this.previewText = '无法读取文本内容';
        } finally {
          this.previewLoading = false;
        }
      } else {
        this.previewLoading = true;
        try {
          if(row.url === "" || row.url === null) {
            this.previewUrl = this.baseAPI + getDownloadUrl(row.path, true);
          } else {
            this.previewUrl = row.url;
          }
        } catch (error) {
          this.$message.error('预览文件失败: ' + error.message);
        } finally {
          this.previewLoading = false;
        }
      }
    },
    async savePreviewText() {
      if (!this.previewFileObj) return;
      this.previewSaveLoading = true;
      try {
        const res = await save_text_file({ path: this.previewFileObj.fullPath, content: this.previewText });
        if (res.code === 200 || res.success) {
          this.$message.success('文本保存成功');
          this.previewDialogVisible = false;
        } else {
          this.$message.error(res.msg || '保存失败');
        }
      } catch (error) {
        this.$message.error(error.msg || '保存失败');
      } finally {
        this.previewSaveLoading = false;
      }
    },
    closePreview() {
      this.previewUrl = '';
      this.previewFileObj = null;
      this.previewType = '';
      this.previewText = '';
      this.previewDialogVisible = false;
    },
    // 上传失败
    handleUploadError() {
      this.uploading = false;
      this.$message({
        message: '上传失败',
        type: 'error'
      })
    },
    // 上传文件数超过限制
    handleUploadExceed() {
      this.$message({
        message: '最大上传文件个数为1',
        type: 'error'
      })
    },
    // 上传成功
    handleUploadSuccess(res) {
      this.uploading = false;
      this.$message.success('上传成功');
      this.$refs.uploadRef.clearFiles()
      this.fetchFiles(this.currentPath, false);
    },
    /**
     * 1. before-upload: 拦截原始文件，创建新文件对象
     */
    beforeUpload(file) {
      this.uploading = true;
      // 这里可以自定义上传前的逻辑，例如显示加载动画、校验文件类型等
      // console.log('Uploading', file.name);
      // 返回 false 可以阻止默认的上传行为
      // 返回一个 Promise 可以控制上传的流程
      // return new Promise((resolve, reject) => {
      //   // 例如，你可以在这里使用 axios 或其他方法上传文件到你的服务器
      //   // 例如：axios.post('/your-upload-url', file).then(response => resolve(response)).catch(error => reject(error));
      //   // 为了示例，我们这里模拟一个成功的上传
      //   // setTimeout(() => {
      //   //   resolve(true); // 表示上传成功，可以继续后续操作
      //   // }, 1000);
      //   upload_file({ file: file, path: this.currentPath }).then(res => {
      //     if (res.code === 200){
      //       this.fetchFiles(this.currentPath, false);
      //       resolve(true);
      //     }else {
      //       reject(new Error(res.msg || '上传失败'));
      //     }
      //    }).catch(err => reject(err));
      // });
      // 1. 检查文件名是否包含空格
      if (/\s/.test(file.name)) {
        // 2. 创建新文件名，替换所有空白字符为下划线
        const newName = file.name.replace(/\s+/g, '_');
        console.log(newName);
        // 3. 构造新的 File 对象
        // new File(bits, name, options)
        this.renamedFile = new File([file], newName, {
          type: file.type,
          lastModified: file.lastModified
        });

        // 4. 关键步骤：由于 before-upload 返回 Promise 或 false 会阻止默认上传
        // 我们需要手动触发上传这个新文件，但 el-upload 的默认行为是上传原始 file
        // 因此，最稳妥的方式是拦截默认行为，手动发送请求，或者利用 http-request

        // 这里采用更通用的方案：返回 false 阻止默认上传，然后手动调用接口
        // 注意：如果希望完全利用 el-upload 的进度条等特性，建议配合 http-request 使用
        // 但为了简单实现“自动上传”，我们在此处直接调用上传接口
        // 返回 false 阻止默认上传流程，转而由 http-request 处理
        // 注意：这里返回 false 是为了让 el-upload 知道我们接管了逻辑，
        // 但实际上 http-request 会被触发，我们需要在 http-request 中使用 renamedFile
        // 或者直接调用上传函数，不使用http-request
        //return false; // 阻止 el-upload 默认的上传行为,不实用http-request
      }
      // 如果没有空格，正常返回 true 允许默认上传（action中设置的地址或者也统一走手动按钮提交逻辑以保持一致）
    },
    // ---------------- ✨ 核心升级：带有重复检测和进度条的自定义上传 ----------------
    async httpRequestUpload(options) {
      const file = this.renamedFile || options.file;
      const targetPath = this.currentPath;

      // 1. 检查是否存在同名文件
      try {
        const checkRes = await check_exist({ path: targetPath, filename: file.name });

        let shouldOverwrite = false;
        if (checkRes.data === true) {
          // 文件存在，弹窗让用户选择
          try {
            await this.$confirm(`文件 "${file.name}" 已存在，是否覆盖？`, '提醒', {
              confirmButtonText: '覆盖',
              cancelButtonText: '跳过',
              type: 'warning'
            });
            shouldOverwrite = true; // 选择覆盖
          } catch (e) {
            this.$message.info(`已跳过上传文件: ${file.name}`);
            options.onError(new Error("用户跳过"));
            return;
          }
        }

        // 2. 准备开始上传并显示进度条
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', targetPath);
        formData.append('overwrite', shouldOverwrite);

        this.progressTitle = "正在上传文件";
        this.progressDesc = `正在上传: ${file.name}`;
        this.progressPercent = 0;
        this.progressVisible = true;

        const onUploadProgress = (progressEvent) => {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          this.progressPercent = percentCompleted;
        };
        const uploadRes = await upload_file(formData, onUploadProgress);

        if (uploadRes.code === 200) {
          this.$message.success('文件上传成功');
          this.fetchFiles(this.currentPath, false); // 更新列表
        } else {
          this.$message.error('上传失败：' + uploadRes.data.msg);
        }
      } catch (error) {
        this.$message.error('请求发生异常');
      } finally {
        setTimeout(() => { this.progressVisible = false; }, 500);
      }
    },

    // ------------------- 下载操作（智能选用三种模式） -------------------
    downloadFile(row) {
      // const baseUrl = this.baseAPI; // 获取当前站点的基础 URL
      //const filePath = this.currentPath === '/' ? `/${row.name}` : `${this.currentPath}/${row.name}`;
      const url = `${this.baseAPI}${getDownloadUrl(row.path, false)}`;
      const fileSize = row.size; // 后端需要补充真实的 bytes 长度。假设已存在

      // 【策略判定】
      const SIZE_50MB = 50 * 1024 * 1024;
      const SIZE_500MB = 500 * 1024 * 1024;

      if (!fileSize) {
         // 大小未知，兜底方案
         downloadCommonFile(row.path, false);
         return;
      }
      if (fileSize < SIZE_50MB) {
        // [方式A：Web Worker 下载] 小于 50MB 用 Web Worker 纯内存接收，进度条最平滑，体验最好
        this.downloadByWebWorker(url, row.name);
      } else if (fileSize >= SIZE_50MB && fileSize < SIZE_500MB && this.swRegistered) {
        // [方式B：Service Worker 下载] 50MB~500MB，如果支持SW则拦截并抛出流供浏览器原生下载，同时反馈 UI 进度
        this.downloadByServiceWorker(url, row.name);
      } else {
        // [方式C：普通下载] 大于500MB，内存吃不消，交给浏览器接管（不显示系统级内敛UI进度条，靠浏览器自身管理器）
        downloadCommonFile(row.path, false);
        this.$message.info("文件较大，已启动浏览器原生后台下载！");
      }
    },

    // 方式 A:强大的后台多线程加载 Web Worker 下载 (含实时 UI 进度条)
    downloadByWebWorker(url, filename) {
        this.progressTitle = "正在下载文件 (多线程加速)";
        this.progressDesc = `下载中: ${filename}`;
        this.progressPercent = 0;
        this.progressVisible = true;

        if (window.Worker) {
            const worker = new Worker('/worker/downloadWorker.js');
            worker.postMessage({ url: url, filename: filename });

            worker.onmessage = (e) => {
                if (e.data.type === 'progress') {
                    this.progressPercent = e.data.percent;
                } else if (e.data.type === 'success') {
                    // 下载完成，由内存Blob创建链接
                    const blobUrl = window.URL.createObjectURL(e.data.blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = e.data.filename;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(blobUrl);

                    this.$message.success('下载完成');
                    setTimeout(() => { this.progressVisible = false; }, 500);
                    worker.terminate();
                } else if (e.data.type === 'error') {
                    this.$message.error('下载遇到阻碍: ' + e.data.error);
                    this.progressVisible = false;
                    worker.terminate();
                }
            };
        } else {
            // 不支持 Web Worker 时退化为 A 方案主线程 Axios 下载
            downloadFileByProgress(url, this.progressPercent, this.progressVisible);
        }
    },

    // 方式 B
    downloadByServiceWorker(url, filename) {
        // 让页面新建隐藏 iframe 触发对应的 URL（附带 sw_download 标识欺骗SW拦截）
        const iframe = document.createElement('iframe');
        iframe.title = filename;
        iframe.style.display = 'none';
        iframe.src = `${url}&sw_download=true`; // 触发 SW fetch 拦截
        document.body.appendChild(iframe);
        // iframe 成功响应后 SW 自己会 postMessage 过来唤起主界面的进度条
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
    toggleView(mode) {
      if (mode !== 'table' && mode !== 'icons') return;
      this.viewMode = mode;
    },
    isImageType(row) {
      const type = (row.type || '').toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heif', 'heic', 'avif'].includes(type);
    },
    isVideoType(row) {
      const type = (row.type || '').toLowerCase();
      return ['mp4', 'webm', 'mov', 'f4v', 'avi', 'mkv', 'flv', 'wmv', 'm4v', '3gp', 'rmvb'].includes(type);
    },
    isAudioType(row) {
      const type = (row.type || '').toLowerCase();
      return ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'ape', 'weba'].includes(type);
    },
    isDocumentType(row) {
      const type = (row.type || '').toLowerCase();
      return ['txt', 'md', 'json', 'js', 'html', 'css', 'java', 'py', 'xml', 'csv', 'log', 'yaml', 'yml', 'pdf'].includes(type);
    },
    previewSrc(row) {
      return `${row.url}`;
    },
    // 写一个点击音频行的函数，控制同一时间只能有一个音频在播放，再次点击同一行则暂停
    toggleAudioPlayback(row) {
      if (this.activeMediaPath === row.path) {
        this.activeMediaPath = '';
        const audio = document.querySelector('.audio-player-' + row.path.replace(/\//g, '-'));
        if (audio && typeof audio.pause === 'function') {
          audio.pause();
          // audio.currentTime = 0; // 可选：重置播放时间到开头
          // document.body.removeChild(audio); // 可选：从 DOM 中移除 audio 元素
        } else {
          console.error('Audio element not found or pause method not available:', audio);
        }
      } else {
        this.activeMediaPath = row.path;
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.style.display = 'none';
        audio.src = this.previewSrc(row);
        audio.setAttribute('class', 'audio-player-' + row.path.replace(/\//g, '-')); // 给 audio 元素添加一个独特的 class，方便后续控制
        document.body.appendChild(audio);
        audio.play();
      }
    },
    toggleMediaPlayback(row) {
      if (this.activeMediaPath === row.path) {
        this.activeMediaPath = '';
      } else {
        this.activeMediaPath = row.path;
      }
    },
    isActiveMedia(row) {
      return this.activeMediaPath === row.path;
    },
    uppercaseType(type) {
      if (!type) return '';
      return type.toUpperCase();
    },
    isSelected(row) {
      return this.selectedFiles.some(f => f.path === row.path);
    },
    showContextMenu(row, index, event) {
      event.preventDefault();
      // 右键点击时，不要选择，保持当前状态不变，直接显示菜单
      // if (!this.isSelected(row)) {
      //   this.selectedFiles = [row];
      //   this.handleSelectionChange(this.selectedFiles);
      // }
      // this.lastSelectedIndex = index; // 右键点击不改变 lastSelectedIndex 的值，保持与鼠标选择行为一致
      const { clientX, clientY } = event;
      const menuWidth = 180;
      const menuHeight = 170;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const left = clientX + menuWidth > screenWidth ? screenWidth - menuWidth - 16 : clientX;
      const top = clientY + menuHeight > screenHeight ? screenHeight - menuHeight - 16 : clientY;
      this.contextMenuRow = row;
      this.contextMenuStyle = { left: `${left}px`, top: `${top}px` };
      this.contextMenuVisible = true;
    },
    hideContextMenu() {
      this.contextMenuVisible = false;
    },
    contextMenuAction(action) {
      const row = this.contextMenuRow;
      if (!row) return;
      this.contextMenuVisible = false;
      if (action === 'open') {
        this.handleItemClick(row);
      } else if (action === 'rename') {
        this.openRenameDialog(row);
      } else if (action === 'copy') {
        this.handleCopyPath(row);
      } else if (action === 'download') {
        this.downloadFile(row);
      } else if (action === 'sidebar') {
        this.openSidePanel(row);
      } else if (action === 'info') {
        this.openDetailDialog(row);
      }
    },
    openDetailDialog(row) {
      this.contextMenuRow = row;
      this.detailDialogVisible = true;
    },
    openSidePanel(row) {
      if (!this.isSelected(row)) {
        this.selectedFiles = [row];
        this.handleSelectionChange(this.selectedFiles);
      }
      this.sideInfoRow = row;
    },
    handleIconSelection(row, index, event) {
      const isShift = event.shiftKey;
      const isCtrl = event.ctrlKey || event.metaKey;
      if (isShift && this.lastSelectedIndex !== -1) {
        const start = Math.min(this.lastSelectedIndex, index);
        const end = Math.max(this.lastSelectedIndex, index);
        const toSelect = this.fileList.slice(start, end + 1);
        this.selectedFiles = [...new Set([...this.selectedFiles, ...toSelect])];
      } else if (isCtrl) {
        if (this.isSelected(row)) {
          this.selectedFiles = this.selectedFiles.filter(f => f.path !== row.path);
        } else {
          this.selectedFiles.push(row);
        }
      } else {
        // 没有按键修饰符，直接选择当前项，取消其他选择
        if (this.isSelected(row) && this.selectedFiles.length === 1) {
          // 如果当前项已经是唯一选中，再次点击则取消选择
          this.selectedFiles = [];
        } else {
          this.selectedFiles = [row];
        }
      }
      this.lastSelectedIndex = index;
      // console.log('当前选中：', index, this.selectedFiles);
      // console.log('当前选中：', event);
      this.handleSelectionChange(this.selectedFiles);
    },
    onDragStart(row, event) {
      if (!this.isSelected(row)) {
        this.selectedFiles = [row];
        this.handleSelectionChange(this.selectedFiles);
      }
      const paths = this.selectedFiles.map(f => f.path);
      event.dataTransfer.setData('text/plain', JSON.stringify(paths));
      event.dataTransfer.effectAllowed = 'move';
    },
    onDrop(event) {
      event.preventDefault();
      const paths = JSON.parse(event.dataTransfer.getData('text/plain'));
      if (paths.length > 0) {
        this.moveFilesToCurrent(paths);
      }
    },
    async moveFilesToCurrent(paths) {
      this.loading = true;
      try {
        const res = await move_file({ paths: paths, destPath: this.currentPath });
        if (res.code === 200) {
          this.$message.success('移动成功');
          this.selectedFiles = [];
          this.fetchFiles(this.currentPath, false);
        } else {
          this.$message.error(res.msg);
        }
      } finally {
        this.loading = false;
      }
    },
    async loadTextSnippet(row) {
      if (!this.isTextEditableType(row) || this.textSnippetCache[row.path]) return;
      try {
        const res = await read_text_file({ path: row.path });
        const text = res.data || '';
        this.$set(this.textSnippetCache, row.path, text.slice(0, 120).replace(/\n/g, ' '));
      } catch (e) {
        this.$set(this.textSnippetCache, row.path, '获取预览失败');
      }
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
.file-name-cell { display: flex; align-items: center; }
.file-name-cell:hover .name-text { color: #409EFF; text-decoration: underline; }
.file-name-cell i { font-size: 20px; margin-right: 5px; }
.file-name-cell .i-btn { margin-right: 5px; border: none; background: none; padding: 3px; }
.name-text { font-size: 14px; user-select: none; }
.danger-text { color: #F56C6C; }
.preview-content { display: flex; justify-content: center; /* background-color: #f8f9fa; align-items: center; */ min-height: 100px; border-radius: 4px; overflow: hidden; }

.icon-view { min-height: 60vh; }
.icon-layout { display: flex; gap: 16px; }
.icon-grid { display: flex; flex-wrap: wrap; gap: 12px; align-items: stretch; flex: 1; }
.icon-card { width: 160px; min-height: 220px; border: 1px solid #e4e7ed; border-radius: 8px; padding: 8px; background: #fff; display: flex; flex-direction: column; position: relative; transition: box-shadow .2s; cursor: pointer; }
.icon-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.12); }
.icon-card.selected { border-color: #409EFF; background: #ecf5ff; }
.icon-checkbox { position: absolute; top: 4px; left: 4px; z-index: 10; }
.icon-preview { width: 100%; height: 100px; display: flex; justify-content: center; align-items: center; background: #f9fafb; border-radius: 4px; position: relative; overflow: hidden; }
.icon-preview img { width: 100%; height: 100%; object-fit: cover; }
.media-action { position: absolute; right: 6px; bottom: 6px; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; cursor: pointer; }
.icon-meta { margin-top: 6px; display: flex; flex-direction: column; flex: 1; }
.icon-name { font-size: 13px; line-height: 1.2; color: #303133; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.icon-type, .icon-size { font-size: 11px; color: #909399; margin-top: 2px; }
.icon-snippet { margin-top: 4px; font-size: 11px; color: #606266; height: 36px; overflow: hidden; text-overflow: ellipsis; }
.icon-actions { margin-top: auto; display: flex; gap: 4px; }
.icon-side-panel { width: 280px; min-width: 280px; background: #ffffff; border: 1px solid #e4e7ed; border-radius: 10px; padding: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 16px; }
.side-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.side-panel-header-text { flex: 1; min-width: 0; }
.side-panel-title { font-size: 16px; font-weight: 600; color: #303133; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.side-panel-subtitle { font-size: 12px; color: #909399; margin-top: 4px; }
.side-panel-close { cursor: pointer; color: #909399; font-size: 16px; }
.side-panel-close:hover { color: #606266; }
.side-panel-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.side-panel-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #606266; font-size: 13px; }
.side-panel-row span:first-child { color: #909399; }
.side-panel-snippet { padding: 12px; background: #f4f6fa; border-radius: 8px; color: #606266; font-size: 12px; line-height: 1.6; }
.side-panel-snippet-label { margin-bottom: 6px; font-size: 12px; color: #909399; }
.context-menu { position: fixed; z-index: 999; min-width: 180px; background: #fff; border: 1px solid rgba(0,0,0,.12); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,.12); overflow: hidden; }
.context-menu ul { margin: 0; padding: 8px 0; list-style: none; }
.context-menu li { padding: 10px 16px; font-size: 13px; color: #303133; cursor: pointer; transition: background .2s; }
.context-menu li:hover { background: #f5f7fa; }
.detail-panel { display: flex; flex-direction: column; gap: 12px; }
.detail-header { display: flex; align-items: center; margin-bottom: 12px; }
.detail-title { font-size: 16px; font-weight: 600; color: #303133; }
.detail-subtitle { font-size: 12px; color: #909399; margin-top: 4px; }
.detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ebeef5; color: #606266; font-size: 13px; }
.detail-row span:first-child { color: #909399; }
.detail-snippet { padding: 10px; background: #f4f6fa; border-radius: 6px; color: #606266; font-size: 12px; line-height: 1.5; }
.detail-snippet-label { margin-bottom: 6px; font-size: 12px; color: #909399; }
.empty-icon-view { color: #909399; text-align: center; padding: 30px; }

/*.file-name-cell @media only screen and (max-width: 767px) {
  .hidden-xs-only { display: none !important; }
  .nav-bar { flex-wrap: wrap; }
  .search-container { width: 100%; }
  .toolbar { flex-direction: column; align-items: flex-start; gap: 10px; }
} */
</style>
