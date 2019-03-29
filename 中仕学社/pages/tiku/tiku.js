// pages/shuati/shuati.js
const app = getApp();
const API_URL = 'https://xcx2.chinaplat.com/daoyou/'; //接口地址

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bars: [{
      title1: "科一",
      title2: "政策法规",
      title3: "政策与法律法规"
    },
    {
      title1: "科二",
      title2: "导游业务",
      title3: "导游业务"
    },
    {
      title1: "科三",
      title2: "全国导基",
      title3: "全国导基"
    },
    {
      title1: "科四",
      title2: "地方导基",
      title3: "地方导基"
    },
    {
      title1: "面试",
      title2: "面试",
      title3: "面试"
    },
    ],

    midHeight: 430, //中间条的高度
    lastScrollTop: 0, //上次滚动条的位置
    opacity: 1, //banner透明度
    jindu: 0, //当前做题进度
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    wx.setNavigationBarTitle({
      title: '题库',
    })
    let currentIndex = wx.getStorageSync('currentIndex') ? wx.getStorageSync('currentIndex') : 0; //如果有本地缓存就用本地缓存,没有就设置默认0
    let currentMidIndex = wx.getStorageSync('currentMidIndex') ? wx.getStorageSync('currentMidIndex') : 0; //当前试题种类(如果有本地缓存就用本地缓存,没有就设置默认0)

    this.setData({
      currentIndex: currentIndex,
      currentMidIndex: currentMidIndex,
      first: true
    })

    // 获取banner图,此请求适合放在onLoad周期函数中
    app.post(API_URL, "action=getTestAD", false, false, "", "").then(res => {
      let banners = res.data.data;
      self.setData({
        banners: banners
      })
    })

    let types = self.getkemuIDByindex(currentIndex); //科目id

    let tiku = {}; //声明所有题库，用于存储所有已载入题

    self.setData({ //默认没有载入完毕
      isLoaded: false
    })

    let zhangjieLoadedStrArray = []; //已载入的科目id和题型标识数组，用于控制如果已经载入一次就不再重新载入

    let zhangjieLoadedStr = '' + currentIndex + currentMidIndex;
    let user = wx.getStorageSync('user');
    let zcode = user.zcode ? user.zcode : "";
    let token = user.token ? user.token : "";
    let change = wx.getStorageSync('change' + zcode);

    if (change) { //如果数据有改变就设置
      types = self.getkemuIDByindex(parseInt(change.currentIndex)); //科目id
      self.setData({
        currentIndex: parseInt(change.currentIndex),
        currentMidIndex: parseInt(change.currentMidIndex)
      })
      zhangjieLoadedStr = '' + change.currentIndex + change.currentMidIndex;
      wx.removeStorageSync('change' + zcode);

      //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
      self.getZuotiJindu(token, zcode, types, self);

    } else { //得到做题进度

      //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
      self.getZuotiJindu(token, zcode, types, self);
    }

    zhangjieLoadedStrArray.push(zhangjieLoadedStr);

    // 获取章节列表
    if (currentMidIndex == 0) { //默认目录是章节列表时才去请求
      app.post(API_URL, "action=getKeMuTestType&types=" + types + "&token=" + token + "&zcode=" + zcode, false, false, "", "").then(res => {


        let zhangjies = res.data.data;

        self.initZhangjie(zhangjies); //初始化章节信息



        tiku[zhangjieLoadedStr] = zhangjies;

        self.setData({
          zhangjies: zhangjies,
          tiku: tiku,
          zhangjieLoadedStrArray: zhangjieLoadedStrArray,
          isLoaded: true
        })

        if (change) { //自动定位
          let zhangIdx = change.zhangIdx; //当前章index
          let jieIdx = change.jieIdx; //当前节index
          let windowWidth = self.data.windowWidth;
          let scroll = (zhangIdx * 130 + 600) * (windowWidth / 750); //滚动条的位置

          wx.pageScrollTo({
            scrollTop: scroll,
            success: function (res) {

              zhangjies[zhangIdx].list[jieIdx].selected = true;
              self.setData({
                zhangjies: zhangjies
              })

              let num = zhangjies[zhangIdx].list.length //取得有多少个章节
              self.step(zhangIdx, num, windowWidth, zhangjies);
            }
          })
        }
      })

    } else { //模拟 & 核心
      let keys = currentMidIndex == 1 ? 0 : 1
      app.post(API_URL, "action=getShijuanList&types=" + types + "&keys=" + keys + "&token=" + token + "&zcode=" + zcode, false, false, "", "").then(res => {
        let zhangjies = res.data.data;

        tiku[zhangjieLoadedStr] = zhangjies;

        self.setData({
          tiku: tiku,
          zhangjieLoadedStrArray: zhangjieLoadedStrArray,
          isLoaded: true,
          zhangjies: zhangjies
        })

        if (change) { //自动定位
          let zhangIdx = change.zhangIdx; //当前章index
          let jieIdx = change.jieIdx; //当前节index
          let windowWidth = self.data.windowWidth;
          let scroll = (zhangIdx * 130 + 600) * (windowWidth / 750); //滚动条的位置

          wx.pageScrollTo({
            scrollTop: scroll,
            success: function (res) {

              zhangjies[zhangIdx].list[jieIdx].selected = true;
              self.setData({
                zhangjies: zhangjies
              })

              let num = zhangjies[zhangIdx].list.length //取得有多少个章节
              self.step(zhangIdx, num, windowWidth, zhangjies);
            }
          })
        }
      })
    }

    //清除前一天的已刷题数缓存
    let myDate = new Date(); //获取系统当前时间
    let year = myDate.getFullYear();
    let month = myDate.getMonth() + 1;
    let day = myDate.getDate();
    myDate = "" + year + month + day; //得到当前答题字符串

    let str = "today" + myDate + zcode;
    wx.getStorageInfo({
      success: function (res) {
        for (let i = 0; i < res.keys.length; i++) {
          let key = res.keys[i];
          if (key.indexOf('today') != -1) {
            if (str != key) {
              wx.removeStorage({
                key: key,
                success: function (res) {

                },
              })
            }
          }
        }
      },
    })
  },

  /**
   * 获取做题进度
   */
  getZuotiJindu: function (token, zcode, types, self) {
    app.post(API_URL, "action=getTiJindu&token=" + token + "&zcode=" + zcode + "&typesid=" + types, false, false, "", "", false, self).then(res => {
      let jindu = res.data.data[0].jindu;
      self.setData({
        jindu: jindu
      })
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
      zhangjie.donenum = 0; //默认章已做题目为0
      zhangjie.rightNum = 0;
      zhangjie.isFolder = true; //设置展开初始值

      for (let j = 0; j < zhangjie.list.length; j++) {
        let jie = zhangjie.list[j];
        let doneArray = wx.getStorageSync('doneArray' + jie.id + '0' + zcode) ? wx.getStorageSync('doneArray' + jie.id + '0' + zcode) : [];

        if (doneArray.length != 0) { //如果有本地缓存,就计算已做数组的长度
          jie.donenum = doneArray.length;
          zhangjie.donenum += doneArray.length;
          let rightNum = 0;

          jie.rateWidth = 470 * (jie.donenum / parseInt(jie.all_num));
          // 计算正确率
          for (let k = 0; k < doneArray.length; k++) {
            let done = doneArray[k];

            if (done.isRight == 0) { //正确
              rightNum++;
              zhangjie.rightNum++;
            }

            jie.rightrate = ((rightNum / doneArray.length) * 100).toFixed(2);
            if (this.data.currentIndex == 4) {
              jie.rightrate = 0;
            }
          }
        } else {
          jie.donenum = 0;
          jie.rightrate = 0;
          jie.rateWidth = 0;
        }
      }

      zhangjie.rateWidth = 470 * zhangjie.donenum / parseInt(zhangjie.all_num); //绿条宽度
      zhangjie.rate = (zhangjie.donenum / parseInt(zhangjie.all_num) * 100).toFixed(2); //完成比例
      zhangjie.rightrate = zhangjie.donenum == 0 ? '0.00' : ((zhangjie.rightNum / zhangjie.donenum) * 100).toFixed(2);
    }

  },

  /**
   * 根据currentIndex得到科目ID(页面最上面的bar)
   */
  getkemuIDByindex: function (currentIndex) {
    let id = null;
    switch (currentIndex) {
      case 0: //法律法规
        id = 239;
        break;
      case 1: //导游业务
        id = 240;
        break;
      case 2: //全国导基
        id = 241;
        break;
      case 3: //地方导基
        id = 242;
        break;
      case 4: //面试
        id = 255;
        break;
    }
    return id;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;

    this.goAnswerModel = this.selectComponent("#goAnswerModel");
    this.jiesuoti = this.selectComponent("#jiesuoti");
    this.modelAnswerModel = this.selectComponent('#modelAnswerModel');
    this.ti = wx.createSelectorQuery(); //题组件dom对象

    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        //console.log(res);
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        //最上面标题栏不同机型的高度不一样(单位PX)
        let platform = res.platform;

        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight,
          platform: platform,
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    let currentIndex = this.data.currentIndex; //当前科目index
    let currentMidIndex = this.data.currentMidIndex; //当前题型index
    let zhangjieLoadedStr = '' + currentIndex + currentMidIndex; //当前题库标识

    //用户信息
    let user = wx.getStorageSync('user');
    let zcode = user.zcode ? user.zcode : "";
    let token = user.token ? user.token : '';

    let first = this.data.first; //是否是第一次载入
    let windowWidth = this.data.windowWidth; //窗口宽度(px)

    self.setData({
      random: new Date().toLocaleDateString()
    })

    if (first) { //如果是首次渲染,说明onload已经更新数据
      this.setData({
        first: false,
        user: user
      })
    } else { //如果已被污染
      let change = wx.getStorageSync('change' + zcode);

      self.setData({
        user: user
      })
      if (change) { //如果有更新数据
        self.setData({
          currentIndex: parseInt(change.currentIndex),
          currentMidIndex: parseInt(change.currentMidIndex)
        })
        let zhangjieLoadedStr = '' + change.currentIndex + change.currentMidIndex;

        let types = self.getkemuIDByindex(parseInt(change.currentIndex)); //科目id

        let tiku = self.data.tiku; //声明所有题库，用于存储所有已载入题

        self.setData({ //默认没有载入完毕
          isLoaded: false
        })
        //已载入的科目id和题型标识数组，用于控制如果已经载入一次就不再重新载入
        let zhangjieLoadedStrArray = self.data.zhangjieLoadedStrArray;

        if (zhangjieLoadedStrArray.indexOf(zhangjieLoadedStr) != -1) { //如果不包含,就添加到数组
          zhangjieLoadedStrArray.push(zhangjieLoadedStr);
        }

        app.post(API_URL, "action=getKeMuTestType&types=" + types, false, false, "", "").then(res => {
          let zhangjies = res.data.data;
          let zhangIdx = change.zhangIdx; //当前章index
          let jieIdx = change.jieIdx; //当前节index

          self.initZhangjie(zhangjies); //初始化章节信息

          tiku[zhangjieLoadedStr] = zhangjies;
          wx.removeStorageSync('change' + zcode);

          self.setData({
            zhangjies: zhangjies,
            tiku: tiku,
            zhangjieLoadedStrArray: zhangjieLoadedStrArray,
            isLoaded: true,
            first: false
          })


          let scroll = (zhangIdx * 130 + 600) * (windowWidth / 750); //滚动条的位置

          wx.pageScrollTo({
            scrollTop: scroll,
            success: function (res) {

              zhangjies[zhangIdx].list[jieIdx].selected = true;
              self.setData({
                zhangjies: zhangjies
              })

              let num = zhangjies[zhangIdx].list.length //取得有多少个章节
              self.step(zhangIdx, num, windowWidth, zhangjies);
            }
          })
        })


        //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
        self.getZuotiJindu(token, zcode, types, self);

      } else { //如果没有数据更新,说明是正常返回的页面
        let types = self.getkemuIDByindex(currentIndex); //科目id
        //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
        self.getZuotiJindu(token, zcode, types, self);
      }
    }
  },

  /**
   * 改变科目
   */
  changeBar: function (e) {
    let self = this;
    let type = e.currentTarget.dataset.type; //切换类型(1.点击科目,2.点击题型)
    let currentIndex = null;
    let currentMidIndex = null;

    if (!self.data.zhangjieLoadedStrArray) {//还没有载入完毕
      wx.showToast({
        title: '等待载入...',
        icon: 'none',
        duration: 3000
      })
      return
    }

    if (type == 1) { //点击科目
      currentIndex = e.currentTarget.dataset.index; //点击的科目id
      currentMidIndex = self.data.currentMidIndex; //当前题型index

      //********用户信息*******//
      let user = wx.getStorageSync('user');
      let zcode = user.zcode ? user.zcode : "";
      let token = user.token ? user.token : '';
      //***********************

      self.setData({
        currentIndex: currentIndex
      })

      wx.setStorage({ //设置本地缓存
        key: 'currentIndex',
        data: currentIndex,
        fail: function () {
          wx.showToast({
            title: '设置currentIndex失败',
            icon: 'none',
            duration: 3000
          })
        }
      })

      //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
      let types = self.getkemuIDByindex(currentIndex);

      //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
      self.getZuotiJindu(token, zcode, types, self);

    } else { //点击题型
      currentIndex = self.data.currentIndex; //点击的科目id
      currentMidIndex = e.currentTarget.dataset.index; //当前题型index
      self.setData({
        currentMidIndex: currentMidIndex
      })

      wx.setStorage({ //设置本地缓存
        key: 'currentMidIndex',
        data: currentMidIndex,
        fail: function () {
          wx.showToast({
            title: '设置currentMidIndex失败',
            icon: 'none',
            duration: 3000
          })
        }
      })
    }

    let currentLoadedStr = "" + currentIndex + currentMidIndex;
    let zhangjieLoadedStrArray = self.data.zhangjieLoadedStrArray; //已载入的科目id和题型标识数组，用于控制如果已经载入一次就不再重新载入
    let tiku = this.data.tiku;


    if (zhangjieLoadedStrArray.indexOf(currentLoadedStr) != -1) { //如果包含,就使用本地tiku数组
      self.setData({
        isLoaded: false
      })
      this.setData({
        zhangjies: tiku[currentLoadedStr],
        isLoaded: true
      })
    } else {
      let types = self.getkemuIDByindex(currentIndex); //科目id
      let zhangjieLoadedStrArray = self.data.zhangjieLoadedStrArray; //本地所有已载入标识数组

      self.setData({
        isLoaded: false
      })

      // 获取章节列表
      if (currentMidIndex == 0) { //默认目录是章节列表时才去请求

        app.post(API_URL, "action=getKeMuTestType&types=" + types, false, false, "", "").then(res => {
          let zhangjies = res.data.data;

          self.initZhangjie(zhangjies); //初始化章节信息

          tiku[currentLoadedStr] = zhangjies;
          zhangjieLoadedStrArray.push(currentLoadedStr);

          self.setData({
            zhangjies: zhangjies,
            tiku: tiku,
            zhangjieLoadedStrArray: zhangjieLoadedStrArray,
            isLoaded: true
          })
        })
      } else { //模拟 & 核心
        let keys = currentMidIndex == 1 ? 0 : 1

        app.post(API_URL, "action=getShijuanList&types=" + types + "&keys=" + keys, false, false, "", "").then(res => {
          let zhangjies = res.data.data;


          tiku[currentLoadedStr] = zhangjies;
          zhangjieLoadedStrArray.push(currentLoadedStr);

          self.setData({
            tiku: tiku,
            zhangjieLoadedStrArray: zhangjieLoadedStrArray,
            isLoaded: true,
            zhangjies: zhangjies
          })
        })
      }
    }
  },

  /**
   * 切换试题折叠状态
   */
  toogleFolder: function (e) {
    let self = this;
    let index = e.currentTarget.dataset.index; //选择章节的index
    let zhangjie = self.data.zhangjies; //取得章节对象

    let windowWidth = self.data.windowWidth;
    let num = zhangjie[index].list.length //取得有多少个章节

    //开始动画
    this.step(index, num, windowWidth, zhangjie);

    self.setData({
      zhangjies: zhangjie,
    })
  },

  /**
   * 实现展开折叠效果
   */
  step: function (index, num, windowWidth, zhangjie) {
    let self = this;
    let isFolder = zhangjie[index].isFolder; //取得现在是什么状态
    let jie_num = 0;

    let height = 121 * num; //上下边框2px 转化为rpx


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
        zhangjies: zhangjie,
      })

    } else { //折叠
      zhangjie[index].display = true;

      self.setData({
        zhangjies: zhangjie
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
          zhangjies: zhangjie,
        })
      }, 500)

      self.setData({
        zhangjies: zhangjie,
      })
    }
  },

  /**
   * 展示模拟真题答题弹窗
   */
  showModelanswerModel: function (e) {
    let user = wx.getStorageSync('user');
    let buy = e.currentTarget.dataset.buy;
    let title = e.currentTarget.dataset.title;
    let id = e.currentTarget.dataset.id;
    let time = e.currentTarget.dataset.time;
    let nums = e.currentTarget.dataset.nums;
    let highScore = parseInt(e.currentTarget.dataset.highscore);
    let maxScore = parseInt(e.currentTarget.dataset.maxscore);

    if (buy == '1') { //免费
      this.modelAnswerModel.showDialog(); //弹窗

      let res = highScore / maxScore; //分数百分比
      let color = null;
      if (res < 0.6) { //不及格
        color = "rgb(218, 0, 0);";
      } else if (res >= 0.6 && res < 80) {
        color = "rgb(223, 89, 0);";
      } else {
        color = "#1ccd75";
      }

      this.modelAnswerModel.setData({
        nums: nums,
        title: title,
        time: time,
        highScore: highScore,
        maxScore: maxScore,
        textColor: color,
        id: id
      })
    } else { //不免费
      if (user) {
        this.jiesuoti.showDialog();
      } else {
        wx.navigateTo({
          url: '/pages/login/login?showToast=true&title=您还没有登录',
        })
      }
    }
  },

  /**
   * 答题弹窗提示
   */
  showAnswerModel: function (e) {
    let self = this;
    let num = e.currentTarget.dataset.num; //总题数
    let donenum = e.currentTarget.dataset.donenum; //已答数目
    let rightrate = e.currentTarget.dataset.rightrate; //正确率
    let title = e.currentTarget.dataset.title; //点击的标题
    let f_id = e.currentTarget.dataset.f_id; //章节id
    let zhangIdx = e.currentTarget.dataset.zhangidx; //章的idx
    let jieIdx = e.currentTarget.dataset.jieidx; //章的idx
    let videoid = e.currentTarget.dataset.videoid; //教程id

    let currentIndex = this.data.currentIndex;
    let modelIndex = this.goAnswerModel.data.currentIndex;
    let typesid = this.getkemuIDByindex(currentIndex);

    if (this.goAnswerModel.data.currentIndex != 0) {
      this.goAnswerModel.setData({
        num: num,
        donenum: donenum,
        rightrate: rightrate,
        title: title,
        f_id: f_id,
        zhangIdx: zhangIdx,
        jieIdx: jieIdx,
        videoid: videoid,
      })

      this.goAnswerModel.showDialog();
      app.post(API_URL, "action=getTestTypeNums&typesid=" + typesid + "&f_id=" + f_id, false, false, "", "").then(res => {
        let result = res.data.data[0];
        let types = self.goAnswerModel.data.types;

        if (result.num_dan == 0) {
          modelIndex = 0;
          types[1].none = true;
        } else {
          types[1].none = false;
        }

        if (result.num_duo == 0) {
          types[2].none = true;
          modelIndex = 0;
        } else {
          types[2].none = false;
        }

        if (result.num_pan == 0) {
          types[3].none = true;
          modelIndex = 0;
        } else {
          types[3].none = false;
        }

        self.goAnswerModel.setData({
          num_dan: result.num_dan,
          num_duo: result.num_duo,
          num_pan: result.num_pan,
          types: types,
          currentIndex: modelIndex,
          zhangIdx: zhangIdx,
          jieIdx: jieIdx
        })

        self.goAnswerModel.setNum();
      })
    } else {
      this.goAnswerModel.setData({
        num: num,
        donenum: donenum,
        rightrate: rightrate,
        title: title,
        f_id: f_id,
        videoid: videoid
      })

      this.goAnswerModel.showDialog();

      app.post(API_URL, "action=getTestTypeNums&typesid=" + typesid + "&f_id=" + f_id, false, false, "", "").then(res => {
        let result = res.data.data[0];
        let types = self.goAnswerModel.data.types;

        if (result.num_dan == 0) {
          modelIndex = 0;
          types[1].none = true;
        } else {
          types[1].none = false;
        }

        if (result.num_duo == 0) {
          types[2].none = true;
          modelIndex = 0;
        } else {
          types[2].none = false;
        }

        if (result.num_pan == 0) {
          types[3].none = true;
          modelIndex = 0;
        } else {
          types[3].none = false;
        }

        self.goAnswerModel.setData({
          num_dan: result.num_dan,
          num_duo: result.num_duo,
          num_pan: result.num_pan,
          types: types,
          currentIndex: modelIndex,
          zhangIdx: zhangIdx,
          jieIdx: jieIdx
        })

      })
    }
  },

  /**
   * 导航到做题页面
   */
  _GOzuoti: function (e) {
    let currentSelectIndex = e.detail.currentSelectIndex; //选择做题的题型
    let currentIndex = this.data.currentIndex; //当前科目index
    let title = e.detail.title;
    let selected = e.detail.selected; //已做题还是全部试题
    let donenum = e.detail.donenum; //已做的题数
    let currentMidIndex = this.data.currentMidIndex; //当前试卷类型(章节练习、全镇模拟、核心密卷)
    let types = this.getkemuIDByindex(currentIndex); //科目ID
    let f_id = e.detail.f_id; //章节id
    let all_nums = e.detail.all_nums; //点击章节的题数
    let videoid = e.detail.videoid; //教程id
    let num_dan = e.detail.num_dan; //单选题数量
    let num_duo = e.detail.num_duo; //多选题数量
    let num_pan = e.detail.num_pan; //判断题数量
    let zhangIdx = e.detail.zhangIdx; //点击的章index
    let jieIdx = e.detail.jieIdx; //点击的节index
    let lastZhangeIdx = this.data.lastZhangeIdx ? this.data.lastZhangeIdx : 0;
    let lastJieIdx = this.data.lastJieIdx ? this.data.lastJieIdx : 0;
    let zhangjies = this.data.zhangjies; //当前科目所有章节

    if (!(zhangIdx == lastZhangeIdx && jieIdx == lastJieIdx)) { //点击了不同章节
      zhangjies[lastZhangeIdx].list[lastJieIdx].selected = false;
      zhangjies[zhangIdx].list[jieIdx].selected = true;
      this.setData({
        lastZhangeIdx: zhangIdx,
        lastJieIdx: jieIdx,
        zhangjies: zhangjies
      })
    }

    wx.navigateTo({
      url: '/pages/shuati/zuoti/zuoti?leibie=' + currentSelectIndex + "&selected=" + selected + "&title=" + title + "&f_id=" + f_id + "&types=" + types + "&all_nums=" + all_nums + "&donenum=" + donenum + "&num_dan=" + num_dan + "&num_duo=" + num_duo + "&num_pan=" + num_pan + "&currentIndex=" + currentIndex + "&currentMidIndex=" + currentMidIndex + "&zhangIdx=" + zhangIdx + "&jieIdx=" + jieIdx + "&videoid=" + videoid,
    })
  },

  /**
   * 导航到笔记页面
   */
  GOnoteAndErrList: function (e) {
    let currentIndex = this.data.currentIndex;
    let type = e.currentTarget.dataset.type; //点击的类型('note'笔记 'err' 错题)
    let typesid = this.getkemuIDByindex(currentIndex);
    wx.navigateTo({
      url: '/pages/shuati/noteAndErrList/noteAndErrList?typesid=' + typesid + "&type=" + type,
    })
  },

  /**
   * 导航到收藏
   */
  GOmark: function (e) {
    let index = e.currentTarget.dataset.index;
    let types = this.getkemuIDByindex(index); //科目id
    wx.navigateTo({
      url: '/pages/shuati/mark/mark?types=' + types,
    })
  },

  /**
   * 导航到随机练习
   */
  GORandom: function (e) {
    let index = e.currentTarget.dataset.index;
    let types = this.getkemuIDByindex(index); //科目id
    wx.navigateTo({
      url: '/pages/shuati/random/random?types=' + types,
    })
  },

  /**
   * 导航到模拟
   */
  _GOmoni: function (e) {
    let title = e.detail.title; //标题
    let id = e.detail.id; //id
    let times = e.detail.times; //时间
    let nums = e.detail.nums; //总数
    let totalscore = e.detail.maxScore; //总分
    let text_score = e.detail.highScore; //最高分

    wx.navigateTo({
      url: '/pages/shuati/moni/moni?title=' + title + "&f_id=" + id + "&times=" + times + "&nums=" + nums + "&totalscore=" + totalscore + "&text_score=" + text_score
    })
  },

  /**
   * 导航到学习计划
   */
  GOxuexijihua: function () {
    wx.navigateTo({
      url: '/pages/index/xuexijihua/xuexijihua',
    })
  },

  /**
   * 监测滚动条滚动
   */
  onPageScroll: function (e) {
    let self = this;

    let windowWidth = this.data.windowWidth;
    let scrollTop = e.scrollTop * (750 / windowWidth);
    let opacity = this.data.opacity; //当前页面透明度
    let jiaonang = this.data.jiaonang; //胶囊高度
    let showBlock = null; //是否显示空白框
    let unit = 1 / 200;

    if (scrollTop > 200) { //滑动超过200时开始透明变色
      opacity = 1 - (scrollTop - 200) * unit;
    } else {
      opacity = 1;
    }

    if (scrollTop > 648) {
      self.setData({
        fixed: "fixed",
        showBlock: true,
        opacity: opacity
      })
    } else {
      self.setData({
        fixed: "",
        showBlock: false,
        opacity: opacity
      })
    }
  },
  /**
   * 购买解析包
   */
  _buy: function (e) {

    this.jiesuoti.hideDialog();
    let product = e.detail.product;
    wx.navigateTo({
      url: '/pages/shuati/pay/pay?product=' + product + '&page=shuati',
    })

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})