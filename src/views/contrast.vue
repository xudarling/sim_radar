<template>
  <div class="contrast">
    <el-container>
      <el-aside width="20%">
        <div id="inputMsg-A">
          <p class="center">参数设置区</p>
          <p>雷达参数 (x, y, 半径):</p>
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
          <p>雷达波长:</p>
          <el-row>
            <el-col :span="4" class="rowcenter">
              <span>A: </span>
            </el-col>
            <el-col :span="16">
              <el-select v-model="num_A" size="mini">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row style="margin-top: 10px">
            <el-col :span="4" class="rowcenter">
              <span>B: </span>
            </el-col>
            <el-col :span="16">
              <el-select v-model="num_B" size="mini">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-col>
          </el-row>
        </div>
        <div class="darw">
          <p class="center">绘图设置区:</p>
          <p>天线转速:</p>
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
          <el-button
            type="primary"
            plain
            style="margin-top: 20px"
            @click="getPltImg"
            >{{ btnMsg }}
          </el-button>
        </div>
      </el-aside>
      <el-main>
        <el-row v-show="isShow">
          <el-col :span="11">
            <img :src="pltImg" alt="" :width="pltWidth" :height="pltWidth"
          /></el-col>
        </el-row>
        <Canvas2
          :x_value="x_value"
          :y_value="y_value"
          :rng_value="rng_value"
          :weather="weatherRadio"
          :weather_radio="this.weatherList.indexOf(this.weatherRadio)"
          :radio="radio"
          :seep="seep"
          :Data="Data"
          :DataVR="DataVR"
          canvas_dbz_id="DBZcanvas"
          canvas_vr_id="VRcanvas"
          ref="Canvas"
          v-show="!isShow"
          @canvasOver="darwOver"
          @getbDZOver="getOver"
        />
        <Canvas2
          :x_value="x_value"
          :y_value="y_value"
          :rng_value="rng_value"
          :weather="weatherRadio"
          :weather_radio="this.weatherList.indexOf(this.weatherRadio)"
          :radio="radio"
          :seep="seep"
          :Data="Data_B"
          :DataVR="DataVR_B"
          canvas_dbz_id="DBZcanvas_B"
          canvas_vr_id="VRcanvas_B"
          ref="Canvas_B"
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
import Canvas2 from '@/components/canvas2.vue'
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
      pltImg: '',
      pltWidth: 0,
      num_A: '1',
      // B 雷达 参数
      num_B: '1',
      // 绘图参数
      isShow: true,
      isShowImg: '1',
      activeName: '1',
      btnMsg: '开始模拟',
      radio: '1',
      seep: 35, // 绘图速度
      // 数据
      Data: [],
      DataVR: [],
      Data_B: [],
      DataVR_B: [],
      options: [{
        value: '1',
        label: '1km'
      }, {
        value: '2',
        label: '500m'
      }, {
        value: '3',
        label: '200m'
      }]

    }
  },
  components: {
    Canvas2
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
        this.getDBZ()
      })
    },
    getOver () {
      this.btnMsg = '模拟中...'
      this.isShowImg = '2'
    },
    darwOver () {
      this.btnMsg = '开始模拟'
    },
    // 那 数据
    getDBZ () {
      this.$refs.Canvas.clearCanvas()
      this.$refs.Canvas_B.clearCanvas()

      this.$refs.Canvas.updateMsg()
      this.$refs.Canvas_B.updateMsg()

      this.$message({
        message: '网络请求中请稍等...',
        type: 'info',
        duration: 1000
      })

      this.axios.post('radar/canvas2/', {
        x_value: this.x_value,
        y_value: this.y_value,
        rng_value: this.rng_value,
        ele: 0,
        numA: this.num_A,
        numB: this.num_B
      }).then(response => {
        if (response.data.code) {
          this.Data = response.data.ret.dbzData
          this.DataVR = response.data.ret.vrData

          this.Data_B = response.data.ret.dbzData_B
          this.DataVR_B = response.data.ret.vrData_B
          this.getOver()

          this.$nextTick(() => {
            this.$refs.Canvas.drwaAll()
            this.$refs.Canvas.drwaAllVR()

            this.$refs.Canvas_B.drwaAll()
            this.$refs.Canvas_B.drwaAllVR()
          })

          // 取剩下的数据
          this.getAll()
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
    getOne (i) {
      return new Promise((resolve) => {
        this.axios.post('radar/canvas2/', {
          x_value: this.x_value,
          y_value: this.y_value,
          rng_value: this.rng_value,
          ele: i,
          numA: this.num_A,
          numB: this.num_B
        }).then(response => {
          if (response.data.code) {
            this.Data.push.apply(this.Data, response.data.ret.dbzData)
            this.DataVR.push.apply(this.DataVR, response.data.ret.vrData)

            this.Data_B.push.apply(this.Data_B, response.data.ret.dbzData_B)
            this.DataVR_B.push.apply(this.DataVR_B, response.data.ret.vrData_B)

            console.log(this.Data)
          } else {
            this.$message({
              message: '未知错误',
              type: 'warning'
            })
          }
          resolve()
        })
      })
    },
    async getAll () {
      // 改为 同步 一次取一条
      var i = 1
      await this.getOne(i++)
      await this.getOne(i++)
      await this.getOne(i++)
      await this.getOne(i++)
      await this.getOne(i++)
      await this.getOne(i++)
      await this.getOne(i++)
      await this.getOne(i++)
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
  padding-top: 0;
  font-weight: 550;
  text-align: left;
  font-size: 14px;
}

.el-main {
  background-color: #fff;
  color: #333;
  text-align: left;
  padding: 0;
}

.el-container {
  margin-bottom: 20px;
  height: 900px;
}

.center {
  text-align: center;
  margin-top: 10px;
}
.rowcenter {
  line-height: 20px;
  padding-left: 5px;
}
</style>
