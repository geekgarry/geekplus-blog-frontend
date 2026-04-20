<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">
      <div class="title-container">
        <h3 class="title">登录</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </span>
        <el-input ref="username" v-model="loginForm.username" placeholder="Username" name="username" type="text"
          tabindex="1" auto-complete="on" />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </span>
        <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
          placeholder="Password" name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd" v-if="!rememberPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <div class="validateCode-div">
        <el-form-item class="validateCode-div-item" prop="validateCode">
          <span class="svg-container">
            <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
          </span>
          <el-input class="validateCode-item-input" v-model="loginForm.validateCode" auto-complete="off"
            placeholder="验证码" @keyup.enter.native="handleLogin">
          </el-input>
        </el-form-item>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" />
        </div>
      </div>
      <el-checkbox v-model="loginForm.rememberMe" style="margin: 0px 0px 25px 0px">记住密码</el-checkbox>
      <div style="text-align: center;">
        <el-button :loading="loading" type="primary" style="width: 100%; margin-bottom: 20px"
          @click.native.prevent="handleLogin">
          <!-- Login -->
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
      <!-- <div class="tips">
        <span style="margin-right:20px;">username</span>
        <span> password:</span>
      </div> -->
    </el-form>
  </div>
</template>

<script>
import { getMenuTree, getCaptchaImage } from "@/api/system/user";
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
        //console.log(res.data);
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberPwd")
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      };
      this.rememberPwd = rememberMe === undefined ? false : Boolean(rememberMe)
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
            this.$router.push({ path: this.redirect || '/admin/' })
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

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/geekgarry/geekplus-admin-vue-ui */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  height: 100vh;
  width: 100%;
  /*opacity: 0.6;*/
  /* background-color: $bg; */
  background: no-repeat center url("../../../assets/images/bg1.jpeg");
  background-position: center;
  background-size: cover;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .validateCode-div {
    display: flex;
    flex-direction: row;
    flex-flow: wrap;
  }

  .validateCode-div-item {
    flex-grow: 1;
    flex-shrink: 1;
    width: min-content;
  }

  .validateCode-item-input {
    width: 70%;
  }

  .login-code {
    width: fit-content;
    margin: 2px auto;
    display: grid;
    justify-content: end;
    align-items: start;
    justify-items: end;

    img {
      cursor: pointer;
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}

.register-btn {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
