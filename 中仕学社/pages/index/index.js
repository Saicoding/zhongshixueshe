//index.js
//获取应用实例
const app = getApp()
let newAni = require('../../common/newAnimate.js');
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址

Page({
  data: {
    catlogList:[
      {
        src:'/images/index/dongtai.png',
        text:'资讯'
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
    let self = this;
    //设置标题,先获取本地缓存,如果有就用缓存，没有就用默认标题
    let title = "房地产经纪人";//默认标题
    let type = wx.getStorageSync('kaoshi') ? wx.getStorageSync('kaoshi'):1;//本地考试类别
    switch(type){//根据类别设置标题
      case 1:
      title = "导游考试通";
      break;
      default:
      break;
    }

    app.post(API_URL,"action=getMainInfo&id="+type,false,false,"").then(res=>{
      let info = res.data.data[0];
      let catlogList = self.data.catlogList;//页面的所有目录
      let currentList = [];
      let ks_date = self.datedifference(info.ks_date);

      for(let i = 0;i<info.menu.length;i++){
        currentList.push(catlogList[info.menu[i]]);
      }

      self.setData({
        info:info,
        currentList: currentList,
        ks_date: ks_date
      })
    })
    wx.setNavigationBarTitle({
      title: title,
    })
  },

  /**
   * 生命周期事件
   */
  onReady:function(){
    let self = this;
    wx.getStorage({//获取帮助缓存
      key: 'help',
      success: function(res) {},
      fail:function(err){
        self.help = self.selectComponent("#help");
        self.help.show();
      }
    })
  },

  /**
   * 计算相差天数
   */
  datedifference:function(sDate2) {    //sDate1和sDate2是2006-12-18格式  
    let sDate1= (new Date()).getTime();
    sDate2 = Date.parse(sDate2);
    let dateSpan = sDate2 - sDate1;
    return Math.floor(dateSpan / (24 * 3600 * 1000));
  },

  /**
   * 切换考试
   */
  switch:function(){
    wx.navigateTo({
      url: '/pages/index/switch/switch',
    })
  },


  /**
   * 生命周期事件
   */
  onShow:function(){
    let self = this;
    let user = wx.getStorageSync('user'); //获取本地用户缓存

    //测试用
    user = self.data.user;

    let zcode = user.zcode == undefined ? "" : user.zcode; //缓存标识
    let token = user.token;
    let first = this.data.first;

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

    //请求学习天数
    app.post(API_URL, "action=getStudyDays&zcode=" + zcode, false, false, "").then(res => {
      let QDdays = res.data.data[0].QDdays;
      self.setData({
        QDdays: QDdays,
        random: wx.getStorageSync('random') ? wx.getStorageSync('random') : new Date().toLocaleDateString() 
      })
    })

    //设置图像随机数
    self.setData({
      user: user,
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

  /**
   * 更多
   */
  more:function(e){
    let type = e.currentTarget.dataset.type;
    if(type == "zixun"){
      wx.navigateTo({
        url: '/pages/zixun/zixun',
      })
    }else{
      wx.navigateTo({
        url: '/pages/video/video',
      })
    }
  },

  /**
   * 扫描
   */
  scan:function(){
    wx.scanCode({
      success: function (e) {
        let code = e.result.substring(6);
        let user = wx.getStorageSync('user');
        if (!user) {
          wx.navigateTo({
            url: '/pages/login/login?showToast=true&title=您还没有登录',
          })
        } else {
          let zcode = user.zcode;
          let token = user.token;
          app.post(API_URL, "action=APPLogin&zcode=" + zcode + "&token=" + token + "&t=" + code, false, false, "", "").then(res => {
            wx.showToast({
              title: '网页已登录成功!',
              duration: 4000,
              icon: 'none'
            })
          })
        }
      },
      fail: function () {
        wx.showToast({
          icon: 'none',
          title: '扫描失败',
          duration: 3000
        })
      }
    })
  },

    /**
   * 导航页面
   */
  GOpage:function(e){
    let index = e.currentTarget.dataset.index;
    switch(index){
      case 0://资讯
        wx.navigateTo({
          url: '/pages/zixun/zixun',
        })
        break;
      case 1://题库
        wx.navigateTo({
          url: '/pages/tiku/tiku',
        })
      break;
      case 2://视频
        wx.navigateTo({
          url: '/pages/video/video',
        })
      break;
      case 3://考点
        wx.navigateTo({
          url: '/pages/kaodian/kaodian',
        })
      break;
    }
  },

  /**
   * 查看资讯列表
   */
  GOzixun:function(){
    wx.navigateTo({
      url: '/pages/zixun/zixun',
    })
  },

  /**
   * 查看资讯详情
   */
  GOzixunDetail:function(){
    wx.navigateTo({
      url: '/pages/zixun/zixunDetail/zixunDetail',
    })
  },

  /**
   * 查看课程列表
   */
  GOkecheng:function(){
    wx.navigateTo({
      url: '/pages/video/video',
    })
  },

  /**
   * 播放视频
   */
  GOplay:function(){
    wx.navigateTo({
      url: '/pages/video/play/play',
    })
  },

  /**
   * 导航到个人主页
   */
  GOuser:function(){
    wx.navigateTo({
      url: '/pages/user/user',
    })
  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {

  }

})
