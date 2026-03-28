<template>
  <div class="main-container">
    <div class="main-tabs">
      <span class="tabs-item" :class="{ active: isLogin }" @click="switchTabs(0)">登录</span>
      <span class="tabs-item" :class="{ active: !isLogin }" @click="switchTabs(1)">注册</span>
    </div>
    <div v-show="isLogin">
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">

      <el-form-item prop="username" class="my-form-item">
        <span class="text-container">
          用户名
        </span>
        <el-input ref="username" v-model="loginForm.username" placeholder="请输入用户名" name="username" type="text"
          tabindex="1" auto-complete="on" />
      </el-form-item>

      <el-form-item prop="password" class="my-form-item">
        <span class="text-container">
          密码
        </span>
        <div style="position: relative;">
          <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
            placeholder="请输入密码" name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
          <span class="show-pwd" @click="showPwd" v-if="!rememberPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </div>
      </el-form-item>
      <el-form-item prop="validateCode" class="my-form-item">
        <span class="text-container">
          验证码
        </span>
        <div class="validateCode-div-item">
          <el-input class="validateCode-item-input" v-model="loginForm.validateCode" auto-complete="off"
            placeholder="请输入验证码" @keyup.enter.native="handleLogin">
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" />
          </div>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin: 0px 0px 25px 0px">记住密码</el-checkbox>
      <div style="text-align: center;">
        <el-button :loading="loading" type="primary" class="form-login-btn"
          @click.native.prevent="handleLogin">
          <!-- Login -->
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </div>
      <div>如果没有账号？<a style="color: var(--theme-color);" href="javascript:void(0);" @click="switchTabs(1)">开始注册</a></div>
    </el-form>
    </div>
    <div v-show="!isLogin">
      <el-form ref="registerForm" :model="signupForm" class="register-form" :rules="registerRules">
        <el-form-item prop="username" class="my-form-item">
          <span class="text-container">
            用户名
          </span>
          <el-input v-model.trim="signupForm.username" type="text" placeholder="请输入用户名(字母，数字和符号的组合)"
            auto-complete="off">
          </el-input>
        </el-form-item>
        <el-form-item prop="email" class="my-form-item">
          <span class="text-container">
            邮箱
          </span>
          <el-input v-model.trim="signupForm.email" type="email" placeholder="请输入邮箱" maxlength="33" show-word-limit
            autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item prop="validateCode" class="my-form-item" style="position: relative">
          <span class="text-container">
            验证码
          </span>
          <div class="validate-email-div">
            <el-input v-model.trim="signupForm.validateCode" type="text" placeholder="验证码">
            </el-input>
            <el-button size="mini" type="primary" class="get-validate-code" :disabled="isGetEmail"
              @click="getEmailValidateCode">
              {{ getCodeMsg }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="password" class="my-form-item">
          <span class="text-container">
            密码
          </span>
          <el-input v-model.trim="signupForm.password" type="password" placeholder="设置密码" autocomplete="new-password">
          </el-input>
        </el-form-item>
        <div style="text-align: center;">
          <el-button class="form-register-btn" type="primary" @click.native.prevent="handleRegister">
            注册
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import Register from "@/views/admin/register"

import { getMenuTree, getCaptchaImage, register, sendEmailCode } from "@/api/system/user";
import { validUsername, validateEmail, isPassword, isPhone } from '@/utils/validate'
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  components: {
    Register
  },
  data() {
    const validateUsername = (rule, value, callback) => {
      if ('' == value) {
        callback(new Error('用户名不能为空'))
      } else if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!isPassword(value)) {
        callback(new Error('密码不能少于6位数'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!isPhone(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    const validateLegalEmail = (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }
    return {
      isLogin: true,
      loginForm: {
        username: '',
        password: '',
        validateCode: '',
        validateKey: '',
        rememberMe: false
      },
      rememberPwd: false,
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername },
          { max: 20, trigger: 'blur', message: '最多不能超过20个字' }
        ],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        validateCode: [{ required: true, trigger: "blur", message: "请输入验证码" }],
      },
      registerRules: {
        username: [
          { required: true, trigger: 'blur', message: '请输入用户名' },
          { max: 20, trigger: 'blur', message: '最多不能超过20个字' },
          { validator: validateUsername, trigger: 'blur' }
        ],
        email: [
          { required: true, trigger: 'blur', message: '请输入邮箱' },
          { validator: validateLegalEmail, trigger: 'blur' },
        ],
        validateCode: [{ required: true, trigger: "blur", message: "请输入验证码" }],
        password: [
          { required: true, trigger: 'blur', message: '请输入密码' },
          { validator: validatePassword, trigger: 'blur' },
        ]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      codeUrl: "",
      isGetEmail: false,
      getValidateCodeIntval: null,
      getCodeMsg: '获取验证码',
      signupForm: {},
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = (route.query && route.query.redirect) || '/'
      },
      immediate: true,
    },
  },
  created() {
    this.getCode();
    this.getCookie();
  },
  mounted() {
  },
  beforeDestroy() {
    this.getValidateCodeIntval = null
    clearInterval(this.getValidateCodeIntval)
  },
  methods: {
    switchTabs(index) {
      if(index === 0) {
        this.isLogin = true;
      }else if(index === 1) {
        this.isLogin = false;
      }
    },
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
            // this.$router.push({ path: this.redirect || '/' })
            window.location.reload();
            this.loading = false;
          }).catch(() => {
            this.getCode();
            this.loading = false
          })
        } else {
          this.getCode();
          console.log('error submit!!')
          return false
        }
      })
    },
    getEmailValidateCode() {
      if (!validateEmail(this.signupForm.email)) {
        this.$message({message: '请输入正确邮箱', type: 'error'})
        this.$refs['registerForm'].validateField('email')
        return
      }
      this.isGetEmail = true
      sendEmailCode({ email: this.signupForm.email }).then((res) => {
        if(res.code === 200) {
          this.signupForm.validateKey = res.data;
          let n = 60
          this.getValidateCodeIntval = setInterval(() => {
            if (n > 0) {
              n--
              this.getCodeMsg = '重新获取(' + n + 's)'
            } else {
              this.getValidateCodeIntval = null
              clearInterval(this.getValidateCodeIntval)
              this.getCodeMsg = '获取验证码'
              this.isGetEmail = false
            }
          }, 1000)
        }else {
          this.isGetEmail = false;
        }
      }).catch((err) => {
        this.isGetEmail = false;
      });
    },
    handleRegister() {
      this.$refs['registerForm'].validate(async (valid) => {
        if (valid) {
          if(!this.signupForm.validateKey) {
            this.$message({message: '验证码无效', type: 'error'})
            return
          }
          // const param = {
          //   username: this.form.username,
          //   email: this.form.email,
          //   password: this.form.password,
          //   validateCode: this.form.validateCode,
          //   validateKey: this.form.validateKey
          // }
          const { msg } = await register(this.signupForm)
          this.$message({message: msg, type: 'success'})
          this.$refs['registerForm'].resetFields()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.main-container {
  width: 100%;
}

.main-tabs {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.tabs-item {
  padding: 5px 0;
  margin: 0 10px;
  cursor: pointer;
}

.tabs-item.active {
  color: var(--theme-color);
  border-bottom: 3px solid var(--theme-color);
}

.el-form-item.my-form-item {
  margin-bottom: 18px;
}

.el-form-item--medium .el-form-item__content {
  line-height: normal;
}

.login-form {
  position: relative;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.validateCode-div-item {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.validateCode-item-input {
  width: 100%;
  flex: 1 1 0;
}

.login-code {
  width: fit-content;
  margin: 2px auto;
  display: grid;
  justify-content: end;
  align-items: start;
  justify-items: end;

  img {
    height: 36px;
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

.text-container {
  padding: 0 5px;
  height: 20px;
  line-height: 20px;
  margin-bottom: 3px;
  color: $dark_gray;
  vertical-align: middle;
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
  top: 0;
  font-size: 16px;
  color: $dark_gray;
  cursor: pointer;
  user-select: none;
}

.validate-email-div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.form-login-btn, .form-register-btn {
  width: 100%; margin-bottom: 20px
}
</style>
