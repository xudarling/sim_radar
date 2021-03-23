import Vue from 'vue'
import {
  Button, Form, Input, Message,
  Container, Header, Main, Aside, Slider, Radio,
  RadioGroup, RadioButton, Row, Col, Collapse, CollapseItem, Popover, Select, Option
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Slider)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Radio)

Vue.use(Row)
Vue.use(Col)

Vue.use(Collapse)
Vue.use(CollapseItem)

Vue.use(Popover)

Vue.use(Select)
Vue.use(Option)

Vue.prototype.$message = Message
