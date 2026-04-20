<template>
  <div class="register-container">
    <el-row>
      <!-- <el-col :xs="24" :sm="24" :md="12" :lg="16" :xl="16">
        <div style="color: transparent">Character</div>
      </el-col>
      <el-col  :xs="24" :sm="24" :md="12" :lg="8" :xl="8"></el-col> -->
      <el-col :xs="24" :sm="{ span: 14, offset: 5 }" :md="{ span: 12, offset: 6 }" :lg="{ span: 10, offset: 7 }"
        :xl="{ span: 8, offset: 8 }">
        <el-form ref="registerForm" :model="form" class="register-form" :rules="registerRules">
          <div class="title-container">
            <h3 class="title">注册</h3>
          </div>
          <el-form-item prop="username">
            <span class="svg-container">
              <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
            </span>
            <el-input v-model.trim="form.username" v-focus type="text" placeholder="请输入用户名(字母，数字和符号的组合)"
              auto-complete="off">
            </el-input>
          </el-form-item>
          <el-form-item prop="email">
            <span class="svg-container">
              <svg-icon slot="prefix" icon-class="email" class="el-input__icon input-icon" />
            </span>
            <el-input v-model.trim="form.email" type="email" placeholder="请输入邮箱" maxlength="33" show-word-limit
              autocomplete="off">
            </el-input>
          </el-form-item>
          <el-form-item prop="validateCode" style="position: relative">
            <span class="svg-container">
              <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
            </span>
            <el-input v-model.trim="form.validateCode" type="text" placeholder="验证码">
            </el-input>
            <el-button size="mini" type="primary" class="show-pwd phone-code" :disabled="isGetEmail"
              @click="getEmailValidateCode">
              {{ getCodeMsg }}
            </el-button>
          </el-form-item>
          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
            </span>
            <el-input v-model.trim="form.password" type="password" placeholder="设置密码" autocomplete="new-password">
            </el-input>
          </el-form-item>
          <div style="text-align: center;">
            <el-button class="register-btn" type="primary" @click.native.prevent="handleRegister">
              注册
            </el-button>
          </div>
          <div class="login-btn">
            <router-link to="/login">
              <el-button type="text">登录</el-button>
            </router-link>
            <router-link to="/">
              <el-button type="text">首页</el-button>
            </router-link>
          </div>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { register, sendEmailCode } from '@/api/system/user'
import { validateEmail, isPassword, isPhone } from '@/utils/validate'

export default {
  name: 'Register',
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
      isGetEmail: false,
      getValidateCodeIntval: null,
      getCodeMsg: '获取验证码',
      nodeEnv: process.env.NODE_ENV,
      form: {},
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
      }
    }
  },
  created() {
    document.body.style.overflow = 'hidden'
  },
  beforeDestroy() {
    document.body.style.overflow = 'auto'
    this.getValidateCodeIntval = null
    clearInterval(this.getValidateCodeIntval)
  },
  methods: {
    getEmailValidateCode() {
      if (!validateEmail(this.form.email)) {
        this.$message({message: '请输入正确邮箱', type: 'error'})
        this.$refs['registerForm'].validateField('email')
        return
      }
      this.isGetEmail = true
      sendEmailCode({ email: this.form.email }).then((res) => {
        if(res.code === 200) {
          this.form.validateKey = res.data;
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
          if(!this.form.validateKey) {
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
          const { msg } = await register(this.form)
          this.$message({message: msg, type: 'success'})
          this.$refs['registerForm'].resetFields()
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.register-container {
  height: 100vh;
  background: url('~@/assets/images/bg1.jpeg') center center fixed no-repeat;
  background-size: cover;

  .title {
    font-size: 54px;
    font-weight: 500;
    color: rgba(14, 18, 26, 1);
  }

  .title-tips {
    margin-top: 29px;
    font-size: 26px;
    font-weight: 400;
    color: rgba(14, 18, 26, 1);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .register-btn {
    max-width: 320px;
    width: 100%;
    margin-top: 5px;
    margin-bottom: 20px;
    border: 0;

    &:hover {
      opacity: 0.9;
    }
  }

  .register-form {
    position: relative;
    max-width: 100%;
    margin: calc((100vh - 432px) / 2) 10% 10%;
    overflow: hidden;

    .forget-password {
      width: 100%;
      margin-top: 40px;
      text-align: left;

      .forget-password {
        width: 129px;
        height: 19px;
        font-size: 20px;
        font-weight: 400;
        color: rgba(92, 102, 240, 1);
      }
    }

    .per-code {
      width: 100px;
      height: 36px;
      font-size: 20px;
      line-height: 36px;
      color: #fff;
      text-align: center;
      cursor: pointer;
      background: #bbc1ce;
    }

    .phone-code {
      padding: 0 10px;
      height: 36px;
      font-size: 14px;
      color: #fff;
      border-radius: 3px;
    }
  }

  .tips {
    margin-bottom: 10px;
    font-size: $base-font-size-default;
    color: $base-color-white;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .title-container {
    position: relative;

    .title {
      margin: 0 auto 40px auto;
      font-size: 26px;
      font-weight: bold;
      color: $base-color-white;
      text-align: center;
    }
  }

  .svg-container {
    position: absolute;
    top: 8px;
    left: 15px;
    z-index: $base-z-index;
    font-size: 16px;
    color: #d7dee3;
    cursor: pointer;
    user-select: none;
  }

  .show-pwd {
    position: absolute;
    top: 6px;
    right: 10px;
    font-size: 16px;
    color: $base-font-color;
    cursor: pointer;
    user-select: none;
  }

  ::v-deep {
    .el-form-item {
      padding-right: 0;
      margin: 20px 0;
      color: #454545;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 2px;

      &__content {
        min-height: $base-input-height;
        line-height: $base-input-height;
      }

      &__error {
        position: absolute;
        top: 100%;
        left: 18px;
        font-size: $base-font-size-small;
        color: $base-color-red;
        line-height: 18px;
      }
    }

    .el-input {
      box-sizing: border-box;

      .el-input__count {
        .el-input__count-inner {
          background: transparent;
        }
      }

      .el-input__prefix {
        left: 15px;
        line-height: 45px;

        .svg-inline--fa {
          width: 20px;
        }
      }

      input {
        height: 47px;
        padding-left: 45px;
        font-size: $base-font-size-default;
        color: #d7dee3;
        caret-color: #d7dee3;
        line-height: 47px;
        background: #11101179;
        border: 0;
      }
    }
  }
}

.login-btn {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
