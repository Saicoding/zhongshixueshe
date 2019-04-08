// components/errorRecovery/errorRecovery.js
let newAni = require('../../common/newAnimate.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    windowHeight: {
      type: Number,
      value: 1333
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
 
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: false
      })
    },
    //展示弹框
    showDialog() {
      let self = this;
      let obj = {
      }
      let bigAnimate = newAni.big1(obj,1.5);
      this.setData({
        isShow: true,
      })

      setTimeout(function(){
        self.setData({
          bigAnimate: bigAnimate
        })
      },100)
    },
    //toogle展示
    toogleDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //点击了空地,让蒙版消失
    tapBlank: function (e) {
      this.setData({
        isShow: false
      })
    },
    //阻止事件冒泡
    stopBubbling: function (e) { },

  }

})