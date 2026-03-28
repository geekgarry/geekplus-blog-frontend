<template>
  <div>
    <el-button
      size="mini"
      type="text"
      icon="el-icon-view"
      @click="tableColumnDialogOpen(tableInfo)"
      >列表项</el-button
    >
    <!--查询数据表的列表项-->
    <el-dialog
      :title="tableColumnTitle"
      :visible.sync="tableColumnOpen"
      width="600px"
      append-to-body
    >
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="success"
            icon="el-icon-plus"
            size="mini"
            @click="handleTableColumnAdd"
            >新增列表项</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            icon="el-icon-edit"
            size="mini"
            :disabled="singleColumn"
            @click="handleTableColumnUpdate"
            >修改</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multipleColumn"
            @click="handleTableColumnDelete"
            >删除</el-button
          >
        </el-col>
        <right-toolbar @queryTable="getTableColumnList"></right-toolbar>
      </el-row>
      <el-table
        v-loading="tableColumnloading"
        :data="tableColumnList"
        @selection-change="handleTableColumnSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="列表ID" align="center" prop="columnId" />
        <el-table-column label="列表名称" align="center" prop="columnName" />
        <el-table-column label="是否主键" align="center" prop="isPk" />
        <el-table-column label="是否自增" align="center" prop="isIncrement" />
        <el-table-column label="是否必须" align="center" prop="isRequired" />
        <el-table-column
          label="列表注释"
          align="center"
          show-overflow-tooltip
          prop="columnComment"
        />
        <el-table-column label="列表类型" align="center" prop="columnType" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="关联表的ID" align="center" prop="tableId" />
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
          width="120"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleTableColumnUpdate(scope.row)"
              >修改</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleTableColumnDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="tableColumnTotal > 0"
        :total="tableColumnTotal"
        :page.sync="queryColumnParams.pageNum"
        :limit.sync="queryColumnParams.pageSize"
        @pagination="getTableColumnList"
      />
    </el-dialog>

    <!-- 添加或修改列表项数据对话框 -->
    <el-dialog
      :title="tableColumnInfoTitle"
      :visible.sync="tableColumnInfoOpen"
      width="780px"
      append-to-body
    >
      <el-form
        ref="tableColumnInfoForm"
        :model="tableColumnForm"
        :rules="tableColumnRules"
        label-width="80px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="列表名称" prop="columnName">
              <el-input
                v-model="tableColumnForm.columnName"
                placeholder="请输入列表名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否主键" prop="isPk">
              <el-select v-model="tableColumnForm.isPk" placeholder="请选择">
                <el-option label="非主键" value="0"></el-option>
                <el-option label="主键" value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否自增" prop="isIncrement">
              <el-select
                v-model="tableColumnForm.isIncrement"
                placeholder="请选择"
              >
                <el-option label="不自增" value="0"></el-option>
                <el-option label="自增" value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否必须" prop="isRequired">
              <el-select
                v-model="tableColumnForm.isRequired"
                placeholder="请选择"
              >
                <el-option label="非必须" value="0"></el-option>
                <el-option label="必须" value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="列表注释" prop="columnComment">
              <el-input
                v-model="tableColumnForm.columnComment"
                placeholder="请输入列表注释"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="列表类型" prop="columnType">
              <el-input
                v-model="tableColumnForm.columnType"
                placeholder="请输入列表类型"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="tableColumnForm.sort"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表格ID" prop="tableId" aria-readonly="true">
              <el-input
                v-model="tableColumnForm.tableId"
                placeholder="关联表的ID"
                readonly
              />
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
        <el-button type="primary" @click="submitTableColumnForm"
          >确 定</el-button
        >
        <el-button @click="tableColumnCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listGenTableColumn, getGenTableColumn, delGenTableColumn, addGenTableColumn, updateGenTableColumn, exportGenTableColumn } from "@/api/tool/tableColumn";
