// pages/shuati/shuati.js
const app = getApp();
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址

Page({

  /**
   * 页面的初始数据
   */
  data: {
    midHeight: 430, //中间条的高度
    lastScrollTop: 0, //上次滚动条的位置
    opacity: 1, //banner透明度
    jindu: 0, //当前做题进度
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    let user = wx.getStorageSync('user')
    let zcode = user.zcode;
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别

    this.setData({
      first: true,
      options: options
    })

    wx.setNavigationBarTitle({
      title: '题库',
    })

    let currentIndex = wx.getStorageSync('currentIndex' + xcx_id) ? wx.getStorageSync('currentIndex' + xcx_id) : 0; //如果有本地缓存就用本地缓存,没有就设置默认0

    this.setData({
      midTitle: this.getMidTitle(xcx_id)
    })

    //获取试题栏目中科目分类
    app.post(API_URL, "action=getKemuList&xcx_id=" + xcx_id, false, false, "").then(res => {
      let bars = res.data.data;

      self.setData({
        bars: bars
      })

      self.setData({
        currentIndex: currentIndex,
        xcx_id: xcx_id
      })


      let types = self.data.bars[currentIndex].id; //科目id

      let tiku = {}; //声明所有题库，用于存储所有已载入题

      self.setData({ //默认没有载入完毕
        isLoaded: false
      })

      let zhangjieLoadedStrArray = []; //已载入的科目id和题型标识数组，用于控制如果已经载入一次就不再重新载入

      let zhangjieLoadedStr = '' + currentIndex
      let user = wx.getStorageSync('user');
      let zcode = user.zcode ? user.zcode : "";
      let token = user.token ? user.token : "";

      //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
      self.getZuotiJindu(token, zcode, types, self);

      zhangjieLoadedStrArray.push(zhangjieLoadedStr);

      // 获取章节列表

      app.post(API_URL, "action=SelectZjList&z_id=" + types, false, false, "", "").then(res => {
        let zhangjies = res.data.data;
        self.initZhangjie(zhangjies); //初始化章节信息

        tiku[zhangjieLoadedStr] = zhangjies;

        self.setData({
          zhangjies: zhangjies,
          tiku: tiku,
          zhangjieLoadedStrArray: zhangjieLoadedStrArray,
          isLoaded: true
        })

        let lastShuati = wx.getStorageSync('lastShuati' + zcode + currentIndex + xcx_id);

        if (lastShuati) { //有最后一次刷题记录才有动画
          let zhangIdx = lastShuati.zhangIdx; //当前章index
          let jieIdx = lastShuati.jieIdx; //当前节index
          let windowWidth = self.data.windowWidth;
          let scroll = (zhangIdx * 90 + 800) * (windowWidth / 750); //滚动条的位置
          let num = null;
          console.log(zhangjies)
          if (jieIdx != 'hasno') {
            num = zhangjies[zhangIdx * 1].zhangjie_child.length //取得有多少个章节
            self.step(zhangIdx, num, windowWidth, zhangjies);
          } else {
            zhangjies[zhangIdx * 1].selected = true;
            self.setData({
              zhangjies: zhangjies
            })
          }

          self.setData({
            zhangIdx: zhangIdx,
            jieIdx: jieIdx
          })

          setTimeout(function() {
            wx.pageScrollTo({
              scrollTop: scroll,
              success: function(res) {
                if (jieIdx != 'hasno') {
                  zhangjies[zhangIdx * 1].zhangjie_child[jieIdx * 1].selected = true;
                  self.setData({
                    zhangjies: zhangjies
                  })
                }

                if (options.from) { //如果从上个页面过来的就有动画
                  options.from = false;
                  self.setData({
                    options: options
                  })
                  setTimeout(function() {
                    wx.navigateTo({
                      url: '/pages/tiku/zuoti/zuoti?title=' + lastShuati.title + "&f_id=" + lastShuati.f_id + "&types=" + lastShuati.types + "&donenum=" + lastShuati.donenum + "&currentIndex=" + lastShuati.currentIndex + "&currentMidIndex=" + lastShuati.currentMidIndex + "&from=shouye" + "&zhangIdx=" + lastShuati.zhangIdx + "&jieIdx=" + lastShuati.jieIdx
                    })
                  }, 2000)
                }
              }
            })
          }, 1000)
        }

        self.setData({
          first: false
        })
      })

      //清除前一天的已刷题数缓存
      let myDate = new Date(); //获取系统当前时间
      let year = myDate.getFullYear();
      let month = myDate.getMonth() + 1;
      let day = myDate.getDate();
      myDate = "" + year + month + day; //得到当前答题字符串

      let str = "today" + myDate + zcode;
      wx.getStorageInfo({
        success: function(res) {
          for (let i = 0; i < res.keys.length; i++) {
            let key = res.keys[i];
            if (key.indexOf('today') != -1) {
              if (str != key) {
                wx.removeStorage({
                  key: key,
                  success: function(res) {

                  },
                })
              }
            }
          }
        },
      })

    })
  },

  /**
   * 获取做题进度
   */
  getZuotiJindu: function(token, zcode, types, self) {
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
  initZhangjie: function(zhangjies) {
    let user = wx.getStorageSync('user');
    let zcode = user.zcode == undefined ? '' : user.zcode; //本地缓存标识,如果登陆就是唯一，如果是游客就公用本地缓存

    for (let i = 0; i < zhangjies.length; i++) { //遍历所有数组
      let zhangjie = zhangjies[i];
      zhangjie.donenum = 0; //默认章已做题目为0
      zhangjie.rightNum = 0;
      zhangjie.isFolder = true; //设置展开初始值
      for (let j = 0; j < zhangjie.zhangjie_child.length; j++) {
        let jie = zhangjie.zhangjie_child[j];
        let doneArray = wx.getStorageSync('shiti' + jie.id + zcode) ? wx.getStorageSync('shiti' + jie.id + zcode) : [];

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

      let zj_doneArray = wx.getStorageSync('shiti' + zhangjie.id + zcode);
      if (zj_doneArray) {
        zhangjie.donenum = zj_doneArray.length;
      }

      zhangjie.rateWidth = 470 * zhangjie.donenum / parseInt(zhangjie.nums); //绿条宽度
      zhangjie.rate = (zhangjie.donenum / parseInt(zhangjie.nums) * 100).toFixed(2); //完成比例
      zhangjie.rightrate = zhangjie.donenum == 0 ? '0.00' : ((zhangjie.rightNum / zhangjie.donenum) * 100).toFixed(2);
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;

    this.goAnswerModel = this.selectComponent("#goAnswerModel");
    this.jiesuoti = this.selectComponent("#jiesuoti");
    this.ti = wx.createSelectorQuery(); //题组件dom对象

    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
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
   * 根据考生类别得到标题
   */
  getMidTitle: function(id) {
    let title = "";
    switch (id) {
      case 1:
        title = "本题库根据2019年最新健康管理师考试大纲命题";
        break;
      case 2:
        title = "本题库根据2019年最新导游考试大纲命题";
        break;
      case 3:
        title = "本题库根据2019年最新房地产经纪人考试大纲命题";
        break;
      case 4:
        title = "本题库根据2019年最新房地产经纪人协理考试大纲命题";
        break;
    }

    return title;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let self = this;
    let currentIndex = this.data.currentIndex; //当前科目index
    let zhangjieLoadedStr = '' + currentIndex; //当前题库标识
    //用户信息
    let user = wx.getStorageSync('user');
    let zcode = user.zcode ? user.zcode : "";
    let token = user.token ? user.token : '';
    let options = self.data.options;


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
      let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1
      let current_xcx_id = self.data.xcx_id;

      this.setData({
        midTitle: this.getMidTitle(xcx_id)
      })

      if (xcx_id != current_xcx_id && xcx_id) { //切换了考试，并且xcx_id被设置过
        // 获取试题栏目中科目分类
        app.post(API_URL, "action=getKemuList&xcx_id=" + xcx_id, false, false, "").then(res => {
          let bars = res.data.data
          self.setData({
            bars: bars
          })

          //初始化index值
          wx.setStorageSync('currentIndex' + xcx_id, 0);

          self.setData({
            currentIndex: 0,
            currentMidIndex: 0,
            xcx_id: xcx_id
          })

          let types = self.data.bars[0].id; //科目id

          let tiku = {}; //声明所有题库，用于存储所有已载入题

          self.setData({ //默认没有载入完毕
            isLoaded: false
          })

          let zhangjieLoadedStrArray = []; //已载入的科目id和题型标识数组，用于控制如果已经载入一次就不再重新载入

          let zhangjieLoadedStr = '' + currentIndex;

          self.getZuotiJindu(token, zcode, types, self);

          zhangjieLoadedStrArray.push(zhangjieLoadedStr);

          app.post(API_URL, "action=SelectZjList&z_id=" + types, false, false, "", "").then(res => {
            let zhangjies = res.data.data;

            self.initZhangjie(zhangjies); //初始化章节信息

            tiku[zhangjieLoadedStr] = zhangjies;

            self.setData({
              zhangjies: zhangjies,
              tiku: tiku,
              zhangjieLoadedStrArray: zhangjieLoadedStrArray,
              isLoaded: true
            })

            self.setData({
              first: false
            })
          })
        })
      } else { //没有切换考试
        self.setData({
          user: user
        })

        let types = self.data.bars[currentIndex].id //科目id
        //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
        self.getZuotiJindu(token, zcode, types, self);
      }
    }
  },

  /**
   * 改变科目
   */
  changeBar: function(e) {
    let self = this;
    let type = e.currentTarget.dataset.type; //切换类型(1.点击科目,2.点击题型)
    let barid = e.currentTarget.dataset.barid;
    let currentIndex = null;
    let currentMidIndex = null;

    if (!self.data.zhangjieLoadedStrArray) { //还没有载入完毕
      wx.showToast({
        title: '等待载入...',
        icon: 'none',
        duration: 3000
      })
      return
    }

    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1


    currentIndex = e.currentTarget.dataset.index; //点击的科目id

    //********用户信息*******//
    let user = wx.getStorageSync('user');
    let zcode = user.zcode ? user.zcode : "";
    let token = user.token ? user.token : '';
    //***********************

    self.setData({
      currentIndex: currentIndex
    })
    wx.setStorage({ //设置本地缓存
      key: 'currentIndex' + xcx_id,
      data: currentIndex,
      fail: function() {
        wx.showToast({
          title: '设置currentIndex失败',
          icon: 'none',
          duration: 3000
        })
      }
    })

    //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
    let types = self.data.bars[currentIndex].id;

    //****获取做题进度百分比,因为onshow事件可能改变currentIndex值,所以要在最新获取currentIndex值的地方使用接口//
    self.getZuotiJindu(token, zcode, types, self);


    let currentLoadedStr = "" + currentIndex;
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
      let types = self.data.bars[currentIndex].id; //科目id
      let zhangjieLoadedStrArray = self.data.zhangjieLoadedStrArray; //本地所有已载入标识数组

      self.setData({
        isLoaded: false
      })

      // 获取章节列表
      app.post(API_URL, "action=SelectZjList&z_id=" + types, false, false, "", "").then(res => {
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

    }
  },

  /**
   * 切换试题折叠状态
   */
  toogleFolder: function(e) {
    let self = this;
    let index = e.currentTarget.dataset.zhangidx; //选择章节的index
    let zhangjie = self.data.zhangjies; //取得章节对象

    let windowWidth = self.data.windowWidth;
    let num = zhangjie[index].zhangjie_child.length //取得有多少个章节


    if (num == 0) {

      this.GOzuoti(e);
      return
    } else {
      //开始动画
      this.step(index, num, windowWidth, zhangjie);

      self.setData({
        zhangjies: zhangjie,
      })
    }
  },

  /**
   * 实现展开折叠效果
   */
  step: function(index, num, windowWidth, zhangjie) {
    let self = this;
    let isFolder = zhangjie[index].isFolder; //取得现在是什么状态
    console.log(zhangjie[index].isFolder)
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

      foldAnimation.height(0, height + "rpx").opacity(0).step(function() {})

      zhangjie[index].height = 0;
      zhangjie[index].isFolder = true;
      zhangjie[index].folderData = foldAnimation.export();

      setTimeout(function() {
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
  showModelanswerModel: function(e) {
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
   * 导航到做题页面
   */
  GOzuoti: function(e) {
    let self = this;
    let currentIndex = this.data.currentIndex; //当前科目index
    let title = e.currentTarget.dataset.title;
    let donenum = e.currentTarget.dataset.donenum; //已做的题数
    let types = self.data.bars[currentIndex].id; //科目ID
    let f_id = e.currentTarget.dataset.f_id; //章节id
    let all_nums = e.currentTarget.dataset.num; //点击章节的题数

    let zhangIdx = e.currentTarget.dataset.zhangidx; //点击的章index
    let jieIdx = e.currentTarget.dataset.jieidx != undefined ? e.currentTarget.dataset.jieidx : 'hasno'; //点击的节index

    let lastZhangeIdx = this.data.zhangIdx;
    let lastJieIdx = this.data.jieIdx;
    let zhangjies = this.data.zhangjies; //当前科目所有章节

    if (!(zhangIdx == lastZhangeIdx*1 && jieIdx == lastJieIdx*1)) { //点击了不同章节
      console.log(lastJieIdx)
      if (lastJieIdx != 'hasno' ) {
        zhangjies[lastZhangeIdx*1].zhangjie_child[lastJieIdx*1].selected = false;
      } else {
        zhangjies[lastZhangeIdx*1].selected = false;
      }

      if (jieIdx != 'hasno') {
        zhangjies[zhangIdx].zhangjie_child[jieIdx].selected = true;
        zhangjies[zhangIdx].selected = true;
      }

      this.setData({
        zhangIdx: zhangIdx,
        jieIdx: jieIdx,
        zhangjies: zhangjies
      })
    }

    wx.navigateTo({
      url: '/pages/tiku/zuoti/zuoti?title=' + title + "&f_id=" + f_id + "&types=" + types + "&all_nums=" + all_nums + "&donenum=" + donenum + "&currentIndex=" + currentIndex + "&zhangIdx=" + zhangIdx + "&jieIdx=" + jieIdx,
    })
  },

  /**
   * 导航到笔记页面
   */
  GOcuoti: function(e) {
    let currentIndex = this.data.currentIndex;
    let typesid = this.data.bars[currentIndex].id;
    wx.navigateTo({
      url: '/pages/tiku/cuoti/cuotiList?typesid=' + typesid
    })
  },

  /**
   * 导航到收藏
   */
  GOmark: function(e) {
    let index = e.currentTarget.dataset.index;
    let types = this.data.bars[index].id; //科目id
    wx.navigateTo({
      url: '/pages/tiku/mark/mark?types=' + types,
    })
  },

  /**
   * 导航到模拟真题列表
   */
  GOmonilist: function(e) {
    let keys = e.currentTarget.dataset.keys; //押题还是真题
    let currentIndex = this.data.currentIndex;
    let typesid = this.data.bars[currentIndex].id;

    wx.navigateTo({
      url: '/pages/tiku/modelReal/modelRealList?typesid=' + typesid + "&keys=" + keys
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
   * 导航到随机练习
   */
  GORandom: function(e) {
    let index = e.currentTarget.dataset.index;
    let types = this.data.bars[currentIndex].id; //科目id
    wx.navigateTo({
      url: '/pages/shuati/random/random?types=' + types,
    })
  },

  /**
   * 导航到模拟
   */
  _GOmoni: function(e) {
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
  GOxuexijihua: function() {
    wx.navigateTo({
      url: '/pages/index/xuexijihua/xuexijihua',
    })
  },

  /**
   * 监测滚动条滚动
   */
  onPageScroll: function(e) {
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
  _buy: function(e) {

    this.jiesuoti.hideDialog();
    let product = e.detail.product;
    wx.navigateTo({
      url: '/pages/shuati/pay/pay?product=' + product + '&page=shuati',
    })

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})