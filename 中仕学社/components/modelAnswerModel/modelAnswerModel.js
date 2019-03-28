// components/errorRecovery/errorRecovery.js
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
    nums: 0,//总题量
    maxScore: 100,//总分值
    highStore:0,//最好分数
    time:0,//总时间
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
      this.setData({
        isShow: true
      })
    },
    //toogle展示
    toogleDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //阻止事件冒泡
    stopBubbling: function (e) { },

    //点击了空地,让蒙版消失
    tapBlank: function (e) {
      this.setData({
        isShow: false
      })
    },

    //点击开始刷题按钮
    _GOmoni: function (e) {
      this.hideDialog();
      this.triggerEvent('GOmoni', { id: this.data.id, title: this.data.title, times: this.data.time, nums: this.data.nums, maxScore:this.data.maxScore,highScore:this.data.highScore});
    }
  }

})