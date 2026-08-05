<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:config:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:config:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:config:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-refresh" size="mini" @click="handleRefreshCache"
          v-hasPermi="['system:config:remove']">刷新缓存</el-button>
      </el-col>
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px"
        class="el-form-search">
        <el-form-item label="参数名称" prop="configName" class="el-form-search-item">
          <el-input v-model="queryParams.configName" placeholder="请输入参数名称" clearable size="small" style="width: 140px"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey" class="el-form-search-item">
          <el-input v-model="queryParams.configKey" placeholder="请输入参数键名" clearable size="small" style="width: 140px"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="值类型" prop="valueType" class="el-form-search-item">
          <el-select v-model="queryParams.valueType" placeholder="值类型" clearable size="small" style="width: 120px">
            <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统内置" prop="configType" class="el-form-search-item">
          <el-select v-model="queryParams.configType" placeholder="系统内置" clearable size="small" style="width: 140px">
            <el-option label="是" value="Y"></el-option>
            <el-option label="否" value="N"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="el-form-search-item">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-form-item>
      </el-form>
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数主键" align="center" prop="configId" width="80" />
      <el-table-column label="参数名称" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column label="参数键名" align="center" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column label="值类型" align="center" prop="valueType" width="90">
        <template slot-scope="scope">
          <span>{{ valueTypeLabel(scope.row.valueType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参数键值" align="center" prop="configValue" :show-overflow-tooltip="true" />
      <el-table-column label="系统内置" align="center" prop="configType" width="80">
        <template slot-scope="scope">
          <span v-show="scope.row.configType == 'Y'">是</span>
          <span v-show="scope.row.configType == 'N'">否</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:config:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:config:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="520px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="值类型" prop="valueType">
          <el-select v-model="form.valueType" placeholder="请选择值类型" style="width: 100%" @change="onValueTypeChange">
            <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-switch
            v-if="form.valueType === 'boolean'"
            v-model="boolValue"
            active-text="是 / true"
            inactive-text="否 / false"
          />
          <el-input-number
            v-else-if="form.valueType === 'number'"
            v-model="numberValue"
            controls-position="right"
            style="width: 100%"
          />
          <el-input
            v-else-if="form.valueType === 'text' || form.valueType === 'json'"
            v-model="form.configValue"
            type="textarea"
            :rows="form.valueType === 'json' ? 6 : 4"
            :placeholder="form.valueType === 'json' ? '请输入 JSON' : '请输入多行文本'"
          />
          <el-input
            v-else
            v-model="form.configValue"
            placeholder="请输入参数键值"
          />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio label="Y">是</el-radio>
            <el-radio label="N">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import {
  listConfig,
  getConfig,
  delConfig,
  addConfig,
  updateConfig,
  refreshCache
} from "@/api/system/config";

const VALUE_TYPE_OPTIONS = [
  { value: "string", label: "字符串" },
  { value: "boolean", label: "布尔" },
  { value: "number", label: "数字" },
  { value: "text", label: "长文本" },
  { value: "json", label: "JSON" },
];

function parseBool(val) {
  if (val === true || val === false) return val;
  const s = String(val == null ? "" : val).trim().toLowerCase();
  return s === "true" || s === "y" || s === "1" || s === "yes";
}

export default {
  name: "Config",
  data() {
    return {
      valueTypeOptions: VALUE_TYPE_OPTIONS,
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      configList: [],
      title: "",
      open: false,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configName: undefined,
        configKey: undefined,
        valueType: undefined,
        configType: undefined,
      },
      form: {},
      rules: {
        configName: [
          { required: true, message: "参数名称不能为空", trigger: "blur" },
        ],
        configKey: [
          { required: true, message: "参数键名不能为空", trigger: "blur" },
        ],
        valueType: [
          { required: true, message: "值类型不能为空", trigger: "change" },
        ],
        configValue: [
          {
            validator: (rule, value, callback) => {
              if (this.form.valueType === "boolean") {
                callback();
                return;
              }
              if (value === undefined || value === null || String(value).trim() === "") {
                callback(new Error("参数键值不能为空"));
                return;
              }
              if (this.form.valueType === "json") {
                try {
                  JSON.parse(String(value));
                } catch (e) {
                  callback(new Error("JSON 格式不正确"));
                  return;
                }
              }
              callback();
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    boolValue: {
      get() {
        return parseBool(this.form.configValue);
      },
      set(v) {
        this.$set(this.form, "configValue", v ? "true" : "false");
      },
    },
    numberValue: {
      get() {
        const n = Number(this.form.configValue);
        return Number.isFinite(n) ? n : 0;
      },
      set(v) {
        this.$set(this.form, "configValue", v == null ? "" : String(v));
      },
    },
  },
  created() {
    this.getList();
  },
  methods: {
    valueTypeLabel(type) {
      const hit = this.valueTypeOptions.find((i) => i.value === type);
      return hit ? hit.label : type || "字符串";
    },
    onValueTypeChange(type) {
      if (type === "boolean") {
        this.$set(this.form, "configValue", parseBool(this.form.configValue) ? "true" : "false");
      } else if (type === "number") {
        const n = Number(this.form.configValue);
        this.$set(this.form, "configValue", Number.isFinite(n) ? String(n) : "0");
      }
    },
    getList() {
      this.loading = true;
      listConfig(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.configList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        configId: undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined,
        valueType: "string",
        configType: "Y",
        remark: undefined,
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加参数";
    },
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.configId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    handleUpdate(row) {
      this.reset();
      const query = { configId: row.configId || this.ids[0] };
      getConfig(query).then((response) => {
        const data = response.data || {};
        if (!data.valueType) {
          data.valueType = "string";
        }
        this.form = data;
        this.open = true;
        this.title = "修改参数";
      });
    },
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const payload = { ...this.form };
          if (payload.valueType === "boolean") {
            payload.configValue = parseBool(payload.configValue) ? "true" : "false";
          } else if (payload.valueType === "number") {
            payload.configValue = String(payload.configValue);
          }
          if (payload.configId != undefined) {
            updateConfig(payload).then(() => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addConfig(payload).then(() => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const configIds = row.configId || this.ids;
      this.confirm('是否确认删除参数编号为"' + configIds + '"的数据项？')
        .then(function () {
          return delConfig(configIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    handleExport() {
      this.download(
        "system/config/export",
        {
          ...this.queryParams,
        },
        `config_${new Date().getTime()}.xlsx`
      );
    },
    handleRefreshCache() {
      refreshCache().then(() => {
        this.msgSuccess("刷新成功");
      });
    },
  },
};
</script>
