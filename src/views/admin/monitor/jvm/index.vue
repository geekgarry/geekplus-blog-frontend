<template>
  <div class="jvm-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h2 class="title"><i class="el-icon-data-analysis"></i> JVM & Server Live Monitor</h2>
      <div class="actions">
        <el-button type="danger" icon="el-icon-delete" @click="triggerGC" :loading="gcLoading" title="System GC"><span class="hidden-xs-only">Force GC</span></el-button>
        <el-button type="info" icon="el-icon-document" @click="openGcLogDialog"><span class="hidden-xs-only">GC Logs</span></el-button>
        <el-button type="primary" icon="el-icon-folder-opened" @click="openHeapDumpDialog"><span class="hidden-xs-only">Heap Dumps</span></el-button>
        <el-button type="success" icon="el-icon-tickets" @click="fetchThreadDump" title="Thread Dump"><span class="hidden-xs-only">Thread Dump</span></el-button>
        <el-button type="warning" icon="el-icon-setting" @click="tuneDialogVisible = true" title="Linux Tuning"><span class="hidden-xs-only">Linux Tuning</span></el-button>
      </div>
    </div>

    <!-- Metric Cards -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">Heap Memory</span>
            <i class="el-icon-cpu icon-purple"></i>
          </div>
          <div class="metric-value">{{ formatMB(currentData.heapUsed) }} MB</div>
          <div class="metric-sub">Max: {{ formatMB(currentData.heapMax) }} MB</div>
          <el-progress :percentage="calcPercentage(currentData.heapUsed, currentData.heapMax)" :color="customColors" :show-text="false" class="mt-3"></el-progress>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">CPU Usage</span>
            <i class="el-icon-odometer icon-blue"></i>
          </div>
          <div class="metric-value">{{ (currentData.processCpuLoad * 100).toFixed(1) }}%</div>
          <div class="metric-sub">System & Process</div>
          <el-progress :percentage="currentData.processCpuLoad * 100" :color="customColors" :show-text="false" class="mt-3"></el-progress>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">Live Threads</span>
            <i class="el-icon-connection icon-green"></i>
          </div>
          <div class="metric-value">{{ currentData.threadCount }}</div>
          <div class="metric-sub">Peak: {{ currentData.peakThreadCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="metric-card">
          <div class="card-header">
            <span class="card-title">Server Memory</span>
            <i class="el-icon-receiving icon-orange"></i>
          </div>
          <div class="metric-value">{{ formatGB(currentData.usedPhysicalMemory) }} GB</div>
          <div class="metric-sub">Total: {{ formatGB(currentData.totalPhysicalMemory) }} GB</div>
          <el-progress :percentage="calcPercentage(currentData.usedPhysicalMemory, currentData.totalPhysicalMemory)" :color="customColors" :show-text="false" class="mt-3"></el-progress>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts -->
    <el-row :gutter="20" class="mb-4">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="chart-header">Heap Memory Usage (MB)</div>
          <div ref="heapChart" style="height: 300px; width: 100%;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="chart-header">CPU Usage (%)</div>
          <div ref="cpuChart" style="height: 300px; width: 100%;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="chart-header">Server Memory Usage (GB)</div>
          <div ref="serverMemChart" style="height: 300px; width: 100%;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="chart-header">(JVM & CPU) Memory Usage (%)</div>
          <div ref="combinedRateChart" style="height: 300px; width: 100%;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- GC Log Dialog -->
    <el-dialog title="GC Logs Viewer" :visible.sync="gcLogVisible" width="600px">
      <div class="dialog-actions mb-3">
        <el-select v-model="logLines" style="max-width: 110px;" @change="fetchGcLog" placeholder="行数" clearable>
          <el-option
            v-for="(item,index) in 10"
            :key="index"
            :label="(item * 100)"
            :value="(item * 100)">
          </el-option>
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-download" @click="downloadGcLog">Download gc.log</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="fetchGcLog">Refresh</el-button>
      </div>
      <div class="log-container" v-loading="gcLogLoading">
        <pre class="log-content">{{ gcLogContent || 'No logs available.' }}</pre>
      </div>
      <el-alert
        title="提示警告"
        type="error"
        description="此功能需要你在运行时加上生成GC日志的命令参数(java -Xlog:gc*:file=/xx/xx/logs/gc.log:time,level -jar app_name.jar)，日志存储地址/xx/xx就是后端的配置文件profile即项目的服务器路径"
        show-icon
        class="mt-3">
      </el-alert>
    </el-dialog>

    <!-- Heap Dump Dialog -->
    <el-dialog title="Heap Dump Manager" :visible.sync="heapDumpVisible" width="520px">
      <div class="dialog-actions mb-3">
        <el-button type="danger" size="small" icon="el-icon-magic-stick" @click="generateHeapDump" :loading="generatingDump">
          Generate New Heap Dump
        </el-button>
        <el-button size="small" icon="el-icon-refresh" @click="fetchHeapDumps">Refresh List</el-button>
      </div>
      <el-table :data="heapDumps" v-loading="heapDumpLoading" border style="width: 100%">
        <el-table-column prop="fileName" label="File Name" min-width="200"></el-table-column>
        <el-table-column label="Size" width="120">
          <template slot-scope="scope">{{ formatMB(scope.row.size) }} MB</template>
        </el-table-column>
        <el-table-column label="Created At" width="180">
          <template slot-scope="scope">{{ formatDate(scope.row.lastModified) }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="downloadHeapDump(scope.row.fileName)">Download</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-alert
        title="提示警告"
        type="error"
        description="此功能需要后端服务器支持jvm命令"
        show-icon
        class="mt-3">
      </el-alert>
    </el-dialog>

    <!-- Thread Dump Drawer -->
    <el-drawer title="Thread Dump (Snapshot)" :visible.sync="drawerVisible" size="50%" custom-class="dark-drawer">
      <div class="thread-dump-container">
        <el-collapse>
          <el-collapse-item v-for="thread in threadDump" :key="thread.threadId">
            <template slot="title">
              <span class="thread-title">{{ thread.threadName }}</span>
              <el-tag size="mini" :type="thread.threadState === 'RUNNABLE' ? 'success' : 'warning'">{{ thread.threadState }}</el-tag>
            </template>
            <pre class="stack-trace">{{ thread.stackTrace }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-drawer>

    <!-- Linux Tuning Dialog -->
    <el-dialog title="Linux Command & JVM Tuning" :visible.sync="tuneDialogVisible" width="500px">
      <el-form :model="tuneForm" label-width="140px">
        <el-form-item label="操作类型">
          <el-select v-model="tuneForm.action" placeholder="请选择操作" style="width: 100%">
            <el-option label="清理OS缓存 (drop_caches)" value="drop_caches"></el-option>
            <el-option label="动态修改JVM Flag (jinfo)" value="jinfo_flag"></el-option>
            <el-option label="修改参数并重启服务 (sed + systemctl)" value="restart_with_new_args"></el-option>
          </el-select>
        </el-form-item>

        <template v-if="tuneForm.action === 'jinfo_flag'">
          <el-form-item label="JVM Flag">
            <el-input v-model="tuneForm.flag" placeholder="例如: +PrintGCDetails"></el-input>
          </el-form-item>
        </template>

        <template v-if="tuneForm.action === 'restart_with_new_args'">
          <el-form-item label="最大堆内存 (-Xmx)">
            <el-input v-model="tuneForm.xmx" placeholder="例如: 2048m"></el-input>
          </el-form-item>
          <el-form-item label="新生代比例 (NewRatio)">
            <el-input v-model="tuneForm.newRatio" placeholder="例如: 2"></el-input>
          </el-form-item>
        </template>
      </el-form>

      <el-alert
        title="高危操作警告"
        type="error"
        description="此功能将直接在服务器执行 Linux Shell 命令 (如 jcmd, jinfo, systemctl)。请确保接口已做好严格的权限校验防范命令注入！"
        show-icon
        class="mt-3">
      </el-alert>

      <span slot="footer" class="dialog-footer">
        <el-button @click="tuneDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitTune">执行命令</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getMetrics, systemGC, getThreadDump, submitTune, submitLinuxTune, jvmGCPid, getGCLog, getHeapDump, generateHeapDump, dlGCLogFile, dlHeapDumpFile } from "@/api/monitor/jvm"
import * as echarts from 'echarts';

export default {
  name: 'JvmDashboard',
  data() {
    return {
      historyData: [],
      currentData: {
        heapUsed: 0, heapMax: 1,
        processCpuLoad: 0,
        threadCount: 0, peakThreadCount: 0,
        usedPhysicalMemory: 0, totalPhysicalMemory: 1
      },
      timer: null,
      gcLoading: false,
      drawerVisible: false,
      threadDump: [],
      tuneDialogVisible: false,
      // GC Log State
      gcLogVisible: false,
      gcLogContent: '',
      gcLogLoading: false,
      logLines: 200, //日志行数

      // Heap Dump State
      heapDumpVisible: false,
      heapDumps: [],
      heapDumpLoading: false,
      generatingDump: false,

      tuneForm: {
        action: 'restart_with_new_args',
        flag: '+PrintGCDetails',
        xmx: '2048m',
        newRatio: '2'
      },
      heapChartInstance: null,
      cpuChartInstance: null,
      serverMemChartInstance: null,
      combinedRateChartInstance: null,
      customColors: [
        {color: '#c4b5fd', percentage: 20},
        {color: '#8b5cf6', percentage: 40},
        {color: '#3b82f6', percentage: 60},
        {color: '#e6a23c', percentage: 80},
        {color: '#f56c6c', percentage: 100}
      ]
    };
  },
  mounted() {
    this.initCharts();
    this.fetchMetrics();
    this.timer = setInterval(this.fetchMetrics, 3000);
    window.addEventListener('resize', this.resizeCharts);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener('resize', this.resizeCharts);
    if (this.heapChartInstance) this.heapChartInstance.dispose();
    if (this.cpuChartInstance) this.cpuChartInstance.dispose();
    if (this.serverMemChartInstance) this.serverMemChartInstance.dispose();
    if (this.combinedRateChartInstance) this.combinedRateChartInstance.dispose();
  },
  computed: {
    swRegistered() {
      return this.$store.getters.swRegistered;
    }
  },
  methods: {
    initCharts() {
      this.heapChartInstance = echarts.init(this.$refs.heapChart);
      this.cpuChartInstance = echarts.init(this.$refs.cpuChart);
      this.serverMemChartInstance = echarts.init(this.$refs.serverMemChart);
      this.combinedRateChartInstance = echarts.init(this.$refs.combinedRateChart);

      const commonOptions = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: [] }
      };

      this.heapChartInstance.setOption({
        ...commonOptions,
        yAxis: { type: 'value', name: 'MB' },
        series: [{
          name: 'Heap Used', type: 'line', smooth: true,
          itemStyle: { color: '#8b5cf6' },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#c4b5fd'}, {offset: 1, color: '#ede9fe'}]) },
          data: []
        }]
      });

      this.cpuChartInstance.setOption({
        ...commonOptions,
        yAxis: { type: 'value', name: '%', max: 100 },
        series: [{
          name: 'CPU Usage', type: 'line', smooth: true,
          itemStyle: { color: '#3b82f6' },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#93c5fd'}, {offset: 1, color: '#eff6ff'}]) },
          data: []
        }]
      });

      this.serverMemChartInstance.setOption({
        ...commonOptions,
        yAxis: { type: 'value', name: 'GB' },
        series: [{
          name: 'Server Mem Used', type: 'line', smooth: true,
          itemStyle: { color: '#10b981' },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#a7f3d0'}, {offset: 1, color: '#ecfdf5'}]) },
          data: []
        }]
      });

      this.combinedRateChartInstance.setOption({
        ...commonOptions,
        legend: { data: ['JVM Memory Rate', 'CPU Memory Rate'], top: 0 },
        yAxis: { type: 'value', name: '%', max: 100 },
        series: [
          {
            name: 'JVM Memory Rate', type: 'line', smooth: true,
            itemStyle: { color: '#8b5cf6' },
            data: []
          },
          {
            name: 'CPU Memory Rate', type: 'line', smooth: true,
            itemStyle: { color: '#3b82f6' },
            data: []
          }
        ]
      });
    },
    updateCharts() {
      const times = this.historyData.map(d => d.time);
      const heapData = this.historyData.map(d => this.formatMB(d.heapUsed));
      const cpuData = this.historyData.map(d => (d.processCpuLoad * 100).toFixed(1));
      const serverMemData = this.historyData.map(d => this.formatGB(d.usedPhysicalMemory));
      const cpuMemRateData = this.historyData.map(d => (d.cpuMemoryUsageRate * 100).toFixed(1));
      const jvmRateData = this.historyData.map(d => (d.jvmMemoryUsageRate * 100).toFixed(1));

      this.heapChartInstance.setOption({
        xAxis: { data: times },
        series: [{ data: heapData }]
      });

      this.cpuChartInstance.setOption({
        xAxis: { data: times },
        series: [{ data: cpuData }]
      });

      this.serverMemChartInstance.setOption({
        xAxis: { data: times },
        series: [{ data: serverMemData }]
      });

      this.combinedRateChartInstance.setOption({
        xAxis: { data: times },
        series: [
          { data: jvmRateData },
          { data: cpuMemRateData }
        ]
      });
    },
    async fetchMetrics() {
      try {
        const res = await getMetrics();
        this.currentData = res.data;

        const now = new Date();
        const timeStr = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        this.historyData.push({ time: timeStr, ...res.data });
        if (this.historyData.length > 20) {
          this.historyData.shift();
        }
        this.updateCharts();
      } catch (error) {
        console.error('获取指标失败', error);
      }
    },
    async triggerGC() {
      this.$confirm(`确定要System GC吗？`, '警告', { type: 'warning' }).then(async () => {
        this.gcLoading = true;
        try {
          await systemGC();
          this.$message.success('GC 请求已发送，正在清理堆栈碎片');
          setTimeout(this.fetchMetrics, 3000);
        } catch (error) {
          this.$message.error('GC 触发失败');
        } finally {
          this.gcLoading = false;
        }
      }).catch(() => {});
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
    // ================= GC Log Methods =================
    openGcLogDialog() {
      this.gcLogVisible = true;
      this.fetchGcLog();
    },
    async fetchGcLog() {
      this.gcLogLoading = true;
      try {
        const res = await getGCLog({lines: this.logLines});
        if (res.data.error) {
          this.$message.warning(res.data.error);
        } else {
          this.gcLogContent = res.data.content;
        }
      } catch (error) {
        this.$message.error('Failed to fetch GC logs');
      } finally {
        this.gcLogLoading = false;
      }
    },
    downloadGcLog() {
      dlGCLogFile();
    },

    // ================= Heap Dump Methods =================
    openHeapDumpDialog() {
      this.heapDumpVisible = true;
      this.fetchHeapDumps();
    },
    async fetchHeapDumps() {
      this.heapDumpLoading = true;
      try {
        const res = await getHeapDump();
        // const res2 = JSON.parse(JSON.stringify(res));
        this.heapDumps = res.data;
        // this.$nextTick(() => {});
      } catch (error) {
        this.$message.error('Failed to fetch Heap Dumps list');
      } finally {
        this.heapDumpLoading = false;
      }
    },
    async generateHeapDump() {
      this.generatingDump = true;
      try {
        const res = await generateHeapDump();
        if (res.data.status === 'success') {
          this.$message.success(res.data.message);
          this.fetchHeapDumps(); // Refresh list
        } else {
          this.$message.error(res.data.message);
        }
      } catch (error) {
        this.$message.error('Failed to generate Heap Dump. Note: This operation can be very slow and pause the JVM.');
      } finally {
        this.generatingDump = false;
      }
    },
    downloadHeapDump(fileName) {
      dlHeapDumpFile(fileName, this.swRegistered);
    },
    async submitTune() {
      try {
        const res = await submitLinuxTune(this.tuneForm);
        if (res.code === 200 || res.msg) {
          this.$message.success({
            message: res.data.message || '命令执行成功: ' + res.data.command,
            duration: 5000
          });
          if (res.data.output) {
            console.log("Command Output:", res.data.output);
          }
        } else {
          this.$message.error(res.data.error || '执行失败');
        }
        this.tuneDialogVisible = false;
      } catch (error) {
        this.$message.error('参数调整请求失败');
      }
    },
    resizeCharts() {
      if (this.heapChartInstance) this.heapChartInstance.resize();
      if (this.cpuChartInstance) this.cpuChartInstance.resize();
      if (this.serverMemChartInstance) this.serverMemChartInstance.resize();
      if (this.combinedRateChartInstance) this.combinedRateChartInstance.resize();
    },
    formatMB(bytes) {
      if (!bytes) return 0;
      return (bytes / 1024 / 1024).toFixed(2);
    },
    formatGB(bytes) {
      if (!bytes) return 0;
      return (bytes / 1024 / 1024 / 1024).toFixed(2);
    },
    formatDate(timestamp) { return new Date(timestamp).toLocaleString(); },
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
  padding: 24px;
  /* background-color: #f3f4f6; */
  min-height: 100vh;
}
.dashboard-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.title {
  margin: 0;
  font-size: 24px;
  /* color: #1f2937; */
  display: flex;
  align-items: center;
  gap: 8px;
}
.actions {
  margin-top: 10px;
}
.mb-4 { margin-bottom: 24px; }
.mt-3 { margin-top: 16px; }

.metric-card {
  border-radius: 12px;
  border: none;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.card-title {
  /* color: #6b7280; */
  font-weight: 500;
  font-size: 14px;
}
.icon-purple { color: #8b5cf6; font-size: 20px; }
.icon-blue { color: #3b82f6; font-size: 20px; }
.icon-green { color: #10b981; font-size: 20px; }
.icon-orange { color: #f59e0b; font-size: 20px; }

.metric-value {
  font-size: 32px;
  font-weight: bold;
  /* color: #1f2937; */
  margin-bottom: 4px;
}
.metric-sub {
  font-size: 12px;
  /* color: #9ca3af; */
}

.chart-card {
  border-radius: 12px;
  border: none;
}
.chart-header {
  font-weight: 600;
  /* color: #374151; */
}

.thread-dump-container {
  padding: 0 24px;
  height: 100%;
  overflow-y: auto;
}
.thread-title {
  font-weight: 600;
  margin-right: 12px;
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden;
  text-overflow: ellipsis; /* 显示省略号 */
}
.stack-trace {
  /* background-color: #1f2937;
  color: #d1d5db; */
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}
.log-container {
  background-color: #1e1e1e;
  border-radius: 4px;
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}
.log-content {
  color: #a6e22e;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  margin: 0;
  white-space: pre-wrap;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