export default {
  name: "GenTableColumn",
  props:{
    tableInfo: {
      required: true,
      type: Object,
      default: null
    },
  },
  data() {
    return {
      onlyread: false,
      tableColumnOpen: false,
      tableColumnInfoOpen: false,
      tableColumnloading: false,
      tableColumnTitle: '',
      tableColumnInfoTitle: '',
      tableColumnTotal: 0,
      tableColumnList: [],
      columnIds: [],
      singleColumn: true,
      multipleColumn: true,
      tableId: undefined,
      queryColumnParams: {
        pageNum: 1,
        pageSize: 10,
        columnId: undefined,
        columnName: undefined,
        isPk: undefined,
        isIncrement: undefined,
        isRequired: undefined,
        columnComment: undefined,
        columnType: undefined,
        sort: undefined,
        tableId: undefined,
      },
      // 表单参数
      tableColumnForm: {},
      // 表单校验
      tableColumnRules: {
        columnId: [
          { required: true, message: "列表ID不能为空", trigger: "change" }
        ],
        columnName: [
          { required: true, message: "列表名称不能为空", trigger: "blur" }
        ],
        isPk: [
          { required: true, message: "是否主键不能为空", trigger: "change" }
        ],
        isIncrement: [
          { required: true, message: "是否自增不能为空", trigger: "change" }
        ],
        isRequired: [
          { required: true, message: "是否必须不能为空", trigger: "change" }
        ],
        columnComment: [
          { required: true, message: "列表注释不能为空", trigger: "blur" }
        ],
        columnType: [
          { required: true, message: "列表类型不能为空", trigger: "blur" }
        ],
        sort: [
          { required: true, message: "排序不能为空", trigger: "change" }
        ],
        tableId: [
          { required: true, message: "关联表的ID不能为空", trigger: "change" }
        ]
      }
    }
  },
  created() {
    
  },
  methods: {
    //查询数据表列表项
    getTableColumnList() {
      this.tableColumnloading = true;
      listGenTableColumn(this.queryColumnParams).then(response => {
        this.tableColumnList = response.rows;
        this.tableColumnTotal = response.total;
        this.tableColumnloading = false;
      });
    },
    /**查看数据表列表项*/
    tableColumnDialogOpen(row) {
      this.tableId = row.tableId;
      this.queryColumnParams.tableId = this.tableId;
      this.queryColumnParams.pageNum=1;
      this.getTableColumnList();
      this.tableColumnOpen = true;
      this.tableColumnTitle = "数据表列表项";
    },
    // 数据列表项取消按钮
    tableColumnCancel() {
      this.tableColumnInfoOpen = false;
      this.tableColumnReset();
    },
    // 表单重置
    tableColumnReset() {
      this.form = {
        columnId: undefined,
        columnName: undefined,
        isPk: undefined,
        isIncrement: undefined,
        isRequired: undefined,
        columnComment: undefined,
        columnType: undefined,
        sort: undefined,
        tableId: undefined,
      };
      this.resetForm("tableColumnInfoForm");
    },
    // 多选框选中数据
    handleTableColumnSelectionChange(selection) {
      this.columnIds = selection.map(item => item.columnId)
      this.singleColumn = selection.length != 1
      this.multipleColumn = !selection.length
    },
    /** 修改按钮操作 */
    handleTableColumnUpdate(row) {
      this.tableColumnReset();
      const id = row.columnId || this.columnIds[0]
      getGenTableColumn({ columnId: id }).then(response => {
        this.tableColumnForm = response.data;
        this.tableColumnInfoOpen = true;
        this.tableColumnInfoTitle = "修改列表项数据";
      });
    },
    //新增表格列表项
    handleTableColumnAdd() {
      this.tableColumnReset();
      this.tableColumnInfoOpen = true;
      this.tableColumnInfoTitle = "添加列表项数据";
      this.tableColumnForm.tableId = this.tableId;
    },
    /** 提交按钮 */
    submitTableColumnForm: function () {
      this.$refs["tableColumnInfoForm"].validate(valid => {
        if (valid) {
          if (this.tableColumnForm.columnId != undefined) {
            updateGenTableColumn(this.tableColumnForm).then(response => {
              this.msgSuccess("修改成功");
              this.tableColumnInfoOpen = false;
              this.getTableColumnList();
            });
          } else {
            addGenTableColumn(this.tableColumnForm).then(response => {
              this.msgSuccess("新增成功");
              this.tableColumnInfoOpen = false;
              this.getTableColumnList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleTableColumnDelete(row) {
      const ids = row.columnId || this.columnIds
      this.$confirm('是否确认删除数据编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delGenTableColumn(ids);
      }).then(() => {
        this.getTableColumnList();
        this.msgSuccess("删除成功");
      })
    },
  }
}
</script>

<style>
</style>