<template>
  <div class="login-container">
    <div class="main">
      <div class="container a-container" :class="{ 'is-mobile-txl': !isLoginForm }" id="a-container">
        <div class="container__circle" :class="{ 'is-txl': isLoginForm }"></div>
        <div class="container__circle container__circle--t" :class="{ 'is-txr': isLoginForm }"></div>
        <div class="container__circle container__circle--t1" :class="{ 'is-txl': isLoginForm }"></div>
        <div class="container__circle container__circle--t2" :class="{ 'is-txl': isLoginForm }"></div>
        <div class="container__circle container__circle--t3" :class="{ 'is-txr': isLoginForm }"></div>
        <el-form class="form" id="a-form" ref="loginForm" :model="loginForm" :rules="loginRules" auto-complete="on">
          <h3 class="form_title title">用户登录</h3>
          <div class="form__icons">
            <router-link to="/"><i class="el-icon-s-home"></i>首页</router-link>
            <!-- <img class="form__icon" src="#"> -->
          </div>
          <!-- <span class="form__span">用户密码登录</span> -->
          <el-form-item class="form-item-input" prop="username">
            <input class="form__input" type="text" name="username" v-model="loginForm.username" placeholder="用户名"
              autocomplete="on">
          </el-form-item>
          <el-form-item class="form-item-input" prop="password">
            <input class="form__input" :type="passwordType" name="password" v-model="loginForm.password"
              placeholder="密码" autocomplete="on" @keyup.enter="handleLogin">
            <span class="show-pwd" @click="showPwd" v-if="!rememberPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-form-item class="form-item-input" prop="validateCode">
            <div class="validateCode-div">
              <input class="form__input" type="text" v-model="loginForm.validateCode" placeholder="验证码"
                autocomplete="off" @keyup.enter="handleLogin">
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" />
              </div>
            </div>
          </el-form-item>
          <el-checkbox v-model="loginForm.rememberMe" style="margin: 0px 0px 15px 0px">记住密码</el-checkbox>
          <!-- <a class="form__link">忘记密码?</a> -->
          <!-- <button class="form__button button submit" @click.prevent="handleLogin">登录</button> -->
          <div style="width: 100%; margin-bottom: 20px; text-align: center;">
            <el-button class="button" :loading="loading" type="primary" @click.native.prevent="handleLogin">
              <!-- Login -->
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </div>
        </el-form>
      </div>
      <div class="container b-container" :class="{ 'is-txl': !isLoginForm, 'is-z200': !isLoginForm }" id="b-container">
        <div class="container__circle" :class="{ 'is-txl': !isLoginForm }"></div>
        <div class="container__circle container__circle--t" :class="{ 'is-txr': !isLoginForm }"></div>
        <div class="container__circle container__circle--t1" :class="{ 'is-txr': !isLoginForm }"></div>
        <div class="container__circle container__circle--t2" :class="{ 'is-txl': !isLoginForm }"></div>
        <div class="container__circle container__circle--t3" :class="{ 'is-txl': !isLoginForm }"></div>
        <el-form class="form" ref="registerForm" :model="registerForm" :rules="registerRules">
          <h3 class="form_title title">用户注册</h3>
          <div class="form__icons">
            <router-link to="/"><i class="el-icon-s-home"></i>首页</router-link>
            <!-- <img class="form__icon" src="#" alt="">
            <img class="form__icon" src="#"> -->
          </div>
          <!-- <span class="form__span">使用邮箱注册</span> -->
          <el-form-item class="form-item-input" prop="username">
            <input class="form__input" type="text" v-model.trim="registerForm.username" placeholder="用户名"
              autocomplete="off">
          </el-form-item>
          <el-form-item class="form-item-input" prop="email">
            <input class="form__input" type="email" v-model.trim="registerForm.email" placeholder="邮箱"
              autocomplete="off">
          </el-form-item>
          <el-form-item class="form-item-input" prop="validateCode" style="position: relative">
            <input class="form__input" v-model.trim="registerForm.validateCode" type="text" placeholder="验证码"
              autocomplete="off">
            <button class="form-button get-email-code" size="mini" type="primary" :disabled="isGetEmail"
              @click.prevent="getEmailValidateCode">
              {{ getCodeMsg }}
            </button>
          </el-form-item>
          <el-form-item class="form-item-input" prop="password">
            <input class="form__input" type="password" v-model.trim="registerForm.password" placeholder="密码"
              autocomplete="new-password">
          </el-form-item>
          <!-- <button class="form__button button submit" @click.prevent="handleRegister">注册</button> -->
          <el-button class="button" type="primary" @click.native.prevent="handleRegister">注册</el-button>
        </el-form>
      </div>
      <div class="switch" :class="{ 'is-txr': !isLoginForm }" id="switch-cnt">
        <div class="switch__circle" :class="{ 'is-txr': isLoginForm }"></div>
        <div class="switch__circle switch__circle--t" :class="{ 'is-txr': isLoginForm }"></div>
        <div class="switch__container" :class="{ 'is-hidden': isLoginForm }" id="switch-c1">
          <h2 class="switch__title title">欢迎回来！</h2>
          <p class="switch__description description">请登录查看更多信息</p>
          <button class="switch__button button switch-btn" @click="switchForm">登录</button>
        </div>
        <div class="switch__container" :class="{ 'is-hidden': !isLoginForm }" id="switch-c2">
          <h2 class="switch__title title">你好朋友！</h2>
          <p class="switch__description description">输入你的个人信息加入我们</p>
          <button class="switch__button button switch-btn" @click="switchForm">注册</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCaptchaImage, register, sendEmailCode } from "@/api/system/user";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { validUsername, isPassword, validateEmail, isPhone } from '@/utils/validate'

