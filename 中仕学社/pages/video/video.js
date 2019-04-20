// pages/video/video.js
const app = getApp();
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址
let animate = require('../../common/newAnimate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [
      '/images/test/video.png',
      '/images/test/video.png'
    ],
    loadedList: [{
        loaded: false,
        list: null
      },
      {
        loaded: false,
        list: null
      },
      {
        loaded: false,
        list: null
      }
    ], //已载入数组
    currentIndex: 0,
    catlogCurrent: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let kaoshi = wx.getStorageSync('kaoshi');
    wx.setNavigationBarTitle({
      title: kaoshi.title ? kaoshi.title:'中仕学社',
    })

    this.setData({
      first: true,
      options: options
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
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
  onShow: function() {
    let self = this;
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别

    //此页面有可能是从首页导航过来的，在首页可能没有登录，在此判断是否登录
    let user = wx.getStorageSync('user');

    if (user) { //如果已经登录
      let zcode = user.zcode;
      let token = user.token;

      if (self.data.first || self.data.isReLoad) { //如果首次载入,或者重复登录
        //获取课程列表分类
        app.post(API_URL, "action=getCourseType&xcx_id=" + xcx_id, false, false, "").then(res => {
          let loadedList = res.data.data[0].list; //已载入视频列表

          let lastke = wx.getStorageSync('lastkesub' + zcode + xcx_id);

          let currentIndex = lastke.options ? lastke.options.index * 1 : 0; //根据是否有浏览记录获取当前的index值

          self.setData({
            loadedList: loadedList,
            currentIndex: currentIndex,
            keCurrent: currentIndex,
            first: false, //设置已经载入一次
            isReLoad: false //设置当前状态不是重新登录状态
          })

          self.getCourse(currentIndex, lastke.options); //获取对应课程列表
        })
      }
    } else { //如果没有登录
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  /**
   * 切换考试
   */
  switch: function() {
    wx.navigateTo({
      url: '/pages/index/switch/switch',
    })
  },

  /**
   * 观看视频
   */
  watch: function(e) {
    var kc_id = e.currentTarget.dataset.kc_id;
    var renshu = e.currentTarget.dataset.renshu;
    let index = this.data.currentIndex;
    let title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '/pages/video/play/play?kc_id=' + kc_id + '&renshu=' + renshu + "&index=" + index + '&title=' + title,
    })
  },

  /**
   * 滑动页面
   */
  changeSwiper: function(e) {
    let index = e.detail.current;
    let source = e.detail.source;
    let loadedList = this.data.loadedList;
    let currentIndex = this.data.currentIndex;
    let catlogCurrent = this.data.catlogCurrent;
    let direction = index > currentIndex ? '左' : '右'
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别

    if (source == 'touch') { //如果是手动滑动
      if (direction == '左' && loadedList.length - 5 >= catlogCurrent) {
        catlogCurrent++;
      }

      if (direction == '右' && catlogCurrent > 0) {
        catlogCurrent--;
      }

      this.setData({
        currentIndex: index,
        catlogCurrent: catlogCurrent
      })
      this.getCourse(index)
    }
  },

  //点击目录
  getList: function(e) {
    let index = e.currentTarget.dataset.index;
    let currentIndex = this.data.currentIndex ? this.data.currentIndex : 0;

    if (index != currentIndex) { //点击不同目录
      this.setData({
        currentIndex: index,
        keCurrent: index
      })
      this.getCourse(index);
    }
  },

  //获取课程列表
  getCourse: function (index, lastKe) {
    let self = this;
    let loadedList = self.data.loadedList; //已载入列表数组
    let user = wx.getStorageSync('user');
    let zcode = user.zcode ? user.zcode : "";
    let token = user.token ? user.token : "";
    let options = self.data.options;

    if (!loadedList[index].list) { //说明已经载入过
      app.post(API_URL, "action=getCourseList&typesid=" + loadedList[index].id + "&zcode=" + zcode + "&token=" + token, false, false, "", "", "", self).then(res => {
        let newcourse = res.data.data;
        loadedList[index].list = newcourse;
        loadedList[index].loaded = true; //该章节载入结束
        self.setData({
          loadedList: loadedList
        });

        if (options.from) {
          setTimeout(function(){
            wx.navigateTo({
              url: '/pages/video/play/play?kc_id=' + lastKe.kc_id + '&renshu=' + lastKe.renshu + "&index=" + lastKe.index + '&title=' + lastKe.title
            })
          },1000)
        }

      });
    }
  },

  /**
   * 关闭提示框(课程适合零基础的小伙伴)
   */
  close: function() {
    this.setData({
      hidePrompt: true
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})