<template>
  <div class="home">
    <el-container>
      <el-aside width="20%">
        <p>参数设置区</p>
        <div id="inputMsg">
          <p>雷达位置 (x, y):</p>
          <div class="block">
            <el-slider
              v-model="x_value"
              :max="xy_max"
              @change="getPlt"
            ></el-slider>
            <el-slider
              v-model="y_value"
              :max="xy_max"
              @change="getPlt"
            ></el-slider>
          </div>
          <p>雷达半径:</p>
          <div class="block">
            <el-slider
              v-model="rng_value"
              :max="rng_max"
              :min="10"
              @change="getPlt"
            >
            </el-slider>
          </div>
          <p>模拟天气类型:</p>
          <el-radio-group
            v-model="weatherRadio"
            size="mini"
            style="margin-top: 10px"
          >
            <el-radio-button
              v-for="(item, index) in weatherList"
              :key="index"
              :label="item"
            ></el-radio-button>
          </el-radio-group>
          <p style="margin-top: 10px">天线转速:</p>
          <div class="block">
            <el-slider v-model="seep" :max="40" :min="20"> </el-slider>
          </div>
          <div style="margin-top: 10px">
            <p style="margin-bottom: 10px">绘图模式:</p>
            <el-radio v-model="radio" label="1">刷新模式</el-radio>
            <el-radio v-model="radio" label="2">经典模式</el-radio>
          </div>
          <div style="margin-top: 10px">
            <p style="margin-bottom: 10px">视图模式:</p>
            <el-radio v-model="isShowImg" label="1">地理视图</el-radio>
            <el-radio v-model="isShowImg" label="2">雷达视图</el-radio>
          </div>
        </div>
        <el-button
          type="primary"
          plain
          style="margin-top: 20px"
          @click="getPltImg"
          >{{ btnMsg }}
        </el-button>
      </el-aside>
      <el-main>
        <el-row v-show="isShow">
          <el-col :span="12">
            <img :src="pltImg" alt="" :width="pltWidth" :height="pltWidth"
          /></el-col>
          <el-col :span="8" :offset="3">
            <el-collapse
              accordion
              style="margin-top: 20px"
              v-model="activeName"
            >
              <el-collapse-item name="1">
                <template slot="title">
                  操作提示 Tips <i class="header-icon el-icon-info"></i>
                </template>
                <p>1. 选择观测时雷达所在位置</p>
                <p>2. 选择雷达半径值</p>
                <p>3. 选择观测模式</p>
                <p>4. 选择模拟天气类型</p>
                <p>5. 点击 -开始模拟-(默认参数可以直接开始模拟)</p>
                <p>6. 点击 -视图模式- 区,可来回切换</p>
              </el-collapse-item>
              <el-collapse-item title="详细说明">
                <div>雷达位置: 拉动滑块可改变模拟观测时雷达所在的位置</div>
                <br />
                <div>
                  -绘图模式- 刷新模式: 每一仰角都清除干净再重新绘制;经典模式:
                  保留上一仰角绘图痕迹
                </div>
                <br />
                <div>模拟天气类型: 可以选择需要模拟的天气场类型</div>
                <br />
                <div>
                  视图模式: 地理视图为 雷达与模拟天气场位置信息; 雷达视图为
                  雷达半径内观测到信息
                </div>
                <br />
                <div>
                  地理视图可以通过 -雷达位置- 的滑块改变;而雷达视图只有点击
                  -开始模拟- 后才会响应
                </div>
                <br />
                <div>-天线转速- 在下一仰角生效</div>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>

        <Canvas
          :x_value="x_value"
          :y_value="y_value"
          :rng_value="rng_value"
          :weather="weatherRadio"
          :weather_radio="weatherList.indexOf(weatherRadio)"
          :radio="radio"
          :seep="seep"
          canvas_dbz_id="DBZcanvas"
          canvas_vr_id="VRcanvas"
          ref="Canvas"
          v-show="!isShow"
          @canvasOver="darwOver"
          @getbDZOver="getOver"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script>
// @ is an alias to /src
import Canvas from '@/components/canvas.vue'
export default {
  name: 'Home',
  data () {
    return {
      x_value: 140,
      y_value: 120,
      rng_value: 150,
      xy_max: 200,
      rng_max: 230,
      weatherList: ['雷暴', '龙卷', '台风'],
      weatherRadio: '雷暴',
      radio: '1',
      pltImg: '',
      pltWidth: 0,
      isShow: true,
      isShowImg: '1',
      activeName: '1',
      btnMsg: '开始模拟',
      seep: 35 // 绘图速度
    }
  },
  components: {
    Canvas
  },
  watch: {
    isShowImg: function (newV, oldV) {
      if (newV === '2') {
        this.isShow = false
      }
      if (newV === '1') {
        this.isShow = true
      }
    }
  },
  created () {
    this.initPlt()
  },
  methods: {
    initPlt () {
      this.axios.post('radar/pltImg2/', {
        x_value: this.x_value,
        y_value: this.y_value,
        rng_value: this.rng_value,
        weather_radio: this.weatherList.indexOf(this.weatherRadio)
      }).then(response => {
        if (response.data.code) {
          this.pltImg = response.data.ret
          this.pltWidth = 500
        } else {
          this.$message({
            message: '未知错误',
            type: 'warning'
          })
        }
      }).catch(error => {
        console.log(error)
      })
    },
    getPlt () {
      this.axios.post('radar/pltImg/', {
        x_value: this.x_value,
        y_value: this.y_value,
        rng_value: this.rng_value,
        weather_radio: this.weatherList.indexOf(this.weatherRadio)
      }).then(response => {
        if (response.data.code) {
          this.pltImg = response.data.ret
          this.pltWidth = 500
        } else {
          this.$message({
            message: '未知错误',
            type: 'warning'
          })
        }
      }).catch(error => {
        console.log(error)
      })
    },
    getPltImg () {
      this.getPlt()
      this.$nextTick(() => {
        this.btnMsg = '请求中...'
        this.$refs.Canvas.getDBZ()
      })
    },
    getOver () {
      this.btnMsg = '模拟中...'
      this.isShowImg = '2'
    },
    darwOver () {
      this.btnMsg = '开始模拟'
    }

    // getDbz () {
    //   this.$refs.Echart.getDBZ()
    // }
  }
}
</script>
<style scoped>
.el-aside {
  background-color: #e9f0f8;
  color: #333;
  padding: 20px;
  font-weight: 550;
}

.el-main {
  background-color: #fff;
  color: #333;
  text-align: left;
}

.el-container {
  margin-bottom: 20px;
  height: 900px;
}

#inputMsg {
  text-align: left;
  font-size: 14px;
}
</style>
