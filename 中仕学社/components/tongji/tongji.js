// components/tongji/tongji.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

    statusBarHeight: {
      type: Number,
      value: 46,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
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

    /**
     * 点击返回按钮
     */
    _toBack:function(){
      this.triggerEvent('toBack');
    },

    /**
     * 查看错题
     */
    _viewWrong:function(){
      this.triggerEvent('viewWrong');
    },

    /**
     * 导航到学习计划
     */
    _GOxuexijihua:function(){
      this.triggerEvent('GOxuexijihua');
    },

    /**
     * 点击继续做题按钮
     */
    jixuzuoti:function(){
      this.hideDialog();
    }
  }
})