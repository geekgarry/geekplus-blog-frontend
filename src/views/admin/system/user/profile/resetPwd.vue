<template>
  <el-form
    ref="form"
    class="gp-profile-form"
    :model="user"
    :rules="rules"
    :label-width="formLabelWidth"
    :label-position="formLabelPosition"
  >
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" show-password />
    </el-form-item>
    <el-form-item class="gp-profile-form__actions">
      <el-button type="primary" size="small" :loading="saving" @click="submit">保存</el-button>
      <el-button size="small" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd } from "@/api/system/user";

export default {
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return {
      saving: false,
      viewportW: typeof window !== "undefined" ? window.innerWidth : 1024,
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      },
      rules: {
        oldPassword: [
          { required: true, message: "旧密码不能为空", trigger: "blur" },
        ],
        newPassword: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { required: true, validator: equalToPassword, trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    formLabelWidth() {
      return this.viewportW < 576 ? "auto" : "88px";
    },
    formLabelPosition() {
      return this.viewportW < 576 ? "top" : "right";
    },
  },
  mounted() {
    this._onResize = () => {
      this.viewportW = window.innerWidth;
    };
    window.addEventListener("resize", this._onResize, { passive: true });
  },
  beforeDestroy() {
    if (this._onResize) window.removeEventListener("resize", this._onResize);
  },
  methods: {
    reset() {
      this.user = {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      };
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    },
    submit() {
      this.$refs["form"].validate((valid) => {
        if (!valid) return;
        this.$confirm(
          "修改密码后需重新登录，是否继续？",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            this.saving = true;
            return updateUserPwd(this.user.oldPassword, this.user.newPassword);
          })
          .then(() => {
            this.msgSuccess("密码已修改，请重新登录");
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
    close() {
      this.$store.dispatch("tagsView/delView", this.$route);
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push({ path: "/admin/dashboard" });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.gp-profile-form {
  max-width: 480px;

  ::v-deep .el-form-item__label {
    color: var(--text-color, #4f4c48);
  }
}

.gp-profile-form__actions {
  margin-bottom: 0;
  padding-top: 4px;
}

@media (max-width: 575px) {
  .gp-profile-form {
    max-width: none;
  }

  .gp-profile-form__actions {
    ::v-deep .el-form-item__content {
      display: flex;
      gap: 8px;
    }

    .el-button {
      flex: 1;
    }
  }
}
</style>
