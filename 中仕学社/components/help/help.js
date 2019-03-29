// components/help/help.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    //展示
    show:function(){
      this.setData({
        show:true
      })
    },

    //隐藏
    hide:function(){
      this.setData({
        show:false
      })
      wx.setStorage({
        key: 'help',
        data: true,
      })
    }

  }
})
