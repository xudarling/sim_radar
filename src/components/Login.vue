<template>
  <div class="login">
    <div class="box">
      <i class="el-icon-close" @click="close_login"></i>
      <div class="content">
        <div class="nav">
          <span
            :class="{ active: login_method === 'is_pwd' }"
            @click="change_login_method('is_pwd')"
            >密码登录</span
          >
          <span
            :class="{ active: login_method === 'is_sms' }"
            @click="change_login_method('is_sms')"
            >短信登录</span
          >
        </div>
        <el-form v-if="login_method === 'is_pwd'">
          <el-input
            placeholder="用户名/手机号/邮箱"
            prefix-icon="el-icon-user"
            v-model="username"
            clearable
          >
          </el-input>
          <el-input
            placeholder="密码"
            prefix-icon="el-icon-key"
            v-model="password"
            clearable
            show-password
          >
          </el-input>
          <el-button type="primary" @click="login_pwd">登录</el-button>
        </el-form>
        <el-form v-if="login_method === 'is_sms'">
          <el-input
            placeholder="手机号"
            prefix-icon="el-icon-phone-outline"
            v-model="mobile"
            clearable
            @blur="check_mobile"
          >
          </el-input>
          <el-input
            placeholder="验证码"
            prefix-icon="el-icon-chat-line-round"
            v-model="sms"
            clearable
          >
            <template slot="append">
              <span class="sms" @click="send_sms">{{ sms_interval }}</span>
            </template>
          </el-input>
          <el-button type="primary" @click="login_code">登录</el-button>
        </el-form>
        <div class="foot">
          <span @click="go_register">立即注册</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: '',
      mobile: '',
      sms: '',
      login_method: 'is_pwd',
      sms_interval: '获取验证码',
      is_send: false
    }
  },
  methods: {
    close_login () {
      this.$emit('close')
    },
    go_register () {
      this.$emit('go')
    },
    change_login_method (method) {
      this.login_method = method
    },
    check_mobile () {
      if (!this.mobile) return
      this.is_send = false
      if (!this.mobile.match(/^1[3-9][0-9]{9}$/)) {
        this.$message({
          message: '手机号有误',
          type: 'warning',
          duration: 1000
          // onClose: () => {
          //   this.mobile = ''
          // }
        })
        return false
      }
      this.axios.get('user/check_telephone/', { params: { telephone: this.mobile } })
        .then(response => {
          if (response.data.code) {
            this.is_send = true
          } else {
            this.$message({
              message: '手机号未注册',
              type: 'warning',
              duration: 1000
            })
          }
        }).catch(error => {
          console.log(error)
        })
    },
    send_sms () {
      if (!this.is_send) return
      this.is_send = false
      let smsIntervalTime = 60
      this.sms_interval = '发送中...'

      this.axios.get('user/send_sms/', { params: { telephone: this.mobile } })
        .then(response => {
          if (response.data.code) {
            this.$message({
              message: '验证码发送成功',
              type: 'success',
              duration: 1000
            })
          }
        }).catch(error => {
          console.log(error)
        })

      const timer = setInterval(() => {
        if (smsIntervalTime <= 1) {
          clearInterval(timer)
          this.sms_interval = '获取验证码'
          this.is_send = true // 重新回复点击发送功能的条件
        } else {
          smsIntervalTime -= 1
          this.sms_interval = `${smsIntervalTime}秒后再发`
        }
      }, 1000)
    },
    login_pwd () {
      if (this.username && this.password) {
        this.axios.post('user/login/', { username: this.username, password: this.password })
          .then(response => {
            if (response.data.code) {
              this.$cookies.set('token', response.data.token, '7d')
              this.$cookies.set('username', response.data.username, '7d')
              // 关闭登录界面 父组件取值
              this.$emit('close')
              this.$emit('loginSuccess')
            } else {
              this.$message({
                message: '账户或密码错误',
                type: 'warning'
              })
            }
          }).catch(error => {
            console.log(error)
          })
      } else {
        this.$message({
          message: '请输入手机号和验证码',
          type: 'warning'
        })
      }
    },
    login_code () {
      if (this.mobile && this.sms) {
        this.axios.post('user/code_login/', { telephone: this.mobile, code: this.sms })
          .then(response => {
            if (response.data.code) {
              this.$cookies.set('token', response.data.token, '7d')
              this.$cookies.set('username', response.data.username, '7d')
              // 关闭登录界面 父组件取值
              this.$emit('close')
              this.$emit('loginSuccess')
            } else {
              this.$message({
                message: '验证码错误',
                type: 'warning'
              })
            }
          }).catch(error => {
            console.log(error)
          })
      } else {
        this.$message({
          message: '请输入用户名和密码',
          type: 'warning'
        })
      }
    }
  }
}
</script>

<style scoped>
.login {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.3);
}

.box {
  width: 400px;
  height: 420px;
  background-color: white;
  border-radius: 10px;
  position: relative;
  top: calc(50vh - 210px);
  left: calc(50vw - 200px);
}

.el-icon-close {
  position: absolute;
  font-weight: bold;
  font-size: 20px;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.el-icon-close:hover {
  color: darkred;
}

.content {
  position: absolute;
  top: 40px;
  width: 280px;
  left: 60px;
}

.nav {
  font-size: 20px;
  height: 38px;
  border-bottom: 2px solid darkgrey;
}

.nav > span {
  margin: 0 20px 0 35px;
  color: darkgrey;
  user-select: none;
  cursor: pointer;
  padding-bottom: 10px;
  border-bottom: 2px solid darkgrey;
}

.nav > span.active {
  color: black;
  border-bottom: 3px solid black;
  padding-bottom: 9px;
}

.el-input,
.el-button {
  margin-top: 40px;
}

.el-button {
  width: 100%;
  font-size: 18px;
}

.foot > span {
  float: right;
  margin-top: 20px;
  color: orange;
  cursor: pointer;
}

.sms {
  color: orange;
  cursor: pointer;
  display: inline-block;
  width: 70px;
  text-align: center;
  user-select: none;
}
</style>
