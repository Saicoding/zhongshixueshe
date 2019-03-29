// pages/learn/learn.js
const app = getApp()
var API_URL = "https://xcx2.chinaplat.com/daoyou/";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: "0",
    videoList: "",
    loaded: false,
    page: "0",
    diqus: [
      ['安徽', '北京', '重庆', '福建'],
      ['河南', '河北', '湖北', '湖南', '海南', '黑龙江'],
      ['青海', '山东', '陕西', '四川', '山西', '上海', '深圳'],
      ['广东', '甘肃', '广西', '贵州'],
      ['江西', '辽宁', '江苏', '吉林', '宁夏', '内蒙古'],
      ['浙江', ' 天津', '新疆', '云南', '西藏']
    ],
    diqu: "北京",
    daoyouci: false,
    opacity: 1, //banner透明度
    loadedList: [
      {
        loaded:false,
        list:null
      },
      {
        loaded: false,
        list: null
      },
      {
        loaded: false,
        list: null
      }
    ]//已载入数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
    let user = wx.getStorageSync('user');
    let zcode = user.zcode ? user.zcode : '';
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        //最上面标题栏不同机型的高度不一样(单位PX)
        let statusBarHeight = res.statusBarHeight * (750 / windowWidth);
        let jiaonang = wx.getMenuButtonBoundingClientRect(); //胶囊位置及尺寸

        let fixedTop = (jiaonang.top + jiaonang.height) * (750 / windowWidth); //定位高度 单位rpx

        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight,
          statusBarHeight: statusBarHeight,
          jiaonang: jiaonang,
          fixedTop: fixedTop
        })
      }
    });
    //获取顶部图
    app.post(API_URL, "action=getCourseAD", false, false, "", "", "", self).then(res => {
      let barUrls = res.data.data[0].pic.split(",");
      self.setData({
        barUrls: barUrls
      });
      if (self.data.barUrls.length > 1) {
        self.bindPhoneModel = self.selectComponent("#bindPhoneModel");
      }
    });

    wx.getStorage({
      key: 'lastkesub' + zcode,
      success: function(res) {
        let lastKe = res.data.options;
          self.setData({
            types: lastKe.types,
            current: parseInt(lastKe.types)
          })
        if (lastKe.types != '3'){
          self.getCourse(lastKe.types)
        }


      },
      fail: function(res) {
        self.getCourse('0')
      }
    })

  },
  //获取课程列表
  getCourse: function(index) {
    let self = this;
    let loadedList = self.data.loadedList; //已载入列表数组

    if (loadedList[parseInt(index)].list) { //说明已经载入过

    } else { //如果没有载入
      let types = "";
      switch (parseInt(index)) {
        case 0 :
          types = '笔试';
          break;
        case 1:
          types = '面试';
          break;
        case 2:
          types = '导考套餐';
          break;
      }

      app.post(API_URL, "action=getCourseList&types=" + types, false, false, "", "", "", self).then(res => {
        let newcourse = res.data.data[0].list;
        loadedList[parseInt(index)].list = newcourse;
        loadedList[parseInt(index)].loaded = true;//该章节载入结束

        self.setData({
          loadedList: loadedList
        });
      });
    }

  },
  watch: function(e) {
    var kc_id = e.currentTarget.dataset.kc_id;
    var renshu = e.currentTarget.dataset.renshu;
    let index = e.currentTarget.dataset.index;
    let types = this.data.types;
    let title = e.currentTarget.dataset.title;

    wx.navigateTo({
      url: 'play?kc_id=' + kc_id + '&renshu=' + renshu + '&types=' + types + "&index=" + index + '&title=' + title,
    })
  },
  //切换菜单
  getList: function(e) {
    var val = e.currentTarget.dataset.val;
      this.setData({
        types: val,
        nomore: false,
        current: parseInt(val)
      })

    if (val !='3'){
      this.getCourse(val);
    }
  },

  //生命周期事件
  onShow:function(){
    this.setData({
      random: new Date().toLocaleDateString()
    })
  },

  //改变编号
  changeSwiper:function(e){
    let current = e.detail.current;
    let source = e.detail.source;
    this.setData({
      types: current.toString(), 
      nomore:false
    })
    if (source == 'touch'){//手动滑动
      if(current!=3){
        this.getCourse(current);
      }
    }
  },

  //点击导游词
  diqu: function(e) {
    var val = e.currentTarget.dataset.diqu;
    wx.navigateTo({
      url: 'daoyouci_list?val=' + val,
    })
  },

  //滚动条滚动到底部
  scrolltolower:function(e){
    this.setData({
      nomore:true
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})