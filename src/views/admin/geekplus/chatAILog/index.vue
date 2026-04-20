<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="AI聊天日志" name="first">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="对话记录ID" prop="userId">
            <el-input v-model="queryParams.chatRecordId" placeholder="请输入对话记录ID" clearable size="small"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable size="small"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="用户IP" prop="userIp">
            <el-input v-model="queryParams.userIp" placeholder="请输入用户IP" clearable size="small"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <!-- <el-form-item label="网络Mac" prop="userMac">
        <el-input
          v-model="queryParams.userMac"
          placeholder="请输入网络Mac"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
          <el-form-item>
            <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single"
              @click="handleUpdate">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple"
              @click="handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
            <!-- v-hasPermi="['function:log:export']" -->
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="主键" align="center" prop="id" width="80" />
          <!-- <el-table-column label="用户ID" align="center" prop="userId" width="70" :show-overflow-tooltip="true" /> -->
          <el-table-column label="聊天ID" align="center" prop="chatRecordId" width="100" :show-overflow-tooltip="true" />
          <el-table-column label="用户名" align="center" prop="username" width="110" :show-overflow-tooltip="true" />
          <el-table-column label="用户IP" align="center" prop="userIp" width="140" :show-overflow-tooltip="true" />
          <el-table-column label="网络Mac" align="center" prop="userMac" width="200" :show-overflow-tooltip="true" />
          <el-table-column label="询问内容" align="center" prop="askContent" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column label="回复内容" align="center" prop="replyContent" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column label="创建日期" align="center" prop="createTime" width="150" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-tab-pane>
      <el-tab-pane label="redis缓存" name="second">

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="reGetRedisChat">刷新缓存</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="redisChatList" @selection-change="handleSelectionChange">
          <!-- <el-table-column type="selection" width="55" align="center" /> -->
          <el-table-column label="聊天记录ID" align="center" prop="historyMsgKey" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column label="聊天内容" align="center" prop="historyMsg" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-delete"
                @click="handleDeleteRedis(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <br/>
      </el-tab-pane>
    </el-tabs>
    <!-- 添加或修改Chatgpt聊天记录日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item> -->
        <el-form-item label="聊天ID" prop="chatRecordId">
          <el-input v-model="form.chatRecordId" placeholder="请输入聊天ID" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="用户IP" prop="userIp">
          <el-input v-model="form.userIp" placeholder="请输入用户IP" />
        </el-form-item>
        <el-form-item label="网络Mac" prop="userMac">
          <el-input v-model="form.userMac" placeholder="请输入网络Mac" />
        </el-form-item>
        <el-form-item label="询问内容">
          <quill-editor v-model="form.askContent" :min-height="192" />
        </el-form-item>
        <el-form-item label="回复内容">
          <quill-editor v-model="form.replyContent" :min-height="192" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listLog, getLog, delLog, addLog, updateLog, exportLog } from "@/api/geekplus/chatAILog";
import { getAllHistoryMessage, deleteOneRedisChat, refreshRedisChat } from "@/api/chatbot/chatbot"
import { mapGetters, mapState } from 'vuex'

export default {
  name: "ChatGPTLog",
  components: {
  },
  data() {
    return {
      activeName: 'first',
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // Chatgpt聊天记录日志
      //表格数据
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        username: null,
        userIp: null,
        userMac: null,
        askContent: null,
        replyContent: null,
        chatRecordId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      redisChatList: []
    };
  },
  created() {
    this.getList();
    this.getRedisChatList();
  },
  computed: {
    ...mapGetters([
      // 'avatar',
      "nickname",
      "username"
    ]),
  },
  methods: {
    handleClick(tab, event) {
      // if(tab.index == '1') {
      //   console.log(tab, event);
      // }
    },
    /** 查询Chatgpt聊天记录日志列表 */
    getList() {
      this.loading = true;
      listLog(this.queryParams).then(response => {
        this.logList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getRedisChatList() {
      getAllHistoryMessage({ username: this.username }).then(res => {
        this.redisChatList = res.data;
      }).catch(err => {
        this.msgError(err);
      });
    },
    handleDeleteRedis(row) {
      deleteOneRedisChat({ historyMsgKey: row.historyMsgKey }).then(res => {
        this.msgSuccess(res.msg);
        this.getRedisChatList();
      }).catch(err => {
        this.msgError(err);
      });
    },
    reGetRedisChat() {
      refreshRedisChat({ username: this.username }).then(res => {
        this.msgSuccess(res.msg);
      }).catch(err => {
        this.msgError(err);
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        userId: null,
        username: null,
        userIp: null,
        userMac: null,
        createTime: null,
        askContent: null,
        replyContent: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加Chatgpt聊天记录日志";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getLog(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改Chatgpt聊天记录日志";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateLog(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLog(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除Chatgpt聊天记录日志编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delLog(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有Chatgpt聊天记录日志数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportLog(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
