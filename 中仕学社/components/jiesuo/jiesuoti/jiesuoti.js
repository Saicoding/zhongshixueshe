// components/jiesuo/jiesuo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    windowHeight: {
      type: Number,
      value: 1333
    },
    platform: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false
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

    /**
     * 打电话
     */
    phone: function() {
      wx.makePhoneCall({
        phoneNumber: '4006-456-114'
      })
    },
    //toogle展示
    toogleDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //阻止事件冒泡
    stopBubbling: function(e) {},

    //点击了空地,让蒙版消失
    tapBlank: function(e) {
      this.setData({
        isShow: false
      })
    },

    //解锁全部
    _buy: function(e) {
      let product = e.currentTarget.dataset.product;
      this.triggerEvent('buy', {
        product: product
      });
    }

  }
})