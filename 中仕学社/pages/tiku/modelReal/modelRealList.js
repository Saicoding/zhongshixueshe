// pages/tiku/modelReal/modelRealList.js
const app = getApp();
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
    this.setData({
      options:options
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    let user = wx.getStorageSync('user');
    let options = this.data.options;//上个页面传来的参数
    let token = user.token;
    let zcode = user.zcode;

    app.post(API_URL, "action=getShijuanList&token=" + token + "&zcode=" + zcode+ "&keys=" + options.keys+"&typesid="+options.typesid, false, false, "","", false,self).then(res => {
      console.log(res)
      let zhangjies = res.data.list;

      self.setData({
        isLoaded: true,
        zhangjies: zhangjies
      })
    })
  },

  GOmodelReal:function(e){
    let title = e.currentTarget.dataset.title;//点击的标题
    let test_score = e.currentTarget.dataset.test_score;//历史最高分
    let id= e.currentTarget.dataset.id;//点击试卷的id号
    let totalscore = e.currentTarget.dataset.totalscore;//总分数
    let times = e.currentTarget.dataset.times;

    wx.navigateTo({
      url: '/pages/tiku/modelReal/modelRealDetail?title='+title+'&test_score='+test_score+'&id='+id+'&totalscore='+totalscore+"&times="+times,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})