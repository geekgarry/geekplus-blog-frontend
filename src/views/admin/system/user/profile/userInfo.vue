<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="用户名称" prop="username">
      <el-input v-model="form.username" maxlength="30" placeholder="登录用户名" />
    </el-form-item>
    <el-form-item label="用户昵称" prop="nickname">
      <el-input v-model="form.nickname" />
    </el-form-item>
    <el-form-item v-if="isBlogSiteAdmin()" label="所属部门" prop="deptId">
      <treeselect
        v-model="form.deptId"
        :options="deptOptions"
        :normalizer="normalizer"
        :show-count="true"
        placeholder="请选择归属部门"
      />
    </el-form-item>
    <el-form-item label="手机号码" prop="phoneNumber">
      <el-input v-model="form.phoneNumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="form.gender">
        <el-radio :label="0">男</el-radio>
        <el-radio :label="1">女</el-radio>
        <el-radio :label="2">未知</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="个人备注" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" :loading="saving" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserProfile } from "@/api/system/user";
import { deptTreeSelect } from "@/api/system/dept";
import { isBlogSiteAdmin } from "@/utils/blogAdmin";

export default {
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      saving: false,
      deptOptions: [],
      form: {
        userId: undefined,
        username: undefined,
        nickname: undefined,
        deptId: undefined,
        phoneNumber: undefined,
        email: undefined,
        gender: 0,
        remark: undefined,
      },
      rules: {
        username: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          { min: 2, max: 30, message: "长度在 2 到 30 个字符", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
            message: "用户名只能包含字母、数字、下划线或中文",
            trigger: "blur",
          },
        ],
        nickname: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" },
        ],
        email: [
          { required: true, message: "邮箱地址不能为空", trigger: "blur" },
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        phoneNumber: [
          { required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
    };
  },
  watch: {
    user: {
      immediate: true,
      deep: true,
      handler(val) {
        if (!val) return;
        this.form = {
          userId: val.userId,
          username: val.username,
          nickname: val.nickname,
          deptId: val.deptId,
          phoneNumber: val.phoneNumber,
          email: val.email,
          gender: val.gender,
          remark: val.remark,
        };
      },
    },
  },
  created() {
    this.getListDeptOptions();
  },
  methods: {
    isBlogSiteAdmin,
    submit() {
      this.$refs["form"].validate((valid) => {
        if (!valid) return;
        this.$confirm(
          "修改个人资料后需重新登录，是否继续？",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            this.saving = true;
            return updateUserProfile(this.form);
          })
          .then((response) => {
            this.msgSuccess(response.msg || "修改成功，请重新登录");
            const redirect = this.$route.fullPath;
            return this.$store.dispatch("user/logout").then(() => {
              this.$router.push({
                path: "/login",
                query: { redirect },
              });
            });
          })
          .catch(() => {})
          .then(() => {
            this.saving = false;
          });
      });
    },
    getListDeptOptions() {
      deptTreeSelect().then((res) => {
        this.deptOptions = res.data;
      });
    },
    normalizer(node) {
      if (node.children == null || node.children == "null" || node.children.length == 0) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      };
    },
    close() {
      this.$store.dispatch("tagsView/delView", this.$route);
      const fallback = "/admin/dashboard";
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push({ path: fallback });
      }
    },
  },
};
</script>
