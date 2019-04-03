// components/errorRecovery/errorRecovery.js
let md5 = require('../../common/MD5.js');
const app = getApp();
let appId = "wx274bc5c5c5ce0434";
const API_URL = 'https://xcx2.chinaplat.com/daoyou/'; //接口地址
let WXBizDataCrypt = require('../../utils/cryptojs/RdWXBizDataCrypt.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    windowHeight: {
      type: Number,
      value: 1333,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    text: '获取验证码',
    currentTime: 61, //倒计时
    disabled: false, //按钮是否禁用
    phone: '' //获取到的手机栏中的值
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: false
      })
    },
    //展示弹框
    showDialog() {
      this.setData({
        isShow: true
      })
    },
    //toogle展示
    toogleDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //阻止事件冒泡
    stopBubbling: function(e) {},

    //点击了空地,让蒙版消失
    tapBlank: function(e) {
      return;
      // this.setData({
      //   isShow: false
      // })
    },

    //关闭
    close: function() {
      this.hideDialog();
    },

    /**
     * 获取验证码input中的值
     */
    codeInput: function(e) {
      this.setData({
        code: e.detail.value
      })
    },

    /**
     * 获取手机栏input中的值
     */
    phoneInput: function(e) {
      this.setData({
        phone: e.detail.value
      })
    },

    /**
     * 获取密码输入框的值
     */
    pwdInput: function(e) {
      this.setData({
        pwd: e.detail.value
      })
    },

    /**
     * /获取验证码按钮
     */
    bindButtonTap: function() {
      let self = this;

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

        app.post(API_URL, "action=CheckMobileUsed&mobile=" + self.data.phone, true, false, "发送中").then((res) => {
          if (res.data.status == -2020) { //微信已绑定手机号
            wx.showToast({
              title: res.data.Message,
              icon: 'none',
              duration: 3000
            })
          } else {
            self.setData({
              disabled: true, //只要点击了按钮就让按钮禁用 （避免正常情况下多次触发定时器事件）
              color: '#ccc',
            })
            wx.showToast({
              title: '短信验证码已发送',
              icon: 'none',
              duration: 2000
            });
           
            let identifyCode = res.data.data[0].code;
           
            self.setData({
              identifyCode: identifyCode
            })

            //设置一分钟的倒计时
            var interval = setInterval(function() {
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
                  color: '#ccc',
                })
              }
            }, 1000);
          }
        })
      };

      //判断 当提示错误信息文字不为空 即手机号输入有问题时提示用户错误信息 并且提示完之后一定要让按钮为可用状态 因为点击按钮时设置了只要点击了按钮就让按钮禁用的情况
      if (warn != null) {
        wx.showToast({
          title: warn,
          icon: 'none',
          duration: 3000
        })

        self.setData({
          disabled: false,
          color: 'white'
        })
        return;
      };
    },

    /**
     * 点击确认按钮
     */
    _confrim: function(e) {
      //先做校验
      let warn = "";
      let phone = this.data.phone; //手机号
      let pwd = this.data.pwd; //密码
      let code = this.data.code; //验证码
      if (phone == '') {
        warn = "手机号码不能为空";
      } else if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
        warn = "手机号格式不正确";
      } else if (pwd == '' || pwd == undefined) {
        warn = "密码不能为空";
      } else if (!/^(\w){6,20}$/.test(pwd)) {
        warn = "只能输入6-20个字母、数字、下划线";
      } else if (code.trim().length != 6) {
        warn = "验证码为6位数字";
      } else {
        this.setData({
          isShow: false
        })
        this.triggerEvent('confirm', {
          phone: phone,
          code: code,
          pwd: pwd
        })
      }

      if (warn != "") {
        wx.showToast({
          title: warn,
          icon: 'none',
          duration: 3000
        })
      }
    },

    /**
 * 获取用户号码
 */
    getphonenumber: function (e) {
      let self = this;
      let encryptedData = e.detail.encryptedData;
      let iv = e.detail.iv;
      wx.showLoading({
        title: '请求中'
      })
      wx.login({
        success: res => {
          let code = res.code;
          app.post(API_URL, "action=getSessionKey&code=" + code, false, false, "").then((res) => {
            let sesstion_key = res.data.data[0].sessionKey;
            let openid = res.data.data[0].openid;
            //拿到session_key实例化WXBizDataCrypt（）这个函数在下面解密用
            let pc = new WXBizDataCrypt(appId, sesstion_key);
            let data = pc.decryptData(encryptedData, iv);
            let phoneNumber = data.phoneNumber;
            if (!phoneNumber) {
              wx.hideLoading();
              wx.showToast({
                title: '请再点击一次',
                icon: 'none',
                duration: 2000
              })
              return
            }

            self.setData({
              phone: phoneNumber,
            })

            wx.hideLoading();
          })
        },
        fail: res => {
          console.log('失败')
        }
      })
    },
    /**
     * 忽略绑定
     */
    _ignore: function() {
      this.setData({
        isShow: false
      })
      this.triggerEvent('ignore');
    }
  },

})