<template>
  <div class="resume-data-manager">
    <el-card shadow="hover">
      <div slot="header" class="clearfix header-bar">
        <span>简历数据管理</span>
        <div class="header-actions">
          <el-input
            v-model="filters.userId"
            placeholder="按用户 ID 筛选"
            style="width: 220px"
            clearable
            size="small"
          />
          <el-button type="primary" size="mini" @click="fetchResumeList">刷新</el-button>
        </div>
      </div>
      <el-table :data="resumeList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户 ID" width="120" />
        <el-table-column prop="title" label="标题" min-width="160" />
        <!-- <el-table-column prop="templateId" label="模板" width="140">
          <template slot-scope="scope">
            {{ scope.row.templateId || scope.row.templateKey || '-' }}
          </template>
        </el-table-column> -->
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template slot-scope="scope">
            {{ formatTimestamp(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="showResumeDetail(scope.row)">查看</el-button>
            <el-button type="warning" size="mini" @click="loadResumeIntoEditor(scope.row)">载入编辑</el-button>
            <el-button type="danger" size="mini" @click="deleteResumeItem(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="简历详情" :visible.sync="detailDialogVisible" width="60%">
      <el-form label-position="top">
        <el-form-item label="简历 ID">
          <el-input :value="String(detail.id || '')" disabled />
        </el-form-item>
        <el-form-item label="用户 ID">
          <el-input :value="String(detail.userId || '')" disabled />
        </el-form-item>
        <el-form-item label="模板">
          <el-input :value="detail.templateId || detail.templateKey || ''" disabled />
        </el-form-item>
        <el-form-item label="数据 JSON">
          <el-input type="textarea" :rows="16" :value="detail.dataJson" disabled />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="loadResumeIntoEditor(detail)">载入到编辑器</el-button>
      </span>
    </el-dialog>
    <el-dialog title="简历编辑器" :visible.sync="editorDialogVisible" append-to-body width="80%">
      <ResumeEditor :data="detail.resumeData" />
    </el-dialog>
  </div>
</template>

<script>
import { getResumeList, getResumeById, deleteResume } from '@/api/resume';
import { createEmptyResumeData } from '@/components/resume';

const CACHE_KEY = 'resume_editor_cache_v2';

export default {
  name: 'ResumeDataManager',
  components: {
    ResumeEditor: () => import('@/views/tool/ResumeEditor.vue'),
  },
  data() {
    return {
      resumeList: [],
      loading: false,
      filters: { userId: '' },
      detailDialogVisible: false,
      detail: {},
      editorDialogVisible: false,
    };
  },
  created() {
    this.fetchResumeList();
  },
  methods: {
    fetchResumeList() {
      this.loading = true;
      getResumeList({ userId: this.filters.userId || undefined })
        .then((res) => {
          this.resumeList = Array.isArray(res)
            ? res
            : res && res.data
            ? res.data
            : [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    normalizePayload(payload) {
      let resumeData = payload.resumeData || payload.data || payload.dataJson;
      if (typeof resumeData === 'string') {
        try {
          resumeData = JSON.parse(resumeData);
        } catch (e) {
          resumeData = createEmptyResumeData();
        }
      }
      if (!resumeData || !resumeData.basics) {
        resumeData = createEmptyResumeData();
      }
      return {
        id: payload.id,
        userId: payload.userId,
        title: payload.title,
        templateId: payload.templateId || payload.templateKey || 'template1',
        resumeData,
        dataJson: JSON.stringify(resumeData, null, 2),
      };
    },
    showResumeDetail(row) {
      const id = row.id || row;
      getResumeById(id).then((res) => {
        const payload = res && res.data ? res.data : res;
        this.detail = this.normalizePayload(payload);
        this.detailDialogVisible = true;
      });
    },
    deleteResumeItem(id) {
      this.$confirm('确认删除该简历数据吗？', '删除确认', {
        type: 'warning',
      })
        .then(() =>
          deleteResume(id).then(() => {
            this.$message.success('已删除简历数据');
            this.fetchResumeList();
          })
        )
        .catch(() => {});
    },
    async loadResumeIntoEditor(row) {
      try {
        let payload = row;
        if (row && row.id && !row.resumeData && !row.data) {
          const res = await getResumeById(row.id);
          payload = res && res.data ? res.data : res;
        }
        const normalized = this.normalizePayload(payload);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            resumeData: normalized.resumeData,
            currentTemplateId: normalized.templateId,
            updatedAt: Date.now(),
          })
        );
        this.$message.success('已载入，正在打开编辑器…');
        this.editorDialogVisible = true;
        this.detail = normalized;
        // this.$router.push({ path: '/resumeGenerator' });
      } catch (e) {
        this.$message.error('载入失败');
      }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleString();
    },
  },
};
</script>

<style scoped>
.resume-data-manager {
  padding: 16px;
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dialog-footer {
  text-align: right;
}
</style>
