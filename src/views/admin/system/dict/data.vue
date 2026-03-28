<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input v-model="queryParams.dictLabel" placeholder="请输入字典标签" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="字典键值" prop="dictValue">
        <el-input v-model="queryParams.dictValue" placeholder="请输入字典键值" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="字典编码" prop="dictCode">
        <el-select v-model="queryParams.dictCode" placeholder="请选择" clearable size="small"
          @keyup.enter.native="handleQuery">
          <el-option v-for="(item,index) in typeOptions" :key="index" :label="item.dictName" :value="item.dictCode"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否默认" prop="isDefault">
        <el-select v-model="queryParams.isDefault" placeholder="请选择" clearable size="small"
          @keyup.enter.native="handleQuery">
          <el-option label="是" value="Y"></el-option>
          <el-option label="否" value="N"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable size="small"
          @keyup.enter.native="handleQuery">
          <el-option label="正常" value="0"></el-option>
          <el-option label="停用" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="queryParams.remark" placeholder="请输入备注" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
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
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典编码" align="center" prop="id" />
      <el-table-column label="字典排序" align="center" prop="dictSort" />
      <el-table-column label="字典标签" align="center" prop="dictLabel" />
      <el-table-column label="字典键值" align="center" prop="dictValue" />
      <el-table-column label="字典编码" align="center" prop="dictCode" />
      <el-table-column label="是否默认（Y是 N否）" align="center" prop="isDefault" />
      <el-table-column label="状态（0正常 1停用）" align="center" prop="status" />
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="100" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ dateFormat(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="100" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ dateFormat(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="780px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="字典标签" prop="dictLabel">
              <el-input v-model="form.dictLabel" placeholder="请输入字典标签" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典键值" prop="dictValue">
              <el-input v-model="form.dictValue" placeholder="请输入字典键值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典编码" prop="dictCode">
              <!-- <el-input v-model="form.dictCode" placeholder="请输入字典编码" /> -->
              <el-select v-model="form.dictCode" placeholder="请选择" clearable size="small">
                <el-option v-for="(item,index) in typeOptions" :key="index" :label="item.dictName" :value="item.dictCode"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否默认" prop="isDefault">
              <el-select v-model="form.isDefault" placeholder="请选择" clearable size="small">
                <el-option label="是" value="Y"></el-option>
                <el-option label="否" value="N"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择" clearable size="small">
                <el-option label="正常" value="0"></el-option>
                <el-option label="停用" value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典排序" prop="dictSort">
              <el-input-number v-model="form.dictSort" :min="1" :max="999" label="请输入排序" clearable
                size="small"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="24">
                      <el-form-item label="">
                        <el-radio-group v-model="">
                          <el-radio :key="" :label="" >radio1</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col> -->
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSysDictData, getSysDictData, delSysDictData, addSysDictData, updateSysDictData, exportSysDictData } from "@/api/system/dict/data";

import { listSysDict, getSysDict } from "@/api/system/dict/index";
export default {
  name: "DictData",
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
      // 数据列表
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      statusOptions: [],
      // 状态数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        dictSort: undefined,
        dictLabel: undefined,
        dictValue: undefined,
        dictCode: undefined,
        isDefault: undefined,
        status: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined,
      },
      dictId: undefined,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictSort: [
          { required: true, message: "字典排序不能为空", trigger: "change" }
        ],
        dictLabel: [
          { required: true, message: "字典标签不能为空", trigger: "blur" }
        ],
        dictValue: [
          { required: true, message: "字典键值不能为空", trigger: "blur" }
        ],
        dictCode: [
          { required: true, message: "字典编码不能为空", trigger: "blur" }
        ],
        isDefault: [
          { required: true, message: "是否默认（Y是 N否）不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态（0正常 1停用）不能为空", trigger: "blur" }
        ],
        createBy: [
          { required: true, message: "创建者不能为空", trigger: "blur" }
        ],
        updateBy: [
          { required: true, message: "更新者不能为空", trigger: "blur" }
        ],
        remark: [
          { required: true, message: "备注不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.dictId = this.$route.params && this.$route.params.dictId;
    this.getDictList();
    this.getList();
  },
  methods: {
    getDictList() {
      listSysDict({pageNum: 1, pageSize: 999}).then((response) => {
        this.typeOptions = response.rows;
      });
    },
    /** 分页查询数据列表 */
    getList() {
      this.loading = true;
      this.queryParams.dictId = this.dictId;
      listSysDictData(this.queryParams).then(response => {
        this.list = response.rows;
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
        id: undefined,
        dictSort: undefined,
        dictLabel: undefined,
        dictValue: undefined,
        dictCode: undefined,
        isDefault: undefined,
        status: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined,
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
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加数据信息";
      const selectedDict = this.typeOptions.filter(item => item.id == this.dictId);
      this.form.dictCode = selectedDict[0].dictCode;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0]
      getSysDictData({ id: id }).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据信息";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateSysDictData(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSysDictData(this.form).then(response => {
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
      const ids = row.id || this.ids
      this.$confirm('是否确认删除列表编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delSysDictData(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有列表数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return 'export' + SysDictData(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
