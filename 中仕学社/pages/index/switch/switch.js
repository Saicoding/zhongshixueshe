// pages/index/switch/switch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //测试数据
    list:[
      {
        title:'健康管理师',
        id:1,
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
        title:'导游资格证',
        id:2,
        catalogs:[
          '金融类小程序',
          '教师资格证',
          '导游从业资格证',
          '劳动关系协调师'
        ]
      },
      {
        title:'房地产经纪人',
        id:3,
        catalogs: [
          '金融类小程序',
        ]
      },
      {
        title: '房地产经纪人协理',
        id:4,
        catalogs: [
          '金融类小程序',
          '房地产经纪人'
        ]
      },
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
    let titleIndex, itemIndex;
    let type = wx.getStorageSync('kaoshi');
    if(type){
      titleIndex = type.tIndex;
      itemIndex = type.cIndex;
    }else{
      titleIndex = 0;
      itemIndex = 2;
    }

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
    let tid = e.currentTarget.dataset.tid;

    wx.setStorage({
      key: 'kaoshi',
      data: {cIndex: cIndex, tIndex: tIndex,title:title,tid:tid},
    })

    this.setData({
      titleIndex: tIndex,
      itemIndex: cIndex,
      title: title
    })
    wx.navigateBack({
      delta: 1,
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})