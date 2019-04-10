const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate();
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + '*' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTime1(date) {
  let month = date.getMonth() + 1
  let day = date.getDate();
  let myddy = date.getDay();//获取存储当前日期
  let weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

  return [month].map(formatNumber) + "月" + [day].map(formatNumber) + "日" + " " + weekday[myddy];
}

module.exports = {
  formatTime: formatTime,
  formatTime2: formatTime2,
  formatTime1: formatTime1
}
