// components/jiexi/jiexi.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isAnswer: {
      type: Boolean,
      value: false
    },
    jiexi: {
      type: String,
      value: "该题没有解析"
    },
    answer: {
      type: String,
      value: ""
    },
    buy:{
      type:Number,
      value:0
    },
    beizhu:{
      type:String,
      value:""
    },
    level:{
      type:String,
      value:"",
      observer: function (level) {
        let levels = new Array(level*1);
        this.setData({
          levels:levels
        })
      }
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
    _toggleErrorRecovery: function () {
      this.triggerEvent('toggleErrorRecovery')
    },
    
    /**
     * 点击解锁后
     */
    _jiesuo:function(){
      this.triggerEvent('jiesuo')
    }
  }
})
