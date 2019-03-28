// pages/index/switch/switch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //测试数据
    list:[
      {
        title:'职业资格类',
        catalogs:[
          '金融类小程序',
          '教师资格证',
          '导游从业资格',
          '劳动关系协调师',
          '健康管理师',
          '房地产经纪人'
        ]
      },
      {
        title:'小程序',
        catalogs:[
          '金融类小程序',
          '教师资格证',
          '导游从业资格证',
          '劳动关系协调师'
        ]
      },
      {
        title:'课程类',
        catalogs: [
          '金融类小程序',
          '教师资格证',
          '导游从业资格证',
          '劳动关系协调师',
          '健康管理师',
          '房地产经纪人'
        ]
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '切换考试',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 
   */
  onUnload:function(){
    //如果改变了类别,就设置上个页面的标题
    if(this.data.title){
      wx.setNavigationBarTitle({
        title: this.data.title
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    let titleIndex = 0;
    let itemIndex = 2;

    self.setData({
      titleIndex: titleIndex,
      itemIndex: itemIndex
    })
  },

  /**
   * 改变类目
   */
  change:function(e){
    let cIndex = e.currentTarget.dataset.cindex;
    let tIndex = e.currentTarget.dataset.tindex;
    let title = e.currentTarget.dataset.title;//点击的标题

    this.setData({
      titleIndex: tIndex,
      itemIndex: cIndex,
      title: title
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})