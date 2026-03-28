<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="用户账号" prop="username">
                <el-input
                    v-model="queryParams.username"
                    placeholder="请输入用户账号"
                    clearable
                    size="small"
                    @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item label="用户昵称" prop="nickname">
                <el-input
                    v-model="queryParams.nickname"
                    placeholder="请输入用户昵称"
                    clearable
                    size="small"
                    @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item label="用户等级" prop="userLevel">
                <el-select v-model="queryParams.userLevel" placeholder="用户等级"
                    clearable size="small">
                    <!-- <el-option
                            v-for="dict in statusOptions"
                            :key="dict.dictValue"
                            :label="dict.dictLabel"
                            :value="dict.dictValue"
                        /> -->
                    <el-option label="普通" :value="0"></el-option>
                    <el-option label="VIP" :value="1"></el-option>
                    <el-option label="SVIP" :value="2"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="用户邮箱" prop="email">
                <el-input
                    v-model="queryParams.email"
                    placeholder="请输入用户邮箱"
                    clearable
                    size="small"
                    @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item label="手机号码" prop="phoneNumber">
                <el-input
                    v-model="queryParams.phoneNumber"
                    placeholder="请输入手机号码"
                    clearable
                    size="small"
                    @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item label="用户性别" prop="gender">
                <el-select v-model="queryParams.gender" placeholder="用户等级"
                    clearable size="small">
                    <!-- <el-option
                            v-for="dict in statusOptions"
                            :key="dict.dictValue"
                            :label="dict.dictLabel"
                            :value="dict.dictValue"
                        /> -->
                    <el-option label="男" :value="0"></el-option>
                    <el-option label="女" :value="1"></el-option>
                    <el-option label="未知" :value="2"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="帐号状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="用户等级"
                    clearable size="small">
                    <!-- <el-option
                            v-for="dict in statusOptions"
                            :key="dict.dictValue"
                            :label="dict.dictLabel"
                            :value="dict.dictValue"
                        /> -->
                    <el-option label="正常" :value="0"></el-option>
                    <el-option label="停用" :value="1"></el-option>
                </el-select>
            </el-form-item>
            <!-- <el-form-item label="删除标志(逻辑删除)" prop="delFlag">
                <el-input
                    v-model="queryParams.delFlag"
                    placeholder="请输入删除标志（0代表存在 1代表删除）"
                    clearable
                    size="small"
                    @keyup.enter.native="handleQuery"
                />
            </el-form-item> -->
            <el-form-item label="登录地址" prop="loginAddress">
                <el-input
                    v-model="queryParams.loginAddress"
                    placeholder="请输入登录地址"
                    clearable
                    size="small"
                    @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
                <el-input
                    v-model="queryParams.remark"
                    placeholder="请输入备注"
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

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="用户ID" align="center" prop="userId" />
            <el-table-column label="用户账号" align="center" prop="username" />
            <el-table-column label="用户昵称" align="center" prop="nickname" />
            <el-table-column label="用户等级" align="center" prop="userLevel" >
                <template slot-scope="scope">
                    <span>{{ scope.row.userLevel == 0 ? '普通' : '会员' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户邮箱" align="center" prop="email" />
            <el-table-column label="手机号码" align="center" prop="phoneNumber" />
            <el-table-column label="用户性别" align="center" prop="gender" >
                <template slot-scope="scope">
                    <span>{{ scope.row.gender == 0 ? '男' : scope.row.gender == 1 ? '女' : '未知' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="头像地址" align="center" prop="avatar" />
            <!-- <el-table-column label="密码" align="center" prop="password" /> -->
            <el-table-column label="帐号状态" align="center" prop="status" >
                <template slot-scope="scope">
                    <span>{{ scope.row.status == 0 ? '正常' : '停用' }}</span>
                </template>
            </el-table-column>
            <!-- <el-table-column label="删除标志" align="center" prop="delFlag" >
                <template slot-scope="scope">
                    <span>{{ scope.row.status == 0 ? '存在' : '删除' }}</span>
                </template>
            </el-table-column> -->
            <el-table-column label="最后登录IP" align="center" prop="loginIp" />
            <el-table-column label="登录地址" align="center" prop="loginAddress" />
            <el-table-column label="最后登录时间" align="center" prop="loginTime" width="100" :show-overflow-tooltip="true" >
                <template slot-scope="scope">
                    <span>{{ dateFormat(scope.row.loginTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="创建者" align="center" prop="createBy" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="100" :show-overflow-tooltip="true" >
                <template slot-scope="scope">
                    <span>{{ dateFormat(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="更新者" align="center" prop="updateBy" />
            <el-table-column label="更新时间" align="center" prop="updateTime" width="100" :show-overflow-tooltip="true" >
                <template slot-scope="scope">
                    <span>{{ dateFormat(scope.row.updateTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" />
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

        <!-- 添加或修改数据对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="780px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="用户账号" prop="username">
                            <el-input v-model="form.username" placeholder="请输入用户账号" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="用户昵称" prop="nickname">
                            <el-input v-model="form.nickname" placeholder="请输入用户昵称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="用户等级" prop="userLevel">
                            <el-select v-model="form.userLevel" placeholder="请选择">
                                <el-option label="普通" :value="0"></el-option>
                                <el-option label="VIP" :value="1"></el-option>
                                <el-option label="SVIP" :value="1"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="用户邮箱" prop="email">
                            <el-input v-model="form.email" placeholder="请输入用户邮箱" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="手机号码" prop="phoneNumber">
                            <el-input v-model="form.phoneNumber" placeholder="请输入手机号码" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="用户性别" prop="gender">
                            <el-select v-model="form.gender" placeholder="请选择">
                                <el-option label="男" :value="0"></el-option>
                                <el-option label="女" :value="1"></el-option>
                                <el-option label="未知" :value="2"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="头像地址" prop="avatar">
                            <el-input v-model="form.avatar" placeholder="请输入头像地址" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="帐号状态" prop="status">
                            <el-select v-model="form.status" placeholder="请选择">
                                <el-option label="正常" :value="0"></el-option>
                                <el-option label="停用" :value="1"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <!-- <el-col :span="12">
                        <el-form-item label="删除标志" prop="delFlag">
                            <el-select v-model="form.delFlag" placeholder="请选择">
                                <el-option label="存在" :value="0"></el-option>
                                <el-option label="已删除" :value="1"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col> -->
                    <el-col :span="12">
                        <el-form-item label="最后登录IP" prop="loginIp">
                            <el-input v-model="form.loginIp" placeholder="请输入最后登录IP" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="登录地址" prop="loginAddress">
                            <el-input v-model="form.loginAddress" placeholder="请输入登录地址" />
                        </el-form-item>
                    </el-col>
                    <!-- <el-col :span="12">
                        <el-form-item label="创建者" prop="createBy">
                            <el-input v-model="form.createBy" placeholder="请输入创建者" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="更新者" prop="updateBy">
                            <el-input v-model="form.updateBy" placeholder="请输入更新者" />
                        </el-form-item>
                    </el-col> -->
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
import { listUsers, getUsers, delUsers, addUsers, updateUsers, exportUsers } from "@/api/geekplus/users";

export default {
    name: "users",
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
            userId: undefined,
            username: undefined,
            nickname: undefined,
            userLevel: undefined,
            email: undefined,
            phoneNumber: undefined,
            gender: undefined,
            avatar: undefined,
            password: undefined,
            status: undefined,
            delFlag: undefined,
            loginIp: undefined,
            loginAddress: undefined,
            loginTime: undefined,
            createBy: undefined,
            createTime: undefined,
            updateBy: undefined,
            updateTime: undefined,
            remark: undefined,
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                username: [
                { required: true, message: "用户账号不能为空", trigger: "blur" }
                ],
                nickname: [
                { required: true, message: "用户昵称不能为空", trigger: "blur" }
                ],
                userLevel: [
                { required: true, message: "默认为0，表示为普通用户（1为vip，2为svip）不能为空", trigger: "change" }
                ],
                email: [
                { required: true, message: "用户邮箱不能为空", trigger: "blur" }
                ],
                phoneNumber: [
                { required: true, message: "手机号码不能为空", trigger: "blur" }
                ],
                gender: [
                { required: true, message: "用户性别（0男 1女 2未知）不能为空", trigger: "change" }
                ],
                avatar: [
                { required: false, message: "头像地址不能为空", trigger: "blur" }
                ],
                password: [
                { required: true, message: "密码不能为空", trigger: "blur" }
                ],
                status: [
                { required: true, message: "帐号状态（0正常 1停用）不能为空", trigger: "change" }
                ],
                delFlag: [
                { required: true, message: "删除标志（0代表存在 2代表删除）不能为空", trigger: "change" }
                ],
                loginIp: [
                { required: false, message: "最后登录IP不能为空", trigger: "blur" }
                ],
                loginAddress: [
                { required: false, message: "登录地址不能为空", trigger: "blur" }
                ],
                createBy: [
                { required: true, message: "创建者不能为空", trigger: "blur" }
                ],
                updateBy: [
                { required: true, message: "更新者不能为空", trigger: "blur" }
                ],
                remark: [
                { required: false, message: "备注不能为空", trigger: "blur" }
                ],
            }
        };
    },
    created() {
        this.getList();
    },
    methods: {
        /** 分页查询数据列表 */
        getList() {
            this.loading = true;
            listUsers(this.queryParams).then(response => {
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
                userId: undefined,
                username: undefined,
                nickname: undefined,
                userLevel: undefined,
                email: undefined,
                phoneNumber: undefined,
                gender: undefined,
                avatar: undefined,
                password: undefined,
                status: undefined,
                delFlag: undefined,
                loginIp: undefined,
                loginAddress: undefined,
                loginTime: undefined,
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
            this.ids = selection.map(item => item.userId)
            this.single = selection.length!=1
            this.multiple = !selection.length
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.open = true;
            this.title = "添加数据信息";
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.userId || this.ids[0]
            getUsers({ userId: id }).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = "修改数据信息";
            });
        },
        /** 提交按钮 */
        submitForm: function() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    if (this.form.userId != undefined) {
                        updateUsers(this.form).then(response => {
                            this.msgSuccess("修改成功");
                            this.open = false;
                            this.getList();
                        });
                    } else {
                        addUsers(this.form).then(response => {
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
            const ids = row.userId || this.ids
            this.$confirm('是否确认删除列表编号为"' + ids + '"的数据项?', "警告", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(function() {
                    return delUsers(ids);
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
            }).then(function() {
                return 'export'+Users(queryParams);
            }).then(response => {
                this.download(response.msg);
            })
        }
    }
};
</script>
