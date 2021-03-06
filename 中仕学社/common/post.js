let common = require('shiti.js');
let animate = require('animate.js')
let share = require('share.js')

/**
 * 练习题
 */
function zuotiOnload(options, px, circular, myFavorite, shitiArray, user, page, colors, category, all_nums, pageall, self) {
  let username = user.username;
  let zcode = user.zcode;

  //得到swiper数组
  let preShiti = undefined; //前一题
  let nextShiti = undefined; //后一题
  let midShiti = shitiArray[px - 1]; //中间题
  console.log(midShiti.answer)
  let sliderShitiArray = [];
  let lastSliderIndex = 0;

  common.initShiti(midShiti, self); //初始化试题对象
  if (px != 1 && px != shitiArray.length) { //如果不是第一题也是不是最后一题
    preShiti = shitiArray[px - 2];
    common.initShiti(preShiti, self); //初始化试题对象
    nextShiti = shitiArray[px];
    common.initShiti(nextShiti, self); //初始化试题对象
  } else if (px == 1) { //如果是第一题
    nextShiti = shitiArray[px];
    common.initShiti(nextShiti, self); //初始化试题对象
  } else {
    preShiti = shitiArray[px - 2];
    common.initShiti(preShiti, self); //初始化试题对象
  }

  //对是否是已答试题做处理
  wx.getStorage({
    key: "shiti" + options.f_id + zcode,
    success: function(res1) {
      //根据章是否有子节所有已经回答的题
      let doneAnswerArray = res1.data;
      console.log(doneAnswerArray)
      common.setMarkAnswerItems(doneAnswerArray, options.nums, self.data.isModelReal, self.data.isSubmit, self); //设置答题板数组     
      //映射已答题目的已作答的答案到shitiArray
      for (let i = 0; i < doneAnswerArray.length; i++) {
        let doneAnswer = doneAnswerArray[i];
        shitiArray[doneAnswer.px - 1].done_daan = doneAnswer.done_daan; //设置已答试题的答案
      }

      //先处理是否是已经回答的题,渲染3个
      if (preShiti != undefined) common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      common.processDoneAnswer(midShiti.done_daan, midShiti, self);
      if (nextShiti != undefined) common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);

      //根据已答试题库得到正确题数和错误题数
      let rightAndWrongObj = common.setRightWrongNums(doneAnswerArray);


      //如果已答试题数目大于0才更新shiti
      if (doneAnswerArray.length > 0) {
        self.setData({
          sliderShitiArray: sliderShitiArray,
          doneAnswerArray: doneAnswerArray, //获取该节所有的已做题目
          rightNum: rightAndWrongObj.rightNum,
          wrongNum: rightAndWrongObj.wrongNum
        })
      }
    },
  })

  circular = px == 1 || px == shitiArray.length ? false : true //如果滑动后编号是1,或者最后一个就禁止循环滑动
  myFavorite = midShiti.favorite;

  if (px != 1 && px != shitiArray.length) { //如果不是第一题也不是最后一题
    sliderShitiArray[0] = midShiti;
    sliderShitiArray[1] = nextShiti;
    sliderShitiArray[2] = preShiti;
  } else if (px == 1) { //如果是第一题
    sliderShitiArray[0] = midShiti;
    sliderShitiArray[1] = nextShiti;
  } else { //如果是最后一题

    sliderShitiArray[0] = preShiti;
    sliderShitiArray[1] = midShiti;
    lastSliderIndex = 1;
    self.setData({
      myCurrent: 1
    })
  }

  self.setData({
    z_id: options.types, //点击组件的id编号
    zhangjie_id: options.f_id, //章节的id号，用于本地存储的key
    zhangIdx: options.zhangIdx, //章的id号
    jieIdx: options.jieIdx, //节的id号

    px: px,
    user: user,
    colors: colors, //配色方案
    title: options.title, //标题
    circular: circular,
    myFavorite: myFavorite, //是否收藏

    nums: all_nums, //题数
    pageall: pageall, //总页数

    shitiArray: shitiArray, //整节的试题数组
    sliderShitiArray: sliderShitiArray, //滑动数组
    lastSliderIndex: lastSliderIndex, //默认滑动条一开始是0
    isLoaded: true, //是否已经载入完毕,用于控制过场动画
  });

  //如果是材料题就有动画
  if (midShiti.TX == 99) {

    let str = "#q" + px;
    share.ifOverHeight(self, midShiti.xiaoti[0], sliderShitiArray)
    let questionStr = midShiti.question; //问题的str
    let height = common.getQuestionHeight(questionStr); //根据问题长度，计算应该多高显示

    height = height >= 400 ? 400 : height;

    let question = self.selectComponent(str);

    animate.blockSpreadAnimation(90, height, question); //占位框动画
    question.setData({
      style2: "positon: fixed; left: 20rpx;height:" + height + "rpx", //问题框"
    })

    self.setData({
      height: height,
    })
  }
}

