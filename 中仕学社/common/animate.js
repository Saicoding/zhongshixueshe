function easeOutAnimation(duration){
  let myAnimation = wx.createAnimation({
    duration: duration,
    delay: 0,
    timingFunction: "ease-out",
    transformOrigin: "50%,50%"
  })
  return myAnimation;
}

function easeInAnimation(duration) {
  let myAnimation = wx.createAnimation({
    duration: duration,
    delay: 0,
    timingFunction: "ease-in",
    transformOrigin: "50%,50%"
  })
  return myAnimation;
}



/**
 * 透明度动画
 */
function opacityOutAnimation(duration) {
  let myAnimation = wx.createAnimation({
    duration: duration,
    delay: 1000,
    timingFunction: "ease-out",
    transformOrigin: "50%,50%"
  })
  return myAnimation;
}

/**
 * 透明度动画
 */

function opacityInAnimation(duration) {
  let myAnimation = wx.createAnimation({
    duration: duration,
    delay: 1000,
    timingFunction: "ease-in",
    transformOrigin: "50%,50%"
  })

  return myAnimation;
}


/**
 * 透明度动画
 */
function opacityAnimation(myAnimation, num) {
  myAnimation.opacity(num).step({
    duration:1000
  });

  return myAnimation.export();
}



function foldAnimation(myAnimation,max,min){
  myAnimation.height(max+"rpx", min+"rpx").step({
    duration: 500,
  })
  return myAnimation.export();
}

function rotateAnimation(myAnimation,angle){
  myAnimation.rotateZ(angle);
  return myAnimation.export();
}

/**
 * 边移动边改变宽度动画
 */
function ChangeWidthAndmoveX(myAnimation,width,x){
  myAnimation.width(width).translateX(x).step({
    duration: 500,
  });
  return myAnimation.export();
}

/**
 * 移动动画
 */

function moveX(myAnimation,x){
  myAnimation.translateX(x).step({
    duration: 500,
  });
  return myAnimation.export();
}

/**
 * 问题折叠动画
 */
function questionFoldAnimation(max,min,question){
  let interval = setInterval(()=>{
    max -=20
    if(max <=min){
      clearInterval(interval);
      max = min;
    }
    question.setData({
      style2: "positon: fixed; left: 20rpx;height:"+max+"rpx"
    })
  },40)
}

/**
 * 问题展开动画
 */
function questionSpreadAnimation(min,max,question){
  let interval = setInterval(() => {
    min += 20
    if (min >= max) {
      clearInterval(interval);
      min = max
    }
    question.setData({
      style2: "positon: fixed; left: 20rpx;height:" + min + "rpx"
    })
  }, 40)
}

/**
 * 占位框折叠动画
 */
function blockFoldAnimation(max, min, question) {
  let interval = setInterval(() => {
    max -= 20
    if (max <= min) {
      clearInterval(interval);
      max = min;
    }
    question.setData({
      style1: "display:block;margin-bottom:30rpx;height:" + max + "rpx"
    })
  }, 40)
}

/**
 * 占位框展开动画
 */
function blockSpreadAnimation(min, max, question) {
  let interval = setInterval(() => {
    min += 20
    if (min >= max) {
      clearInterval(interval);
      min = max
    }
    question.setData({
      style1: "display:block;margin-bottom:30rpx;height:" + min + "rpx"
    })
  }, 40)
}

/**
 * 红包跳动动画
 */
function tiaoAnimation(myAnimation,self){
  var next = true;
  setInterval(function () {
    if (next) {
      //根据需求实现相应的动画
      myAnimation.rotate(20).scale(1.2).step()
      next = !next;
    } else {
      myAnimation.rotate(-20).scale(0.8).step()
      next = !next;
    }
    self.setData({
      //导出动画到指定控件animation属性
      tiaoData: myAnimation.export()
    })
  }.bind(this), 700)
}
//**************************************新版动画************************************************** */


module.exports = {
  easeOutAnimation: easeOutAnimation,
  easeInAnimation: easeInAnimation,
  foldAnimation: foldAnimation,
  rotateAnimation: rotateAnimation,
  ChangeWidthAndmoveX: ChangeWidthAndmoveX,
  moveX: moveX,
  questionFoldAnimation: questionFoldAnimation,
  questionSpreadAnimation: questionSpreadAnimation,
  blockFoldAnimation: blockFoldAnimation,
  blockSpreadAnimation: blockSpreadAnimation,
  tiaoAnimation: tiaoAnimation,
  opacityOutAnimation: opacityOutAnimation,
  opacityInAnimation: opacityInAnimation,
  opacityAnimation: opacityAnimation
}