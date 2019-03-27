//index.js
//获取应用实例
const app = getApp()
let newAni = require('../../common/newAnimate.js');

Page({
  data: {
    banners:[//轮播图
      '/images/test/banner.png', 
      '/images/test/banner.png'
    ],
    catlogList:[
      {
        src:'/images/index/dongtai.png',
        text:'动态'
      },
      {
        src: '/images/index/tiku.png',
        text: '题库'
      },
      {
        src: '/images/index/shipin.png',
        text: '视频'
      },
      {
        src: '/images/index/kaodian.png',
        text: '考点'
      },
      {
        src: '/images/index/zhibo.png',
        text: '直播'
      },
      {
        src: '/images/index/xianxiake.png',
        text: '线下课'
      },
    ],
    //测试用
    user: {
      text: "你已加入学习计划,快去学习吧!",
      loginIcon: "/images/index/vip.png",
      Pic: '/images/avatar.png',
      Nickname: '说好只牵手'
    },
    midtext:'开始刷题',
    midtitle:'测试用',
    ketext:'开始看课',
    ketitle:'看视频得红包',
    zixun:{
      title:'2019年最新考试大纲发布',
      content:'报考条件更加苛刻,大纲对比去年变化不大,重点在于法律法规的,,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的'.substring(1,40)+'...',
      img:'/images/'
    },
    kes:[
      {
        img:'/images/test/zixun.png',
        title:'2019最新科目名称',
        nums:910,
        jieNums:78
      },
      {
        img: '/images/test/zixun.png',
        title: '2019最新科目名称',
        nums: 910,
        jieNums: 78
      },
      {
        img: '/images/test/zixun.png',
        title: '2019最新科目名称',
        nums: 910,
        jieNums: 78
      },
      {
        img: '/images/test/zixun.png',
        title: '2019最新科目名称',
        nums: 910,
        jieNums: 78
      }
    ]
  },

  /**
   * 生命周期事件
   */
  onLoad: function () {
    //设置标题,先获取本地缓存,如果有就用缓存，没有就用默认标题
    let title = "房地产经纪人";//默认标题
    let type = wx.getStorageSync('kaoshi');//本地考试类别

    switch(type){//根据类别设置标题
      case 0:
      title = "导游考试通";
      break;
      default:
      break;
    }

    wx.setNavigationBarTitle({
      title: title,
    })
  },

  /**
   * 切换考试
   */
  switch:function(){
    console.log('切换考试')
  },

  /**
   * 分享事件
   */
  
  /**
   * 生命周期事件
   */
  onShow:function(){
    let self = this;

    let user = wx.getStorageSync('user'); //获取本地用户缓存

    //测试用
    user = self.data.user;

    let zcode = user.zcode == undefined ? "" : user.zcode; //缓存标识

    //用于控制打卡动画
    let todayDaka = wx.getStorageSync('todayDaka' + zcode);//今日打卡本地字符串,用于判断是否打过卡
    let myDate = new Date(); //获取系统当前时间
    let year = myDate.getFullYear();
    let month = myDate.getMonth() + 1;
    let day = myDate.getDate();
    let interval = this.data.interval;
    myDate = "" + year + month + day; //得到当前答题字符串

    if (todayDaka != myDate && !interval) {
      self.riliAnimate(); //日历动画
    }

    //设置图像随机数
    self.setData({
      user: user,
      random: wx.getStorageSync('random') ? wx.getStorageSync('random') : new Date().toLocaleDateString() 
    })
  },

  /**
  * 日历动画
  */
  riliAnimate: function () {
    let self = this;
    let obj = {
      transformOrigin: '10% 10% 0',
      delay: 0,
      duration: 1000,
    }

    let obj2 = {
      transformOrigin: '50% 50% 0',
      delay: 0,
      duration: 2000,
    }

    let dakaAnimate = null;
    let next = true;
    dakaAnimate = newAni.rate2(obj2, 360);
    self.setData({
      dakaAnimate: dakaAnimate
    })

    let interval = setInterval(res => {
      let num = Math.round(Math.random());
      if (num == 0) {
        dakaAnimate = newAni.rate1(obj, 40);
      } else {
        dakaAnimate = newAni.rate2(obj2, 360);
      }
      self.setData({
        dakaAnimate: dakaAnimate
      })
    }, 5000);

    self.setData({
      interval: interval
    })
  },

  /**
  * 打开打卡页面
  */
  attendance: function () {
    let user = wx.getStorageSync('user');
    let self = this;
    if (user) {
      wx.vibrateShort({})//手机短震动

      this.rili.showDialog(self);
    } else {
      wx.navigateTo({
        url: '/pages/login/login?showToast=true&title=您还没有登录',
      })
    }
  },

})