export default {
  name: 'UserLogin',
  directives: {
    focus: {
      inserted(el) {
        el.querySelector('input').focus()
      },
    },
  },
  data() {
    const validateUsername = (rule, value, callback) => {
      if ('' == value) {
        callback(new Error('用户名不能为空'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!isPassword(value)) {
        callback(new Error('密码不能少于6位'))
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
      nodeEnv: process.env.NODE_ENV,
      isGetEmail: false,
      getValidateCodeIntval: null,
      getCodeMsg: '获取验证码',
      registerForm: {},
      registerRules: {
        username: [
          { required: true, trigger: 'blur', message: '请输入用户名' },
          { max: 20, trigger: 'blur', message: '最多不能超过20个字' },
          { validator: validateUsername, trigger: 'blur' },
        ],
        email: [
          { required: true, trigger: 'blur', message: '请输入邮箱' },
          { validator: validateLegalEmail, trigger: 'blur' },
        ],
        password: [
          { required: true, trigger: 'blur', message: '请输入密码' },
          { validator: validatePassword, trigger: 'blur' },
        ],
        validateCode: [
          { required: true, trigger: 'blur', message: '请输入验证码' },
        ]
      },
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
      codeUrl: "",
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      isLoginForm: true
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.isLoginForm = this.isLogin;
        this.redirect = (route.query && route.query.redirect) || '/'
      },
      immediate: true,
    },
  },
  computed: {
    isLogin() {
      return this.$route.query.method === 'register' ? false : true;
    }
  },
  created() {
    this.getCode();
    this.getCookie();
  },
  beforeDestroy() {
    this.getValidateCodeIntval = null
    clearInterval(this.getValidateCodeIntval)
  },
  mounted() {
  },
  methods: {
    switchForm() {
      this.isLoginForm = !this.isLoginForm;
    },
    handlePassword() {
      this.passwordType === 'password'
        ? (this.passwordType = '')
        : (this.passwordType = 'password')
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
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
            this.$router.push({ path: this.redirect || '/' })
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          // console.log('error submit!!')
          this.$message({ message: '请输入用户名密码和验证码', type: 'error' })
          return false
        }
      })
    },
    getEmailValidateCode() {
      if (!this.registerForm.email || !validateEmail(this.registerForm.email)) {
        this.$message({ message: '请输入正确邮箱', type: 'error' })
        this.$refs['registerForm'].validateField('email')
        return
      }
      this.isGetEmail = true
      sendEmailCode({ email: this.registerForm.email }).then((res) => {
        if (res.code === 200) {
          this.registerForm.validateKey = res.data;
          //加了一个判断，防止出现后面的getValidateCodeIntval没有被清理掉，出现两个
          if(this.getValidateCodeIntval) return;
          let n = 60
          this.getCodeMsg = '重新获取(' + n + 's)';
          this.getValidateCodeIntval = setInterval(() => {
            if (n > 0) {
              n--
              this.getCodeMsg = '重新获取(' + n + 's)';
            } else {
              clearInterval(this.getValidateCodeIntval);
              this.getValidateCodeIntval = null;
              this.getCodeMsg = '获取验证码';
              this.isGetEmail = false;
            }
          }, 1000);
        } else {
          this.isGetEmail = false;
        }
      }).catch((err) => {
        this.isGetEmail = false;
      });
    },
    handleRegister() {
      this.$refs['registerForm'].validate(async (valid) => {
        if (valid) {
          if (!this.registerForm.validateKey) {
            this.$message({ message: '验证码无效', type: 'error' })
            return
          }
          // const param = {
          //   username: this.form.username,
          //   email: this.form.email,
          //   password: this.form.password,
          //   validateCode: this.form.validateCode,
          //   validateKey: this.form.validateKey
          // }
          const { msg } = await register(this.registerForm)
          this.$message({message: msg, type: 'success'})
          this.$refs['registerForm'].resetFields()
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  /* background-color: var(--color-background,#ecf0f3);
  color: var(--fontColor,#a0a5a8);
  background: url("../../assets/images/bg1.jpeg") center center fixed no-repeat;
  background-size: cover; */
}

/* 登录框 */
.main {
  position: relative;
  width: 92%;
  max-width: 900px;
  max-height: 500px;
  height: 100%;
  padding: 25px;
  color: var(--fontColor);
  background-color: var(--background, #ecf0f3);
  box-shadow: 10px 10px 10px var(--color-background, #d1d9e6), -10px -10px 10px var(--box-shadow, #f9f9f9);
  border-radius: 12px;
  overflow: hidden;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  padding: 25px;
  background-color: var(--background, #ecf0f3);
  transition: 1.25s;
}

.form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  z-index: inherit;
}

.form__icon {
  object-fit: contain;
  width: 30px;
  margin: 0 5px;
  opacity: .5;
  transition: .15s;
}

.form__icon:hover {
  opacity: 1;
  transition: .15s;
  cursor: pointer;
}

.form-item-input {
  width: 100%;
  margin: 5px auto 12px;
  padding: 0;
}

.form__input {
  width: 100%;
  height: 40px;
  padding-left: 25px;
  font-size: 13px;
  letter-spacing: .15px;
  border: none;
  outline: none;
  font-family: 'Montserrat', sans-serif;
  color: var(--fontColor);
  background-color: var(--color-background, #ecf0f3);
  transition: .25s ease;
  border-radius: 5px;
  box-shadow: inset 2px 2px 4px var(--color-background, #d1d9e6), inset -2px -2px 4px var(--box-shadow, #f9f9f9);
}

.show-pwd {
  position: absolute;
  right: 10px;
  top: 7px;
  font-size: 16px;
  color: var(--plus-grey-9);
  cursor: pointer;
  user-select: none;
}

.validateCode-div {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  .form__input {
    flex: 1 1 auto;
  }
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
  display: grid;
  justify-content: end;
  align-items: start;
  justify-items: end;

  img {
    cursor: pointer;
    height: 40px;
  }
}

.form__input:focus {
  box-shadow: inset 4px 4px 4px var(--color-background, #d1d9e6), inset -4px -4px 4px var(--box-shadow, #f9f9f9);
}

.form__span {
  margin-top: 5px;
  margin-bottom: 5px;
}

.form__link {
  color: var(--fontColor, #181818);
  font-size: 15px;
  margin-top: 25px;
  border-bottom: 1px solid var(--borderColor, #a0a5a8);
  line-height: 2;
}

.title {
  margin: 10px auto;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: var(--fontColor, #181818);
}

.description {
  font-size: 14px;
  letter-spacing: .25px;
  text-align: center;
  line-height: 1.6;
}

.button {
  width: 80%;
  height: 50px;
  border-radius: 25px;
  margin-top: 10px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1.15px;
  background-color: var(--theme-color,#4B70E2);
  color: #f9f9f9;
  box-shadow: 8px 8px 16px var(--color-background, #d1d9e6), -8px -8px 16px var(--box-shadow, #f9f9f9);
  border: none;
  outline: none;
  padding: 0;
  cursor: pointer;
}

.form-button {
  display: inline;
  border-radius: 4px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1.15px;
  background-color: var(--theme-color,#4B70E2);
  color: #f9f9f9;
  box-shadow: 8px 8px 16px var(--color-background, #d1d9e6), -8px -8px 16px var(--box-shadow, #f9f9f9);
  border: none;
  outline: none;
  padding: 5px 10px;
  cursor: pointer;
}

.get-email-code {
  position: absolute;
  top: 10px;
  right: 5px;
}

/**/
.a-container {
  z-index: 100;
  left: calc(100% - 50%);
}

.b-container {
  left: calc(100% - 50%);
  z-index: 0;
}

.switch {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 50%;
  padding: 50px;
  z-index: 200;
  transition: 1.25s;
  background-color: var(--background, #ecf0f3);
  overflow: hidden;
  box-shadow: 4px 4px 10px var(--color-background, #d1d9e6), -4px -4px 10px var(--box-shadow, #f9f9f9);
}

.container__circle {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background-color: var(--background, #ecf0f3);
  box-shadow: inset 8px 8px 12px var(--color-background, #d1d9e6), inset -8px -8px 12px var(--box-shadow, #f9f9f9);
  bottom: -50%;
  left: -40%;
  transition: 1.25s;
}

.container__circle--t {
  top: -18%;
  left: 20%;
  width: 200px;
  height: 200px;
}

.container__circle--t1{
  top: 45%;
  right: 30%;
  width: 150px;
  height: 150px;
}

.container__circle--t2 {
  top: 10%;
  right: 70%;
  width: 150px;
  height: 150px;
}

.container__circle--t3 {
  top: 55%;
  right: 0;
  width: 250px;
  height: 250px;
}

.switch__circle {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background-color: var(--background, #ecf0f3);
  box-shadow: inset 8px 8px 12px var(--color-background, #d1d9e6), inset -8px -8px 12px var(--box-shadow, #f9f9f9);
  bottom: -60%;
  left: -60%;
  transition: 1.25s;
}

.switch__circle--t {
  top: -30%;
  left: 60%;
  width: 300px;
  height: 300px;
}

.switch__container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  width: 100%;
  padding: 50px 55px;
  transition: 1.25s;
}

.switch__button {
  cursor: pointer;
}

.switch__button:hover {
  box-shadow: 6px 6px 10px var(--color-background, #d1d9e6), -6px -6px 10px var(--box-shadow, #f9f9f9);
  transform: scale(0.985);
  transition: .25s;
}

.switch__button:active,
.switch__button:focus {
  box-shadow: 2px 2px 6px var(--color-background, #d1d9e6), -2px -2px 6px var(--box-shadow, #f9f9f9);
  transform: scale(0.97);
  transition: .25s;
}

/**/
.is-txr {
  left: calc(100% - 50%);
  transition: 1.25s;
  transform-origin: left;
}

.is-txl {
  left: 0;
  transition: 1.25s;
  transform-origin: right;
}

.is-z200 {
  z-index: 200;
  transition: 1.25s;
}

.is-hidden {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  transition: 1.25s;
}

.is-gx {
  animation: is-gx 1.25s;
}

@media screen and (max-width: 768px) {
  .container {
    width: 100%;
  }

  /**/
  .a-container {
    z-index: 100;
    left: 0;
  }

  .b-container {
    left: 0;
    z-index: 0;
  }

  .switch {
    position: absolute;
    width: 100%;
    height: 50px;
    left: 0;
    right: 0;
    top: calc(100% - 60px);
    padding: 0;
    box-shadow: none;
    background: transparent;
  }

  .switch__container {
    padding: 0;
  }

  .switch__circle {
    display: none;
  }

  .switch__title {
    display: none;
  }

  .switch__description {
    display: none;
  }

  .button {
    width: 60%;
    height: 30px;
    border-radius: 25px;
    margin: 5px auto;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 1.15px;
    border: none;
    outline: none;
    box-shadow: none;
  }

  .is-txr {
    left: 0;
    transition: 1.25s;
    transform-origin: left;
  }

  .is-txl {
    left: 0;
    transition: 1.25s;
    transform-origin: right;
  }

  .is-mobile-txl {
    left: -100%;
    transition: 1.25s;
    transform-origin: right;
  }

  .is-z200 {
    z-index: 200;
    transition: 1.25s;
  }
}

@keyframes is-gx {

  0%,
  10%,
  100% {
    width: 400px;
  }

  30%,
  50% {
    width: 500px;
  }
}
</style>
