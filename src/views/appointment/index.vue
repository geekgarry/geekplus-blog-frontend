<template>
  <div class="appointment-page">
    <el-card>
      <h2>预约管理</h2>

      <!-- 新建预约表单 -->
      <el-form :inline="true" :model="form">
        <el-form-item label="用户ID">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="任务内容">
          <el-input v-model="form.payload" placeholder="任务描述" />
        </el-form-item>
        <el-form-item label="执行时间">
          <el-date-picker
            v-model="form.scheduleAt"
            type="datetime"
            placeholder="选择执行时间"
            value-format="yyyy-MM-dd'T'HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createAppointment">创建预约</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card style="margin-top: 20px;">
      <h3>任务列表</h3>
      <el-table :data="appointments" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="payload" label="任务内容" />
        <el-table-column prop="scheduleAt" label="执行时间" width="180" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="380">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="warning"
              @click="pause(scope.row.id)"
              :disabled="scope.row.status !== 'SCHEDULED'"
            >
              暂停
            </el-button>
            <el-button
              size="mini"
              type="success"
              @click="resume(scope.row.id)"
              :disabled="scope.row.status !== 'PAUSED'"
            >
              恢复
            </el-button>
            <el-button
              size="mini"
              type="info"
              @click="cancel(scope.row.id)"
              :disabled="scope.row.status === 'DONE' || scope.row.status === 'CANCELLED'"
            >
              取消
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="remove(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AppointmentPage",
  data() {
    return {
      form: {
        userId: "",
        payload: "",
        scheduleAt: "",
      },
      appointments: [],
    };
  },
  created() {
    this.loadAppointments();
  },
  methods: {
    async loadAppointments() {
      const res = await axios.get("/tool/user/appointment/list");
      this.appointments = res.data;
    },
    async createAppointment() {
      if (!this.form.userId || !this.form.payload || !this.form.scheduleAt) {
        this.$message.error("请填写完整表单");
        return;
      }
      await axios.post("/tool/user/appointment", this.form);
      this.$message.success("创建成功");
      this.loadAppointments();
    },
    async pause(id) {
      await axios.post(`/tool/user/appointment/${id}/pause`);
      this.$message.warning("已暂停");
      this.loadAppointments();
    },
    async resume(id) {
      await axios.post(`/tool/user/appointment/${id}/resume`);
      this.$message.success("已恢复");
      this.loadAppointments();
    },
    async cancel(id) {
      await axios.post(`/tool/user/appointment/${id}/cancel`);
      this.$message.info("已取消");
      this.loadAppointments();
    },
    async remove(id) {
      await axios.delete(`/tool/user/appointment/${id}`);
      this.$message.error("已删除");
      this.loadAppointments();
    },
  },
};
</script>

<style scoped>
.appointment-page {
  padding: 20px;
}
</style>
