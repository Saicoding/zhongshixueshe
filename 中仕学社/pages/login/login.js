// pages/login/login.js
let animate = require('../../common/animate.js');
let myAnimation = animate.easeOutAnimation();
const app = getApp();
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址
let WXBizDataCrypt = require('../../utils/cryptojs/RdWXBizDataCrypt.js');
let md5 = require('../../common/MD5.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: '获取验证码', //按钮文字
    signText:'获取验证码',//注册框的验证码文字
    status: 0, //登录
    currentTime: 61, //倒计时
    signCurrentTime:61,//注册帐号验证码倒计时
    phone: '', //获取到的手机栏中的值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '登录',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 改变登录情况
   */
  changeStatus: function(e) {
    let status = e.currentTarget.dataset.status; //当前的登录状态
    let currentStatus = this.data.status;

    if (currentStatus == status * 1) return; //如果点击的是同一个,就返回

    this.setInfo(status);

    this.setData({
      status: status,
      currentIndex: status
    })
  },

  /**
   * 改变滑块
   */
  changeSwiper: function(e) {
    let status = e.detail.current; //当前的登录状态
    if (e.detail.source == "touch") {
      this.setInfo(status);
      this.setData({
        status: status
      })
    }
  },

  /**
   * 根据类别设置参数
   */
  setInfo: function(status) {
    let heightData
    switch (status * 1) {
      case 0:
        heightData = animate.comeHeight(myAnimation, 450);
        this.setData({
          heightData: heightData
        })
        wx.setNavigationBarTitle({
          title: '登录',
        });
        break;
      case 1:
        heightData = animate.comeHeight(myAnimation, 550);
        this.setData({
          heightData: heightData
        })
        wx.setNavigationBarTitle({
          title: '注册',
        });
        break;
    }
  },

  /**
   * 改变登录方式
   */
  changeLoginType: function(e) {
    let type = e.currentTarget.dataset.type;
    let heightData = animate.comeHeight(myAnimation, 450);
    wx.setNavigationBarTitle({
      title: type == '1' ? '登录' : '手机快捷登录',
    })
    this.setData({
      status: 0,
      currentIndex: 0,
      fast: type == '1' ? false : true,
      heightData: heightData
    })
  },

  /**
   * 隐藏和显示密码
   */
  changeEye: function() {
    this.setData({
      eye: this.data.eye == 'text' ? 'password' : 'text'
    })
  },

  /**
   * 帐号输入框
   */
  phoneInput: function(e) {
    let phone = e.detail.value;
    let submit_disabled = null;

    //校验手机号码
    if (phone.trim().length == 11 && /^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
      submit_disabled = true;
    } else {
      submit_disabled = false;
    }
    console.log(phone)

    this.setData({
      phone: e.detail.value,
      submit_disabled: submit_disabled
    })
  },

  /**
   * 注册手机输入
   */
  signPhoneInput:function(e){
    this.setData({
      signPhone: e.detail.value
    })
  },

  /**
 * 输入密码时存储变量
 */
  pwdInput: function (e) {
    this.setData({
      pwd: e.detail.value
    })
  },

  /**
   * 注册验证码发送
   */
  signCodeButtonTap:function(e){
    let self = this;

    self.setData({
      signDisabled: true, //只要点击了按钮就让按钮禁用 （避免正常情况下多次触发定时器事件）
      color: '#ccc',
    })

    let signPhone = self.data.signPhone;
    console.log(signPhone)
    let signCurrentTime = self.data.signCurrentTime //把手机号跟倒计时值变例成js值

    let warn = null; //warn为当手机号为空或格式不正确时提示用户的文字，默认为空


    if (signPhone == '') {
      warn = "号码不能为空";
    } else if (signPhone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(signPhone)) {
      warn = "手机号格式不正确";
    } else {
      let Sign = md5.md5(signPhone + "ChinaplatSms").toLowerCase();
      //当手机号正确的时候提示用户短信验证码已经发送
      app.post('https://xcx2.chinaplat.com/', "action=SendSms&mobile=" + self.data.signPhone + "&Sign=" + Sign, true, true, "发送中").then((res) => {
        wx.showToast({
          title: '短信验证码已发送',
          icon: 'none',
          duration: 2000
        });
        let signIdentifyCode = res.data.data[0].yzm;
        console.log(signIdentifyCode)
        self.setData({
          signIdentifyCode: signIdentifyCode
        })
      })



      //设置一分钟的倒计时
      var interval = setInterval(function () {
        signCurrentTime--; //每执行一次让倒计时秒数减一
        self.setData({
          text: signCurrentTime + 's', //按钮文字变成倒计时对应秒数
        })
        //如果当秒数小于等于0时 停止计时器 且按钮文字变成重新发送 且按钮变成可用状态 倒计时的秒数也要恢复成默认秒数 即让获取验证码的按钮恢复到初始化状态只改变按钮文字
        if (signCurrentTime <= 0) {
          clearInterval(interval)
          self.setData({
            signText: '重新发送',
            signCurrentTime: 61,
            signDisabled: false,
            signColor: '#f88415'
          })
        }
      }, 1000);

      self.setData({
        signInterval: interval
      })

    };

    //判断 当提示错误信息文字不为空 即手机号输入有问题时提示用户错误信息 并且提示完之后一定要让按钮为可用状态 因为点击按钮时设置了只要点击了按钮就让按钮禁用的情况
    if (warn != null) {
      wx.showToast({
        icon: 'none',
        title: warn,
        duration: 3000
      })

      self.setData({
        disabled: false,
        color: '#f88415'
      })
      return;
    };
  },

  /**
 * 登录验证码发送
 */
  codeButtonTap: function (e) {
    let self = this;

    self.setData({
      disabled: true, //只要点击了按钮就让按钮禁用 （避免正常情况下多次触发定时器事件）
      color: '#ccc',
    })

    let phone = self.data.phone;
    let currentTime = self.data.currentTime //把手机号跟倒计时值变例成js值

    let warn = null; //warn为当手机号为空或格式不正确时提示用户的文字，默认为空


    if (phone == '') {
      warn = "号码不能为空";
    } else if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
      warn = "手机号格式不正确";
    } else {
      let Sign = md5.md5(phone + "ChinaplatSms").toLowerCase();
      //当手机号正确的时候提示用户短信验证码已经发送
      app.post('https://xcx2.chinaplat.com/', "action=SendSms&mobile=" + self.data.phone + "&Sign=" + Sign, true, true, "发送中").then((res) => {
        wx.showToast({
          title: '短信验证码已发送',
          icon: 'none',
          duration: 2000
        });
        let identifyCode = res.data.data[0].yzm;
        console.log(identifyCode)
        self.setData({
          identifyCode: identifyCode
        })
      })



      //设置一分钟的倒计时
      var interval = setInterval(function () {
        currentTime--; //每执行一次让倒计时秒数减一
        self.setData({
          text: currentTime + 's', //按钮文字变成倒计时对应秒数
        })
        //如果当秒数小于等于0时 停止计时器 且按钮文字变成重新发送 且按钮变成可用状态 倒计时的秒数也要恢复成默认秒数 即让获取验证码的按钮恢复到初始化状态只改变按钮文字
        if (currentTime <= 0) {
          clearInterval(interval)
          self.setData({
            text: '重新发送',
            currentTime: 61,
            disabled: false,
            color: '#f88415'
          })
        }
      }, 1000);

      self.setData({
        interval: interval
      })

    };

    //判断 当提示错误信息文字不为空 即手机号输入有问题时提示用户错误信息 并且提示完之后一定要让按钮为可用状态 因为点击按钮时设置了只要点击了按钮就让按钮禁用的情况
    if (warn != null) {
      wx.showToast({
        icon: 'none',
        title: warn,
        duration: 3000
      })

      self.setData({
        disabled: false,
        color: '#f88415'
      })
      return;
    };
  },

  /**
   * 帐号密码登录
   */
  userLogin:function(){
    let self = this;
    let phone = self.data.phone;
    let pwd = self.data.pwd;

    let warn = null; //warn为当手机号为空或格式不正确时提示用户的文字，默认为空

    if (phone == '') {
      warn = "号码不能为空";
    } else if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
      warn = "手机号格式不正确";
    } else if (pwd == '' || pwd == undefined) {
      warn = "密码不能为空";
    } else if (!/^(\w){6,20}$/.test(pwd)) {
      warn = "只能输入6-20个字母、数字、下划线";
    } else {
      //开始登录
      pwd = md5.md5(pwd).toLowerCase();
      wx.showLoading({
        title: '登录中',
      })
      app.post(API_URL, "action=Login&user=" + self.data.phone + "&pwd=" + pwd, false, false, "").then((res) => {
        let user = res.data.data[0];

        wx.setStorage({
          key: 'user',
          data: user,
          success: function () {
            wx.navigateBack({
             success:function(){
               wx.hideLoading();
             }
            })

            if (ifGoPage == "true") {
              wx.navigateTo({
                url: url,
              })
            }
          },
          fail: function () {
            console.log('存储失败')
          }
        })
      })
    }

    if (warn != null) {
      wx.showToast({
        icon: 'none',
        title: warn,
        duration: 3000
      })
      return;
    };
  },

  /**
   * 手机号快捷登录
   */
  phoneFastLogin:function(){

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})