// pages/tiku/zuoti/index.js
const API_URL = 'https://xcx2.chinaplat.com/main/'; //接口地址
let common = require('../../../common/shiti.js');
let animate = require('../../../common/animate.js')
let share = require('../../../common/share.js')
let post = require('../../../common/post.js');
let isFold = true; //默认都是折叠的

const util = require('../../../utils/util.js')
//把winHeight设为常量，不要放在data里（一般来说不用于渲染的数据都不能放在data里）
const winHeight = wx.getSystemInfoSync().windowHeight
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //书的编号,默认为0
    rightNum: 0, //正确答案数
    wrongNum: 0, //错误答案数

    isLoaded: false, //是否已经载入完毕,用于控制过场动画
    cl_question_hidden: false, //材料题是否隐藏题目
    checked: false, //选项框是否被选择
    doneAnswerArray: [], //已做答案数组
    markAnswerItems: [], //设置一个空数组

    isModelReal: false, //是不是真题或者押题
    isSubmit: false, //是否已提交答卷
    circular: true, //默认slwiper可以循环滚动
    myFavorite: 0, //默认收藏按钮是0
    isHasShiti: true, //是否有试题
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({//先存储起来,触发权限问题时带过去区分页面
      options: options
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
    //获得dialog组件
    this.markAnswer = this.selectComponent("#markAnswer");
    this.errorRecovery = this.selectComponent("#errorRecovery");
    this.clJiexi = this.selectComponent("#clJiexi");
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
 * 切换问题的动画
 */
  _toogleAnimation: function () {
    let self = this;

    let px = self.data.px; //当前px
    let str = "#q" + px; //当前问题组件id
    let question = self.selectComponent(str); //当前问题组件

    let shitiArray = self.data.shitiArray; //当前试题数组
    let shiti = shitiArray[px - 1]; //当前试题
    let height = self.data.height;

    if (!shiti.isAnswer && !shiti.confirm) return;

    if (isFold) {
      question.setData({
        style2: "positon: fixed; left: 20rpx;height:" + height + "rpx"
      })
      // animate.questionSpreadAnimation(90, height, question);
      animate.blockSpreadAnimation(90, height, question);
      isFold = false;
    } else {
      question.setData({
        style2: "positon: fixed; left: 20rpx;height:90rpx"
      })
      // animate.questionFoldAnimation(height, 90, question);
      animate.blockFoldAnimation(height, 90, question);
      isFold = true;
    }
  },

  /**
   * slider改变事件
   */
  sliderChange: function (e) {
    let source = e.detail.source;
    if (source != "touch") return;

    let self = this;
    let lastSliderIndex = self.data.lastSliderIndex;
    let current = e.detail.current;

    let myFavorite = 0;
    let pageArray = self.data.pageArray; //当前所有已经渲染的页面数组
    let pageall = self.data.pageall; //当前题库错题页总页数

    let z_id = self.data.z_id;

    let user = self.data.user;
    let options = self.data.options;
    let zcode = user.zcode;
    let token = user.token;

    let px = self.data.px;
    let direction = "";
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let circular = self.data.circular;

    //判断滑动方向
    if ((lastSliderIndex == 0 && current == 1) || (lastSliderIndex == 1 && current == 2) || (lastSliderIndex == 2 && current == 0)) { //左滑
      direction = "左滑";
    } else {
      direction = "右滑";
    }

    if (direction == "左滑") {
      px++;
      if (px % 10 >= 6) { //滑动到号大于7，这时判断有没有下一个page
        let nextPage = ((px - 1) - (px - 1) % 10) / 10 + 2;

        if (pageArray.indexOf(nextPage) == -1 && nextPage <= pageall) { //已渲染数组不包含下一页面

          pageArray.push(nextPage); //请求后就添加到已渲染数组
          self.setData({
            pageArray: pageArray,
            isLoading: true //设置正在载入中
          })

          app.post(API_URL, "action=getKeMuTestshow&zcode=" + zcode + "&z_id=" + options.f_id + "&token=" + token + "&page=" + nextPage, false, false, "", true, self).then((res) => {

            let newWrongShitiArray = res.data.shiti;

            common.initNewWrongArrayDoneAnswer(newWrongShitiArray, nextPage - 1); //将试题的所有done_daan置空

            for (let i = 0; i < newWrongShitiArray.length; i++) {
              shitiArray[i + (nextPage - 1) * 10] = newWrongShitiArray[i];
            }

            self.setData({
              shitiArray: shitiArray,
              isLoading: false //设置已经载入完毕
            })

            wx.hideLoading();
          })
        }
      }
    } else {
      px--;
      if (px % 10 <= 4) { //滑动到小于等于3时，这时判断有没有上一个page

        let prePage = ((px - 1) - (px - 1) % 10) / 10;

        if (pageArray.indexOf(prePage) == -1 && prePage >= 1) { //已渲染数组不包含下一页面
          pageArray.push(prePage); //请求后就添加到已渲染数组
          self.setData({
            pageArray: pageArray,
          })

          app.post(API_URL, "action=getKeMuTestshow&zcode=" + zcode + "&z_id=" + options.f_id + "&token=" + token + "&page=" + prePage, false, false, "", true, self).then((res) => {

            let newWrongShitiArray = res.data.shiti;

            common.initNewWrongArrayDoneAnswer(newWrongShitiArray, prePage - 1); //将试题的所有done_daan置空

            for (let i = 0; i < newWrongShitiArray.length; i++) {
              shitiArray[i + (prePage - 1) * 10] = newWrongShitiArray[i];
            }

            self.setData({
              shitiArray: shitiArray,
            })

            wx.hideLoading();
          })
        }
      }
    }

    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题

    myFavorite = midShiti.favorite;

    //每次滑动结束后初始化前一题和后一题
    if (direction == "左滑") {
      if (px < shitiArray.length) { //如果还有下一题
        nextShiti = shitiArray[px];
        common.initShiti(nextShiti, self); //初始化试题对象

        //先处理是否是已经回答的题    
        common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
      }

      if (px + 1 < shitiArray.length) {//如果有下下题
        if (shitiArray[px + 1].id == undefined) {
          wx.showToast({
            title: '载入试题中...',
            icon: 'none',
            mask: true
          })
        }
      }
      preShiti = shitiArray[px - 2]; //肯定会有上一题
    } else { //右滑
      if (px > 1) { //如果还有上一题
        preShiti = shitiArray[px - 2];
        common.initShiti(preShiti, self); //初始化试题对象
        common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      }
      if (px > 2) {//如果有上上题
        if (shitiArray[px - 3].id == undefined) {
          wx.showToast({
            title: '载入试题中...',
            icon: 'none',
            mask: true
          })
        }
      }
      nextShiti = shitiArray[px];
    }

    common.storeLastShiti(px, self); //存储最后一题的状态


    //滑动结束后,更新滑动试题数组
    let sliderShitiArray = [];

    if (px != 1 && px != shitiArray.length) {
      if (current == 1) {
        if (nextShiti != undefined) sliderShitiArray[2] = nextShiti;
        sliderShitiArray[1] = midShiti;
        if (preShiti != undefined) sliderShitiArray[0] = preShiti;
      } else if (current == 2) {
        if (nextShiti != undefined) sliderShitiArray[0] = nextShiti;
        sliderShitiArray[2] = midShiti;
        if (preShiti != undefined) sliderShitiArray[1] = preShiti;

      } else {
        if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
        sliderShitiArray[0] = midShiti;
        if (preShiti != undefined) sliderShitiArray[2] = preShiti;
      }
    } else if (px == 1) {
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
      current = 0;
      self.setData({
        myCurrent: 0
      })
    } else if (px == shitiArray.length) {
      sliderShitiArray[0] = preShiti;
      sliderShitiArray[1] = midShiti;
      current = 1;
      self.setData({
        myCurrent: 1
      })
    }


    circular = px == 1 || px == shitiArray.length ? false : true //如果滑动后编号是1,或者最后一个就禁止循环滑动

    self.setData({ //每滑动一下,更新试题
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      circular: circular,
      lastSliderIndex: current,
      xiaotiCurrent: 0, //没滑动一道题都将材料题小题的滑动框index置为0
      myFavorite: myFavorite,
      px: px,
      checked: false
    })

    //如果是材料题就判断是否动画
    if (midShiti.TX == 99) {
      let str = "#q" + px;
      share.ifOverHeight(self, midShiti.xiaoti[0], sliderShitiArray)
      let questionStr = midShiti.question;//问题的str
      let height = common.getQuestionHeight(questionStr);//根据问题长度，计算应该多高显示

      height = height >= 400 ? 400 : height;

      let question = self.selectComponent(str);

      animate.blockSpreadAnimation(90, height, question);

      question.setData({//每切换到材料题就把占位框复位
        style2: "positon: fixed; left: 20rpx;height:" + height + "rpx", //问题框"   
      })

      self.setData({
        height: height
      })
    }

  },



  /**
   * 小题滑块改动时
   */
  xtSliderChange: function (e) {
    if (e.detail.source != 'touch') return;//如果不是手动滑动就返回
    let self = this;
    let lastSliderIndex = self.data.lastSliderIndex;
    let sliderShitiArray = self.data.sliderShitiArray;
    let sliderShiti = sliderShitiArray[lastSliderIndex];//当前材料题
    let xtCurrent = e.detail.current;
    let xt = sliderShiti.xiaoti[xtCurrent];//当前小题

    share.ifOverHeight(self, xt, sliderShitiArray)

    this.setData({
      xtCurrent: xtCurrent
    })
  },

  /**
 * 材料题点击查看解析
 */
  viewJiexi: function (e) {
    let jiexi = e.currentTarget.dataset.jiexi;
    let answer = e.currentTarget.dataset.answer;

    this.setData({
      cl_jiexi: jiexi,
      cl_answer: answer
    })

    this.clJiexi.showDialog();
  },

  /**
    * 材料题作答
    */
  _CLAnswerSelect: function (e) {
    let self = this;
    let px = e.currentTarget.dataset.px;

    let shitiPX = self.data.px;//试题的px
    let shitiArray = self.data.shitiArray
    let shiti = shitiArray[shitiPX - 1]; //本试题对象
    let done_daan = "";
    let xiaoti = shiti.xiaoti;
    let user = self.data.user;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex//当前滑动编号
    let currentShiti = sliderShitiArray[current];
    let currentXiaoti = currentShiti.xiaoti

    if (shiti.isAnswer) return;

    shiti.flag = 0;

    for (let i = 0; i < xiaoti.length; i++) {
      if (xiaoti[i].flag == 1) shiti.flag = 1;
      if (px - 1 == i) { //找到对应的小题
        if (xiaoti[i].isAnswer) return;
        done_daan = xiaoti[i].TX == 1 || xiaoti[i].TX == 3 ? e.detail.done_daan : e.detail.done_daan.sort(); //根据单选还是多选得到done_daan,多选需要排序
        if (xiaoti[i].TX == 2 && xiaoti[i].selectAnswer == undefined) {
          wx.showToast({
            title: '还没有作答 !',
            icon: 'none',
          })
          return;
        }
        common.changeSelectStatus(done_daan, xiaoti[i], self); //改变试题状态
        common.changeSelectStatus(done_daan, currentXiaoti[i], self); //改变试题状态
        if (xiaoti[i].flag == 1) shiti.flag = 1; //如果小题错一个,整个材料题就是错的

        shiti.doneAnswer.push({
          'px': px,
          'done_daan': done_daan
        }); //向本材料题的已答数组中添加已答题目px 和 答案信息

        if (shiti.doneAnswer.length == xiaoti.length) { //说明材料题已经全部作答
          shiti.done_daan = shiti.doneAnswer; //设置该试题已作答的答案数组
          shiti.isAnswer = true;

          common.changeNum(shiti.flag, self); //更新答题的正确和错误数量
          common.postAnswerToServer(user.Login_random, user.zcode, shiti.id, shiti.flag, shiti.done_daan, app, API_URL); //向服务器提交答题结
          common.storeAnswerStatus(shiti, self); //存储答题状态
          common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self) //更新答题板状态
          common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
        }
      }
    }
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
  },

  /**
   * 材料题多选点击一个选项
   */
  _CLCheckVal: function (e) {
    let self = this;
    let xtpx = e.currentTarget.dataset.px;
    let px = this.data.px;
    let done_daan = e.detail.done_daan.sort();
    let shitiArray = self.data.shitiArray;

    let shiti = shitiArray[px - 1]; //本试题对象

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex//当前滑动编号
    let currentShiti = sliderShitiArray[current];
    let currentXiaoti = currentShiti.xiaoti

    let xiaoti = shiti.xiaoti; //材料题下面的小题

    for (let i = 0; i < xiaoti.length; i++) {
      if (xtpx - 1 == i) { //找到对应小题
        if (xiaoti[i].isAnswer) return;
        //初始化多选的checked值
        common.initMultiSelectChecked(currentXiaoti[i]);
        //遍历这个答案，根据答案设置shiti的checked属性
        done_daan = common.changeShitiChecked(done_daan, currentXiaoti[i]);

        common.changeMultiShiti(done_daan, xiaoti[i]);
        common.changeMultiShiti(done_daan, currentXiaoti[i]);
      }
    }
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
  },



  /**
   * 材料题点击开始作答按钮
   */
  CLZuoti: function (e) {
    let self = this;

    let str = "#q" + self.data.px;
    let question = self.selectComponent(str);

    let px = self.data.px;
    let lastSliderIndex = self.data.lastSliderIndex;
    let shitiArray = self.data.shitiArray;
    let sliderShitiArray = self.data.sliderShitiArray;
    let shiti = shitiArray[px - 1];
    let height = self.data.height;

    let sliderShiti = sliderShitiArray[lastSliderIndex];
    shiti.confirm = true;
    sliderShiti.confirm = true;

    question.setData({
      style2: "positon: fixed; left: 20rpx;height:90rpx", //问题框"   
    })

    animate.blockFoldAnimation(height, 90, question);
    isFold = true;

    share.ifOverHeight(self, sliderShiti.xiaoti[0], sliderShitiArray);

    self.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    })
  },


  /**
   * 作答
   */
  _answerSelect: function (e) {
    let self = this;
    let px = self.data.px;
    let done_daan = "";
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex //当前滑动编号
    let currentShiti = sliderShitiArray[current];
    let user = self.data.user;
    let typesid = self.data.options.types;

    let shiti = shitiArray[px - 1]; //本试题对象

    done_daan = shiti.TX == 1 || shiti.TX == 3 ? e.detail.done_daan : shiti.selectAnswer; //根据单选还是多选得到done_daan

    if (shiti.TX == 2 && shiti.selectAnswer == undefined) {
      wx.showToast({
        title: '还没有作答 !',
        icon: 'none',
      })
      return;
    }

    if (shiti.isAnswer) return;

    common.changeSelectStatus(done_daan, shiti, false); //改变试题状态
    common.changeSelectStatus(done_daan, currentShiti, false); //改变试题状态

    this.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    })

    common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

    common.postAnswerToServer(user.token,user.zcode,typesid,shiti.beizhu, shiti.id, shiti.flag, shiti.done_daan, app, API_URL); //向服务器提交答题结
    common.storeAnswerStatus(shiti, self); //存储答题状态

    common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self) //更新答题板状态

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完

  },

  /**
   * 多选题选一个选项
   */
  _checkVal: function (e) {
    let self = this;
    let done_daan = e.detail.done_daan.sort();
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex //当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1];
    //初始化多选的checked值
    // common.initMultiSelectChecked(shiti);
    common.initMultiSelectChecked(currentShiti);
    //遍历这个答案，根据答案设置shiti的checked属性

    done_daan = common.changeShitiChecked(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, shiti);
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
  },

  /**
   * 刚载入时的动画
   */
  onShow: function (e) {
    let self = this;
    let options = self.data.options;
    let colors = share.getColors("qh"); //配色方案
    let category  = "qh";

    let user = wx.getStorageSync('user');
    let zcode = user.zcode?user.zcode:"";
    let token = user.token == undefined ? "" : user.token;
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1

    console.log(options)
    console.log(wx.getStorageSync('kaoshi'))
    console.log('lastShuati' + zcode + xcx_id)

    wx.setStorage({
      key: 'lastShuati' + zcode + xcx_id,
      data: options
    })

    share.setColor("qh", false, false); //设置tabbar颜色

    wx.setNavigationBarTitle({
      title: options.title
    }) //设置标题

    let page = 1; //默认是第一页
    let pageArray = []; //页面缓存数组

    let circular = false;
    let myFavorite = 0;

    //根据章是否有字节来定制最后一次访问的key
    let last_view_key = 'last_view' + options.f_id + user.zcode;

    let last_view = wx.getStorageSync(last_view_key); //得到最后一次的题目
    let px = last_view.px; //最后一次浏览的题的编号

    if (px == undefined) {
      px = 1 //如果没有这个px说明这个章节首次访问
      circular: false
    } else {
      page = ((px - 1) - (px - 1) % 10) / 10 + 1; //当前页
    }

    app.post(API_URL, "action=getKeMuTestshow&zcode=" + zcode + "&z_id=" + options.f_id + "&token=" + token + "&page=" + page, false, false, "", "", false, self).then((res) => {
      console.log(res)
      let shitiArray = res.data.shiti;
      let all_nums = res.data.all_nums;
      let pageall = res.data.pageall;
      let prepage = page - 1; //上一页
      let nextPage = page + 1; //下一页
      pageArray.push(page);

      common.initNewWrongArrayDoneAnswer(shitiArray, page - 1); //将试题的所有done_daan置空
      shitiArray = common.initShitiArray(shitiArray, all_nums, page);
      common.initMarkAnswer(all_nums, self); //初始化答题板数组

      if (px % 10 >= 1 && px % 10 <= 4 && prepage >= 1) { //px为前半部分并且有上一页时，请求上一页
        app.post(API_URL, "action=getKeMuTestshow&zcode=" + zcode + "&z_id=" + options.f_id + "&token=" + token + "&page="  + prepage, false, false, "", "", false, self).then((res) => {
          pageArray.push(prepage);

          self.setData({
            pageArray: pageArray
          })

          let newWrongShitiArray = res.data.shiti;
          common.initNewWrongArrayDoneAnswer(newWrongShitiArray, prepage - 1); //将试题的所有done_daan置空
          for (let i = 0; i < newWrongShitiArray.length; i++) { //更新shitiArray
            shitiArray[i + (prepage - 1) * 10] = newWrongShitiArray[i];
          }
          post.zuotiOnload(options, px, circular, myFavorite, shitiArray, user, page, colors, category, all_nums, pageall, self) //对数据进行处理和初始化
        })
      } else if ((px % 10 >= 6 || px % 10 == 0) && nextPage <= pageall) {
        app.post(API_URL, "action=getKeMuTestshow&zcode=" + zcode + "&z_id=" + options.f_id + "&token=" + token + "&page="  + nextPage, false, false, "", "", false, self).then((res) => {
          pageArray.push(nextPage);

          self.setData({
            pageArray: pageArray
          })

          let newWrongShitiArray = res.data.shiti;
          common.initNewWrongArrayDoneAnswer(newWrongShitiArray, nextPage - 1); //将试题的所有done_daan置空
          for (let i = 0; i < newWrongShitiArray.length; i++) { //更新shitiArray
            shitiArray[i + (nextPage - 1) * 10] = newWrongShitiArray[i];
          }
          post.zuotiOnload(options, px, circular, myFavorite, shitiArray, user, page, colors, category, all_nums, pageall, self) //对数据进
        })
      } else {
        self.setData({
          pageArray: pageArray
        })
        post.zuotiOnload(options, px, circular, myFavorite, shitiArray, user, page, colors, category, all_nums, pageall, self) //对数据进
      }
    })
  },

  /**
 * 重新开始练习
 */
  _restart: function () {
    let self = this;
    self._hideMarkAnswer();
    common.lianxiRestart(self); //重新开始作答
  },

  /**
   * 切换纠错面板
   */

  _toggleErrorRecovery: function (e) {
    this.markAnswer.hideDialog();
    this.errorRecovery.toogleDialog();
  },

  /**
   * 切换答题板
   */
  _toogleMarkAnswer: function () {
    this.errorRecovery.hideDialog();
    this.markAnswer.toogleDialog();
  },
  /**
   * 显示答题板
   */
  showMarkAnswer: function () {
    this.markAnswer.showDialog();
  },
  /**
   * 隐藏答题板
   */
  _hideMarkAnswer: function () {
    this.markAnswer.hideDialog();
  },
  /**
   * 切换是否收藏该试题
   */
  _toogleMark: function (e) {
    let self = this;
    let user = self.data.user;

    let token = user.token;
    let zcode = user.zcode;
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];

    shiti.favorite = shiti.favorite == 0 ? 1 : 0;

    this.setData({
      myFavorite: shiti.favorite,
      shitiArray: shitiArray
    })
    app.post(API_URL, "action=FavoriteShiti&t_id=" + shiti.id + "&token=" + token + "&zcode=" + zcode + "&beizhu=" + shiti.beizhu, false).then((res) => {
      
    })
  },

  /**
   * 得到新一组试题
   */
  getNewShiti: function (zcode, z_id, token, page, midShiti, preShiti, nextShiti, px, current, circular) {
    let self = this;
    let shitiArray = self.data.shitiArray;

    app.post(API_URL, "action=getKeMuTestshow&zcode=" + zcode + "&z_id=" + z_id + "&token=" + token + "&page=" + page, false, false, "", true, self).then((res) => {

      let newWrongShitiArray = res.data.shiti;

      common.initNewWrongArrayDoneAnswer(newWrongShitiArray, page - 1); //将试题的所有done_daan置空

      for (let i = 0; i < newWrongShitiArray.length; i++) {
        shitiArray[i + (page - 1) * 10] = newWrongShitiArray[i];
      }

      let allLoaded = self.data.allLoaded;

      if (allLoaded.length == 1) { //说明已经载入完毕一个
        midShiti = shitiArray[px - 1];
        common.processTapLianxiAnswer(midShiti, preShiti, nextShiti, px, current, circular, shitiArray, self);
        allLoaded = [];
      } else {
        allLoaded.push(1);
      }

      self.setData({
        allLoaded: allLoaded,
        shitiArray: shitiArray
      })
    })
  },

  /**
   * 答题板点击编号事件,设置当前题号为点击的题号
   */
  _tapEvent: function (e) {
    let self = this;
    let px = e.detail.px;

    let shitiArray = self.data.shitiArray;

    let z_id = self.data.z_id;
    let options = self.data.options;

    let user = self.data.user;
    let token = user.token;
    let zcode = user.zcode;

    let pageArray = self.data.pageArray; //当前所有已经渲染的页面数组
    let pageall = self.data.pageall; //当前题库错题页总页数

    let current = self.data.lastSliderIndex; //当前swiper的index
    let circular = self.data.circular;

    //得到swiper数组
    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题

    let page = ((px - 1) - (px - 1) % 10) / 10 + 1; //当前页

    let prepage = page - 1; //上一页
    let nextPage = page + 1; //下一页

    self._hideMarkAnswer();

    //如果渲染数组不包含当前页面
    if (pageArray.indexOf(page) == -1) {
      pageArray.push(page);

      self.setData({
        allLoaded: [], //设置正在载入的page个数 0 1 2 ，当个数为2时说明已经载入完毕
        isLoaded: false,
      })

      if (px % 10 >= 1 && px % 10 <= 4 && prepage >= 1 && pageArray.indexOf(prepage) == -1) { //如果是页码的第一题,并且有上一页,并且不在已渲染数组中
        pageArray.push(prepage);
        self.setData({
          pageArray: pageArray
        })
        self.getNewShiti(zcode,options.f_id,token,page, midShiti, preShiti, nextShiti, px, current, circular);
        self.getNewShiti(zcode,options.f_id,token,prepage, midShiti, preShiti, nextShiti, px, current, circular);

      } else if ((px % 10 >= 6 || px % 10 == 0) && nextPage <= pageall && pageArray.indexOf(nextPage) == -1) { //如果是页码的最后一题,并且有下一页，并且不在已渲染数组中
        pageArray.push(nextPage);
        self.setData({
          pageArray: pageArray
        })

        self.getNewShiti(zcode,options.f_id,token, page, midShiti, preShiti, nextShiti, px, current, circular);
        self.getNewShiti(zcode, options.f_id, token,  nextPage, midShiti, preShiti, nextShiti, px, current, circular);

      } else {
        self.setData({
          pageArray: pageArray,
          allLoaded: [1], //设置正在载入的page个数 0 1 2,只请求一个页面，这时把allLoaded长度直接设为1
        })
        self.getNewShiti(zcode,options.f_id,token, page, midShiti, preShiti, nextShiti, px, current, circular);
      }

    } else if (px % 10 >= 1 && px % 10 <= 4 && prepage >= 1 && pageArray.indexOf(prepage) == -1) { //如果本页已经渲染，但上一页没有渲染
      pageArray.push(prepage);
      self.setData({
        isLoaded: false,
        pageArray: pageArray,
        allLoaded: [1], //设置正在载入的page个数 0 1 2,只请求一个页面，这时把allLoaded长度直接设为1
      })
      self.getNewShiti(zcode,options.f_id,token, prepage, midShiti, preShiti, nextShiti, px, current, circular);
    } else if ((px % 10 >= 6 || px % 10 == 0) && nextPage <= pageall && pageArray.indexOf(nextPage) == -1) { ////如果本页已经渲染，但上一页没有渲染
      pageArray.push(nextPage);
      self.setData({
        isLoaded: false,
        pageArray: pageArray,
        allLoaded: [1], //设置正在载入的page个数 0 1 2,只请求一个页面，这时把allLoaded长度直接设为1
      })
      self.getNewShiti(zcode, options.f_id, token,  nextPage, midShiti, preShiti, nextShiti, px, current, circular);
    } else {
      common.processTapLianxiAnswer(midShiti, preShiti, nextShiti, px, current, circular, shitiArray, self);
    }

  },
  /**
   * 纠错提交后
   */
  _submit: function (e) {
    let self = this;

    let user = wx.getStorageSync('user');
    let token = user.token;
    let zcode = user.zcode;
    let reason = e.detail.reason;
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];
    let stid = shiti.id

    app.post(API_URL, "action=jiuCuo&token=" + token + "&zcode=" + zcode + "&tid=" + stid + "&content=" + reason, true, false, "提交中").then((res) => {
      self.errorRecovery.hideDialog();
      wx.showToast({
        title: '提交成功',
        duration:3000
      })
    })
  },

  /**
   * 当摧毁页面时
   */
  onUnload:function(){
    let options = this.data.options;
    let user = wx.getStorageSync('user');
    let zcode = user.zcode ? user.zcode : '';
    let pages = getCurrentPages();
    let prePage = pages[pages.length - 2];
    let currentIndex = options.currentIndex;
    let zhangIdx = options.zhangIdx;
    let jieIdx = options.jieIdx;
    let zhangjieLoadedStr = '' + currentIndex;//当前题库标识
    let doneAnswerArray = this.data.doneAnswerArray; //所有已答数组
    let tiku = prePage.data.tiku; //上个页面的题库对象
    let xcx_id = wx.getStorageSync('kaoshi').tid ? wx.getStorageSync('kaoshi').tid : 1

    let donenum = this.data.options.donenum;//进入页面时的已做题数
    if (donenum == doneAnswerArray.length){
      console.log('没有做题')
      return
    }

    //找到对应的题库
    let mytikuArray = tiku[zhangjieLoadedStr];
    for (let i = 0; i < mytikuArray.length; i++) {
      let mytiku = mytikuArray[i];

      if (mytiku.zhangjie_child.length == 0){
        if (mytiku.id == options.f_id){
          mytiku.donenum = doneAnswerArray.length;
          mytiku.rightrate = mytiku.donenum == 0 ? '0.00' : ((mytiku.rightNum / mytiku.donenum) * 100).toFixed(2);
          mytiku.rate = (mytiku.donenum / parseInt(mytiku.nums) * 100).toFixed(2);
          mytiku.rateWidth = 490 * mytiku.donenum / parseInt(mytiku.nums);
          prePage.setData({
            zhangjies: mytikuArray,
            tiku: tiku
          })
          break;
        }
       
      }else{
        for (let j = 0; j < mytiku.zhangjie_child.length; j++) {
          let jie = mytiku.zhangjie_child[j];
          let doneArray = wx.getStorageSync("shiti" + options.f_id + zcode);

          if (jie.id == options.f_id) {//找到对应章节
            mytiku.donenum += doneAnswerArray.length - jie.donenum;//提前计算，避免jie.donenum更新
            jie.donenum = doneArray.length;
            jie.rateWidth = 490 * jie.donenum / parseInt(jie.nums);
            jie.rightrate = jie.donenum == 0 ? '0.00' : ((jie.rightNum / jie.donenum) * 100).toFixed(2);
            if (currentIndex == 4) {
              jie.rightrate = 0;
            }

            mytiku.rightrate = mytiku.donenum == 0 ? '0.00' : ((mytiku.rightNum / mytiku.donenum) * 100).toFixed(2);
            mytiku.rate = (mytiku.donenum / parseInt(mytiku.nums) * 100).toFixed(2);
            mytiku.rateWidth = 490 * mytiku.donenum / parseInt(mytiku.nums);
            prePage.setData({
              zhangjies: mytikuArray,
              tiku: tiku
            })
            break;
          }
        }
      }
    }
  }
})