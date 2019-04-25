// pages/index/switch/switch.js
const app = getApp()
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({
      title: '切换考试',
    })

    app.post(API_URL,"action=getTypeList",false,false,"").then(res=>{
      let list = res.data.data;
      console.log(list)
      self.setData({
        list:list
      })
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
      
      let pages = getCurrentPages();
      let prepage = pages[pages.length - 2];

      prepage.setData({//初始化上个页面,用于更新上个页面的参数
        first: prepage.data.midHeight?false:true,
      })

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
    let appid = e.currentTarget.dataset.appid;

    if(appid){//如果有appid,导航到对应app
      wx.navigateToMiniProgram({
        appId: appid,
        path: '',
        extraData: {},
        envVersion: 'release',
        success(res) {
          // 打开成功
        }
      })

    }else{
      wx.setStorage({
        key: 'kaoshi',
        data: { cIndex: cIndex, tIndex: tIndex, title: title, tid: tid },
      })

      this.setData({
        titleIndex: tIndex,
        itemIndex: cIndex,
        title: title
      })
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})