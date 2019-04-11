//app.js
App({
  /** 
   * 自定义post函数，返回Promise
   * +-------------------
   * author: Saicoding<g6666g@163.com>
   * +-------------------
   * @param {String}      url 接口网址
   * @param {arrayObject} data 要传的数组对象 例如: {name: 'Saicoding', age: 32}
   * +-------------------
   * @return {Promise}    promise 返回promise供后续操作
   */
  post: function (url, data, ifShow, ifCanCancel, title, pageUrl, ifGoPage, self) {
    if (ifShow) {
      wx.showLoading({
        title: title,
        mask: !ifCanCancel
      })
    }

    var promise = new Promise((resolve, reject) => {
      //init
      var that = this;
      var postData = data;
      /*
      //自动添加签名字段到postData，makeSign(obj)是一个自定义的生成签名字符串的函数
      postData.signature = that.makeSign(postData);
      */
      //网络请求

      wx.request({
        url: url,
        data: postData,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) { //服务器返回数据

          if (ifShow) { //隐藏载入
            wx.hideLoading();
          }
          let status = res.data.status;
          let message = res.data.message ? res.data.message : res.data.Message;

          if (status == 1) { //请求成功
            resolve(res);
          } else if (status == -2) { //没有权限

            wx.showToast({
              icon: 'none',
              title: message,
              duration: 3000
            })
          } else if (status == -101) { //没有试题

            self.setData({
              isHasShiti: false,
              isLoaded: true,
              message: message
            })

          } else if (status == -2010) { //重复登录
            wx.removeStorageSync('user');
            if (self) { //如果传了这个参数
              self.setData({
                isReLoad: true,
                isShow: false,
                isDaka: true
              })
            }
            wx.navigateTo({
              url: '/pages/login/login?showToast=true&title=登录已失效,请重新登录'
            })


          } else if (status == -404) { //没有对应视频教程
            if (self) { //如果传了这个参数
              wx.showToast({
                icon: 'none',
                title: message,
                duration: 3000
              })
              self.setData({
                hasNoVideo: true,
                first: false
              })
            }

          } else if (status == -201) { //没有权限
            wx.showToast({
              icon: 'none',
              title: '没权权限,将为您推荐学习计划',
              duration: 3000
            })

            setTimeout(function () {
              wx.navigateBack({
                success: function () {
                  wx.navigateTo({
                    url: '/pages/index/xuexijihua/xuexijihua',
                  })
                }
              })
            }, 3000);

          } else if (status == -2012) { //微信未绑定手机号
            resolve(res);
          } else if (status == -2020) { //绑定的手机号已经存在
            resolve(res);
          } else {
            console.log('异常',res);
            wx.showToast({
              icon: 'none',
              title: message,
              duration: 3000
            })
          }
        },
        error: function (e) {
          reject('网络出错');
        }
      })
    });
    return promise;
  },

  onLaunch: function () {
    // wx.clearStorage();
    // wx.clearStorage("user")
  },
  globalData: {

  }
})