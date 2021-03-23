import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './plugins/echarts'
import cookies from 'vue-cookies'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

Vue.use(cookies)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
