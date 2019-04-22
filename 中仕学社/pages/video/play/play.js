// pages/video/videoDetail/videoDetail.js
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址
const app = getApp();
let md5 = require('../../../common/MD5.js');
let animate = require('../../../common/animate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
let myanimation = animate.easeOutAnimation();
let buttonClicked = false;
let changeVideo = false; //是否是通过点击更换的video
let changeType = false; //网络类型是否更改
let first = true; //是不是第一次控制自动播放
let time = require('../../../common/time.js');

let icon = { //图标高度宽度
  'width': 38,
  'height': 38
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loaded: false,
    isPlaying: false, //是否在播放
    useFlux: false, //是否使用流量观看
    isWifi: true, //默认有wifi
    lastType: "first",
    product: 'option',
    pl: [],
    text: "",

    beisuP: "", //全屏倍速样式
    //meuntop: "",//获取菜单高度
    mybar: "",
    playbackRate: 1, //播放速率  0.5、0.8、1.0、1.25、1.5
    currentTime: 0, //当前播放时间
    autoplay: true, //默认自动播放
    showBeisu: false, //是否显示倍速
    loadingMore: false, //是否在加载更多
    loadingText: "", //上拉载入更多的文字
    showLoadingGif: false, //是否显示刷新gif图
  },

  test: function() {

    var filePath = '/images/test.pptx'   ;
    wx.openDocument({
      filePath: filePath,
      success: function(res) {
        console.log('打开文档成功')
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var kcid = options.kc_id;

    this.setData({
      kcid: kcid,
      options: options
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
    this.payDetail = this.selectComponent("#payDetail");

    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        let platform = res.platform;

        windowHeight = (windowHeight * (750 / windowWidth));

        self.setData({
          windowHeight: windowHeight,
          windowWidth: windowWidth,
          platform: platform
        })
      }
    });

    this.videoContext = wx.createVideoContext('myVideo')
  },

  /**
   * 根据播放时间设置音频图片
   */
  setPic: function(audio, currentTime) {
    let pics = audio.pics;

    let time = 0;
    let showPicIndex = 0; //默认第一张图片
    for (let i = 0; i < pics.length; i++) {
      let pic = pics[i] //图片对象

      let time1 = pic.length / 1000
      if (currentTime - time > 0 && currentTime - time <= time1) {
        if (i != this.data.showPicIndex) {
          console.log(i)
          this.setData({
            showPicIndex: i
          })
        }
        break;
      } else if (currentTime - time > time1) { //涨过后就变图片
        if (i < pics.length - 1) {
          time += pic.length / 1000 //当前累计秒数
        }
      }
    }
  },

  //改变视频速率
  beisu: function(e) {
    let self = this;
    var beisu = e.currentTarget.dataset.su * 1;
    this.setData({
      playbackRate: beisu
    });
    this.videoContext.playbackRate(beisu);
    this.videoContext.play();

    let lastTimeout = self.data.timeOut;
    clearTimeout(lastTimeout);
    let showBeisu = this.data.showBeisu; //当前是否显示倍速

    let timeOut = setTimeout(function() {
      self.setData({
        showBeisu: false,
      })
    }, 5000)

    self.setData({
      timeOut: timeOut
    })

  },

  quan: function() {
    if (this.data.beisuP == "") {
      this.setData({
        beisuP: "on"
      })
    } else {
      this.setData({
        beisuP: ""
      })
    }

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let self = this;

    let windowWidth = wx.getSystemInfoSync().windowWidth;

    let kcid = self.data.kcid;

    let img = "";
    let loaded = self.data.loaded;
    let px = 1;
    let user = wx.getStorageSync('user');

    let zcode = user.zcode ? user.zcode : ''; //客户端id号
    let token = user.token ? user.token : '';


    if (loaded == undefined) return;

    loaded = false;

    if (user) {
      app.post(API_URL, "action=getCourseShow&cid=" + kcid + "&token=" + token + "&zcode=" + zcode, false, false, "", "", false, self).then((res) => {
        let files = res.data.data[0].files; //视频列表
        //最后播放视频索引
        let lastpx = wx.getStorageSync('lastVideo' + kcid + user.zcode);
        let scroll = lastpx * 100 * windowWidth / 750;
        if (lastpx != "") {
          px = lastpx.px;
          //videoID 最后播放视频id
          //initialTime 最后播放视频时间
          let lasttime = wx.getStorageSync('kesub' + kcid + "_" + lastpx.videoID + "_" + user.zcode);
          if (lasttime) {
            this.videoContext.seek(files[px - 1].lastViewLength * 1);
          }
        }

        let currentVideo = files[px - 1];
        console.log(currentVideo)

        //获取当前看课节数
        let myDate = new Date(); //获取系统当前时间
        let year = myDate.getFullYear();
        let month = myDate.getMonth() + 1;
        let day = myDate.getDate();
        myDate = "" + year + month + day; //得到当前答题字符串

        let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别

        let todayDoneKe = wx.getStorageSync("todayKe" + myDate + user.zcode + xcx_id) ? wx.getStorageSync("todayKe" + myDate + user.zcode + xcx_id) : [];
        if (todayDoneKe.indexOf(currentVideo.id) == -1) { //如果不包含当前id
          todayDoneKe.push(currentVideo.id);
        }

        wx.setStorage({
          key: "todayKe" + myDate + user.zcode + xcx_id,
          data: todayDoneKe,
        })

        let buy = res.data.data[0].buy; //是否已经开通
        let kc_money = res.data.data[0].money; //价格 
        let info = res.data.data[0].kc_info ? res.data.data[0].kc_info : ''; //课程信息

        self.initfiles(files, px)
        self.setData({
          files: files,
          kc_name: res.data.data[0].kc_name,
          teacher: res.data.data[0].teacher,
          zi: res.data.data[0].kc_name.substr(res.data.data[0].kc_name.length - 2, 2),
          info: info,
          kc_money: kc_money,
          loaded: true,
          img: res.data.data[0].kc_img,
          kcid: kcid,
          px: px,
          buy: buy,
          todayDoneKe: todayDoneKe //今日看课节数
        });
        wx.setNavigationBarTitle({ //设置标题
          title: res.data.data[0].kc_name
        });
      })

    } else {
      wx.navigateTo({
        url: '/pages/login/login?showToast=true&title=您还没有登录',
      })
    }
  },

  /**
   * 得到评论
   */
  getPL: function() {
    let self = this;
    let kcid = this.data.kcid;
    let pl = this.data.pl;

    //获取评论列表
    let page_all = this.data.page_all ? this.data.page_all : 1000; //如果有page_all说明已经请求过,如果没有,说明第一次，默认为1000
    let page_now = this.data.page_now ? this.data.page_now : 0; //当前页默认为0

    self.setData({
      loadingMore: true
    })

    app.post(API_URL, "action=GetCoursePL&cid=" + kcid + "&page=" + page_now + 1, false, false, "", "").then((res) => {
      var page_all = res.data.data[0].page_all;
      var page_now = res.data.data[0].page_now;
      let newpl = res.data.data[0].pllist;

      pl = pl.concat(newpl); //连接数组

      let info = "";

      page_now = page_all == 0 ? 0 : page_now; //如果当前页总数为0,那么就把当前页设为0

      if (!self.data.plfirst) { //如果第一次载入
        self.setData({
          page_all: page_all,
          page_now: page_now,
          loadingMore: false,
          plfirst: true,
          pl: pl,
        })

        if (page_now == page_all) { //说明已经最后一页
          self.setData({
            plAllDone: true,
            loadingText: "别扯了,我是有底线的..."
          })
        }
      } else { //如果第N次载入
        self.setData({
          showLoadingGif: false,
          loadingText: "载入完成"
        })

        setTimeout(function() {
          self.setData({
            page_all: page_all,
            page_now: page_now,
            loadingMore: false,
            pl: pl,
            loadingText: ""
          })

          if (page_now == page_all) { //说明已经最后一页
            self.setData({
              plAllDone: true,
              loadingText: "别扯了,我是有底线的..."
            })
          }
        }, 200)
      }
    })
  },

  /**
   * 输入文字
   */
  typing: function(e) {
    let text = e.detail.value;
    this.setData({
      text: text
    })
  },
  /**
   * 发送信息
   */
  sendMessage: function() {
    buttonClicked = false;
    let self = this;
    let pl = self.data.pl;

    if (self.data.text == '') {
      wx.showToast({
        title: '内容不能为空',
        image: '/images/sad.png',
        duration: 3000
      })
      return;
    }

    let user = wx.getStorageSync('user');
    if (user) {
      let content = self.data.text;
      // 本地先更新
      let obj = {};
      obj.hf = "";
      obj.nickname = user.Nickname;
      obj.pc_content = content;
      obj.pl_time = "刚刚";
      obj.userimg = user.Pic;

      pl.unshift(obj);

      self.setData({
        pl: pl,
        page_all: 1,
        text: '',
        value: '',
        scrollTop: 0
      })

      let zcode = user.zcode;
      let token = user.token;
      let kcid = self.data.kcid;

      app.post(API_URL, "action=SaveCoursePL&token=" + token + "&zcode=" + zcode + "&cid=" + kcid + "&plcontent=" + content + "&page=1", false, false, "", "", "", self).then(res => {

      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },



  /**
   * 使用流量继续观看
   */
  continueWatch: function() {
    this.videoContext.play();
    this.setData({
      isPlaying: true,
      autoplay: true,
      useFlux: true
    })
  },


  /**
   * 换视频时
   */
  changeVideo: function(e) {
    let self = this;
    let windowWidth = self.data.windowWidth;

    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别
    let kcid = self.data.kcid;
    let options = self.data.options;

    changeVideo = false;

    let files = self.data.files; //当前所有视频

    let px = self.data.px; //当前视频编号
    let isPlaying = true; //是否正在播放视频

    let index = e.currentTarget.dataset.index; //点击的视频编号

    if (index == px - 1) return; //如果点击的是同一个视频就不做任何操作

    let lastVideo = files[px - 1]; //上一个视频
    let videoID = lastVideo.id; //上一个视频id
    let flag = 1; //判断是否看完;
    let currentVideo = files[index]; //点击的这个视频

    if (currentVideo.files == "") {
      let user = wx.getStorageSync('user');
      if (user) {
        wx.showToast({
          title: '您还没有开通此课程',
          icon: 'none',
          duration: 3000
        })
        return;
      } else {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    }

    let playTime = 0;
    let currentTime = self.data.currentTime;
    if (currentTime > 10 && currentTime < lastVideo.time_length - 10) { //播放时间)
      playTime = currentTime - 10;
    } else if (currentTime > lastVideo.time_length - 10) {
      playTime = currentTime;
    } else {
      playTime = 0;
    }

    lastVideo.lastViewLength = currentTime; //设置上一个视频的播放时间

    if (currentVideo.lastViewLength >= currentVideo.time_length * 1 - 3) {
      changeVideo = true;
      self.videoContext.stop();
      isPlaying = false;
    }

    self.setData({
      files: files,
      isPlaying: isPlaying,
      px: index + 1,

      currentTime: currentVideo.lastViewLength //将当前播放时间置为该视频的播放进度
    })
    wx.pageScrollTo({
      scrollTop: 0
    })
    let user = wx.getStorageSync('user');
    if (user) {
      //获取当前看课节数
      let myDate = new Date(); //获取系统当前时间
      let year = myDate.getFullYear();
      let month = myDate.getMonth() + 1;
      let day = myDate.getDate();
      myDate = "" + year + month + day; //得到当前答题字符串

      let todayDoneKe = wx.getStorageSync("todayKe" + myDate + user.zcode) ? wx.getStorageSync("todayKe" + myDate + user.zcode) : [];
      if (todayDoneKe.indexOf(currentVideo.id) == -1) { //如果不包含当前id
        todayDoneKe.push(currentVideo.id);
      }

      wx.setStorage({
        key: "todayKe" + myDate + user.zcode,
        data: todayDoneKe,
      })
      let zcode = user.zcode;
      let token = user.token;

      wx.setStorage({
        key: 'kesub' + kcid + "_" + videoID + "_" + zcode,
        data: playTime,
        success: function() {},
        fail: function() {

        }
      })

      wx.setStorage({
        key: 'lastkesub' + zcode + xcx_id,
        data: {
          options: options
        },
      })

      console.log('播放了', playTime)
      app.post(API_URL, "action=savePlayTime&zcode=" + zcode + "&token=" + token + "&videoid=" + videoID + "&playTime=" + playTime + "&kcid=" + kcid + "&flag=" + flag, false, true, "").then((res) => {

      })
    }
    //videoID 缓存的视频id
    //initialTime 缓存的视频时间
    let hctime = wx.getStorageSync('kesub' + kcid + "_" + files[index].videoID + "_" + user.zcode);
    if (hctime) {
      this.videoContext.seek(hctime)
      if (hctime >= currentVideo.time_length * 1 - 3) {
        changeVideo = true;
        self.videoContext.stop();
        isPlaying = false;
      }
    }
  },
  /**
   * 点击滑块事件
   */
  slderTap:function(){
    console.log('我点击了')
  },

  /**
   * 音频图片swiper滑块的滑动事件
   */
  sliderChange: function(e) {
    let self = this;
    let px = self.data.px;
    let files = self.data.files;
    let video = files[px - 1];
    let postion = e.detail.value; //滑动到的位置
    let time_length = video.time_length;
    let step = time_length * 1 / 100;
    let currentSliderPosition = this.data.currentSliderPosition;
    console.log(postion)
    this.setData({
      currentTime: postion * step
    })
  },

  /**
   * 播放进度改变时
   */
  timeupdate: function(e) {
    let self = this;
    let px = self.data.px;
    let files = self.data.files;
    let video = files[px - 1];
    let currentTime = e.detail.currentTime
    let showPicIndex = this.data.showPicIndex;
    let currentSliderPosition = this.data.currentSliderPosition; //当前的slider滑块位置

    if (video.leixing == '1') {
      let pics = video.pics;
      let times = video.times;

      for (let i = 0; i < times.length; i++) {
        let time = i == 0 ? 0 : times[i - 1];
        let time1 = times[i];

        if (currentTime > time && currentTime < time1) {
          if (showPicIndex != i) {
            console.log('设置了' + i)
            console.log(video)
            this.setData({
              showPicIndex: i
            })
          }
          break;
        }
      }
    }

    let m = parseInt(e.detail.currentTime / 60);

    if (video.playCourseArr[m] == 0) {
      video.playCourseArr[m] = 1;
    }

    if (e.detail.currentTime >= video.time_length * 1 - 3 && first) { //刚载入时如果缓存的视频是结尾状态就暂停
      changeVideo = true;
      self.videoContext.stop();
      self.setData({
        isPlaying: false
      })
    }

    first = false;
    let currentTimeStr = time.formatTimeBySecond2(Math.round(e.detail.currentTime));
    let time_length = video.time_length;
    let step = time_length * 1 / 100;
    let sliderPosition = Math.round(e.detail.currentTime / step);

    if (sliderPosition != currentSliderPosition) {
      this.setData({
        currentSliderPosition: sliderPosition
      })
    }

    self.setData({
      files: files,
      currentTime: e.detail.currentTime,
      currentTimeStr: currentTimeStr,
    })

  },

  tooglePlayaudio: function() {
    this.audioContext.play();
  },

  /**
   * 点击开始播放
   */
  play: function(e) {
    let self = this;
    let px = self.data.px; //当前视频编号
    let files = self.data.files; //当前所有视频
    let currentVideo = files[px - 1];

    if (currentVideo.files == "") {
      wx.showToast({
        title: '您还没有开通此课程',
        icon: 'none',
        duration: 3000
      })
      return;
    }


    this.setData({
      isPlaying: true,
    })
  },

  /**
   * 点击暂停播放
   */
  pause: function() {
    this.setData({
      isPlaying: false
    })
  },

  /**
   * 视频播放结束后
   */
  end: function(e) {
    let self = this;
    let windowWidth = self.data.windowWidth;
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别

    if (changeVideo) { //如果点击的视频时结尾状态就暂停
      self.videoContext.stop();
      return; //如果是通过点击更换的video
    }

    let kcid = self.data.kcid;
    let options = self.data.options;

    let files = self.data.files; //当前所有视频

    let px = self.data.px; //当前视频编号
    let isPlaying = true; //是否在播放

    if (px == files.length) return; //如果点击的是同一个视频就不做任何操作

    let lastVideo = files[px - 1]; //上一个视频
    let flag = 2 //判断是否看完;
    let videoID = lastVideo.id; //视频id


    let currentVideo = files[px]; //当前视频

    if (currentVideo.files == "") {
      let user = wx.getStorageSync('user');
      if (user) {
        wx.showToast({
          title: '您还没有开通此课程',
          icon: 'none',
          duration: 3000
        })
        return;
      } else {
        wx.navigateTo({
          url: '/pages/login/login',
        })
      }
    }



    let playTime = 0;
    let currentTime = self.data.currentTime;
    if (currentTime > 10 && currentTime < lastVideo.time_length - 10) { //播放时间)
      playTime = currentTime - 10;
    } else if (currentTime >= lastVideo.time_length - 10) {
      playTime = currentTime;
    } else {
      playTime = 0;
    }

    lastVideo.lastViewLength = currentTime; //设置上一个视频的播放时间

    let currentAngle = currentVideo.lastViewLength / currentVideo.time_length * 2 * Math.PI;

    if (currentVideo.lastViewLength >= currentVideo.time_length - 3) {
      changeVideo = true;
      isPlaying = false;
    }

    self.setData({
      files: files,
      isPlaying: isPlaying,
      px: px + 1,
      currentTime: currentVideo.lastViewLength //将当前播放时间置为该视频的播放进度
    })

    let user = wx.getStorageSync('user');
    if (user) {
      //获取当前看课节数
      let myDate = new Date(); //获取系统当前时间
      let year = myDate.getFullYear();
      let month = myDate.getMonth() + 1;
      let day = myDate.getDate();
      myDate = "" + year + month + day; //得到当前答题字符串

      let todayDoneKe = wx.getStorageSync("todayKe" + myDate + user.zcode) ? wx.getStorageSync("todayKe" + myDate + user.zcode) : [];
      if (todayDoneKe.indexOf(currentVideo.id) == -1) { //如果不包含当前id
        todayDoneKe.push(currentVideo.id);
      }

      wx.setStorage({
        key: "todayKe" + myDate + user.zcode,
        data: todayDoneKe,
      })

      let zcode = user.zcode;
      let token = user.token;
      wx.setStorage({
        key: 'kesub' + kcid + "_" + videoID + "_" + zcode,
        data: playTime,
        success: function() {

        },
        fail: function() {

        }
      })

      wx.setStorage({
        key: 'lastkesub' + zcode + xcx_id,
        data: {
          options: options
        },
      })

      console.log('播放了', playTime)
      app.post(API_URL, "action=savePlayTime&zcode=" + zcode + "&token=" + token + "&videoid=" + videoID + "&playTime=" + playTime + "&kcid=" + kcid + "&flag=" + flag, false, true, "").then((res) => {

      })
    }

  },

  /**
   * 切换播放状态
   */
  tooglePlay: function() {
    let self = this;


    let px = self.data.px; //当前视频编号
    let files = self.data.files; //当前所有视频
    let currentVideo = files[px - 1];

    if (currentVideo.files == "") {
      wx.showToast({
        title: '您还没有开通此课程',
        icon: 'none',
        duration: 3000
      })
      return;
    }

    let isPlaying = self.data.isPlaying;
    if (currentVideo.lastViewLength == "0") { //如果没有播放过,就
      currentVideo.lastViewLength = "0.1";
      self.setData({
        files: files
      })
    }
    isPlaying = !isPlaying;
    changeVideo = false; //防止视频到最后时自动播放

    isPlaying ? this.videoContext.play() : this.videoContext.pause();

    self.setData({
      isPlaying: isPlaying,
    })
  },

  /**
   * 切换显示倍速
   */
  toogleShow: function() {
    let self = this;
    let showBeisu = this.data.showBeisu;
    this.setData({
      showBeisu: !showBeisu
    })

    let lastTimeout = self.data.timeOut;

    clearTimeout(lastTimeout);

    if (!showBeisu) {
      let showBeisu = this.data.showBeisu; //当前是否显示倍速

      let timeOut = setTimeout(function() {
        self.setData({
          showBeisu: false,
        })
      }, 5000)


      self.setData({
        timeOut: timeOut
      })
    }
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.videoContext.pause();
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别
    let self = this;
    let user = self.data.user;

    if (user != undefined) {
      let kcid = self.data.kcid;
      let options = self.data.options;

      let px = self.data.px;
      //wx.setStorageSync('lastVideo' + kcid + user.zcode, px);
      let onVideo = files[px];
      let videoID = onVideo.id;
      wx.setStorage({
        key: 'lastVideo' + kcid + user.zcode,
        data: {
          px: px,
          videoID: videoID
        },
        success: function() {

        },
        fail: function() {

        }
      })

      wx.setStorage({
        key: 'lastkesub' + zcode + xcx_id,
        data: {
          options: options
        },
      })

    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    let self = this;
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1 //考试类别

    if (self.data.loaded) { //载入完毕才执行
      let kcid = self.data.kcid;
      let options = self.data.options;
      let px = self.data.px;
      let files = self.data.files; //当前所有视频
      let lastVideo = files[px - 1];

      let flag = 1; //判断是否看完;
      let videoID = lastVideo.id;

      let playTime = 0;
      let currentTime = self.data.currentTime;
      if (currentTime > 10 && currentTime < lastVideo.time_length - 10) { //播放时间)
        playTime = currentTime - 10;
      } else if (currentTime > lastVideo.time_length - 10) {
        playTime = currentTime;
      } else {
        playTime = 0;
      }

      let user = wx.getStorageSync('user');
      if (user) {
        let zcode = user.zcode;
        let token = user.token;
        wx.setStorage({
          key: 'lastVideo' + kcid + zcode,
          data: {
            px: px,
            videoID: videoID
          },
          success: function() {

          },
          fail: function() {

          }
        })


        wx.setStorage({
          key: 'kesub' + kcid + "_" + videoID + "_" + zcode,
          data: playTime,
          success: function() {

          },
          fail: function() {

          }
        })


        wx.setStorage({
          key: 'lastkesub' + zcode + xcx_id,
          data: {
            options: options
          },
        })
        console.log('播放了', playTime)
        app.post(API_URL, "action=savePlayTime&zcode=" + zcode + "&token=" + token + "&videoid=" + videoID + "&playTime=" + playTime + "&kcid=" + kcid + "&flag=" + flag, false, true, "").then((res) => {})

        if (self.data.options.fromIndex == 'true') {
          wx.switchTab({
            url: '/pages/learn/learn'
          })
        }
      }
    }
  },
  /**
   * 初始化视频信息
   */
  initfiles: function(files, px) {
    for (let i = 0; i < files.length; i++) {
      let video = files[i];
      video.show = true;
      let flag = video.Flag;

      //处理时间
      let length = Math.ceil(video.time_length);
      let m = parseInt(length / 60);
      let s = length % 60 < 10 ? '0' + length % 60 - 1 : length % 60 - 1;
      video.time = m + '分' + s + '秒';
      video.allTimeStr = m + ':' + s;
      video.playCourseArr = [];
      //初始化已观看视频的时间数组
      if (video.playCourseArr == "") { //如果是空数组，说明是首次观看
        if (s !== "00") {
          for (let i = 0; i < m + 1; i++) {
            video.playCourseArr.push(0);
          }
        }
      }
    }
  },

  scrollTOtop: function() {
    this.setData({
      mybar: "",
      scrollTop: 0
    })
  },

  scroll: function(e) {
    let windowWidth = this.data.windowWidth;
    let scrollTop = e.detail.scrollTop * 750 / windowWidth;
    let lastScroll = this.data.lastScroll;
    //防止多次setData，这里只有在有变化时才去设置
    if (scrollTop > 422 && lastScroll <= 422) {
      this.setData({
        fixed: 'position: fixed;width:375rpx;height:211rpx;left:375rpx;top:0rpx;',
        showBlank: true
      })
    } else if (scrollTop <= 422 && lastScroll >= 422) {
      this.setData({
        fixed: '',
        showBlank: false
      })
    }

    if (scrollTop > 900 && lastScroll <= 900) {
      this.setData({
        mybar: "on"
      })
    } else if (scrollTop < 900 && lastScroll >= 900) {
      this.setData({
        mybar: ""
      })
    }

    this.setData({
      lastScroll: scrollTop
    })
  },

  /**
   * 改变目录
   */
  changeOption: function(e) {
    let self = this;
    let currentProduct = self.data.product; //当前种类
    let product = e.currentTarget.dataset.product; //点击的视频种类
    if (product == currentProduct) return; //如果没有改变就不作任何操作

    let windowWidth = self.data.windowWidth; //窗口宽度
    let moveData = undefined; //动画
    if (product == "introduction") {
      moveData = animate.moveX(easeOutAnimation, -250 * (windowWidth / 750));
    } else if (product == "option") {
      moveData = animate.moveX(easeOutAnimation, 0);
    } else { //课程评价
      moveData = animate.moveX(easeOutAnimation, 250 * (windowWidth / 750));
      if (!this.data.plfirst) { //如果还没获取评论过
        self.getPL();
      }
    }

    self.setData({
      product: product,
      moveData: moveData
    })
  },

  /**
   * 导航到套餐页面
   */
  goPay: function() {
    let platform = this.data.platform;
    if (platform == 'ios') {
      wx.showModal({
        title: '提示',
        content: '因Apple政策原因，IOS暂不支持小程序内购买课程，苹果用户请使用安卓设备开通！服务电话：4006-456-114',
        showCancel: true,
        confirmText: '拨打电话',
        confirmColor: '#2ec500',
        success: function(e) {
          if (e.confirm) {
            wx.makePhoneCall({
              phoneNumber: '4006-456-114'
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: 'pay?danke=true&id=' + this.data.kcid + '&money_zong=' + this.data.kc_money + '&title=' + this.data.kc_name + '&keshi=' + this.data.files.length + '&teacher=' + this.data.teacher
      })
    }

  },

  /**
   * 滚动条滑动到底
   */
  scrolltolower: function() {
    let self = this;
    let loadingMore = self.data.loadingMore;

    if (loadingMore || self.data.plAllDone || self.data.page_all == 0) return; //如果还在载入中或者都载入完成或者没有评论,就不继续执行

    let product = this.data.product;

    if (product == 'pingjia') { //如果是评价目录下的滚床单到底事件
      self.setData({ //正在载入
        showLoadingGif: true,
        loadingText: "载入更多资讯 ..."
      })
      self.getPL();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }

})