<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="97px">
      <el-form-item label="链接网站地址" prop="linkUrl">
        <el-input
          v-model="queryParams.linkUrl"
          placeholder="请输入网站地址"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="网站名称" prop="linkName">
        <el-input
          v-model="queryParams.linkName"
          placeholder="请输入链接网站名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="链接简介" prop="linkIntro">
        <el-input
          v-model="queryParams.linkIntro"
          placeholder="请输入链接简介"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="链接申请理由" prop="appReason">
        <el-input
          v-model="queryParams.appReason"
          placeholder="请输入链接申请理由"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="linkList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" fixed align="center" />
      <!-- <el-table-column label="网站友情链接ID" align="center" prop="id" /> -->
      <el-table-column label="链接地址" align="center" width="130" show-overflow-tooltip prop="linkUrl" />
      <el-table-column label="链接网站名称" align="center" width="120" show-overflow-tooltip prop="linkName" />
      <el-table-column label="链接简介" align="center" width="140" show-overflow-tooltip prop="linkIntro" />
      <el-table-column label="链接申请理由" align="center" width="130" show-overflow-tooltip prop="appReason" />
      <el-table-column label="展示链接" align="center" width="110" show-overflow-tooltip prop="isDisplay" >
        <template slot-scope="scope">
          <span v-if="scope.row.isDisplay=='0'" style="color:#8B0000">不展示</span>
          <span v-if="scope.row.isDisplay=='1'" style="color:#13ce66">展示</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="120" show-overflow-tooltip prop="createTime" />
      <el-table-column label="更新时间" align="center" width="120" show-overflow-tooltip prop="updateTime" />
      <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改网站友情链接对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="链接地址" prop="linkUrl">
          <el-input v-model="form.linkUrl" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="链接网站名称" prop="linkName">
          <el-input v-model="form.linkName" placeholder="请输入链接网站名称" />
        </el-form-item>
        <el-form-item label="链接简介" prop="linkIntro">
          <el-input v-model="form.linkIntro" placeholder="请输入链接简介" />
        </el-form-item>
        <el-form-item label="链接申请理由" prop="appReason">
          <el-input v-model="form.appReason" placeholder="请输入链接申请理由" />
        </el-form-item>
        <el-form-item label="首页显示链接" >
          <!-- <el-input v-model="form.workVisible" placeholder="请输入0（展示在简历中）或1（不展示）" :disabled="onlyread" /> -->
          <el-select v-model="form.isDisplay" placeholder="请选择是否首页展示" :disabled="onlyread" >
            <el-option label="不展示" value='0' />
            <el-option label="展示" value='1' />
          </el-select>
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
import { displayFriendlyLink, listLink, getLink, delLink, addLink, updateLink, exportLink } from "@/api/geekplus/link";

export default {
  name: "Link",
  components: {
  },
  data() {
    return {
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
      // 网站友情链接表格数据
      linkList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      onlyread:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        linkUrl: null,
        linkName: null,
        linkIntro: null,
        appReason: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询网站友情链接列表 */
    getList() {
      this.loading = true;
      listLink(this.queryParams).then(response => {
        this.linkList = response.rows;
        this.total = response.total;
        this.loading = false;
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
        linkUrl: null,
        linkName: null,
        linkIntro: null,
        appReason: null
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加网站友情链接";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getLink(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改网站友情链接";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateLink(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLink(this.form).then(response => {
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
      this.$confirm('是否确认删除网站友情链接编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delLink(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有网站友情链接数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportLink(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
