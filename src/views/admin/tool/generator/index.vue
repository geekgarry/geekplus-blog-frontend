<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="110px"
    >
      <el-form-item label="表格名" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="请输入数据表名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="实体类名" prop="modelName">
        <el-input
          v-model="queryParams.modelName"
          placeholder="请输入实体类名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="java类名" prop="className">
        <el-input
          v-model="queryParams.className"
          placeholder="请输入java类名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="代码功能名" prop="functionName">
        <el-input
          v-model="queryParams.functionName"
          placeholder="请输入代码功能名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="前端模板">
        <el-radio-group v-model="uiType" size="mini">
          <el-radio-button label="element">Element UI</el-radio-button>
          <el-radio-button label="antd">Ant Design Vue</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button
          type="cyan"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="displayTableInfoList"
          >数据表</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleCleanTable"
          >清空</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-truck"
          size="mini"
          :disabled="multiple"
          @click="handleGenCodeByGenTable"
          >统一生成</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          >导出</el-button
        >
      </el-col> -->
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getGenTableList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="genTableList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" fixed />
      <el-table-column label="ID" align="center" width="40" prop="tableId" />
      <el-table-column
        label="数据表名称"
        align="center"
        show-overflow-tooltip
        prop="tableName"
      />
      <el-table-column
        label="数据表描述"
        align="center"
        show-overflow-tooltip
        prop="tableComment"
      />
      <el-table-column
        label="Java类名称"
        align="center"
        show-overflow-tooltip
        prop="className"
      />
      <el-table-column
        label="实体类名称"
        align="center"
        show-overflow-tooltip
        prop="modelName"
      />
      <el-table-column
        label="使用的模板"
        align="center"
        show-overflow-tooltip
        prop="tplCategory"
      />
      <el-table-column
        label="包路径"
        align="center"
        width="130"
        prop="packageName"
      />
      <el-table-column
        label="基础包路径"
        align="center"
        width="130"
        prop="basePackageName"
      />
      <el-table-column
        label="生成模块名"
        align="center"
        show-overflow-tooltip
        prop="moduleName"
      />
      <el-table-column
        label="生成业务名"
        align="center"
        show-overflow-tooltip
        prop="businessName"
      />
      <el-table-column
        label="生成功能名"
        align="center"
        show-overflow-tooltip
        prop="functionName"
      />
      <el-table-column
        label="生成功能作者"
        align="center"
        show-overflow-tooltip
        prop="functionAuthor"
      />
      <el-table-column
        label="其它生成选项"
        align="center"
        show-overflow-tooltip
        prop="other"
      />
      <el-table-column
        label="创建者"
        align="center"
        show-overflow-tooltip
        prop="createBy"
      />
      <el-table-column
        label="创建时间"
        align="center"
        show-overflow-tooltip
        prop="createTime"
      >
        <template slot-scope="scope">
          <span>{{ dateFormat(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="更新者"
        align="center"
        show-overflow-tooltip
        prop="updateBy"
      />
      <el-table-column
        label="更新时间"
        align="center"
        show-overflow-tooltip
        prop="updateTime"
      >
        <template slot-scope="scope">
          <span>{{ dateFormat(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        align="center"
        show-overflow-tooltip
        prop="remark"
      />
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-view"
            @click="handlePreview(scope.row)"
            >预览</el-button
          >
          <el-button
            size="small"
            type="primary"
            icon="el-icon-truck"
            @click="handleGenCodeByGenTable(scope.row)"
            >生成代码</el-button
          >
          <el-button
            size="small"
            type="success"
            icon="el-icon-s-promotion"
            @click="handlePublishMenu(scope.row)"
            >发布菜单</el-button
          >
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="tableColumnDialogOpen(scope.row)"
            >列表项</el-button
          > -->
          <gen-table-column :tableInfo="scope.row"></gen-table-column>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getGenTableList"
    />

    <!-- 添加或修改数据表信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="数据表名称" prop="tableName">
          <el-input v-model="form.tableName" placeholder="请输入数据表名称" />
        </el-form-item>
        <el-form-item label="数据表描述" prop="tableComment">
          <el-input
            v-model="form.tableComment"
            placeholder="请输入数据表描述"
          />
        </el-form-item>
        <el-form-item label="java类名称" prop="className">
          <el-input v-model="form.className" placeholder="请输入java类名称" />
        </el-form-item>
        <el-form-item label="实体类名称" prop="className">
          <el-input v-model="form.modelName" placeholder="请输入实体类名称" />
        </el-form-item>
        <el-form-item label="使用的模板" prop="tplCategory">
          <el-input v-model="form.tplCategory" placeholder="请输入使用的模板" />
        </el-form-item>
        <el-form-item label="生成包路径" prop="packageName">
          <el-input v-model="form.packageName" placeholder="请输入生成包路径" />
        </el-form-item>
        <el-form-item label="基础包路径" prop="basePackageName">
          <el-input
            v-model="form.basePackageName"
            placeholder="请输入生成包路径"
          />
        </el-form-item>
        <el-form-item label="生成模块名" prop="moduleName">
          <el-input v-model="form.moduleName" placeholder="请输入生成模块名" />
        </el-form-item>
        <el-form-item label="生成业务名" prop="businessName">
          <el-input
            v-model="form.businessName"
            placeholder="请输入生成业务名"
          />
        </el-form-item>
        <el-form-item label="生成功能名" prop="functionName">
          <el-input
            v-model="form.functionName"
            placeholder="请输入生成功能名"
          />
        </el-form-item>
        <el-form-item label="代码操作人" prop="functionAuthor">
          <el-input
            v-model="form.functionAuthor"
            placeholder="请输入代码操作人"
          />
        </el-form-item>
        <!-- <el-form-item label="生成代码方式">
          <el-select
            v-model="form.genType"
            placeholder="请选择生成代码方式"
            :disabled="onlyread"
          >
            <el-option label="zip压缩包" value="0" />
            <el-option label="自定义路径" value="1" />
          </el-select>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--查询数据库列表list-->
    <el-dialog
      :title="tableInfoTitle"
      :visible.sync="tableinfolistopen"
      width="600px"
      append-to-body
    >
      <!--数据库列表list-->
      <el-select
        v-model="getTableInfoListType"
        size="small"
        placeholder="选择">
        <el-option label="非系统表" value="0"></el-option>
        <el-option label="所有数据表" value="1"></el-option>
      </el-select>
      <el-button-group>
        <el-button
          type="primary"
          icon="el-icon-view"
          size="small"
          @click="getTableInfoList()"
          >查询</el-button
        >
      </el-button-group>
      <el-divider></el-divider>
      <el-table v-loading="tableLoading" :data="listTableInfo">
        <el-table-column label="数据表名称" align="center" prop="tableName" />
        <el-table-column
          label="数据表描述"
          align="center"
          prop="tableComment"
        />
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
          fixed="right"
          width="200"
        >
          <template slot-scope="scope">
            <el-button
              size="small"
              type="info"
              icon="el-icon-truck"
              @click="handleAddGenTable(scope.row)"
              >生成代码数据表</el-button
            >
            <!-- <el-button
              size="small"
              type="primary"
              icon="el-icon-truck"
              @click="handleGenCode(scope.row)"
              >生成代码</el-button
            > -->
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="tableInfoTotal > 0"
        :total="tableInfoTotal"
        :page.sync="queryTableInfoParams.pageNum"
        :limit.sync="queryTableInfoParams.pageSize"
        @pagination="getTableInfoList"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="tableInfoCancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 代码预览：border-card 标签 + 可横向滚动的代码区 -->
    <el-dialog
      :title="preview.title"
      :visible.sync="preview.open"
      width="85%"
      top="4vh"
      append-to-body
      custom-class="gen-code-preview-dialog"
    >
      <div v-if="previewFileCount" class="gen-code-preview__hint">
        共 {{ previewFileCount }} 个生成文件！
      </div>
      <el-tabs v-model="preview.activeName" type="border-card" class="gen-code-preview__tabs">
        <el-tab-pane
          v-for="(item, key) in preview.data"
          :label="previewTabLabel(item.fileName)"
          :name="previewTabName(item.fileName)"
          :key="key"
        >
          <div class="gen-code-preview__toolbar">
            <span class="gen-code-preview__filename" :title="item.fileName">{{ item.fileName }}</span>
            <el-button
              type="text"
              size="mini"
              class="copy-code-btn"
              :data-clipboard-text="item.fileContent"
              icon="el-icon-document-copy"
            >复制代码</el-button>
          </div>
          <div class="gen-code-preview__scroll">
            <pre class="gen-code-preview__pre"><code class="hljs gen-code-preview__code" v-text="item.fileContent" v-highlight></code></pre>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <gen-publish-dialog ref="publishDialog" />
  </div>
</template>

<script>
import { getListTableInfo, getAllListTableInfo, getTableInfo, listGenTable, getGenTable, delGenTable, cleanGenTable, modifyGenTable, addGenTable, genAddGenTableInfo, previewTableCode, downloadCode, downloadByGenTable } from "@/api/tool/generatorTable"
import { listGenTableColumn, getGenTableColumn, delGenTableColumn, addGenTableColumn, updateGenTableColumn, exportGenTableColumn } from "@/api/tool/tableColumn";
import { downLoadZip } from "@/utils/downloadZip";
import GenTableColumn from "./genTableColumn.vue"
import GenPublishDialog from "./GenPublishDialog.vue"
import Clipboard from 'clipboard';
import lazyLoadDirectives from '@/mixins/lazyLoadDirectives'
export default {
  name: 'Generator',
  mixins: [lazyLoadDirectives],
  components:{
    GenTableColumn,
    GenPublishDialog
  },
  data() {
    return {
      tableinfolistopen: false,
      tableInfoTitle: '',
      tableLoading: true,
      getTableInfoListType: '0',
      listTableInfo: [],
      tableInfoTotal: 0,
      queryTableInfoParams: {
        pageNum: 1,
        pageSize: 10,
      },
      title: '',
      open: false,
      genTableList: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined,
        className: undefined,
        modelName: undefined,
        functionName: undefined,
      },
      form: {},
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      loading: true,
      // 显示搜索条件
      showSearch: true,
      /** 代码生成前端模板：element（默认）| antd */
      uiType: 'element',
      rules: {
        tableName: [
          { required: true, message: "数据表名称不为空", trigger: "blur" }
        ],
        tableComment: [
          { required: true, message: "数据表描述不为空", trigger: "blur" }
        ],
      },
      // 预览参数
      preview: {
        open: false,
        title: "代码预览",
        data: {},
        activeName: "entity",
      },
      // onlyread: false,
      // tableColumnOpen: false,
      // tableColumnInfoOpen: false,
      // tableColumnloading: false,
      // tableColumnTitle: '',
      // tableColumnInfoTitle: '',
      // tableColumnTotal: 0,
      // tableColumnList: [],
      // columnIds: [],
      // singleColumn: false,
      // multipleColumn: false,
      // tableId: undefined,
      // queryColumnParams: {
      //   pageNum: 1,
      //   pageSize: 10,
      //   columnId: undefined,
      //   columnName: undefined,
      //   isPk: undefined,
      //   isIncrement: undefined,
      //   isRequired: undefined,
      //   columnComment: undefined,
      //   columnType: undefined,
      //   sort: undefined,
      //   tableId: undefined,
      // },
      // // 表单参数
      // tableColumnForm: {},
      // // 表单校验
      // tableColumnRules: {
      //   columnId: [
      //     { required: true, message: "列表ID不能为空", trigger: "change" }
      //   ],
      //   columnName: [
      //     { required: true, message: "列表名称不能为空", trigger: "blur" }
      //   ],
      //   isPk: [
      //     { required: true, message: "是否主键不能为空", trigger: "change" }
      //   ],
      //   isIncrement: [
      //     { required: true, message: "是否自增不能为空", trigger: "change" }
      //   ],
      //   isRequired: [
      //     { required: true, message: "是否必须不能为空", trigger: "change" }
      //   ],
      //   columnComment: [
      //     { required: true, message: "列表注释不能为空", trigger: "blur" }
      //   ],
      //   columnType: [
      //     { required: true, message: "列表类型不能为空", trigger: "blur" }
      //   ],
      //   sort: [
      //     { required: true, message: "排序不能为空", trigger: "change" }
      //   ],
      //   tableId: [
      //     { required: true, message: "关联表的ID不能为空", trigger: "change" }
      //   ]
      // }
    }
  },
  computed: {
    /** 预览弹窗顶部文件数提示 */
    previewFileCount() {
      const data = this.preview.data
      return Array.isArray(data) ? data.length : 0
    }
  },
  created() {
    this.getGenTableList();
  },
  mounted() {
    this.clipboard = new Clipboard('.copy-code-btn'); // 注意选择器要和模板中的class匹配
    this.clipboard.on('success', (e) => {
      this.msgSuccess("复制成功"); // 复制成功时的提示信息
      e.clearSelection(); // 清除选择区域，以防页面上出现蓝色选择框的问题
    });
    this.clipboard.on('error', (e) => {
      console.error('Action:', e.action); // 打印出错误信息到控制台，以便调试。例如：'copy'、'cut'等。
      console.error('Trigger:', e.trigger); // 打印出触发事件的元素。例如：'button'、'input'等。
    });
  },
  methods: {
    getTableInfoList() {
      this.tableLoading = true;
      if (this.getTableInfoListType == '0') {
        getListTableInfo(this.queryTableInfoParams).then((response) => {
          this.listTableInfo = response.rows;
          this.tableInfoTotal = response.total;
          this.tableLoading = false;
        })
      } else {
        getAllListTableInfo(this.queryTableInfoParams).then((response) => {
          this.listTableInfo = response.rows;
          this.tableInfoTotal = response.total;
          this.tableLoading = false;
        })
      }
    },
    //查询生成的数据表
    getGenTableList() {
      this.loading = true;
      listGenTable(this.queryParams).then((response) => {
        this.genTableList = response.rows;
        this.total = response.total;
        this.loading = false;
      })
    },
    //查询数据表列表项
    getTableColumnList() {
      this.tableColumnloading = true;
      listGenTableColumn(this.queryColumnParams).then(response => {
        this.tableColumnList = response.rows;
        this.tableColumnTotal = response.total;
        this.tableColumnloading = false;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        tableId: undefined,
        tableName: undefined,
        tableComment: undefined,
        className: undefined,
        modelName: undefined,
        tplCategory: undefined,
        packageName: undefined,
        basePackageName: undefined,
        businessName: undefined,
        functionName: undefined,
        functionAuthor: undefined,
        pkColumn: undefined,
        other: undefined,
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
      this.getGenTableList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    displayTableInfoList() {
      this.tableinfolistopen = true;
      this.tableInfoTitle = "查看数据库表格";
      this.getTableInfoList();
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    tableInfoCancel() {
      this.tableinfolistopen = false;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.tableId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    // 多选框选中数据
    // handleTableColumnSelectionChange(selection) {
    //   this.columnIds = selection.map(item => item.columnId)
    //   this.singleColumn = selection.length != 1
    //   this.multipleColumn = !selection.length
    // },
    //导入生成数据表
    handleAddGenTable(row) {
      let dataForm = { tableName: row.tableName, tableComment: row.tableComment }
      genAddGenTableInfo(dataForm).then(res => {
        this.msgSuccess(res.msg);
        this.getGenTableList();
      }).catch(error => {
        //this.msgSuccess(error.msg)
      })
    },
    /** 复制代码成功 */
    clipboardSuccess() {
      this.msgSuccess("复制成功");
    },
    /** 预览 Tab 唯一 name：去扩展名，兼容 .java/.vue 等非 .ftl */
    previewTabName(fileName) {
      if (!fileName) return 'file'
      const dot = fileName.lastIndexOf('.')
      return dot > 0 ? fileName.slice(0, dot) : fileName
    },
    /** 预览 Tab 展示文案：短名 + 语言后缀 */
    previewTabLabel(fileName) {
      const name = this.previewTabName(fileName)
      if (!fileName || fileName.indexOf('.') < 0) return name
      const ext = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()
      const langMap = { java: 'Java', vue: 'Vue', js: 'JS', xml: 'XML', sql: 'SQL', ftl: '模板' }
      return langMap[ext] ? `${name} · ${langMap[ext]}` : name
    },
    /** 预览按钮 */
    handlePreview(row) {
      previewTableCode(row.tableId, this.uiType).then((response) => {
        const list = response.data || []
        this.preview.data = list
        this.preview.open = true
        if (list.length) {
          this.preview.activeName = this.previewTabName(list[0].fileName)
        }
      });
    },
    //直接生成代码
    handleGenCode(row) {
      downLoadZip("/generator/download/" + row.tableName + "?uiType=" + this.uiType, "geekplus");
    },
    //通过生成表生成代码
    handleGenCodeByGenTable(row) {
      const tableIds = row.tableId || this.ids
      downLoadZip("/generator/downloadByGenTable/" + tableIds + "?uiType=" + this.uiType, "geekplus");
    },
    /** 发布菜单（ZIP 与菜单写入分离，见 docs/lowcode） */
    handlePublishMenu(row) {
      this.$refs.publishDialog.open(row)
    },
    handleDelete(row) {
      const tableIds = row.tableId || this.ids
      this.$confirm('是否确认删除表格编号为"' + tableIds + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delGenTable(tableIds);
      }).then(() => {
        this.getGenTableList();
        this.msgSuccess("删除成功");
      })
    },
    handleCleanTable() {
      this.$confirm('是否确认清空所有生成代码表的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return cleanGenTable();
      }).then(() => {
        this.getGenTableList();
        this.msgSuccess("清空成功");
      })
    },
    handleUpdate(row) {
      this.reset();
      const tableId = row.tableId || this.ids[0]
      getGenTable({ tableId: tableId }).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据表信息";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.tableId != undefined) {
            modifyGenTable(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getGenTableList();
            });
          } else {
            addGenTable(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getGenTableList();
            });
          }
        }
      });
    },
    handleExport() {

    },
  },
  beforeDestroy() { // 组件销毁前移除事件监听器，防止内存泄漏。
    this.clipboard.destroy(); // 销毁Clipboard实例。
  }
}
</script>

<style>
</style>
