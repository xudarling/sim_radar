<template>
  <div id="Canvas">
    <el-row>
      <el-col :span="6">
        <canvas :id="canvas_dbz_id" width="400px" height="400px"></canvas>
      </el-col>
      <el-col :span="6">
        <div id="radioMsg">
          <div>
            雷达参数: x:{{ x_value_X }} y:{{ y_value_X }} r: {{ rng_value_X }}
          </div>
          <div>天气类型: {{ weather_X }} 天线转速: {{ seep_X }}</div>
          <div>发射机状态:{{ transmitterStatus }}</div>
          <div>
            方位角:
            {{ (curAzimuth / 2).toFixed() }}°
          </div>
          <div>仰角:{{ eleList[ele] }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <canvas :id="canvas_vr_id" width="400px" height="400px"></canvas>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Canvas',
  props: ['x_value', 'y_value', 'rng_value', 'weather_radio', 'radio', 'seep', 'canvas_dbz_id', 'canvas_vr_id', 'weather'],
  data () {
    return {
      r: 150, // 图形半径
      Data: [], // dbz 元数据
      DataVR: [], // vr 元数据
      timer: '', // 画图定时器
      timerVR: '',
      timer2: '',
      timerVR2: '',
      dbzColor: ['#00FEFE', '#00ACFE', '#0064FE', '#00FE00', '#00AC00', '#006400', '#FEFE00',
        '#FEAC00', '#FE6400', '#FE0000', '#AC0000', '#640000', '#FE00FE', '#AC00AC', '#640064'],
      vrColor: ['#240CF3', '#3849F5', '#559CF6', '#6FE9B3', '#5DC961', '#50AA28', '#51A419',
        '#73C31D', '#98DC1F', '#C0C0C0', '#F9FE29', '#E9DE24', '#E3C221', '#DBA120', '#CA601A',
        '#C03118', '#BD0317', '#85001C', '#49013F'],
      dbzColorScale: [-5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
      vrColorScale: [-20, -12, -7.5, -6.5, -5.5, -4.5, -3.5, -2.5, -1.5, -0.5,
        0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 12], // 视觉映射 对应表
      ele: 0, // 显示 当前仰角
      eleList: [0.5, 1.0, 1.8, 2.6, 3.6, 4.7, 6.5, 9.1, 12.8],
      transmitterStatus: '开启',
      curAzimuth: 0,
      x_value_X: this.x_value,
      y_value_X: this.y_value,
      rng_value_X: this.rng_value,
      weather_X: this.weather,
      seep_X: this.seep
    }
  },
  mounted () {
    this.initCanvas() // 拿canvas 上下文
  },
  methods: {
    initCanvas () {
      this.ctx = document.getElementById(this.canvas_dbz_id).getContext('2d')
      this.ctxVR = document.getElementById(this.canvas_vr_id).getContext('2d')
      this.drawCoord(this.ctx) // 画坐标
      this.drawColorMap(this.ctx) //  画色标
      this.drawCoord(this.ctxVR) // 画坐标
      this.drawColorMapVR(this.ctxVR) //  画色标
      this.updateMsg()
    },
    clearCanvas () {
      document.getElementById(this.canvas_dbz_id).height = 400
      document.getElementById(this.canvas_vr_id).height = 400
      this.$nextTick(() => {
        this.initCanvas()
      })
      clearInterval(this.timerVR) // 清除
      clearInterval(this.timer)
      clearInterval(this.timerVR2) // 清除 模式2
      clearInterval(this.timer2)
      this.curAzimuth = 0
      this.ele = 0
    },
    // 更新信息显示栏
    updateMsg () {
      this.x_value_X = this.x_value
      this.y_value_X = this.y_value
      this.rng_value_X = this.rng_value
      this.weather_X = this.weather
      this.seep_X = this.seep
    },
    getOne (i) {
      return new Promise((resolve) => {
        this.axios.post('radar/canvas/', {
          x_value: this.x_value,
          y_value: this.y_value,
          rng_value: this.rng_value,
          ele: i
        }).then(response => {
          if (response.data.code) {
            this.Data.push.apply(this.Data, response.data.ret.dbzData)
            this.DataVR.push.apply(this.DataVR, response.data.ret.vrData)
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
    },
    getDBZ () {
      this.clearCanvas()
      this.updateMsg()
      this.$message({
        message: '网络请求中请稍等...',
        type: 'info',
        duration: 1000
      })
      this.axios.post('radar/canvas/', {
        x_value: this.x_value,
        y_value: this.y_value,
        rng_value: this.rng_value,
        ele: 0
      }).then(response => {
        if (response.data.code) {
          this.Data = response.data.ret.dbzData
          this.DataVR = response.data.ret.vrData
          this.$emit('getbDZOver')
          this.drwaAll()
          this.drwaAllVR()
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
    getDBZ2 () {
      this.clearCanvas()
      this.updateMsg()
      this.$message({
        message: '网络请求中请稍等...',
        type: 'info',
        duration: 1000
      })
      this.axios.post('radar/canvas/', {
        x_value: this.x_value,
        y_value: this.y_value,
        rng_value: this.rng_value,
        ele: 0
      }).then(response => {
        if (response.data.code) {
          this.Data = response.data.ret.dbzData
          this.DataVR = response.data.ret.vrData
          this.drwaAll2()
          this.drwaAllVR2()
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
    async drwaAll () {
      var i = 0
      for (; i < this.Data.length; i++) {
        this.ele = i
        if (this.radio === '1') {
          await this.draw(i)
        } else {
          await this.draw2(i)
        }
      }
      if (this.ele === this.eleList.length - 1) {
        this.$message({
          message: '绘制完成',
          type: 'success',
          duration: 1000
        })
        this.$emit('canvasOver')
      }
      if (i < this.eleList.length - 1) {
        this.$message({
          message: '网络速度太慢啦...',
          type: 'warning',
          duration: 1000
        })
      }
    },
    async drwaAllVR () {
      for (let i = 0; i < this.Data.length; i++) {
        if (this.radio === '1') {
          await this.drawVR(i)
        } else {
          await this.drawVR2(i)
        }
      }
    },
    async drwaAll2 () {
      var i = 0
      for (; i < this.Data.length; i++) {
        this.ele = i
        await this.draw2(i)
      }
      if (this.ele === this.eleList.length - 1) {
        this.$message({
          message: '绘制完成',
          type: 'success',
          duration: 1000
        })
      }
      if (i < this.eleList.length - 1) {
        this.$message({
          message: '网络速度太慢啦...',
          type: 'warning',
          duration: 1000
        })
      }
    },
    async drwaAllVR2 () {
      for (let i = 0; i < this.Data.length; i++) {
        await this.drawVR2(i)
      }
    },
    // 画 坐标
    drawCoord (ctx) {
      ctx.beginPath()
      ctx.arc(200, 200, this.r + 2, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.globalCompositeOperation = 'source-over'

      ctx.strokeStyle = '#000'
      ctx.setLineDash([])
      ctx.stroke()
      ctx.strokeStyle = '#9C9C9C'
      ctx.setLineDash([5, 10])
      // 半径轴
      for (var i = 50; i < this.rng_value; i += 50) {
        ctx.beginPath()
        ctx.arc(200, 200, this.r * i / this.rng_value, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.stroke()
      }
      // 角度轴
      ctx.beginPath()
      ctx.lineTo(50, 200)
      ctx.lineTo(350, 200)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.lineTo(200, 50)
      ctx.lineTo(200, 350)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.lineTo(200 - 106, 200 - 106)
      ctx.lineTo(200 + 106, 200 + 106)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.lineTo(200 - 106, 200 + 106)
      ctx.lineTo(200 + 106, 200 - 106)
      ctx.closePath()
      ctx.stroke()
    },
    // 画 无最外圈 坐标
    drawCoord2 (ctx) {
      ctx.strokeStyle = '#9C9C9C'
      ctx.globalCompositeOperation = 'destination-over'
      ctx.lineWidth = 0.1
      ctx.setLineDash([5, 10])
      // 半径轴
      for (var i = 50; i < this.rng_value; i += 50) {
        ctx.beginPath()
        ctx.arc(200, 200, this.r * i / this.rng_value, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.stroke()
      }
      // 角度轴
      ctx.beginPath()
      ctx.lineTo(50, 200)
      ctx.lineTo(350, 200)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.lineTo(200, 50)
      ctx.lineTo(200, 350)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.lineTo(200 - 106, 200 - 106)
      ctx.lineTo(200 + 106, 200 + 106)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.lineTo(200 - 106, 200 + 106)
      ctx.lineTo(200 + 106, 200 - 106)
      ctx.closePath()
      ctx.stroke()
      ctx.globalCompositeOperation = 'source-over'
    },
    // 画 色标
    drawColorMap (ctx) {
      ctx.font = '10px Songti SC'
      for (var i = 0; i < this.dbzColor.length; i++) {
        ctx.fillStyle = this.dbzColor[i]
        ctx.fillRect(330 - i * 18, 375, 18, 10)
        ctx.fillStyle = '#000'
        ctx.fillText(this.dbzColorScale[i], 330 - i * 18, 370)
      }
      ctx.font = '16px STheiti'
      ctx.fillText('dBZ', 30, 380)
    },
    drawColorMapVR (ctx) {
      var Scale = ''
      for (var i = 0; i < this.vrColor.length; i++) {
        ctx.fillStyle = this.vrColor[i]
        ctx.fillRect(360 - i * 18, 375, 18, 10)
        if (i > 1 && i < 18) {
          Scale = this.vrColorScale[i] + 0.5
        } else {
          Scale = this.vrColorScale[i]
        }
        ctx.fillStyle = '#000'
        ctx.fillText(Scale, 360 - i * 18, 370)
      }
      ctx.font = '16px STheiti'
      ctx.fillText('Vr', 0, 380)
    },
    // 画 主图
    draw (el) {
      return new Promise((resolve) => {
        var ctx = this.ctx
        var r = this.r// 半径
        var dev = 50 // 偏移量
        var rangle = this.rng_value // 半径个数
        var step = 720 // 角度数
        var i = 0
        // 清除上次的痕迹
        ctx.clearRect(45, 45, 310, 310)
        this.drawCoord(ctx)
        this.timer = setInterval(() => { // 设置延迟执行
          // 循环角度
          var rad1 = 2 * Math.PI / step * (-i)
          var rad2 = 2 * Math.PI / step * (-i - 1)
          // 增加 扫描线
          this.clearLast(ctx, step, i)
          // 循环半径
          for (var j = 0; j < rangle; j++) {
            ctx.beginPath()
            var x1 = r - Math.sin(rad1) * r * (j / rangle) + dev
            var y1 = r - Math.cos(rad1) * r * (j / rangle) + dev
            var x2 = r - Math.sin(rad1) * r * ((j + 1) / rangle) + dev
            var y2 = r - Math.cos(rad1) * r * ((j + 1) / rangle) + dev
            var x3 = r - Math.sin(rad2) * r * ((j + 1) / rangle) + dev
            var y3 = r - Math.cos(rad2) * r * ((j + 1) / rangle) + dev
            var x4 = r - Math.sin(rad2) * r * (j / rangle) + dev
            var y4 = r - Math.cos(rad2) * r * (j / rangle) + dev

            ctx.lineTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.lineTo(x3, y3)
            ctx.lineTo(x4, y4)
            ctx.closePath()
            const color = this.getcolor(this.Data[el][i][j])
            ctx.strokeStyle = color
            ctx.fillStyle = color
            ctx.fill()
            ctx.stroke()
          };
          i++
          this.curAzimuth = i
          if (i === step) {
            clearInterval(this.timer)
            resolve()
          }
        }, this.seep)
      })
    },
    drawVR (el) {
      return new Promise((resolve) => {
        var ctx = this.ctxVR
        var r = this.r// 半径
        var dev = 50 // 偏移量
        var rangle = this.rng_value // 半径个数
        var step = 720 // 角度数
        // 清除上次的痕迹
        ctx.clearRect(48, 48, 304, 304)
        this.drawCoord(ctx)
        var i = 0
        this.timerVR = setInterval(() => { // 设置延迟执行
          // 循环角度
          var rad1 = 2 * Math.PI / step * (-i)
          var rad2 = 2 * Math.PI / step * (-i - 1)
          // 增加扫描线
          this.clearLast(ctx, step, i)
          // 循环半径
          for (var j = 0; j < rangle; j++) {
            ctx.beginPath()
            var x1 = r - Math.sin(rad1) * r * (j / rangle) + dev
            var y1 = r - Math.cos(rad1) * r * (j / rangle) + dev
            var x2 = r - Math.sin(rad1) * r * ((j + 1) / rangle) + dev
            var y2 = r - Math.cos(rad1) * r * ((j + 1) / rangle) + dev
            var x3 = r - Math.sin(rad2) * r * ((j + 1) / rangle) + dev
            var y3 = r - Math.cos(rad2) * r * ((j + 1) / rangle) + dev
            var x4 = r - Math.sin(rad2) * r * (j / rangle) + dev
            var y4 = r - Math.cos(rad2) * r * (j / rangle) + dev
            ctx.lineTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.lineTo(x3, y3)
            ctx.lineTo(x4, y4)
            ctx.closePath()
            const color = this.getcolorVR(this.DataVR[el][i][j])
            ctx.strokeStyle = color
            ctx.fillStyle = color
            ctx.fill()
            ctx.stroke()
          };
          i++
          if (i === step) {
            clearInterval(this.timerVR)
            resolve()
          }
        }, this.seep)
      })
    },
    // 保留痕迹画法
    draw2 (el) {
      return new Promise((resolve) => {
        var ctx = this.ctx
        var r = this.r// 半径
        var dev = 50 // 偏移量
        var rangle = this.rng_value // 半径个数
        var step = 720 // 角度数
        var i = 0
        this.timer2 = setInterval(() => { // 设置延迟执行
          // 循环角度
          var rad1 = 2 * Math.PI / step * (-i)
          var rad2 = 2 * Math.PI / step * (-i - 1)

          // 清空一个角度 上的图像
          this.clearLast(ctx, step, i)
          // 循环半径
          for (var j = 0; j < rangle; j++) {
            ctx.beginPath()
            var x1 = r - Math.sin(rad1) * r * (j / rangle) + dev
            var y1 = r - Math.cos(rad1) * r * (j / rangle) + dev
            var x2 = r - Math.sin(rad1) * r * ((j + 1) / rangle) + dev
            var y2 = r - Math.cos(rad1) * r * ((j + 1) / rangle) + dev
            var x3 = r - Math.sin(rad2) * r * ((j + 1) / rangle) + dev
            var y3 = r - Math.cos(rad2) * r * ((j + 1) / rangle) + dev
            var x4 = r - Math.sin(rad2) * r * (j / rangle) + dev
            var y4 = r - Math.cos(rad2) * r * (j / rangle) + dev
            ctx.lineTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.lineTo(x3, y3)
            ctx.lineTo(x4, y4)
            ctx.closePath()
            const color = this.getcolor(this.Data[el][i][j])
            ctx.strokeStyle = color
            ctx.fillStyle = color
            ctx.fill()
            ctx.stroke()
          };
          i++
          this.curAzimuth = i
          if (i === step) {
            clearInterval(this.timer2)
            resolve()
          }
        }, this.seep)
      })
    },
    drawVR2 (el) {
      return new Promise((resolve) => {
        var ctx = this.ctxVR
        var r = this.r// 半径
        var dev = 50 // 偏移量
        var rangle = this.rng_value // 半径个数
        var step = 720 // 角度数
        var i = 0
        this.timerVR2 = setInterval(() => { // 设置延迟执行
          // 循环角度
          var rad1 = 2 * Math.PI / step * (-i)
          var rad2 = 2 * Math.PI / step * (-i - 1)
          // 清空一个角度 上的图像
          this.clearLast(ctx, step, i)
          // 循环半径
          for (var j = 0; j < rangle; j++) {
            ctx.beginPath()
            var x1 = r - Math.sin(rad1) * r * (j / rangle) + dev
            var y1 = r - Math.cos(rad1) * r * (j / rangle) + dev
            var x2 = r - Math.sin(rad1) * r * ((j + 1) / rangle) + dev
            var y2 = r - Math.cos(rad1) * r * ((j + 1) / rangle) + dev
            var x3 = r - Math.sin(rad2) * r * ((j + 1) / rangle) + dev
            var y3 = r - Math.cos(rad2) * r * ((j + 1) / rangle) + dev
            var x4 = r - Math.sin(rad2) * r * (j / rangle) + dev
            var y4 = r - Math.cos(rad2) * r * (j / rangle) + dev
            ctx.lineTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.lineTo(x3, y3)
            ctx.lineTo(x4, y4)
            ctx.closePath()
            const color = this.getcolorVR(this.DataVR[el][i][j])
            ctx.strokeStyle = color
            ctx.fillStyle = color
            ctx.fill()
            ctx.stroke()
          };
          i++
          if (i === step) {
            clearInterval(this.timerVR2)
            resolve()
          }
        }, this.seep)
      })
    },
    // 清除前一角度 图形
    clearLast (ctx, step, i) {
      //  增加一条扫描线
      var perRad1 = 2 * Math.PI / step * (-i - 3)
      ctx.beginPath()
      var xx1 = 200 - Math.sin(perRad1) * this.r
      var yy1 = 200 - Math.cos(perRad1) * this.r
      ctx.lineTo(200, 200)
      ctx.lineTo(xx1, yy1)
      ctx.closePath()
      ctx.lineWidth = 0.3
      ctx.setLineDash([])
      ctx.strokeStyle = '#000'
      ctx.stroke()
      // 增加 坐标线
      ctx.strokeStyle = '#9C9C9C'
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = 0.05
      ctx.setLineDash([5, 10])
      // 半径轴
      for (var ii = 50; ii < this.rng_value; ii += 50) {
        ctx.beginPath()
        ctx.arc(200, 200, this.r * ii / this.rng_value, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.stroke()
      }
      // 角度轴
      ctx.beginPath()
      ctx.lineTo(50, 200)
      ctx.lineTo(350, 200)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.lineTo(200, 50)
      ctx.lineTo(200, 350)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.lineTo(200 - 106, 200 - 106)
      ctx.lineTo(200 + 106, 200 + 106)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.lineTo(200 - 106, 200 + 106)
      ctx.lineTo(200 + 106, 200 - 106)
      ctx.closePath()
      ctx.stroke()
      ctx.lineWidth = 1.0
      ctx.setLineDash([])
      ctx.globalCompositeOperation = 'source-over'
    },
    // 拿色标
    getcolor (x) {
      var ret = ''
      switch (true) {
        case x > this.dbzColorScale[14]:
          ret = this.dbzColor[14]
          break
        case x > this.dbzColorScale[13]:
          ret = this.dbzColor[13]
          break
        case x > this.dbzColorScale[12]:
          ret = this.dbzColor[12]
          break
        case x > this.dbzColorScale[11]:
          ret = this.dbzColor[11]
          break
        case x > this.dbzColorScale[10]:
          ret = this.dbzColor[10]
          break
        case x > this.dbzColorScale[9]:
          ret = this.dbzColor[9]
          break
        case x > this.dbzColorScale[8]:
          ret = this.dbzColor[8]
          break
        case x > this.dbzColorScale[7]:
          ret = this.dbzColor[7]
          break
        case x > this.dbzColorScale[6]:
          ret = this.dbzColor[6]
          break
        case x > this.dbzColorScale[5]:
          ret = this.dbzColor[5]
          break
        case x > this.dbzColorScale[4]:
          ret = this.dbzColor[4]
          break
        case x > this.dbzColorScale[3]:
          ret = this.dbzColor[3]
          break
        case x > this.dbzColorScale[2]:
          ret = this.dbzColor[2]
          break
        case x > this.dbzColorScale[1]:
          ret = this.dbzColor[1]
          break
        case x > this.dbzColorScale[0]:
          ret = this.dbzColor[0]
          break
        default:
          ret = '#fff'
      }
      return ret
    },
    getcolorVR (x) {
      var ret = 'a'
      switch (true) {
        case x > this.vrColorScale[18]:
          ret = this.vrColor[18]
          break
        case x > this.vrColorScale[17]:
          ret = this.vrColor[17]
          break
        case x > this.vrColorScale[16]:
          ret = this.vrColor[16]
          break
        case x > this.vrColorScale[15]:
          ret = this.vrColor[15]
          break
        case x > this.vrColorScale[14]:
          ret = this.vrColor[14]
          break
        case x > this.vrColorScale[13]:
          ret = this.vrColor[13]
          break
        case x > this.vrColorScale[12]:
          ret = this.vrColor[12]
          break
        case x > this.vrColorScale[11]:
          ret = this.vrColor[11]
          break
        case x > this.vrColorScale[10]:
          ret = this.vrColor[10]
          break
        case x > this.vrColorScale[9]:
          ret = this.vrColor[9]
          break
        case x > this.vrColorScale[8]:
          ret = this.vrColor[8]
          break
        case x > this.vrColorScale[7]:
          ret = this.vrColor[7]
          break
        case x > this.vrColorScale[6]:
          ret = this.vrColor[6]
          break
        case x > this.vrColorScale[5]:
          ret = this.vrColor[5]
          break
        case x > this.vrColorScale[4]:
          ret = this.vrColor[4]
          break
        case x > this.vrColorScale[3]:
          ret = this.vrColor[3]
          break
        case x > this.vrColorScale[2]:
          ret = this.vrColor[2]
          break
        case x > this.vrColorScale[1]:
          ret = this.vrColor[1]
          break
        case x > this.vrColorScale[0]:
          ret = this.vrColor[0]
          break
        default:
          ret = '#fff'
      }
      return ret
    }
  }
}
</script>

<style scoped>
#radioMsg {
  margin-left: 120px;
  text-align: left;
}
</style>
