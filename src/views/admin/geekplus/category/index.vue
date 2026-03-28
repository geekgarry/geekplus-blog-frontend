<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文章分类目录" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="请输入文章分类目录名称" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="文章分类信息" prop="categoryInfo">
        <el-input v-model="queryParams.categoryInfo" placeholder="请输入文章分类目录信息" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="所属父类目录" prop="parentId">
        <el-input v-model="queryParams.parentId" placeholder="请输入所属父类目录" clearable size="small"
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

    <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange" row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="目录ID" align="center" prop="id" /> -->
      <el-table-column label="目录分类" align="center" width="140" show-overflow-tooltip prop="categoryName" />
      <el-table-column label="分类信息" align="center" show-overflow-tooltip prop="categoryInfo" />
      <el-table-column label="菜单类型" align="center" width="100" show-overflow-tooltip prop="menuType">
        <template slot-scope="scope">
          <span v-if="scope.row.menuType == '0'" style="color:#8B0000">父目录</span>
          <span v-else style="color:#13ce66">子目录</span>
        </template>
      </el-table-column>
      <el-table-column label="路由地址" align="center" width="160" show-overflow-tooltip prop="path" />
      <el-table-column label="组件模版" align="center" width="160" show-overflow-tooltip prop="component" />
      <!-- <el-table-column label="目录图标" align="center" width="100" prop="icon" >
        <template slot-scope="scope">
          <span style="color:#8B0000"><i :class="scope.row.icon"></i></span>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="权限" align="center" prop="permission" /> -->
      <el-table-column label="优先级" align="center" width="120" prop="priorityId" />
      <el-table-column label="创建时间" align="center" show-overflow-tooltip prop="createTime" />
      <el-table-column label="更新时间" align="center" show-overflow-tooltip prop="updateTime" />
      <el-table-column label="操作" align="center" width="120" fixed="right" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" v-if="scope.row.menuType == 0"
            @click="handleAdd(scope.row)">添加</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    /> -->

    <!-- 添加或修改文章类型目录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="目录分类" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入文章类型目录名称" />
        </el-form-item>
        <el-form-item label="目录信息" prop="categoryInfo">
          <el-input v-model="form.categoryInfo" placeholder="请输入文章类型目录信息" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="请输入目录菜单路由，父目录路径需要带/" />
        </el-form-item>
        <el-form-item label="菜单权限" prop="permission">
          <el-input v-model="form.permission" placeholder="请输入目录菜单权限" />
        </el-form-item>
        <!-- <el-form-item label="目录" v-if="categoryType==='addcategory'">
          <el-radio-group v-model="form.menuType">
            <el-radio label="category" value="0" >父目录</el-radio>
            <el-radio label="menu" value="1" @change="getParentCategoryList" >子菜单</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <!-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% -->
        <el-form-item label="分类目录" v-if="categoryType === 'menu'" prop="parentId">
          <el-select v-model="form.parentId" placeholder="请选择所属目录" :disabled="onlyread">
            <el-option v-for="(item, index) in parentCategoryList" :key="index" :label="item.categoryName"
              :value="item.id" />
            <!-- <el-option label="子目录"  value='1' /> -->
          </el-select>
        </el-form-item>
        <!-- <el-form-item v-if="isParent==='noparent'" label="目录菜单组件地址" prop="component">
          <el-input v-model="form.component" placeholder="请输入目录菜单组件地址,路径需要带/" />
        </el-form-item> -->
        <!-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% -->
        <!-- <el-form-item v-if="form.menuType == '0'" label="所属父目录" prop="parentId">
          <el-select v-model="form.parentId" placeholder="请选择所属目录" :disabled="onlyread" >
            <el-option v-for="(item,index) in parentCategoryList" :key="index" :label="item.categoryName" :value="item.id" />
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item v-if="categoryType === 'menu'" label="目录菜单组件地址" prop="component">
          <el-input v-model="form.component" placeholder="请输入目录菜单组件地址,路径需要带/" />
        </el-form-item> -->
        <!-- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% -->
        <!-- <el-form-item label="目录菜单类型" prop="menuType">
          <el-input v-model="form.menuType" placeholder="目录菜单类型" />
        </el-form-item> -->
        <el-form-item label="组件地址" prop="component">
          <el-select v-model="form.component" placeholder="请选择目录分类页面组件模版">
            <el-option label="一般样式" value="article-list/index.vue" />
            <el-option label="卡片样式" value="article-list/card.vue" />
            <el-option label="简单样式" value="article-list/simple.vue" />
          </el-select>
          <!-- <el-input v-model="form.component" placeholder="请输入目录菜单组件地址,路径前都不需要" /> -->
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
            <IconSelect ref="iconSelect" @selected="selected" />
            <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" clearable>
              <svg-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class="el-input__icon"
                style="height: 32px;width: 16px;" />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
          <!-- <el-input v-model="form.icon" placeholder="请输入目录菜单图标字符" /> -->
          <!-- <i :class="form.icon"></i> -->
        </el-form-item>
        <el-form-item label="优先级" prop="priorityId">
          <el-input v-model="form.priorityId" placeholder="请输入大于1的整数，越小优先级越大" />
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
import { listCategory, getCategory, delCategory, addCategory, updateCategory, exportCategory, listParentCategory } from "@/api/geekplus/category";
import IconSelect from "@/components/IconSelect";
// import { toStatement } from "@babel/types";

export default {
  name: "Category",
  components: {
    IconSelect
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
      // 文章类型目录表格数据
      categoryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryName: null,
        categoryInfo: null,
        parentId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      categoryType: '',
      parentCategoryList: [],
      onlyread: false,
    };
  },
  created() {
    this.getList();
    this.getParentCategoryList();
  },
  watch: {

  },
  computed: {

  },
  methods: {
    /** 查询文章类型目录列表 */
    getList() {
      this.loading = true;
      listCategory(this.queryParams).then(response => {
        //console.log(response.data)
        this.categoryList = this.handleTree(response.data, "id");
        //this.total = response.total;
        this.loading = false;
      });
    },
    getParentCategoryList() {
      listParentCategory().then(response => {
        //console.log(response);
        this.parentCategoryList = response.data;
        //this.$message({message:response.msg,type:'success'})
      }).catch(error => {
        console.log(error);
        this.$message({ message: error.msg, type: 'error' })
      })
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
        categoryName: null,
        categoryInfo: null,
        parentId: null,
        path: null,
        permission: null,
        component: null,
        priorityId: null,
        menuType: null,
        icon: undefined
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
    handleAdd(row) {
      this.reset();
      this.categoryType = 'category';
      this.form.menuType = 0;
      if (row && row.menuType == 0) {
        this.categoryType = 'menu'
        this.form.menuType = 1;
        this.form.parentId = row.id;
      }
      //console.log(this.form.menuType)
      this.open = true;
      this.title = "添加文章类型目录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.categoryType = ''
      if (row.parentId == 0) {
        this.categoryType = 'category'
      } else {
        this.categoryType = 'menu'
        // this.getParentCategoryList();
      }
      this.reset();
      const id = row.id || this.ids
      getCategory(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改文章类型目录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCategory(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCategory(this.form).then(response => {
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
      this.$confirm('是否确认删除文章类型目录编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delCategory(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有文章类型目录数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportCategory(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    // 选择图标
    selected(name) {
      this.form.icon = name;
    }
  }
};
</script>
