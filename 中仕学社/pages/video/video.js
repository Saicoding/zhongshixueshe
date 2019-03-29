// pages/video/video.js
let animate = require('../../common/newAnimate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners:[
      '/images/test/video.png',
      '/images/test/video.png'
    ],
    list:[
      {
        title:'初级会计职称',
        nums:857,
        jieNums:34,
        img:'/images/test/ke.png'
      },
      {
        title: '经济法律法规',
        nums: 857,
        jieNums: 34,
        img: '/images/test/ke.png'
      },
      {
        title: '贼哇',
        nums: 857,
        jieNums: 34, 
        img: '/images/test/ke.png'
      },
      {
        title: '卡士大夫',
        nums: 857,
        jieNums: 34,
        img: '/images/test/ke.png'
      },
      {
        title: '中仕学社',
        nums: 857,
        jieNums: 34,
        img: '/images/test/ke.png'
      },
    ],
    currentIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '某一类考试标题',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;

        windowHeight = (windowHeight * (750 / windowWidth));

        self.setData({
          windowHeight: windowHeight,
          windowWidth: windowWidth,
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
  * 切换考试
  */
  switch: function () {
    wx.navigateTo({
      url: '/pages/index/switch/switch',
    })
  },

  /**
   * 切换目录
   */
  changeCatalog:function(e){
    let index = e.currentTarget.dataset.index;
    
    if(index*1 == this.data.currentIndex) return //如果点击的是同一个目录就不执行
    let moveData = undefined;
    let windowWidth = this.data.windowWidth;

    switch(index){
      case "0":
        moveData = animate.moveX(easeOutAnimation, 0);
        break;
      case "1":
        moveData = animate.moveX(easeOutAnimation, 250*windowWidth/750);
      break;
      case "2":
        moveData = animate.moveX(easeOutAnimation, 500 * windowWidth / 750);
      break;
    }

    this.setData({
      currentIndex:index*1,
      moveData: moveData
    })
  },

  /**
 * 关闭提示框(课程适合零基础的小伙伴)
 */
  close: function () {
    this.setData({
      hidePrompt: true
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})