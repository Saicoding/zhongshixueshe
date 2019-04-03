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
    signPhone:'',//注册手机号默认值
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
    let self = this;
    //获得dialog组件
    this.bindPhoneModel = this.selectComponent("#bindPhoneModel");

    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight
        })
      }
    });
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
    console.log(this.data.eye)
    this.setData({
      eye: this.data.eye == 'text'? 'password' : 'text'
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
 * 输入密码时存储变量
 */
  pwdInput: function (e) {
    this.setData({
      pwd: e.detail.value
    })
  },

  /**
   * 验证码输入
   */
  codeInput:function(){
    
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
          signText: signCurrentTime + 's', //按钮文字变成倒计时对应秒数
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
 * 注册手机输入
 */
  signPhoneInput: function (e) {
    let signPhone = e.detail.value;
    let signSubmit_disabled = null;

    //校验手机号码
    if (signPhone.trim().length == 11 && /^1[3|4|5|6|7|8|9]\d{9}$/.test(signPhone)) {
      signSubmit_disabled = true;
    } else {
      signSubmit_disabled = false;
    }

    this.setData({
      signPhone: e.detail.value,
      signSubmit_disabled: signSubmit_disabled
    })
  },

  /**
   * 注册输入框输入注册
   */
  signCodeInput:function(e){
    let signCode = e.detail.value
    this.setData({
      signCode: signCode
    })
  },
  /**
   * 注册密码框输入
   */
  signPwdinput:function(e){
    let signPwd = e.detail.value;
    this.setData({
      signPwd:signPwd
    })
  },

  /**
   * 注册
   */
  sign:function(){
    let self = this;
    let signCode = self.data.signCode;
    let signIdentifyCode = self.data.signIdentifyCode;
    let signPwd = self.data.signPwd;
    let url = self.data.url;
    let warn;

    if (signPwd == '' || undefined) {
      warn = "密码不能为空";
    } else if (!/^(\w){6,20}$/.test(signPwd)) {
      warn = "只能输入6-20个字母、数字、下划线";
    }
    signPwd = md5.md5(signPwd).toLowerCase();
    if (warn) {
      wx.showToast({
        icon: 'none',
        title: warn,
        duration: 3000
      })
      return;
    }

    if (signCode == signIdentifyCode && signCode != undefined) { //如果相等
      //开始注册
      app.post(API_URL, "action=SaveReg&mobile=" + self.data.signPhone + "&code=" + signCode + "&pwd=" + signPwd, true, true, "注册中").then((res) => {
        let status = self.data.status;
        let signInterval = self.data.signInterval;
        let signSubmit_disabled;

        clearInterval(signInterval);

        let heightData = animate.comeHeight(myAnimation, 450);
        wx.setNavigationBarTitle({
          title:  '登录' ,
        })

        self.setData({
          status: 0,
          heightData: heightData,
          signCurrentTime: 61,
          signSubmit_disabled: false,
          color: '#388ff8',
          signText: '获取验证码',
          signPwd: '',
          phone: self.data.signPhone,
          currentIndex: 0
        })

        wx.showToast({
          title: '注册成功',
          icon: 'none',
          duration: 3000
        })

      })
    } else if (code == undefined) {

      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
        duration: 2000
      });
    } else {

      wx.showToast({
        title: '验证码不正确',
        icon: 'none',
        duration: 2000
      });
    }
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
  * 微信授权登录
  */
  wxLogin: function (e) {
    let self = this;

    wx.showLoading({
      title: '登录中',
    })

    wx.login({
      success: res => {
        let code = res.code;
        console.log("action=getSessionKey&code=" + code)
        app.post(API_URL, "action=getSessionKey&code=" + code, false, false, "").then((res) => {
          let sesstion_key = res.data.data[0].sessionKey;
          let openid = res.data.data[0].openid;

          wx.getUserInfo({
            success: function (res) {
              let wxid = ""; //openId
              let session_key = ""; //

              let encryptedData = res.encryptedData;
              let iv = res.iv;
              let signature = res.signature; //签名
              let nickname = res.userInfo.nickName; //昵称
              let headurl = res.userInfo.avatarUrl; //头像
              let sex = res.userInfo.gender //性别

              //拿到session_key实例化WXBizDataCrypt（）这个函数在下面解密用
              let pc = new WXBizDataCrypt(appId, sesstion_key);
              let data = pc.decryptData(encryptedData, iv);
              let unionid = data.unionId;

              let ifGoPage = self.data.ifGoPage //是否返回上一级菜单
              let url = self.data.url; //需要导航的url

              //监测微信是否有新号
              app.post(API_URL, "action=ChkUnionId&unionid=" + unionid, false, false, "").then(res => {
                //存储本地变量

                if (res.data.status == -2012) { //如果没有绑定
                  wx.hideLoading();
                  self.bindPhoneModel.showDialog();

                  self.setData({
                    unionid: unionid,
                    wxid: openid,
                    nickname: nickname,
                    headurl: headurl,
                    sex: sex
                  })
                } else { //如果已经绑定了
                  let user = res.data.data[0];
                  wx.setStorage({
                    key: 'user',
                    data: user
                  })
                  wx.vibrateShort({})//震动一下
                  wx.navigateBack({
                    success: function () {
                      wx.hideLoading();
                    }
                  }) //先回到登录前的页面
                  if (ifGoPage == 'true') {
                    if (redirect == 'true') {
                      wx.redirectTo({ //是直接跳转
                        url: url,
                      })
                    } else {
                      wx.navigateTo({
                        url: url,
                      })
                    }
                  }
                }
              })
            },
            fail: function (res1) {

            }
          })
        })
      },
      fail: function () {

      }
    })
  },

  /**
   * 绑定手机页面点击绑定
   */
  _confirm: function (e) {
    let phone = e.detail.phone; //手机号
    let code = e.detail.code; //验证码
    let pwd = e.detail.pwd; //密码
    let unionid = this.data.unionid;
    let wxid = this.data.wxid;
    let nickname = this.data.nickname;
    let headurl = this.data.headurl;
    let sex = this.data.sex;
    let ifGoPage = this.data.ifGoPage;
    let redirect = this.data.redirect;
    pwd = md5.md5(pwd).toLowerCase();

    wx.showLoading({
      title: '绑定中',
    })
    app.post(API_URL, "action=Login_wx&unionId=" + unionid + "&wxid=" + wxid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex + "&mobile=" + phone + "&pwd=" + pwd + "&code=" + code, false, false, "").then((res) => {
      let user = res.data.data[0];

      wx.setStorage({
        key: 'user',
        data: user
      })

      wx.vibrateShort({})//震动一下
      wx.navigateBack({
        success: function () {
          wx.hideLoading();
        }
      }) //先回到登录前的页面
      if (ifGoPage == 'true') {
        if (redirect == 'true') {
          wx.redirectTo({ //是直接跳转
            url: url,
          })
        } else {
          wx.navigateTo({
            url: url,
          })
        }
      }
    })
  },

  /**
   * 跳过绑定
   */
  _ignore: function () {
    let unionid = this.data.unionid;
    let wxid = this.data.wxid;
    let nickname = this.data.nickname;
    let headurl = this.data.headurl;
    let ifGoPage = this.data.ifGoPage;
    let redirect = this.data.redirect;
    let sex = this.data.sex;


    app.post(API_URL, "action=Login_wx&unionId=" + unionid + "&wxid=" + wxid + "&nickname=" + nickname + "&headurl=" + headurl + "&sex=" + sex, true, false, "登录中").then((res) => {
      let user = res.data.data[0];
      wx.setStorage({
        key: 'user',
        data: user
      })

      wx.vibrateShort({})//震动一下
      wx.navigateBack({}) //先回到登录前的页面
      if (ifGoPage == 'true') {
        if (redirect == 'true') {
          wx.redirectTo({ //是直接跳转
            url: url,
          })
        } else {
          wx.navigateTo({
            url: url,
          })
        }
      }
    })
  },

  /**
   * 获取用户号码
   */
  getphonenumber: function (e) {
    let self = this;
    wx.showLoading({
      title: '请求中'
    })
    wx.login({
      success: res => {
        let code = res.code;
        app.post(API_URL, "action=getSessionKey&code=" + code, false, false, "").then((res) => {
          let sesstion_key = res.data.data[0].sessionKey;
          let openid = res.data.data[0].openid;
          let encryptedData = e.detail.encryptedData;
          let iv = e.detail.iv;
          //拿到session_key实例化WXBizDataCrypt（）这个函数在下面解密用
          let pc = new WXBizDataCrypt(appId, sesstion_key);
          let data = pc.decryptData(encryptedData, iv);
          if (!data) {
            wx.hideLoading();
            wx.showToast({
              title: '请再点击一次',
              icon: 'none',
              duration: 2000
            })
            return
          }
          let phoneNumber = data.phoneNumber;


          let pwdText = wx.getStorageSync('pwdSave' + phoneNumber);
          let pwd = pwdText; //上次快捷获取电话号码的密码

          self.setData({
            phoneText: phoneNumber,
            phone: phoneNumber,
            isKuaijie: true,
            submit_disabled: false,
            pwd: pwd,
            pwdText: pwdText
          })

          wx.hideLoading();
        })
      },
      fail: res => {
        console.log('shibai')
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})