/**
 * 收藏题
 */
function markOnload(options, px, circular, myFavorite, shitiArray, user, page, colors, category, all_nums, pageall, self) {
  let username = user.username;
  let zcode = user.zcode;

  //得到swiper数组
  let nextShiti = undefined; //后一题
  let midShiti = shitiArray[px - 1]; //中间题
  let sliderShitiArray = [];
  let lastSliderIndex = 0;

  common.initShiti(midShiti, self); //初始化试题对象
  if (shitiArray.length > 1) {
    nextShiti = shitiArray[px];
    common.initShiti(nextShiti, self); //初始化试题对象
  }


  circular = false; //如果滑动后编号是1,或者最后一个就禁止循环滑动
  myFavorite = 0;

  sliderShitiArray[0] = midShiti;

  if (shitiArray.length > 1) {
    sliderShitiArray[1] = nextShiti;
  }
  console.log(midShiti)

  self.setData({
    z_id: options.types, //点击组件的id编号
    px: 1,
    user: user,
    colors: colors, //配色方案
    circular: circular,
    myFavorite: myFavorite, //是否收藏

    nums: all_nums, //题数
    pageall: pageall, //总页数

    shitiArray: shitiArray, //整节的试题数组
    sliderShitiArray: sliderShitiArray, //滑动数组
    lastSliderIndex: lastSliderIndex, //默认滑动条一开始是0
    isLoaded: true, //是否已经载入完毕,用于控制过场动画
  });

  //如果是材料题就有动画
  if (midShiti.TX == 99) {

    let str = "#q" + px;
    share.ifOverHeight(self, midShiti.xiaoti[0], sliderShitiArray)
    let questionStr = midShiti.question; //问题的str
    let height = common.getQuestionHeight(questionStr); //根据问题长度，计算应该多高显示

    height = height >= 400 ? 400 : height;

    let question = self.selectComponent(str);

    animate.blockSpreadAnimation(90, height, question); //占位框动画
    question.setData({
      style2: "positon: fixed; left: 20rpx;height:" + height + "rpx", //问题框"
    })

    self.setData({
      height: height,
    })
  }
}


/**
 * 错题
 */
function wrongOnload(options, px, circular, myFavorite, shitiArray, user, page, colors, category, all_nums, pageall, self) {
  let username = user.username;
  let zcode = user.zcode;

  //得到swiper数组
  let nextShiti = undefined; //后一题
  let midShiti = shitiArray[px - 1]; //中间题
  let sliderShitiArray = [];
  let lastSliderIndex = 0;

  common.initShiti(midShiti, self); //初始化试题对象
  if (shitiArray.length > 1) {
    nextShiti = shitiArray[px];
    common.initShiti(nextShiti, self); //初始化试题对象
  }


  circular = false; //如果滑动后编号是1,或者最后一个就禁止循环滑动
  myFavorite = midShiti.favorite;

  sliderShitiArray[0] = midShiti;

  if (shitiArray.length > 1) {
    sliderShitiArray[1] = nextShiti;
  }
  console.log(midShiti)

  self.setData({
    z_id: options.types, //点击组件的id编号
    px: 1,
    user: user,
    colors: colors, //配色方案
    circular: circular,
    myFavorite: myFavorite, //是否收藏

    nums: all_nums, //题数
    pageall: pageall, //总页数

    shitiArray: shitiArray, //整节的试题数组
    sliderShitiArray: sliderShitiArray, //滑动数组
    lastSliderIndex: lastSliderIndex, //默认滑动条一开始是0
    isLoaded: true, //是否已经载入完毕,用于控制过场动画
  });

  //如果是材料题就有动画
  if (midShiti.TX == 99) {

    let str = "#q" + px;
    share.ifOverHeight(self, midShiti.xiaoti[0], sliderShitiArray)
    let questionStr = midShiti.question; //问题的str
    let height = common.getQuestionHeight(questionStr); //根据问题长度，计算应该多高显示

    height = height >= 400 ? 400 : height;

    let question = self.selectComponent(str);

    animate.blockSpreadAnimation(90, height, question); //占位框动画
    question.setData({
      style2: "positon: fixed; left: 20rpx;height:" + height + "rpx", //问题框"
    })

    self.setData({
      height: height,
    })
  }
}

module.exports = {
  zuotiOnload: zuotiOnload,
  wrongOnload: wrongOnload,
  markOnload: markOnload
}