// pages/zixun/zixun.js
let app = getApp();
let API_URL = "https://xcx2.chinaplat.com/main/";
let util = require('../../utils/util.js');

let buttonClicked = false;//默认还没有点击可以导航页面的按钮

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingMore: false, //是否在加载更多
    loadingText: "", //上拉载入更多的文字
    showLoadingGif: false, //是否显示刷新gif图
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let requesttime = util.formatTime2(new Date()); //请求时间（第一次请求的时间）
    let xcx_id = options.xcx_id;

    this.setData({ //最后请求的时间
      requesttime: requesttime,
      first: true ,//第一次载入默认首次载入
      xcx_id, xcx_id//小程序类别
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //下拉刷新可能触发重复登录，这时跳转到登录界面时没有停止刷新状态，需要手动设置
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
    this.setData({//上拉加载可能触发重复登录
      loadingMore: false
    })
    let self = this;

    let isReLoad = self.data.isReLoad; //是否是重复登录
    let first = self.data.first; //是否是第一次渲染页面
    let xcx_id = self.data.xcx_id;//小程序类别

    buttonClicked = false;

    if (isReLoad || first) { //如果重复登录或者第一次渲染才执行
      let date = new Date(); //当前信息
      let day = date.getDate(); //几日
      let dateStr = util.formatTime1(date); //日期字符串

      self.setData({
        dateStr: dateStr,
        day: day,
        isLoaded: false
      })

      let url = encodeURIComponent('/pages/index/index');
      wx.setStorageSync('first', false);

      console.log("action=getNewsList&xcx_id=" + xcx_id)
      app.post(API_URL, "action=getNewsList&xcx_id=" + xcx_id, false, false, "", "", "", self).then(res => {
        let news = res.data.data[0].list; //所有资讯
        console.log(news)
        let allpage = res.data.data[0].page_all //所有页码

        self.setData({
          isLoaded: true,
          isReLoad: false,
          page: 1,
          news: news,
          allpage: allpage,
          first: false
        })
      })
    }
  },

  /**
   * 观看资讯详情
   */
  viewNewsDetail: function (e) {
    if (buttonClicked) return; //如果点击了一次就不执行
    buttonClicked = true; //已经点击

    let id = e.currentTarget.dataset.id; //点击的新闻ID

    //用户信息
    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;

    wx.navigateTo({
      url: '/pages/zixun/zixunDetail/zixunDetail?id=' + id,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let self = this;
    let loadingMore = self.data.loadingMore;
    if (loadingMore) return; //如果还在载入中,就不继续执行
    let requesttime = self.data.requesttime; //最后请求的时间

    let allpage = self.data.allpage;
    let page = self.data.page;

    if (page >= allpage) {
      self.setData({ //正在载入
        loadingText: "别扯了,我是有底线的..."
      })
      return;
    }

    self.setData({ //正在载入
      showLoadingGif: true,
      loadingText: "载入更多资讯 ..."
    })

    //用户信息
    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;

    let news = self.data.news;
    page++;

    app.post(API_URL, "action=getNewsList&loginrandom=" + loginrandom + "&zcode=" + zcode + "&page=" + page, false, false, "", "", "", self).then(res => {
      let newNews = res.data.data[0].list;
      news = news.concat(newNews);

      self.setData({
        showLoadingGif: false,
        loadingText: "载入完成"
      })

      setTimeout(function () {
        self.setData({
          page: page,
          loadingMore: false,
          news: news,
          loadingText: ""
        })
      }, 200)
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let self = this;
    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;
    let news = self.data.news;

    wx.showNavigationBarLoading() //在标题栏中显示加载

    let requesttime = util.formatTime2(new Date()); //请求时间（最后请求的时间）

    app.post(API_URL, "action=getNewsList&loginrandom=" + loginrandom + "&zcode=" + zcode + "&page=1" + "&requesttime=" + requesttime, false, false, "", "", "", self).then(res => {
      if (res.data.data.length > 0) {
        let newNews = res.data.data[0].list;
        news = newNews.concat(news);

        self.setData({
          news: news
        })
      }

      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    })
  },
})