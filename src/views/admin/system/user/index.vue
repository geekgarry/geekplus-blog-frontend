<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="deptName" placeholder="请输入部门名称" clearable size="mini" prefix-icon="el-icon-search"
            style="margin-bottom: 20px" />
        </div>
        <div class="head-container" style="overflow-x: scroll;">
          <el-tree :data="deptOptions" :props="defaultProps" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" default-expand-all @node-click="handleNodeClick" />
        </div>
        <br/>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="queryParams.username" placeholder="请输入用户名称" clearable size="small" style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phoneNumber">
            <el-input v-model="queryParams.phoneNumber" placeholder="请输入手机号码" clearable size="small"
              style="width: 240px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable size="small" style="width: 240px">
              <!-- <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              /> -->
              <el-option label="正常" :value="0"></el-option>
              <el-option label="禁用" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd"
              type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <!-- <el-form-item label="所属部门" prop="deptId">
            <treeselect v-model="queryParams.deptId" :options="deptOptions" :normalizer="normalizer" :show-count="true"
              placeholder="请选择归属部门" />
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
          <!-- <el-col :span="1.5">
            <el-button
              type="info"
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
              >导入</el-button
            >
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table v-loading="listLoading" :data="list" element-loading-text="Loading"
          @selection-change="handleSelectionChange" border fit highlight-current-row>
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column align="center" prop="userId" label="用户ID"></el-table-column>
          <el-table-column label="用户名" align="center">
            <template slot-scope="scope">
              {{ scope.row.username }}
            </template>
          </el-table-column>
          <el-table-column label="用户昵称" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.nickname }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户类型" width="110" align="center" prop="userType" :formatter="userTypeFormat">
            <template slot-scope="scope">
              <span v-if="scope.row.userType == 0">普通人员</span>
              <span v-if="scope.row.userType == 1">系统管理员</span>
              <span v-if="scope.row.userType == 2">网站管理员</span>
              <span v-if="scope.row.userType == 3">开发人员</span>
            </template>
          </el-table-column>
          <el-table-column label="邮箱" align="center">
            <template slot-scope="scope">
              {{ scope.row.email }}
            </template>
          </el-table-column>
          <el-table-column label="性别" align="center">
            <template slot-scope="scope">
              <!-- {{ scope.row.gender == 1 ? "男" : "女" }} -->
              <span v-if="scope.row.gender == 0">男</span>
              <span v-if="scope.row.gender == 1">女</span>
              <span v-if="scope.row.gender == 2">未知</span>
            </template>
          </el-table-column>
          <el-table-column class-name="status-col" label="停止使用" width="110" align="center">
            <template slot-scope="scope">
              <!-- <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag> -->
              <!-- <span>{{ scope.row.status == 0 ? "正常使用" : "暂停禁用" }}</span> -->
              <el-switch :disabled="scope.row.userId === 1 || scope.row.userId === loginUserId"
                v-model="scope.row.status" :active-value="1" :inactive-value="0"
                @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="createTime" label="创建时间" width="180">
            <template slot-scope="scope">
              <i class="el-icon-time" />
              <span>{{ dateFormat(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width" fixed="right">
            <template slot-scope="scope">
              <el-button v-if="scope.row.userId !== 1 || loginUserId === 1" size="mini" type="text" icon="el-icon-edit"
                @click="handleUpdate(scope.row)">修改</el-button>
              <el-button v-if="scope.row.userId !== 1 && scope.row.userId !== loginUserId" size="mini" type="text"
                icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
              <el-button v-if="scope.row.userId !== 1 || loginUserId === 1" size="mini" type="text" icon="el-icon-key"
                @click="handleResetPwd(scope.row)">重置</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
        <!-- <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 15, 20, 25, 30]"
          :small="small"
          :disabled="disabled"
          :background="background"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        /> -->
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px"
        :disabled="isUpdate && form.userId === 1 && loginUserId !== 1">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="请输入用户昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :normalizer="normalizer" :show-count="true"
                placeholder="请选择归属部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phoneNumber">
              <el-input v-model="form.phoneNumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户名称" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择">
                <!-- <el-option
                  v-for="dict in sexOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option> -->
                <el-option label="男" :value="0"></el-option>
                <el-option label="女" :value="1"></el-option>
                <el-option label="未知" :value="2"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status"
                :disabled="isUpdate && (form.userId === 1 || form.userId === loginUserId)">
                <!-- <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                  >{{ dict.dictLabel }}</el-radio
                > -->
                <el-radio :label="0">正常</el-radio>
                <el-radio :label="1">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户类型" prop="userType">
              <el-select v-model="form.userType" placeholder="请选择">
                <!-- <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == 1"
                ></el-option> -->
                <el-option label="普通用户" :value="0"></el-option>
                <el-option label="系统管理" :value="1"></el-option>
                <el-option label="网站管理" :value="2"></el-option>
                <el-option label="开发人员" :value="3"></el-option>
                <el-option label="其他" :value="4"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select multiple v-model="form.roleIds" @change="$forceUpdate($event)" placeholder="请选择" collapse-tags
                clearable>
                <el-option v-for="item in listRole" :key="item.roleId" :label="item.roleName" :value="item.roleId"
                  :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--XXX列表-->
    <!-- <el-dialog
      :title="title"
      :visible.sync="worklistopen"
      width="770px"
      append-to-body
    > -->
    <!-- <el-button-group><el-button type="primary" icon="el-icon-plus" @click="handleWorkAdd" >添加</el-button></el-button-group> -->
    <el-divider></el-divider>
    <!-- <el-table v-loading="loading" :data="workExperienceList" @selection-change="handleSelectionChange"> -->
    <!--        <el-table-column type="selection" width="55" align="center" />-->
    <!--        <el-table-column label="id" align="center" prop="id" />-->
    <!-- </el-table> -->
    <!-- </el-dialog> -->

    <!-- 用户导入对话框 -->
    <!-- <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
          <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
        </div>
        <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import { listUser, getUser, delUser, updateUser, addUser, addUserPwd, resetUserPwd, changeUserStatus, exportUser } from "@/api/system/user";
import { listAllRole, listUserRoles, addUserRoles, batchAddUserRoles, deleteUserRoles, batchDeleteUserRoles } from "@/api/system/role"
import { deptTreeSelect, listDept } from "@/api/system/dept";

export default {
  name: "UserManage",
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "gray",
        deleted: "danger",
      };
      return statusMap[status];
    },
  },
  data() {
    return {
      list: null,
      listLoading: true,
      total: 2,
      queryForm: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: undefined,
        phoneNumber: undefined,
        status: undefined,
        email: undefined
      },
      form: {},
      listRole: [],//角色列表
      roleIds: [],
      // 日期范围
      dateRange: [],
      ids: [],
      title: '',
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      open: false,
      menuOpen: false,
      // 表单校验
      rules: {
        username: [
          { required: true, message: "用户名称不能为空", trigger: "blur" }
        ],
        nickname: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" }
        ],
        groupId: [
          { required: true, message: "归属部门不能为空", trigger: "change" }
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" }
        ],
        email: [
          { required: true, message: "邮箱地址不能为空", trigger: "blur" },
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phoneNumber: [
          { required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ]
      },
      isUpdate: false,
      // 部门名称
      deptName: undefined,
      // 部门树选项,部门列表
      deptOptions: undefined,
      defaultProps: {
        children: "children",
        label: "deptName"
      },
    };
  },
  computed: {
    loginUserId() {
      return this.$store.state.user.userId;
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.getList();
    this.getListDeptOptions();
  },
  methods: {
    /** 查询部门下拉树结构 Treeselect*/
    getListDeptOptions() {
      deptTreeSelect().then(res => {
        this.deptOptions = res.data;//this.handleTree(res.rows, "deptId")
      })
    },
    // 筛选节点
    filterNode(value, data) {

      if (!value) return true;
      return data.deptName.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.deptId;
      this.handleQuery();
    },
    getList() {
      this.listLoading = true;
      listUser(this.queryParams).then((response) => {
        // console.log(response)
        this.list = response.rows;
        this.total = response.total;
        this.listLoading = false;
      });
    },
    getListRoles() {
      listAllRole({}).then((res) => {
        // console.log(res)
        this.listRole = res.rows;
      })
    },
    userTypeFormat(row) {
      var userTypeName;
      switch (row.userType) {
        case '1':
          userTypeName = "系统管理员";
          break;
        case '2':
          userTypeName = "普通用户";
          break;
        case '3':
          userTypeName = "测试用户";
          break;
        case '4':
          userTypeName = "开发者";
          break;
        default:
          userTypeName = "其他用户";
          break;
      }
      return userTypeName;
    },
    /** 转换部门数据结构 */
    normalizer(node) {
      // if (node.children && !node.children.length) {
      if (node.children == null || node.children == 'null' || node.children.length == 0) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      };
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = { pageNum: 1, pageSize: 10};
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        groupId: undefined,
        username: undefined,
        nickname: undefined,
        password: undefined,
        userType: undefined,
        phoneNumber: undefined,
        email: undefined,
        gender: undefined,
        avatar: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: []
      };
      this.resetForm("form");
    },
    // 角色状态修改
    handleStatusChange(row) {
      let text = row.status === 0 ? "解禁" : "禁用";
      this.$confirm('确认要"' + text + '""' + row.username + '"用户吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        // let dataForm = {userId: row.userId, status: row.status}
        return changeUserStatus(row.userId, row.status);
      }).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === 0 ? 1 : 0;
      });
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.isUpdate = false;
      this.title = "添加用户";
      this.getListRoles();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$confirm('是否确认删除用户编号为"' + userIds + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delUser(userIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getListDeptOptions();
      this.getListRoles();
      const userId = { userId: row.userId || this.ids[0] };
      this.isUpdate = true;
      getUser(userId).then(response => {
        // console.log(response)
        this.form = response.data;
        // this.postOptions = response.posts;
        // this.roleOptions = response.roles;
        // this.form.postIds = response.postIds;
        const roleIdArray = this.getUserRoleListRoleId(response.data.sysRoleList);
        this.form.roleIds = roleIdArray;
        this.roleIds = roleIdArray;
        this.open = true;
        this.title = "修改用户";
        this.form.password = "";
      });
    },

    getUserRoleListRoleId(roleList) {
      let roleIds = new Array;
      roleList.forEach(role => {
        roleIds.push(role.roleId);
      })
      return roleIds
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.username + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(({ value }) => {
        resetUserPwd(row.userId, value).then(response => {
          this.msgSuccess("修改成功，新密码是：" + value);
        });
      }).catch(() => { });
    },

    // $forceUpdate(val){
    //   console.log(val);
    // },

    async getUserRoleSize(userId, roleIds) {
      roleIds.forEach(async (roleOneId) => {
        let queryForm = { userId: userId, roleId: roleOneId }
        return listUserRoles(queryForm).then(response => {
          return response.total
        })
      })
    },

    addUserOneRole(userId, roleIds) {
      let listUserRoles = this.buildUserRoleList(userId, roleIds);
      batchAddUserRoles(listUserRoles).then(response => {
        this.msgSuccess("新增角色" + response.msg);
      })
      // roleIds.forEach((roleOneId) => {
      //   let dataForm = { userId: userId, roleId: roleOneId };
      //   addUserRoles(dataForm).then((response) => {
      //     this.msgSuccess("新增角色" + response.msg);
      //   }).catch((error) => {
      //     this.msgError(error.message);
      //   })
      // });
    },

    removeUserRole(userId, roleIds) {
      let listUserRoles = this.buildUserRoleList(userId, roleIds);
      batchDeleteUserRoles(listUserRoles).then(response => {
        this.msgSuccess("回收角色" + response.msg);
      })
      // roleIds.forEach((roleOneId) => {
      //   let queryParams = { userId: userId, roleId: roleOneId }
      //   deleteUserRoles(queryParams).then((response) => {
      //     this.msgSuccess("删除角色" + response.msg);
      //   })
      // })
    },

    //构建要添加的角色菜单权限列表
    buildUserRoleList(userId, roleIds) {
      var userRoleList = new Array();
      //let menuIdListTemp=menuIdList;
      roleIds.forEach((res => {
        userRoleList.push({ userId: userId, roleId: res });
      }))
      return userRoleList
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.userId != undefined) {
            // console.log(this.form)
            updateUser(this.form).then(response => {
              // this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
            // console.log(this.getUserRoleSize(this.form.userId, this.form.roleIds));
            if (this.roleIds == undefined || this.roleIds.length == 0) {
              this.addUserOneRole(this.form.userId, this.form.roleIds)
            } else {
              // 差集 通过两个数组的比较差值，以数据库中的为基准查询比较差值为删除的数据
              var deleteRoles = this.roleIds.filter(item => !this.form.roleIds.includes(item))
              // console.log(addRoles)
              // 通过两个数组的比较差值，以表单中的为基准查询比较差值为添加的数据
              var addRoles = this.form.roleIds.filter(item => !this.roleIds.includes(item))
              // console.log(deleteRoles)
              // let allRoleIds = this.roleIds.filter((item) => {
              //   return this.form.roleIds.every((e) => e != item);
              //   //return tempImageList.indexOf(item) === -1
              // });
              //大于0，开始执行删除
              if (deleteRoles.length > 0) {
                this.removeUserRole(this.form.userId, deleteRoles);
              }
              //大于0，开始执行添加
              if (addRoles.length > 0) {
                this.addUserOneRole(this.form.userId, addRoles);
              }
            }
            // let allTempRoleIds = this.roleIds.filter((item) => {
            //   return allRoleIds.every((e) => e != item);
            // });
            // this.roleIds = allTempRoleIds;
            // batchAddUserRoles(this.form.roleIds).then(response => {
            //   this.msgSuccess("修改成功");
            // })
          } else {
            addUserPwd(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              let userId = response.userId;
              if (this.form.roleIds.length > 0) {//|| this.form.roleIds!=null || this.form.roleIds!='' || this.form.roleIds!=undefined
                this.addUserOneRole(userId, this.form.roleIds)
              } else {
                addUserRoles({ userId: userId, roleId: 2 }).then(res => {
                  this.msgSuccess("添加默认角色成功");
                })
              }
              this.getList();
            });
          }
        }
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有角色数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportUser(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  },
};
</script>
