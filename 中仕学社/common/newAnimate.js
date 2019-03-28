/**
 * 我的方法  
 * timingFunction:
 *1.linear 动画从头到尾的速度是相同的 
 *2.ease 动画以低速开始，然后加快，在结束前变慢
 *3.ease-in 动画以低速开始
 *4.ease-in-out 动画以低速开始和结束
 *5.ease-out 动画以低速结束
 *6.step-start 动画第一帧就跳至结束状态直到结束
 *7.step-end 动画一直保持开始状态，最后一帧跳到结束状态
 */
function easeOutAnimation() {
  let myAnimation = wx.createAnimation({
    duration: 500,
    delay: 0,
    timingFunction: "ease-out",
    transformOrigin: "50%,50%"
  })

  return myAnimation;
}

function easeInAnimation() {
  let myAnimation = wx.createAnimation({
    duration: 500,
    delay: 0,
    timingFunction: "ease-in",
    transformOrigin: "50%,50%"
  })

  return myAnimation;
}

function myAnimation(obj){
  let ani = wx.createAnimation({
    duration: obj.duration ? obj.duration:400,
    timingFunction: obj.timingFunction ? obj.timingFunction:'ease',
    delay: obj.delay ? obj.delay:0,
    transformOrigin: obj.transformOrigin ? obj.transformOrigin :'50% 50%'
  })
  return ani
}


/**
 * 边移动边改变宽度动画
 */
function moveX(myAnimation, x) {
  myAnimation.translateX(x).step({
    duration: 500,
  });
  return myAnimation.export();
}


/**
 * 旋转
 */
function rate1(obj,num){
  let ani = myAnimation(obj);
  ani.rotate(num).step().rotate(0).step();
  return ani.export();
}

/**
 * Y轴旋转
 */
function rate2(obj,num){
  let ani = myAnimation(obj);
  ani.rotateY(num).step().rotateY(0).step();;
  return ani.export();
}

module.exports = {
  rate1: rate1,
  rate2: rate2,
  easeOutAnimation: easeOutAnimation,
  easeInAnimation: easeInAnimation,
  moveX: moveX,
}