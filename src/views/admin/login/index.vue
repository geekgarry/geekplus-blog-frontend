<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">登录</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd" v-if="!rememberPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <div class="validateCode-div">
        <el-form-item class="validateCode-div-item" prop="validateCode">
          <span class="svg-container">
            <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
          </span>
          <el-input
            class="validateCode-item-input"
            v-model="loginForm.validateCode"
            auto-complete="off"
            placeholder="验证码"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <div class="login-code">
          <img v-if="codeUrl" :src="codeUrl" @click="getCode" alt="验证码" title="点击刷新验证码" />
          <button v-else type="button" class="login-code-fallback" @click="getCode">刷新验证码</button>
        </div>
      </div>

      <el-checkbox v-model="loginForm.rememberMe" class="remember-me">记住密码</el-checkbox>

      <div class="login-submit">
        <el-button
          :loading="loading"
          type="primary"
          class="login-submit-btn"
          @click.native.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </div>

      <div class="register-btn">
        <router-link to="/register">
          <el-button type="text">注册</el-button>
        </router-link>
        <router-link to="/">
          <el-button type="text">首页</el-button>
        </router-link>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getCaptchaImage } from "@/api/system/user";
import { validUsername } from '@/utils/validate'
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位数'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        validateCode: '',
        validateKey: '',
        rememberMe: false
      },
      rememberPwd: false,
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        validateCode: [{ required: true, trigger: "blur", message: "验证码不能为空" }],
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      codeUrl: "",
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true,
    }
  },
  created() {
    this.getCode();
    this.getCookie();
  },
  methods: {
    getCode() {
      getCaptchaImage().then((res) => {
        this.codeUrl = "data:image/gif;base64," + res.data.base64Code;
        this.loginForm.validateKey = res.data.validateKey;
      }).catch(() => {
        this.codeUrl = '';
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberPwd");
      // 只改账号相关字段，避免覆盖验证码 validateKey
      if (username !== undefined) this.loginForm.username = username;
      if (password !== undefined) this.loginForm.password = decrypt(password);
      this.loginForm.rememberMe = rememberMe === undefined ? false : Boolean(rememberMe);
      this.rememberPwd = this.loginForm.rememberMe;
    },
    showPwd() {
      if (!this.rememberPwd) {
        if (this.passwordType === 'password') {
          this.passwordType = ''
        } else {
          this.passwordType = 'password'
        }
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
            Cookies.set("rememberPwd", this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberPwd");
          }
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            const target = this.redirect || '/admin/'
            this.$router.push({ path: target })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/**
 * 保留原背景图；仅叠加主题色蒙层，保证浅/深模式字色与输入区对比一致。
 * 输入区做成单层条，覆盖全局 Element 白底边框，避免「套娃」框。
 */
.login-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: auto;
  /* 原背景图保留 */
  background: no-repeat center center / cover url("~@/assets/images/bg1.jpeg");
  color: var(--text-color-2, #fbfafa);

  /* 主题色蒙层：只改「颜色滤镜」，不换图 */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    /* 浅色：暖纸色半透明罩，压暗图上的反光、抬高表单对比
    background: rgba(247, 245, 242, 0.52); */
  }
}

/* 深色：暗色罩，与站点 dark Token 一致 */
body[theme-mode="dark"] .login-container::before {
  background: rgba(25, 25, 25, 0.58);
}

.login-container {
  .login-form {
    position: relative;
    z-index: 1;
    width: 520px;
    max-width: 100%;
    padding: 140px 35px 48px;
    margin: 0 auto;
    box-sizing: border-box;
    overflow: hidden;
  }

  .title-container {
    position: relative;

    .title {
      margin: 0 auto 40px;
      font-size: 26px;
      font-weight: bold;
      text-align: center;
      /* 浅色蒙层上用深字；深色蒙层上用浅字 —— 走 Token */
      color: var(--text-color-2, #1f1e1d);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }
  }

  .svg-container {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 47px;
    padding: 0 0 0 12px;
    color: var(--muted-1-color, #8a8580);
    vertical-align: middle;
    box-sizing: border-box;
  }

  .show-pwd {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: var(--muted-1-color, #8a8580);
    cursor: pointer;
    user-select: none;
    z-index: 2;

    &:hover {
      color: var(--theme-color, #5f7d80);
    }
  }

  .validateCode-div {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
    gap: 10px;
  }

  .validateCode-div-item {
    flex: 1 1 auto;
    min-width: 0;
    margin-bottom: 22px;
  }

  .validateCode-item-input {
    width: auto;
    flex: 1 1 auto;
  }

  .login-code {
    flex: 0 0 auto;
    height: 47px;
    margin: 0 0 22px;
    display: flex;
    align-items: center;

    img {
      display: block;
      height: 47px;
      width: auto;
      max-width: 130px;
      cursor: pointer;
      border-radius: var(--gp-border-radius-base, 4px);
      border: 1px solid rgba(255, 255, 255, 0.22);
      background: var(--background-origin, #fff);
      object-fit: cover;
    }
  }

  .login-code-fallback {
    height: 47px;
    padding: 0 12px;
    border: 1px solid var(--border-color-2, #d4cfc8);
    border-radius: var(--gp-border-radius-base, 4px);
    background: var(--background-origin, #fff);
    color: var(--text-color, #4f4c48);
    cursor: pointer;
    font-size: 13px;
  }

  .remember-me {
    margin: 0 0 22px;
    color: var(--text-color-2, #1f1e1d);
  }

  .login-submit {
    text-align: center;
  }

  .login-submit-btn {
    width: 100%;
    margin-bottom: 20px;
  }

  .register-btn {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  /* 单层输入条：外框在 form-item，内层 input 彻底透明无边 */
  ::v-deep .el-form-item {
    margin-bottom: 22px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    background: rgba(0, 0, 0, 0.22);
    border-radius: 5px;
    color: var(--text-color-2, #fbfafa);
    transition: border-color 0.15s ease, background-color 0.15s ease;

    &:hover {
      border-color: rgba(255, 255, 255, 0.45);
    }
  }

  ::v-deep .el-form-item__content {
    display: flex;
    align-items: center;
    line-height: 47px;
    position: relative;
  }

  ::v-deep .el-form-item__error {
    padding-top: 2px;
  }

  ::v-deep .el-input {
    flex: 1 1 auto;
    width: auto !important;
    height: 47px;

    /* 覆盖全局 element-overrides 的白底/描边，消灭套娃框 */
    .el-input__inner {
      height: 47px;
      line-height: 47px;
      padding: 0 36px 0 8px;
      background: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-appearance: none;
      color: #fff !important;
      caret-color: #fff;

      &::placeholder {
        color: rgba(255, 255, 255, 0.55);
      }

      &:hover,
      &:focus {
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }

      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus {
        -webkit-text-fill-color: #fff !important;
        caret-color: #fff;
        /* 与外层半透明条接近的深色，避免黄底露出 */
        box-shadow: 0 0 0 1000px rgba(40, 52, 67, 0.92) inset !important;
        transition: background-color 99999s ease-out;
      }
    }
  }

  ::v-deep .el-checkbox__label {
    color: var(--text-color-2, #1f1e1d);
  }

  ::v-deep .el-button--text {
    color: var(--theme-color, #5f7d80);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);

    &:hover {
      color: var(--theme-color-strong, var(--theme-color, #4a6366));
    }
  }
}

/*
 * 浅色模式下蒙层偏亮：输入条改用半透明白底 + 深字，避免白字看不清。
 * 深色仍用上面的深条 + 白字。
 */
body:not([theme-mode="dark"]) .login-container {
  ::v-deep .el-form-item {
    background: rgba(255, 255, 255, 0.72);
    border-color: rgba(44, 42, 40, 0.14);
    color: var(--text-color-2, #1f1e1d);

    &:hover {
      border-color: var(--theme-color-soft, #8aa0a2);
    }
  }

  ::v-deep .el-input .el-input__inner {
    color: var(--text-color-2, #1f1e1d) !important;
    caret-color: var(--theme-color, #5f7d80);

    &::placeholder {
      color: var(--muted-1-color, #8a8580);
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-text-fill-color: var(--text-color-2, #1f1e1d) !important;
      caret-color: var(--theme-color, #5f7d80);
      box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.85) inset !important;
    }
  }

  .svg-container,
  .show-pwd {
    color: var(--muted-1-color, #8a8580);
  }

  .login-code img {
    border-color: rgba(44, 42, 40, 0.12);
  }
}
</style>
