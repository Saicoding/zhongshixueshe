// pages/zixun/zixunDetail/zixunDetail.js
let app = getApp();
let API_URL = "https://xcx2.chinaplat.com/xy/";
let util = require('../../../utils/util.js');

let buttonClicked = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoaded: false,
    comments: [],
    loadingMore: false,//是否正在载入更多
    loadingText: "", //上拉载入更多的文字
    showLoadingGif: false, //是否显示刷新gif图
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;

    this.setData({
      id: id
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

    //用户信息
    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;

    let id = self.data.id; //资讯ID

    buttonClicked = false;

    //获取资讯
    app.post(API_URL, "action=getNewsShow&loginrandom=" + loginrandom + "&zcode=" + zcode + "&id=" + id, false, false, "", "", "", self).then(res => {
      let zixun = res.data.data[0];
      self.setData({
        zixun: zixun,
        isLoaded: true
      })

      //获取评论
      app.post(API_URL, "action=getBrokeNewsPllist&loginrandom=" + loginrandom + "&zcode=" + zcode + "&id=" + id + "&page=1", false, false, "", "", "", self).then(res => {
        let comments = res.data.data[0].list;
        let pageall = res.data.data[0].pageall;//评论总页数
        let pagenow = res.data.data[0].pagenow;//当前评论页
        // let PLcounts = res.data.data[0].PLcounts;
        self.setData({
          comments: comments,
          page: 1,
          pageall: pageall,
          pagenow: pagenow
        })
      })
    })
  },

  /**
   * 输入评论
   */
  inputComment: function (e) {
    this.setData({
      comment_content: e.detail.value //当前评论内容
    })
  },

  /**
   * 发送评论
   */
  sendComment: function () {
    let self = this;
    let comment_content = this.data.comment_content; //当前输入的评论
    let comments = this.data.comments; //当前所有评论
    let aid = self.data.id; //资讯ID

    //用户信息
    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;

    //保存评论内容到服务器
    app.post(API_URL, "action=addBrokeNewsPL&loginrandom=" + loginrandom + "&zcode=" + zcode + "&aid=" + aid + "&content=" + comment_content, false, false, "", "", "", self).then(res => {

      //自定义一个时时显示的评论对象
      let mycomment = {};
      mycomment.addtime = "1秒前"; //提交时间
      mycomment.content = comment_content; //评论内容
      mycomment.nickname = user.Nickname;
      mycomment.userpic = user.Pic;
      mycomment.from = "保密(开发中)";

      self.setData({
        comments: comments,
        mycomment: mycomment,
        currentComment: "", //清空评论
      })

    })
  },

  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    let self = this;
    let loadingMore = self.data.loadingMore;
    if (loadingMore) return; //如果还在载入中,就不继续执行

    let pageall = self.data.pageall;

    if (pageall == undefined) return;
    let page = self.data.page;
    let id = self.data.id; //资讯ID

    if (page >= pageall) {
      self.setData({ //正在载入
        loadingText: "别扯了,我是有底线的..."
      })
      return;
    }

    self.setData({ //正在载入
      showLoadingGif: true,
      loadingText: "载入更多评论 ..."
    })

    //用户信息
    let user = wx.getStorageSync('user');
    let loginrandom = user.Login_random;
    let zcode = user.zcode;

    let comments = self.data.comments;
    page++;

    //获取资讯
    app.post(API_URL, "action=getNewsShow&loginrandom=" + loginrandom + "&zcode=" + zcode + "&id=" + id, false, false, "", "", "", self).then(res => {
      let zixun = res.data.data[0];
      self.setData({
        zixun: zixun,
      })

      //获取评论
      app.post(API_URL, "action=getBrokeNewsPllist&loginrandom=" + loginrandom + "&zcode=" + zcode + "&id=" + id + "&page=" + page, false, false, "", "", "", self).then(res => {
        comments = comments.concat(res.data.data[0].list);

        self.setData({
          showLoadingGif: false,
          loadingText: "载入完成"
        })

        setTimeout(function () {
          self.setData({
            page: page,
            loadingMore: false,
            comments: comments,
            loadingText: ""
          })
        }, 200)
      })
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
    let id = self.data.id; //资讯ID

    wx.showNavigationBarLoading() //在标题栏中显示加载

    //获取评论
    app.post(API_URL, "action=getBrokeNewsPllist&loginrandom=" + loginrandom + "&zcode=" + zcode + "&id=" + id, false, false, "", "", "", self).then(res => {
      let comments = res.data.data[0].list;
      let pageall = res.data.data[0].pageall;
      let pagenow = res.data.data[0].pagenow;
      let PLcounts = res.data.data[0].PLcounts;

      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新

      self.setData({
        comments: comments,
        page: 1
      })
    })
  },


})