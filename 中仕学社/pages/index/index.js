//index.js
//获取应用实例
const app = getApp()
let newAni = require('../../common/newAnimate.js');
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址

Page({
  data: {
    catlogList: [{
        src: '/images/index/dongtai.png',
        text: '资讯'
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

    midtext: "开始刷题",
    midtitle: "暂无刷题记录",
    ketext: "开始看课",
    ketitle: "暂无看课记录",
    zixun: {
      title: '2019年最新考试大纲发布',
      content: '报考条件更加苛刻,大纲对比去年变化不大,重点在于法律法规的,,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的,重点在于法律法规的'.substring(1, 40) + '...',
      img: '/images/'
    },
    kes: [{
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
  onLoad: function() {

  },

  /**
   * 继续刷题
   */
  continiueShuati: function() {
    let lastShuati = this.data.lastShuati;
    console.log(lastShuati)
    if (lastShuati) { //如果有最后一次刷题
      wx.navigateTo({
        url: '/pages/tiku/tiku?from=shouye',
      })
    } else {
      wx.navigateTo({
        url: '/pages/tiku/tiku',
      })
    }
  },

  /**
 * 继续看课
 */
  continiueKanke: function () {
    let lastKe = this.data.lastKe
    if (lastKe) { //如果有最后一次看课
      wx.navigateTo({
        url: '/pages/video/video?from=shouye'
      })
    }else{
      console.log('hh')
      wx.navigateTo({
        url: '/pages/video/video',
      })
    }


    // let lastKe = this.data.lastKe
    // if (lastKe) { //如果有最后一次看课
    //   lastKe = lastKe.options;
    //   wx.navigateTo({
    //     url: '/pages/video/play?title=' + lastKe.title + "&renshu=" + lastKe.renshu + "&types=" + lastKe.types + "&index=" + lastKe.index + "&kc_id=" + lastKe.kc_id + "&fromIndex=true"
    //   })
    // } else {
    //   wx.navigateTo({
    //     url: '/pages/learn/play?title=2018导游考试「政策与法律法规」基础精讲&renshu=6267&types=0&index=0&kc_id=141920&fromIndex=true'
    //   })
    // }
  },

  /**
   * 生命周期事件
   */
  onReady: function() {
    let self = this;
    this.rili = this.selectComponent("#rili");
    this.haibao = this.selectComponent("#haibao");
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        //最上面标题栏不同机型的高度不一样(单位PX)
        let statusBarHeight = res.statusBarHeight * (750 / windowWidth);

        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight,
          statusBarHeight: statusBarHeight
        })
      }
    });
    wx.getStorage({ //获取帮助缓存
      key: 'help',
      success: function(res) {},
      fail: function(err) {
        self.help = self.selectComponent("#help");
        self.help.show();
      }
    })
  },

  /**
   * 创建海报
   */
  _createHaibao: function(e) {
    let self = this;
    let SignDays = e.detail.SignDays;
    let SignTotalDays = e.detail.SignTotalDays;
    this.haibao.setData({
      imageUrl: false
    })
    this.haibao.draw(SignDays, SignTotalDays, self);
  },

  /**
   * 计算相差天数
   */
  datedifference: function(sDate2) { //sDate1和sDate2是2006-12-18格式  
    let sDate1 = (new Date()).getTime();
    sDate2 = Date.parse(sDate2);
    let dateSpan = sDate2 - sDate1;
    return Math.floor(dateSpan / (24 * 3600 * 1000));
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
   * 生命周期事件
   */
  onShow: function() {
    let self = this;
    let user = wx.getStorageSync('user'); //获取本地用户缓存

    let zcode = user.zcode == undefined ? "" : user.zcode; //缓存标识
    let token = user.token;
    let first = this.data.first;


    //设置标题,先获取本地缓存,如果有就用缓存，没有就用默认标题
    let title = "房地产经纪人"; //默认标题
    let type = wx.getStorageSync('kaoshi'); //本地考试类别
    let tid;

    if (type) {
      title = type.title;
      tid = type.tid;
    } else {
      tid = 1;
    }

    //获取试题栏目中科目分类，并设置当前typesid
    app.post(API_URL, "action=getKemuList&xcx_id=" + type.tid, false, false, "").then(res => {
      let bars = res.data.data;

      self.setData({
        bars: bars 
      })
    })

    app.post(API_URL, "action=getMainInfo&id=" + tid, false, false, "").then(res => {
      let info = res.data.data[0];
      let catlogList = self.data.catlogList; //页面的所有目录
      let currentList = [];
      let ks_date = self.datedifference(info.ks_date);

      for (let i = 0; i < info.menu.length; i++) {
        currentList.push(catlogList[info.menu[i]]);
      }

      self.setData({
        info: info,
        currentList: currentList,
        ks_date: ks_date
      })
    })

    wx.setNavigationBarTitle({
      title: title,
    })

    //用于控制打卡动画
    let todayDaka = wx.getStorageSync('todayDaka' + zcode); //今日打卡本地字符串,用于判断是否打过卡
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

    this.setData({ //设置已经载入一次
      first: false
    })

    if (user) { //如果已经登录
      if (user.taocan == '0') { //未加入学习计划
        user.text = "你尚未加入学习计划,去加入>>";
        user.loginIcon = "/images/index/danger.png";
      } else {
        user.text = "你已加入学习计划,快去学习吧!"
        user.loginIcon = "/images/index/vip.png";
      }
      self.setData({
        user: user
      })
    } else { //如果没有登录
      let user = {};
      user.Pic = '/images/avatar.png'
      user.Nickname = '未登录'
      user.loginIcon = "/images/index/login.png";
      user.text = "点此登录"
      self.setData({
        user: user
      })
    }

    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别

    wx.getStorage({
      key: 'lastShuati' + zcode + xcx_id,
      success: function(res) {
        let lastShuati = res.data;
        self.setData({
          midtext: "继续刷题",
          midtitle: lastShuati.title,
          lastShuati: lastShuati
        })
      },
      fail: function(res) {
        self.setData({
          midtext: "开始刷题",
          midtitle: "暂无刷题记录",
          lastShuati: false
        })
      }
    })

    wx.getStorage({
      key: 'lastkesub' + zcode + xcx_id,
      success: function (res) {
        let lastKe = res.data;

        self.setData({
          ketext: "继续看课",
          ketitle: lastKe.options.title,
          lastKe: lastKe
        })
      },
      fail: function (res) {
        self.setData({
          ketext: "开始看课",
          ketitle: "暂无看课记录",
          lastKe: false
        })
      }
    })

    wx.getStorage({ //今日刷题数
      key: "today" + myDate + zcode + xcx_id,
      success: function (res) {
        self.setData({
          todayNum: res.data.length
        })
      },
    })

    wx.getStorage({ //今日看课数
      key: "todayKe" + myDate + zcode + xcx_id,
      success: function (res) {
        self.setData({
          todayKeNum: res.data.length
        })
      },
    })
  },

  /**
   * 日历动画
   */
  riliAnimate: function() {
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
  attendance: function() {
    let user = wx.getStorageSync('user');
    let self = this;
    if (user) {
      wx.vibrateShort({}) //手机短震动

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
  more: function(e) {
    let type = e.currentTarget.dataset.type;
    if (type == "zixun") {
      this.GOzixun();
    } else {
      wx.navigateTo({
        url: '/pages/video/video',
      })
    }
  },

  /**
   * 扫描
   */
  scan: function() {
    wx.scanCode({
      success: function(e) {
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
      fail: function() {
        wx.showToast({
          icon: 'none',
          title: '扫描失败',
          duration: 3000
        })
      }
    })
  },

  /**
   * 点击“点此登录”或者“学习计划”等信息
   */
  tapInfo: function(e) {
    let user = this.data.user;
    switch (user.text) {
      case "你尚未加入学习计划,去加入>>":
        wx.navigateTo({
          url: '/pages/index/xuexijihua/xuexijihua',
        })
        break;
      case "点此登录":
        wx.navigateTo({
          url: '/pages/login/login',
        })
        break;
    }
  },

  /**
   * 导航页面
   */
  GOpage: function(e) {
    let index = e.currentTarget.dataset.index;

    switch (index) {
      case 0: //资讯
        this.GOzixun();
        break;
      case 1: //题库
        wx.navigateTo({
          url: '/pages/tiku/tiku',
        })
        break;
      case 2: //视频
        wx.navigateTo({
          url: '/pages/video/video',
        })
        break;
      case 3: //考点
        let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1
        let currentIndex = wx.getStorageSync('currentIndex' + xcx_id);
        let typesid = this.data.bars[currentIndex].id;
        let title = this.data.bars[currentIndex].title;
        wx.navigateTo({
          url: '/pages/tiku/kaodian/kaodianList?typesid='+typesid+"&title="+title,
        })
        break;
    }
  },

  /**
   * 查看资讯列表
   */
  GOzixun: function() {
    let type = wx.getStorageSync('kaoshi');
    let xcx_id; //小程序类别
    if (type) {
      xcx_id = type.tid;
    } else {
      xcx_id = 1;
    }

    wx.navigateTo({
      url: '/pages/zixun/zixun?xcx_id=' + xcx_id,
    })
  },

  /**
   * 查看资讯详情
   */
  GOzixunDetail: function() {
    wx.navigateTo({
      url: '/pages/zixun/zixunDetail/zixunDetail',
    })
  },

  /**
   * 查看课程列表
   */
  GOkecheng: function() {
    wx.navigateTo({
      url: '/pages/video/video',
    })
  },

  /**
   * 播放视频
   */
  GOplay: function() {
    wx.navigateTo({
      url: '/pages/video/play/play',
    })
  },

  /**
   * 导航到考点页面
   */
  GOkaodian: function() {
    let currentIndex = this.data.currentIndex;
    let typesid = this.data.bars[currentIndex].id;
    let title = this.data.bars[currentIndex].title;
    wx.navigateTo({
      url: '/pages/tiku/kaodian/kaodianList?typesid=' + typesid + "&title=" + title
    })
  },

  /**
   * 导航到个人主页
   */
  GOuser: function() {
    wx.navigateTo({
      url: '/pages/user/user',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }

})