<template>
  <div id="app">
    <el-container>
      <el-header height="30px">
        <el-row :gutter="40">
          <el-col :span="6" :offset="0.5">
            <span> <i class="el-icon-heavy-rain"></i> 模拟雷达回波系统 </span>
          </el-col>
          <el-col :span="8" :offset="3">
            <div id="nav">
              <el-row>
                <el-col :span="6" :offset="3">
                  <router-link to="/"> 雷达模拟 </router-link>
                </el-col>
                <el-col :span="6">
                  <router-link to="/contrast"> 雷达对比 </router-link>
                </el-col>
                <el-col :span="6">
                  <router-link to="/about"> 关于我们 </router-link>
                </el-col>
              </el-row>
            </div></el-col
          >
        </el-row>
      </el-header>
    </el-container>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
  </div>
</template>

<style scoped>
#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 14px;
}
#nav a {
  text-decoration: none;
  color: rgb(255, 255, 255);
}

#nav a.router-link-exact-active {
  border: #ffffff 1px solid;
  border-radius: 10%;
  padding: 1px;
  /* text-decoration: underline; */
}
.el-header {
  background-color: #02a5ec;
  font-weight: bolder;
  color: rgb(255, 255, 255);
  text-align: left;
  line-height: 30px;
  font-family: "微软雅黑";
}
</style>
