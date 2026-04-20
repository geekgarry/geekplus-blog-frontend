<template>
  <div class="jvm-dashboard">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card">
          <div slot="header" class="clearfix">
            <span>Heap Memory (堆内存)</span>
          </div>
          <div class="metric-value">
            {{ formatMB(metrics.heapUsed) }} / {{ formatMB(metrics.heapMax) }} MB
          </div>
          <el-progress :percentage="calcPercentage(metrics.heapUsed, metrics.heapMax)" :color="customColors"></el-progress>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card">
          <div slot="header" class="clearfix">
            <span>CPU Usage (CPU使用率)</span>
          </div>
          <div class="metric-value">
            {{ (metrics.processCpuLoad * 100).toFixed(2) }}%
          </div>
          <el-progress :percentage="metrics.processCpuLoad * 100" :color="customColors"></el-progress>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="metric-card">
          <div slot="header" class="clearfix">
            <span>Threads (活动线程)</span>
          </div>
          <div class="metric-value">
            {{ metrics.threadCount }} (Peak: {{ metrics.peakThreadCount }})
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>操作面板 (Operations)</span>
          </div>
          <el-button type="danger" icon="el-icon-delete" @click="triggerGC" :loading="gcLoading">手动触发 GC</el-button>
          <el-button type="primary" icon="el-icon-document" @click="fetchThreadDump">查看线程堆栈</el-button>
          <el-button type="warning" icon="el-icon-setting" @click="tuneDialogVisible = true">动态调整 JVM 参数</el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 线程堆栈抽屉 -->
    <el-drawer
      title="线程堆栈跟踪 (Thread Dump)"
      :visible.sync="drawerVisible"
      size="50%">
      <div class="thread-dump-container">
        <el-collapse>
          <el-collapse-item v-for="thread in threadDump" :key="thread.threadId" :title="thread.threadName + ' [' + thread.threadState + ']' ">
            <pre class="stack-trace">{{ thread.stackTrace }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-drawer>

    <!-- 动态调整参数对话框 -->
    <el-dialog title="调整 JVM 参数" :visible.sync="tuneDialogVisible" width="30%">
      <el-form :model="tuneForm" label-width="120px">
        <el-form-item label="新生代比例">
          <el-input v-model="tuneForm.newRatio" placeholder="例如: 2"></el-input>
        </el-form-item>
        <el-form-item label="垃圾回收器">
          <el-select v-model="tuneForm.gcType" placeholder="请选择">
            <el-option label="G1 GC" value="G1"></el-option>
            <el-option label="ZGC" value="ZGC"></el-option>
            <el-option label="CMS" value="CMS"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-alert
        title="架构限制提示"
        type="warning"
        description="标准HotSpot JVM不支持在运行时动态修改堆大小、新生代比例或更改垃圾回收器。这些操作必须通过修改启动脚本并重启进程来实现。"
        show-icon
        class="mt-3">
      </el-alert>
      <span slot="footer" class="dialog-footer">
        <el-button @click="tuneDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitTune">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getMetrics, systemGC, getThreadDump, submitTune, submitLinuxTune, jvmGCPid } from "@/api/monitor/jvm"

export default {
  name: 'JvmDashboard',
  data() {
    return {
      metrics: {
        heapUsed: 0,
        heapMax: 1,
        processCpuLoad: 0,
        threadCount: 0,
        peakThreadCount: 0
      },
      timer: null,
      gcLoading: false,
      drawerVisible: false,
      threadDump: [],
      tuneDialogVisible: false,
      tuneForm: {
        newRatio: '',
        gcType: ''
      },
      customColors: [
        {color: '#6f7ad3', percentage: 20},
        {color: '#1989fa', percentage: 40},
        {color: '#5cb87a', percentage: 60},
        {color: '#e6a23c', percentage: 80},
        {color: '#f56c6c', percentage: 100}
      ]
    };
  },
  mounted() {
    this.fetchMetrics();
    // 每3秒刷新一次数据
    this.timer = setInterval(this.fetchMetrics, 3000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    async fetchMetrics() {
      try {
        const res = await getMetrics();
        this.metrics = res.data;
      } catch (error) {
        console.error('获取指标失败', error);
      }
    },
    async triggerGC() {
      this.gcLoading = true;
      try {
        await systemGC();
        this.$message.success('GC 请求已发送，正在清理堆栈碎片');
        setTimeout(this.fetchMetrics, 1000); // 延迟刷新看效果
      } catch (error) {
        this.$message.error('GC 触发失败');
      } finally {
        this.gcLoading = false;
      }
    },
    async fetchThreadDump() {
      try {
        const res = await getThreadDump();
        this.threadDump = res.data;
        this.drawerVisible = true;
      } catch (error) {
        this.$message.error('获取线程堆栈失败');
      }
    },
    async submitTune() {
      try {
        const res = await submitTune(this.tuneForm);
        if (res.data.status === 'warning') {
          this.$message.warning({
            message: res.data.message,
            duration: 5000
          });
        }
        this.tuneDialogVisible = false;
      } catch (error) {
        this.$message.error('参数调整请求失败');
      }
    },
    formatMB(bytes) {
      if (!bytes) return 0;
      return (bytes / 1024 / 1024).toFixed(2);
    },
    calcPercentage(used, max) {
      if (!max || max === 0) return 0;
      const pct = (used / max) * 100;
      return pct > 100 ? 100 : Number(pct.toFixed(1));
    }
  }
};
</script>

<style scoped>
.jvm-dashboard {
  padding: 20px;
}
.mb-4 {
  margin-bottom: 20px;
}
.mt-3 {
  margin-top: 15px;
}
.metric-card {
  height: 100%;
}
.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  /* color: #303133; */
}
.thread-dump-container {
  padding: 0 20px;
  height: 100%;
  overflow-y: auto;
}
.stack-trace {
  /* background-color: #f5f7fa; */
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
