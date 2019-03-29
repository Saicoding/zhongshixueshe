// pages/kaodian/kaodian.js
let animate = require('../../common/newAnimate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[
      {
        title:'快快来看，哇塞',
        jies:[
          {
            title: '第一章 房地产业及相关犯规政策',
            donenum:5,
            all_num:20
          },
          {
            title: '第二章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第三章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第四章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第五章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
        ]
      },
      {
        title: '这也太哇了',
        jies: [
          {
            title: '第一章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第二章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第三章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第四章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第五章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
        ]
      },
      {
        title: '贼哇劳动',
        jies: [
          {
            title: '第一章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第二章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第三章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第四章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
          {
            title: '第五章 房地产业及相关犯规政策',
            donenum: 5,
            all_num: 20
          },
        ]
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '考试考点',
    })

    let list = this.data.list;
    this.initZhangjie(list); //初始化章节信息
    this.setData({
      list:list
    })
  },

  /**
   * 初始化章节信息
   */
  initZhangjie: function (zhangjies) {
    let user = wx.getStorageSync('user');
    let zcode = user.zcode == undefined ? '' : user.zcode; //本地缓存标识,如果登陆就是唯一，如果是游客就公用本地缓存

    for (let i = 0; i < zhangjies.length; i++) { //遍历所有数组
      let zhangjie = zhangjies[i];
      zhangjie.isFolder = true; //设置展开初始值
    }
  },

  /**
    * 切换试题折叠状态
    */
  toogleFolder: function (e) {
    let self = this;
    let index = e.currentTarget.dataset.index; //选择章节的index
    let zhangjie = self.data.list; //取得章节对象

    let windowWidth = self.data.windowWidth;
    let num = zhangjie[index].jies.length //取得有多少个章节

    //开始动画
    this.step(index, num, windowWidth, zhangjie);

    self.setData({
      list: zhangjie,
    })
  },

  /**
   * 实现展开折叠效果
   */
  step: function (index, num, windowWidth, zhangjie) {
    let self = this;
    let isFolder = zhangjie[index].isFolder; //取得现在是什么状态
    let jie_num = 0;

    let height = 80 * num; //上下边框2px 转化为rpx


    if (isFolder) { //展开
      let spreadAnimation = wx.createAnimation({
        duration: 500,
        delay: 0,
        timingFunction: "ease-in"
      })

      spreadAnimation.height(height + "rpx", 0).opacity(1).step({

      })

      zhangjie[index].isFolder = false;
      zhangjie[index].height = height;
      zhangjie[index].spreadData = spreadAnimation.export()

      self.setData({
        list: zhangjie,
      })

    } else { //折叠
      zhangjie[index].display = true;

      self.setData({
        list: zhangjie
      })

      let foldAnimation = wx.createAnimation({
        duration: 500,
        delay: 0,
        timingFunction: "ease-out"
      })

      foldAnimation.height(0, height + "rpx").opacity(0).step(function () { })

      zhangjie[index].height = 0;
      zhangjie[index].isFolder = true;
      zhangjie[index].folderData = foldAnimation.export();

      setTimeout(function () {
        zhangjie[index].display = false;
        self.setData({
          list: zhangjie,
        })
      }, 500)

      self.setData({
        list: zhangjie,
      })
    }
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
   * 改变产品时
   */
  changeProduct: function (e) {
    let self = this;
    let currentProduct = self.data.product; //当前种类
    let product = e.currentTarget.dataset.product; //点击的视频种类
    if (product == currentProduct) return; //如果没有改变就不作任何操作

    self.setData({
      loaded: false
    })

    let windowWidth = self.data.windowWidth; //窗口宽度
    let moveData = undefined; //动画
    if (product == "xl") {
      moveData = animate.moveX(easeOutAnimation, 355* (windowWidth / 750));
      // app.post(API_URL, "action=GetCourseList&types=xl", false, true, "", "").then((res) => {
      //   let videoList = res.data.list;
      //   self.setData({
      //     videoList: videoList,
      //     loaded: true
      //   })
      // })
    } else {
      moveData = animate.moveX(easeOutAnimation, 0);
      // app.post(API_URL, "action=GetCourseList&types=jjr", false, true, "", "").then((res) => {
      //   let videoList = res.data.list;
      //   self.setData({
      //     videoList: videoList,
      //     loaded: true
      //   })
      // })
    }

    self.setData({
      product: product,
      moveData: moveData
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})