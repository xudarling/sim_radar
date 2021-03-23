<template>
  <div class="about">
    <div v-if="!username">
      <span @click="put_login">登录</span> |
      <span @click="put_register">注册</span>
    </div>
    <div v-else>
      <span>{{ username }}</span> |
      <span @click="logout">注销</span>
    </div>
    <p></p>

    <Login
      v-if="is_login"
      @close="close_login"
      @go="put_register"
      @loginSuccess="login_success"
    />
    <Register v-if="is_register" @close="close_register" @go="put_login" />
  </div>
</template>

<script>
import Login from '@/components/Login.vue'
import Register from '@/components/register.vue'
export default {
  data () {
    return {
      is_login: false,
      is_register: false,
      username: '',
      token: ''
    }
  },
  created () {
    this.username = this.$cookies.get('username')
    this.token = this.$cookies.get('token')
    // this.axios.get('http://127.0.0.1:8000/home/')
    //   .then(res => {
    //     console.log(res)
    //   }).catch(error => {
    //     console.log(error)
    //   })
  },
  components: {
    Login,
    Register
  },
  methods: {
    put_login () {
      this.is_login = true
      this.is_register = false
    },
    put_register () {
      this.is_login = false
      this.is_register = true
    },
    close_login () {
      this.is_login = false
    },
    close_register () {
      this.is_register = false
    },
    login_success () {
      this.username = this.$cookies.get('username')
      this.token = this.$cookies.get('token')
    },
    logout () {
      this.$cookies.remove('token')
      this.$cookies.remove('username')
      this.token = ''
      this.username = ''
    }
  }
}
</script>
<style  scoped>
</style>
