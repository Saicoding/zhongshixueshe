// pages/hasNoErrorShiti/hasNoErrorShiti.js
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址
const app = getApp(); //获取app对象
let buttonClicked = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    folder_object: [], //展开字节的对象,用于判断点击的章之前有多少个字节被展开
    buttonClicked: false,
    isLoaded: false,
    display: false, //动画是否已经完成
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
   * 初始化列表信息
   */
  initKdList: function (kdList) {
    for (let i = 0; i < kdList.length; i++) {
      let kd = kdList[i];
      kd.isFolder = true;
    }
  },

  /**
   * onShow生命周期事件
   */
  onShow: function () {
    let self = this;
    buttonClicked = false;
    let options = this.data.options;

    wx.setNavigationBarTitle({ //设置标题
      title: options.title
    })

    //先执行onload方法，如果没有登录信息就先进入登录界面，登录成功后又执行一次该方法，这时可以获取user值，
    let user = wx.getStorageSync('user');

    let token = user.token?user.token:"";
    let zcode = user.zcode == undefined ? "" : user.zcode;


    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1
    //获取试题栏目中科目分类
    app.post(API_URL, "action=getKemuList&xcx_id=" + xcx_id, false, false, "").then(res => {
      this.setZhangjie(res.data.data); //得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index
      app.post(API_URL, "action=GetKaodianList&typesid=" + options.typesid + "&zcode=" + zcode+"&token="+token,false, false, "", "", true,self).then((res) => {
        console.log(res)
        let kdList = res.data.list; //考点列表
        console.log(kdList)
        self.initKdList(kdList);

        self.setData({
          kdList: kdList,
          isLoaded: true,
          user: user
        })
      })
    })
  },
  /**
   * 
   */
  onReady: function () {
    this.waterWave = this.selectComponent('#waterWave')
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowHeight: windowHeight
        })
      }
    });
  },

  /**
   * 当点击章节时
   */
  onTapZhangjie: function (e) {
    this.waterWave.containerTap(e);
    let self = this;
    let kdList = self.data.kdList;
    let index = e.currentTarget.dataset.itemidx;
    let num = kdList[index].data.length;
    let windowWidth = self.data.windowWidth;
    let isFolder = kdList[index].isFolder; //取得现在是什么状态
    let folder_object = self.data.folder_object //取得展开章节的对象

    let jie_num = 0;

    for (let i = 0; i < folder_object.length; i++) {
      if (folder_object[i].index < index) { //如果在点击选项前面有展开字节
        jie_num += folder_object[i].num //有几个节点就加几个节点
      }
    }

    if (kdList[index].data.length == 0) {
      this.GOkaodianDetail(e);
      return;
    }

    let height = 80 * num;

    let scroll = (index * 100 + jie_num * 80) * (windowWidth / 750);


    if (isFolder) { //展开
      let spreadAnimation = wx.createAnimation({
        duration: 1000,
        delay: 0,
        timingFunction: "ease"
      })

      spreadAnimation.height(height + "rpx", 0).opacity(1).step({})

      kdList[index].isFolder = false;
      kdList[index].height = height;
      kdList[index].spreadData = spreadAnimation.export()
      //添加对象到折叠数组
      folder_object.push({
        index: index,
        num: num
      })

      self.setData({
        kdList: kdList,
        scroll: scroll,
        folder_object: folder_object
      })

    } else { //折叠

      if (index == kdList.length - 1) {
        self.setData({
          display: true
        })
      }
      let foldAnimation = wx.createAnimation({
        duration: 1000,
        delay: 0,
        timingFunction: "ease-out"
      })

      foldAnimation.height(0, height + "rpx").opacity(0).step(function (res) {

      })
      //把折叠对象从折叠对象数组中去除
      for (let i = 0; i < folder_object.length; i++) {
        if (folder_object[i].index == index) {
          folder_object.splice(i, 1)
        }
      }
      kdList[index].height = 0;

      kdList[index].folderData = foldAnimation.export();
      kdList[index].isFolder = true;

      if (index == kdList.length - 1) {
        setTimeout(function () {
          self.setData({
            display: false
          })
        }, 1000)
      }

      self.setData({
        scroll: scroll,
        kdList: kdList,
        folder_object: folder_object
      })

    }
  },

  /**
   * 当改变课题
   */
  bindPickerChange: function (e) {
    let self = this;

    let index = e.detail.value //picker index
    let kaodian_id = self.data.array[e.detail.value].id;
    let user = self.data.user;
    let options = self.data.options;
    let token = user.token;
    let zcode = user.zcode;
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1

    self.setData({
      index: index, //设置是第几个题库
      kaodian_id: kaodian_id, //设置章节的id编号
      isLoaded: false,
    })

    app.post(API_URL, "action=GetKaodianList&typesid=" + options.typesid + "&zcode=" + zcode + "&token=" + token, false, false, "").then((res) => {
      let kdList = res.data.list; //考点列表

      self.initKdList(kdList); //初始化考点列表信息
      //存储本次浏览的题库

      wx.setStorageSync("kaodian_id" + zcode + xcx_id, 
      {
        "id": kaodian_id,
        "index": index
      });
      self.setData({
        kdList: kdList,
        isLoaded: true
      })
    })
  },

  GOkaodianDetail: function (e) {
    this.waterWave.containerTap(e);
    if (buttonClicked) return;
    buttonClicked = true;

    let kdid = e.currentTarget.dataset.kdid;
    let zid = e.currentTarget.dataset.zid;
    let kdList = this.data.kdList
    let title = e.currentTarget.dataset.title

    let url = encodeURIComponent('/pages/tiku/kaodian/kaodianDetail?kdid=' + kdid + "&title=" + title + "&zid=" + zid);
    let url1 = '/pages/tiku/kaodian/kaodianDetail?kdid=' + kdid + "&title=" + title + "&zid=" + zid;

    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function (res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd
        wx.navigateTo({
          url: url1,
        })
      },
      fail: function (res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoPage=true",
        })
      }
    })
  },

  /**
   * 得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index
   */
  setZhangjie: function (res) {
    let self = this;
    let kaodian_id = 0;
    let index = 0;
    let user = wx.getStorageSync('user');
    let username = user.username;
    let zcode = user.zcode?user.zcode:"";
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1
    let kaodian = wx.getStorageSync("kaodian_id" + zcode + xcx_id);
    if (kaodian == "") {
      kaodian_id = res[0].id;
      index = 0;
    } else {
      kaodian_id = kaodian.id;
      index = kaodian.index;
    }

    this.setData({
      array: res,
      kaodian_id: kaodian_id,
      index: index
    })
  },
})