/**
 * 通用js方法封装处理
 * Copyright (c) 2019 GeekPlus
 */

const baseURL = process.env.VUE_APP_BASE_API;
import { getClickTextWords, getOneFamousWords } from "@/api/geekplus/geekplus"
// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === "string") {
      time = time.replace(new RegExp(/-/gm), "/");
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    if (result.length > 0 && value < 10) {
      value = "0" + value;
    }
    return value || 0;
  });
  return time_str;
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 添加日期范围
export function addDateRange(params, dateRange) {
  var search = params;
  search.beginTime = "";
  search.endTime = "";
  if (null != dateRange && "" != dateRange) {
    search.beginTime = dateRange[0];
    search.endTime = dateRange[1];
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  var actions = [];
  Object.keys(datas).some((key) => {
    if (datas[key].dictValue == "" + value) {
      actions.push(datas[key].dictLabel);
      return true;
    }
  });
  return actions.join("");
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
  var actions = [];
  var currentSeparator = undefined === separator ? "," : separator;
  var temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some((val) => {
    Object.keys(datas).some((key) => {
      if (datas[key].dictValue == "" + temp[val]) {
        actions.push(datas[key].dictLabel + currentSeparator);
      }
    });
  });
  return actions.join("").substring(0, actions.join("").length - 1);
}

// 通用下载方法
export function download(fileName) {
  window.location.href =
    baseURL +
    "/common/download?fileName=" +
    encodeURI(fileName) +
    "&delete=" +
    true;
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments,
    flag = true,
    i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === "undefined") {
      flag = false;
      return "";
    }
    return arg;
  });
  return flag ? str : "";
}

export function randomRGB() {
  //rgb颜色随机
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
  var rgb = "(" + r + "," + g + "," + b + ")";
  return rgb;
}
export function color16() {
  //十六进制颜色随机
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
  var color = "#" + r.toString(16) + g.toString(16) + b.toString(16);
  return color;
}
export {
  getRandomColor1,
  getRandomColor2,
  getRandomColor3,
  getRandomColor4,
  getRandomColor5,
};
//颜色对象
function getRandomColor1() {
  this.r = Math.floor(Math.random() * 255);
  this.g = Math.floor(Math.random() * 255);
  this.b = Math.floor(Math.random() * 255);
  this.color = "rgba(" + this.r + "," + this.g + "," + this.b + ",0.8)";
}

function getRandomColor2() {
  return (
    "#" +
    (function (color) {
      return (color += "0123456789abcdef"[Math.floor(Math.random() * 16)]) &&
        color.length == 6 ?
        color :
        arguments.callee(color);
    })("")
  );
}
//方法三
function getRandomColor3() {
  return "#" + Math.floor(Math.random() * 256).toString(10);
}
//方法四
function getRandomColor4() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}
//方法五
function getRandomColor5() {
  return "#" + Math.random().toString(16).slice(2, 8);
}
//随机颜色
export function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
/*********************************************/
//获取随机蒙塞尔颜色,返回十六进制颜色
export function randomMunsellColor() {
  const letters = "0CEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}
//获取随机郁金香色系
export function getRandomTulipColor() {
  const hue = Math.random() * 360; // 色相在0-360之间
  const saturation = 40 + Math.random() * 30; // 饱和度在40-70之间
  const lightness = 50 + Math.random() * 15; // 亮度在50-65之间
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
//获取随机莫兰迪色系，参考莫兰迪色系规则，返回十六进制颜色
export function getRandomMorandiColor() {
  const hue = Math.floor(Math.random() * 360); // 色相在0-360之间
  const saturation = 20 + Math.random() * 10; // 饱和度在20-30之间
  const lightness = 50 + Math.random() * 15; // 亮度在50-65之间
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function generateMorandiColorCombined() {
  // 首先生成一个接近灰色的RGB颜色
  const baseValue = Math.floor(Math.random() * 51) + 100; // 100到150
  const color = `rgb(${baseValue}, ${baseValue}, ${baseValue})`;
  // 然后将该颜色转换为HSL，并调整其饱和度和亮度以符合莫兰迪色系的特点
  const hslColor = rgbToHsl(baseValue, baseValue, baseValue); // 使用自定义的rgbToHsl函数转换颜色并调整参数
  return `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
      h = s = 0; // achromatic
  } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; // Adjust saturation and lightness here if needed for Morandi effect.
}

//随机选固定颜色
export function someColor() {
  var colors = [
    "red",
    "green",
    "blue",
    "#ed2626",
    "#ed1f71",
    "#ed1fce",
    "#b31fed",
    "#8617ed",
    "#e05312",
    "#4917ed",
    "#331c82",
    "#1d228f",
    "#090a2b",
    "#1c75e3",
    "#159de6",
    "#d8e615",
    "#e3c116",
    "#e39816",
    "#e62f17",
    "#15cee6",
    "#15e6d5",
    "#15e6b2",
    "#15e66f",
    "#50e615",
    "#a4e615",
    "#a16b0d",
    "#e08d12",
    "#e07212",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

function gudingColor() {
  let colorList = [
    "#1882f8",
    "#f95757",
    "#FFBF11",
    "#11BBEC",
    "#FB7C26",
    "#46BE1A",
  ];
  let colorMath = Math.floor(Math.random() * colorList.length + 1) - 1;
  let color;
  let i = 0;
  for (i; colorList.length > i; i++) {
    if (i == colorMath) {
      color = colorList[i];
    }
  }
}

export function getYearMonth(date) {
  // 将日期以空格隔开，即['2020-06-13', '17:10:09']
  date = (date + "").split(/[ ]+/);
  let result = [];
  let reg = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  // 用截取出来的年月日进行正则表达式匹配
  reg.exec(date[0]);
  result.push(RegExp.$1); //获取匹配到的第一个子匹配，即‘2020’
  result.push(RegExp.$2);
  result.push(RegExp.$3);
  return result;
}
export function formatNumber(num) {
  return num >= 1e3 && num < 1e4 ?
    (num / 1e3).toFixed(1) + "k" :
    num >= 1e4 ?
      (num / 1e4).toFixed(1) + "w" :
      num;
}
export function numFormatKWM(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e4, symbol: "W" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

//只截取时间的年月日
export function getOnlyYMD(val) {
  //let time ='2021-10-15 12:17:49'
  // let appointDate = /\d{4}-\d{1,2}-\d{1,2}/g.exec(val)[0];
  //2021-10-15
  // 使用正则表达式匹配年月日
  let match = val.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
      let year = match[1];
      let month = match[2];
      let day = match[3];
      // console.log(`${year}-${month}-${day}`);
      return `${year}-${month}-${day}`;
  } else {
      console.log("No match found");
      return val;
  }
}

export function getYMDTime(val) {
  const date = new Date(val)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，所以+1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

//判断是否为json对象
export function objectIsJson(obj) {
  if (
    typeof data == "object" &&
    Object.prototype.toString.call(data).toLowerCase() == "[object object]" &&
    !data.length
  ) {
    return true;
  }
  return false;
}
//判断json是否存在某个对象
export function checkObjectExists1(json, key) {
  return key in json;
}
export function checkObjectExists2(json, key) {
  return json.hasOwnProperty(key);
}
//这个方法不太严谨，当key存在，且又为undefined
export function checkObjectExists3(json, key) {
  return typeof json[key] !== "undefined";
}
export function checkObjectExists4(json, key) {
  try {
    return json[key] !== null;
  } catch (error) {
    return false;
  }
}
/**
 * 字符串是否含有html标签的检测
 * @param htmlStr
 */
export function checkHtml(htmlStr) {
  var reg = /<[^>]+>/g;
  return reg.test(htmlStr);
}

export function getHtmlPlainText(html_str) {
  //提取字符串中的文字
  let re = new RegExp("<[^<>]+>", "g");
  let text = html_str.replace(re, "");
  //或
  //var text = html_str.replace(/<[^<>]+>/g, "");
  return text;
}

export function getHtmlValue(value) {
  //String s = "abc<span>def</span>gh<font>666</font>999";
  var reg = /<([^>]+)>([\d\D]*?)<\/\1>/g;
  //var reg2 = /(?=>)(.|\s)?(?=</?\w+[^<]>)/g;
  //var reg1= /(?<=<p>).*(?=</p>)/g;
  var result = value.replace(reg, "$2").split(/\s+/); // '$2 ' 这里多加空格适配标签之间无空格情况
  result.pop(); // 去掉最后一个空格
  return result;
  // List<String> words = new ArrayList<>();
  // Matcher matcher = pattern.matcher(s);
  // while (matcher.find()){
  //     words.add(matcher.group(3));
  // }
}
//获取图片的原始尺寸
export function getImageNaturalDimensions(oImgSrc, callback) {
  var oImg = new Image();
  oImg.onload = function () {
    var nWidth, nHeight;
    if (!oImg.naturalWidth) {
      nWidth = oImg.naturalWidth;
      nHeight = oImg.naturalHeight;
      callback(oImg, { w: nWidth, h: nHeight });
    } else {
      var nImg = new Image();
      nImg.onload = function () {
        var nWidth = nImg.width,
          nHeight = nImg.height;
        callback(oImg, { w: nWidth, h: nHeight });
      };
      nImg.src = oImg.src;
    }
  };
  oImg.onerror = function () {
    callback(null);
  };
  oImg.src = oImgSrc;
}

//输入一个整数，返回他从1开始的随机数，需要加1，否则就是返回从0开始到length-1
export function someNumberCount(length) {
  return Math.floor(Math.random() * length) + 1;
}

//标准时间转换为时间戳
export function getDateTimeStamp(dateStr) {
  return Date.parse(dateStr.replace(/-/gi, "/"));
}

//dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上
//除以1000，就是十位数的时间戳。13位数的都是时间毫秒。dateTimeStamp
export function dateTimeAgo(dateStr) {
  var dateTimeStamp = Date.parse(dateStr.replace(/-/gi, "/"));
  var result = "";
  var minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
  var hour = minute * 60;
  var day = hour * 24;
  var week = day * 7;
  var halfamonth = day * 15;
  var month = day * 30;
  var year = day * 365;
  var now = new Date().getTime(); //获取当前时间毫秒
  // console.log(now)
  var diffValue = now - dateTimeStamp; //时间差

  if (diffValue < 0) {
    return;
  }
  var minC = diffValue / minute; //计算时间差的分，时，天，周，月
  var hourC = diffValue / hour;
  var dayC = diffValue / day;
  var weekC = diffValue / week;
  var monthC = diffValue / month;
  var yearC = diffValue / year;

  if (yearC >= 1 && yearC <= 5) {
    result = " " + parseInt(yearC) + "年前";
  }else if (monthC >= 6 && monthC <= 12) {
    result = " " + "半年前";
  } else if (monthC >= 1 && monthC <= 6) {
    var datetime = new Date();
    datetime.setTime(dateTimeStamp);
    var Nmonth =
      datetime.getMonth() + 1 < 10 ?
        "0" + (datetime.getMonth() + 1) :
        datetime.getMonth() + 1;
    var Ndate =
      datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    result = Nmonth + "-" + Ndate;
    // result = " " + parseInt(monthC) + "个月前";
  } else if (weekC >= 1 && weekC < 5) {
    result = " " + parseInt(weekC) + "周前";
  } else if (dayC >= 1 && dayC <= 7) {
    result = " " + parseInt(dayC) + "天前";
  } else if (hourC >= 1 && hourC <= 24) {
    result = " " + parseInt(hourC) + "小时前";
  } else if (minC >= 1 && minC <= 60) {
    result = " " + parseInt(minC) + "分钟前";
  } else if (diffValue >= 0 && diffValue <= minute) {
    result = "刚刚";
  } else {
    var datetime = new Date();
    datetime.setTime(dateTimeStamp);
    var Nyear = datetime.getFullYear();
    var Nmonth =
      datetime.getMonth() + 1 < 10 ?
        "0" + (datetime.getMonth() + 1) :
        datetime.getMonth() + 1;
    var Ndate =
      datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var Nhour =
      datetime.getHours() < 10 ?
        "0" + datetime.getHours() :
        datetime.getHours();
    var Nminute =
      datetime.getMinutes() < 10 ?
        "0" + datetime.getMinutes() :
        datetime.getMinutes();
    var Nsecond =
      datetime.getSeconds() < 10 ?
        "0" + datetime.getSeconds() :
        datetime.getSeconds();
    var state = '';
    // 判断当前时间段
    if (Nhour >= 7 && Nhour < 11) {
      state = `早上`;
    } else if (Nhour >= 11 && Nhour < 14) {
      state = `中午`;
    } else if (Nhour >= 14 && Nhour < 18) {
      state = `下午`;
    } else if (Nhour >= 18 && Nhour < 24) {
      state = `晚上`;
    } else if (Nhour >= 0 && Nhour < 7) {
      state = `凌晨`;
    }
    result = Nyear + "-" + Nmonth;// + "-" + Ndate + (state ? " " + state : '');
  }
  return result;
}

//js判断一天的时间段
export function getTimeState() {
  // 获取当前时间
  let timeNow = new Date();
  // 获取当前小时
  let hours = timeNow.getHours();
  // 设置默认文字
  let state = ``;
  // 判断当前时间段
  if (hours >= 7 && hours < 11) {
    state = `早上好!`;
  } else if (hours >= 11 && hours < 14) {
    state = `中午好!`;
  } else if (hours >= 14 && hours < 18) {
    state = `下午好!`;
  } else if (hours >= 18 && hours < 24) {
    state = `晚上好!`;
  } else if (hours >= 0 && hours < 7) {
    state = `凌晨好!`;
  }
  return state;
}

//白天或晚上
export function isLightDay() {
  // 获取当前时间
  const timeNow = new Date();
  // 获取当前小时
  // 设置默认文字
  // 判断当前时间段,白天或黑夜
  if (timeNow.getHours() >= 6 && timeNow.getHours() < 18) {
    return true;
  } else if (timeNow.getHours() >= 18 && timeNow.getHours() < 24) {
    return false;
  } else if (timeNow.getHours() >= 0 && timeNow.getHours() < 6) {
    return false;
  }
}

export function backToTop(topNumber = null) {
  //判断是否是老旧的IE浏览器和版本低于IE9
  // if (navigator.userAgent.indexOf('MSIE') !== -1 && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf('MSIE')+5, navigator.userAgent.indexOf('MSIE')+8)) < 9) {
  // }
  if (topNumber == null) {
    let top = document.documentElement.scrollTop || document.body.scrollTop
    // 实现滚动效果
    const timeTop = setInterval(() => {
      document.body.scrollTop = document.documentElement.scrollTop = top -= 100;
      if (top <= 0) {
        clearInterval(timeTop);
      }
    }, 10);
  } else {
    const curPosition = document.documentElement.scrollTop || document.body.scrollTop;
    if (curPosition > 0) {
      window.requestAnimationFrame(backToTop); // 调用自己
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth' // 可选，平滑滚动
      });
    }
  }
}

// 返回顶部动画效果
export function goToTop() {
  var u = navigator.userAgent;
  var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1; //android终端
  var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  let scrollTop =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop;
  // 实现滚动效果
  let speed = scrollTop / 10; // 每次滚动多少 （步长值）
  const timeTop = setInterval(() => {
    if (isIOS) {
      if (document.documentElement.scrollTop !== 0) {
        document.documentElement.scrollTop -= speed; // 不在顶部 每次滚动到的位置
      } else {
        clearInterval(timeTop); // 回到顶部清除定时器
      }
    }
    if (isAndroid) {
      if (document.body.scrollTop != 0) {
        document.body.scrollTop -= speed;
      } else {
        clearInterval(timeTop);
      }
    }
  }, 20);
}
// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleTree(data, id, parentId, children, rootId) {
  id = id || "id";
  parentId = parentId || "parentId";
  children = children || "children";
  rootId =
    rootId ||
    Math.min.apply(
      Math,
      data.map((item) => {
        return item[parentId];
      })
    ) ||
    0;
  //对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data));
  //循环所有项
  const treeData = cloneData.filter((father) => {
    let branchArr = cloneData.filter((child) => {
      //返回每一项的子级数组
      return father[id] === child[parentId];
    });
    branchArr.length > 0 ? (father.children = branchArr) : "";
    //返回第一层
    return father[parentId] === rootId;
  });
  return treeData != "" ? treeData : data;
}

export function getNowDate() {
  var date = new Date();
  var sign2 = ":";
  var year = date.getFullYear(); // 年
  var month = date.getMonth() + 1; // 月
  var day = date.getDate(); // 日
  var hour = date.getHours(); // 时
  var minutes = date.getMinutes(); // 分
  var seconds = date.getSeconds(); //秒
  //var weekArr = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'];
  //var week = weekArr[date.getDay()];
  // 给一位数的数据前面加 “0”
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 0 && day <= 9) {
    day = "0" + day;
  }
  if (hour >= 0 && hour <= 9) {
    hour = "0" + hour;
  }
  if (minutes >= 0 && minutes <= 9) {
    minutes = "0" + minutes;
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = "0" + seconds;
  }
  return (
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    hour +
    sign2 +
    minutes +
    sign2 +
    seconds
  );
}

/*字符串转dom对象*/
export function loadXMLString(xmlStr) {
  var xmlDoc = null;
  try {
    //Internet Explorer
    // xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    // xmlDoc.async = "false";
    // xmlDoc.loadXML(xmlStr);
    // //alert('IE');
    // return xmlDoc;
    const range = document.createRange();
    xmlDoc = range.createContextualFragment(xmlStr);
  } catch (e) {
    try {
      //Firefox, Mozilla, Opera, etc.
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlStr, "text/html");
      //alert('FMO');
      return xmlDoc;
    } catch (e) {
      // xmlDoc =e.message;
      const template = document.createElement("template");
      template.innerHTML = xmlStr;
      xmlDoc = template.content;
    }
  }
  return xmlDoc;
}

export function textToImage(text, font, color, width, height) {
  // 创建canvas元素
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  // 获取canvas上下文
  var ctx = canvas.getContext("2d");

  // 设置填充样式和字体
  ctx.fillStyle = color;
  ctx.font = font;

  // 绘制文本
  ctx.fillText(text, 0, height / 2 + 5);

  // 将canvas转换为DataURL格式的图片
  var dataURL = canvas.toDataURL("image/png");

  // 创建Image元素并设置src属性为DataURL
  var img = new Image();
  img.src = dataURL;

  return img;
}
// 使用例子
// var image = textToImage('字', '20px Arial', '#000000', 100, 50);

//添加复制代码按钮
export function copyCode() {
  //在这里使用需要判断样式是否不存在，不存在则开始添加到head中，避免了使用return导致函数出现终止执行问题
  if (!document.getElementById("copy-code-styles")) {
    //这里就是添加css样式表到head的主要代码
    const css = `
        .pre-all-wrapper {
        position: relative;
        }

        .pre-tool-container {
        position: absolute;
        /* 设置复制按钮所在tool容器样式，使其绝对定位于父容器元素的右上角 */
        top: 4px;
        right: 10px;
        }

        .pre-tool-container.ptc-hidden {
        display: none;
        }

        .copy-btn {
        font-size: 13px;
        display: block;
        line-height: 1;
        transition: color 0.1s;
        color: #ffffff;
        background-color: #9999AA;
        padding: 4px 9px;
        margin:
        border: none;
        border-radius: 3px;
        cursor: pointer;
        z-index: 1;
        }
        /* 定义一个pre标签的hover鼠标悬停效果
        pre:hover .pre-tool-container {
        display: inline-block;
        background: red;
        color: blue;
        } */
        `;
    const style = document.createElement("style");
    style.id = "copy-code-styles";
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  const codeBlocks = document.querySelectorAll("pre");
  //const codeContainer = document.querySelectorAll(".code-container");
  if (codeBlocks) {
    codeBlocks.forEach(function (codeBlock) {
      //这段注释的代码是给代码添加行数，便于结构化代码显示
      //判断当前代码块不存在行数显示标签ol时，才创建新的ol
      // if (!codeBlock.querySelectorAll('ol')) {
      //     // 创建新的ol元素
      //     const ol = document.createElement('ol');
      //     // 获取所有<code>标签中的文本行
      //     const codeLines = codeBlock.innerText.split('\n');
      //     // 移除<pre>中的所有内容
      //     codeBlock.innerHTML = '';
      //     // 为每行代码添加序号并重新添加到<pre>中
      //     codeLines.forEach((line, index) => {
      //         // const lineNumber = index + 1;
      //         const lineElement = document.createElement('li');
      //         lineElement.innerText = `${line}`;//${lineNumber}.
      //         ol.appendChild(lineElement);
      //         // codeBlock.innerHTML = `<ol><li>${codeBlock.innerHTML.replace(/\n/g,`</li><li class="line">`)}</li></ol>`;
      //     });
      //     codeBlock.appendChild(ol);
      // }

      //var codeToolWrapper = codeBlock.querySelector('.code-tool-wrapper');

      var preAllWrapper = codeBlock.parentNode || codeBlock.parentElement;
      //判断代码块中是否已经有codeToolWrapper，有就return中断执行
      if (preAllWrapper.classList.contains("pre-all-wrapper")) {
        return;
      }

      // 创建包裹pre的容器
      const preAllWrapperNew = document.createElement("div");
      preAllWrapperNew.className = "pre-all-wrapper";

      // 创建包裹一键复制按钮的容器元素
      var toolContainer = document.createElement("div");
      toolContainer.className = "pre-tool-container ptc-hidden";

      //创建一个复制按钮
      var copyButton = document.createElement("span");
      copyButton.className = "copy-btn";
      copyButton.innerText = "复制";
      // 将按钮添加到容器元素内
      toolContainer.appendChild(copyButton);

      // 将容器元素插入到代码块之前
      // codeBlock.parentNode.insertBefore(toolContainer, codeBlock);
      // 设置容器元素样式，使其定位为相对定位（position: relative）
      // container.style.position = 'relative';
      // codeBlock.appendChild(codeToolWrapper);
      // while (codeBlock.firstChild) {
      //     preAllWrapper.appendChild(container.firstChild);
      // }
      preAllWrapper.insertBefore(preAllWrapperNew, codeBlock);
      preAllWrapperNew.appendChild(toolContainer);
      preAllWrapperNew.insertBefore(codeBlock, toolContainer);

      copyButton.addEventListener("click", function (e) {
        // 获取代码块的文本内容innerText
        var code = codeBlock.innerText;

        if (navigator.clipboard && window.isSecureContext) {
          try {
            navigator.clipboard
              .writeText(code)
              .then(() => {
                // 修改复制按钮文本为“已复制”
                this.innerText = "复制成功";
              })
              .catch(() => {
                this.innerText = "复制失败";
              });
          } catch (err) {
            this.innerText = "复制失败";
          }
        } else {
          // 创建一个临时的textarea元素，并将代码块的内容设置为其值
          var textarea = document.createElement("textarea");
          textarea.value = code;
          // 将textarea元素追加到body中
          document.body.appendChild(textarea);
          // 选中textarea中的文本
          textarea.select();
          // 执行复制操作
          document.execCommand("copy");
          // 移除临时的textarea元素
          document.body.removeChild(textarea);
          this.innerText = "复制成功";
        }
        //一定时间后把按钮名改回来
        setTimeout(() => {
          this.innerText = "复制";
        }, 1800);
      });

      //实现代码块pre悬停显示复制按钮等，包括桌面和移动端
      // 监听mouseenter和mouseleave事件
      preAllWrapperNew.addEventListener("mouseenter", function () {
        // 鼠标进入元素时的效果
        toolContainer.classList.remove("ptc-hidden"); // 'hover-class'是CSS中定义的类，包含hover样式
      });

      preAllWrapperNew.addEventListener("mouseleave", function () {
        // 鼠标离开元素时的效果
        toolContainer.classList.add("ptc-hidden");
      });

      // 为了适配触摸设备，可以监听触摸事件
      preAllWrapperNew.addEventListener("touchstart", function (e) {
        // 阻止默认的触摸行为，例如缩放
        //e.preventDefault();
        // 触摸开始时的效果
        toolContainer.classList.remove("ptc-hidden");
      }, { passive: false });

      // 为了适配触摸设备，可以监听页面，当任意地方按下活触摸时
      document.addEventListener("touchstart", (e) => {
        //任意点击不是当前pre的位置
        if (!preAllWrapperNew.contains(e.target)) {
          toolContainer.classList.add("ptc-hidden");
        }
      }, { passive: false });
    });
  }

  // if (document.getElementById("copy-code-styles")) return; // 避免重复添加样式
  //如果要使用这种方法，需要把上面的判断样式不存在中的添加css的代码转移到下面，
  //因为return;会终止当前函数，也就是下面的不会再执行了，所以添加到head的方法移到下面
}
/***********************------全局复制携带网站信息-------************************* */
export function addLink() {
  var body_element = document.body;
  var selection;
  var copytext;
  var pagelink;
  let range = new Array();
  selection = window.getSelection();
  for (let i = 0; i < selection.rangCount; i++) {
    range[i] = selection.getRangeAt(i);
  }
  if (window.clipboardData) {
    // Internet Explorer
    pagelink =
      "\r\n\r\n\r\n 本文为[梦极客园]的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明 原文链接: \r\n" +
      document.location.href +
      "";
    copytext = selection + pagelink;
    window.clipboardData.setData("Text", copytext);
    return false;
  } else {
    pagelink =
      "\r\n\r\n\r\n 本文为[梦极客园]的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明 原文链接: \r\n" +
      document.location.href +
      "";
    copytext = selection + pagelink;
    var newdiv = document.createElement("div");
    newdiv.style.position = "absolute";
    newdiv.style.left = "-99999px";
    body_element.appendChild(newdiv);
    newdiv.innerText = copytext;
    selection.selectAllChildren(newdiv);
    window.setTimeout(function () {
      body_element.removeChild(newdiv);
    }, 0);
  }
}

/***********************------全局鼠标点击七彩效果-------************************* */
// function clickEffect() {
//     let balls = [];
//     let longPressed = false;
//     let longPress;
//     let multiplier = 0;
//     let width, height;
//     let origin;
//     let normal;
//     let ctx;
//     const colours = ["#F73859", "#14FFEC", "#00E0FF", "#FF99FE", "#FAF15D"];
//     const canvas = document.createElement("canvas");
//     document.body.appendChild(canvas);
//     canvas.setAttribute("style", "width: 100%; height: 100%; top: 0; left: 0; z-index: 99999; position: fixed; pointer-events: none;");
//     const pointer = document.createElement("span");
//     pointer.classList.add("pointer");
//     document.body.appendChild(pointer);

//     if (canvas.getContext && window.addEventListener) {
//         ctx = canvas.getContext("2d");
//         updateSize();
//         window.addEventListener('resize', updateSize, false);
//         loop();
//         window.addEventListener("mousedown", function (e) {
//             pushBalls(randBetween(10, 20), e.clientX, e.clientY);
//             document.body.classList.add("is-pressed");
//             longPress = setTimeout(function () {
//                 document.body.classList.add("is-longpress");
//                 longPressed = true;
//             }, 500);
//         }, false);
//         window.addEventListener("mouseup", function (e) {
//             clearInterval(longPress);
//             if (longPressed == true) {
//                 document.body.classList.remove("is-longpress");
//                 pushBalls(randBetween(50 + Math.ceil(multiplier), 100 + Math.ceil(multiplier)), e.clientX, e.clientY);
//                 longPressed = false;
//             }
//             document.body.classList.remove("is-pressed");
//         }, false);
//         window.addEventListener("mousemove", function (e) {
//             let x = e.clientX;
//             let y = e.clientY;
//             pointer.style.top = y + "px";
//             pointer.style.left = x + "px";
//         }, false);
//     } else {
//         console.log("canvas or addEventListener is unsupported!");
//     }

//     function updateSize() {
//         canvas.width = window.innerWidth * 2;
//         canvas.height = window.innerHeight * 2;
//         canvas.style.width = window.innerWidth + 'px';
//         canvas.style.height = window.innerHeight + 'px';
//         ctx.scale(2, 2);
//         width = (canvas.width = window.innerWidth);
//         height = (canvas.height = window.innerHeight);
//         origin = {
//             x: width / 2,
//             y: height / 2
//         };
//         normal = {
//             x: width / 2,
//             y: height / 2
//         };
//     }
//     class Ball {
//         constructor(x = origin.x, y = origin.y) {
//             this.x = x;
//             this.y = y;
//             this.angle = Math.PI * 2 * Math.random();
//             if (longPressed == true) {
//                 this.multiplier = randBetween(14 + multiplier, 15 + multiplier);
//             } else {
//                 this.multiplier = randBetween(6, 12);
//             }
//             this.vx = (this.multiplier + Math.random() * 0.5) * Math.cos(this.angle);
//             this.vy = (this.multiplier + Math.random() * 0.5) * Math.sin(this.angle);
//             this.r = randBetween(8, 12) + 3 * Math.random();
//             this.color = colours[Math.floor(Math.random() * colours.length)];
//         }
//         update() {
//             this.x += this.vx - normal.x;
//             this.y += this.vy - normal.y;
//             normal.x = -2 / window.innerWidth * Math.sin(this.angle);
//             normal.y = -2 / window.innerHeight * Math.cos(this.angle);
//             this.r -= 0.3;
//             this.vx *= 0.9;
//             this.vy *= 0.9;
//         }
//     }

//     function pushBalls(count = 1, x = origin.x, y = origin.y) {
//         for (let i = 0; i < count; i++) {
//             balls.push(new Ball(x, y));
//         }
//     }

//     function randBetween(min, max) {
//         return Math.floor(Math.random() * max) + min;
//     }

//     function loop() {
//         ctx.fillStyle = "rgba(255, 255, 255, 0)";
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         for (let i = 0; i < balls.length; i++) {
//             let b = balls[i];
//             if (b.r < 0) continue;
//             ctx.fillStyle = b.color;
//             ctx.beginPath();
//             ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2, false);
//             ctx.fill();
//             b.update();
//         }
//         if (longPressed == true) {
//             multiplier += 0.2;
//         } else if (!longPressed && multiplier >= 0) {
//             multiplier -= 0.4;
//         }
//         removeBall();
//         requestAnimationFrame(loop);
//     }

//     function removeBall() {
//         for (let i = 0; i < balls.length; i++) {
//             let b = balls[i];
//             if (b.x + b.r < 0 || b.x - b.r > width || b.y + b.r < 0 || b.y - b.r > height || b.r < 0) {
//                 balls.splice(i, 1);
//             }
//         }
//     }
// }
// clickEffect();//调用点击器材绽放效果

/****************************-----鼠标点击文字特效-----*******************************/
/**
 * 点击飘字：文案优先接口 getClickTextWords（可后台配置），失败则名言接口 / 本地默认词。
 * 仅绑定一次 click，定时刷新词库；动画优先 Web Animations API。
 */
var a_idx = 0;
var DEFAULT_CLICK_WORDS = [
  "别说话", "泪水", "你别带走", "镜子里", "的我", "已留下你", "轮廓上的", "笑容",
  "别回眸", "末班车", "要开了", "你不过先走", "深爱", "是让", "不舍离开", "的人", "好好走"
];
var clickWords = DEFAULT_CLICK_WORDS.slice();
var clickTextBound = false;
var clickTextRefreshTimer = null;

function removeDomNode(node) {
  if (!node) return;
  if (node.remove) {
    node.remove();
  } else if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

function floatClickText(el, startY, duration) {
  if (el && typeof el.animate === "function") {
    el.animate(
      [
        { top: startY + "px", opacity: 1, transform: "scale(1)" },
        { top: startY - 100 + "px", opacity: 0.5, transform: "scale(0.8)" },
        { top: startY - 180 + "px", opacity: 0, transform: "scale(0.65)" }
      ],
      {
        duration: duration,
        iterations: 1,
        fill: "forwards",
        delay: 0,
        easing: "linear"
      }
    );
    return;
  }
  el.style.transition = "top " + duration + "ms linear, opacity " + duration + "ms linear, transform " + duration + "ms linear";
  void el.offsetHeight;
  el.style.top = startY - 180 + "px";
  el.style.opacity = "0";
  el.style.transform = "scale(0.65)";
}

function normalizeClickWords(payload) {
  if (!payload) return [];
  var data = payload.data !== undefined ? payload.data : payload;
  if (Array.isArray(data)) {
    return data
      .map(function (item) {
        if (item == null) return "";
        if (typeof item === "string") return item.trim();
        if (typeof item === "object") {
          return String(item.content || item.text || item.word || item.title || "").trim();
        }
        return String(item).trim();
      })
      .filter(Boolean);
  }
  if (typeof data === "object") {
    var content = data.content || data.text || data.word || "";
    if (content) return getSimpleNativeWordsArray(String(content));
  }
  if (typeof data === "string") {
    var textVal = data.trim();
    if (!textVal) return [];
    if (textVal.charAt(0) === "[") {
      try {
        var parsed = JSON.parse(textVal);
        if (Array.isArray(parsed)) return normalizeClickWords(parsed);
      } catch (e) { /* ignore */ }
    }
    if (/[,，\n|;；]/.test(textVal)) {
      return textVal.split(/[,，\n\r|;；]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    }
    return getSimpleNativeWordsArray(textVal);
  }
  return [];
}

function applyClickWords(words) {
  if (words && words.length) {
    clickWords = words;
    a_idx = 0;
    try {
      localStorage.setItem("gp_click_text_words", JSON.stringify(words));
      localStorage.setItem("gp_click_text_words_at", String(Date.now()));
    } catch (e) { /* ignore */ }
  }
}

function loadCachedClickWords() {
  try {
    var cached = localStorage.getItem("gp_click_text_words");
    var at = Number(localStorage.getItem("gp_click_text_words_at") || 0);
    if (cached && Date.now() - at < 6 * 60 * 60 * 1000) {
      var words = JSON.parse(cached);
      if (Array.isArray(words) && words.length) {
        clickWords = words;
        return true;
      }
    }
  } catch (e) { /* ignore */ }
  return false;
}

function fetchClickTextWords() {
  return getClickTextWords()
    .then(function (res) {
      var words = normalizeClickWords(res);
      if (!words.length) {
        return getOneFamousWords().then(function (famousRes) {
          return normalizeClickWords(famousRes);
        });
      }
      return words;
    })
    .then(function (words) {
      applyClickWords(words);
      return words;
    })
    .catch(function () {
      return clickWords;
    });
}

var clickTextFetchInflight = null;
function ensureClickTextWords(force) {
  if (!force && loadCachedClickWords()) {
    return Promise.resolve(clickWords);
  }
  if (clickTextFetchInflight) return clickTextFetchInflight;
  clickTextFetchInflight = fetchClickTextWords().finally(function () {
    clickTextFetchInflight = null;
  });
  return clickTextFetchInflight;
}

function onClickTextEffect(e) {
  var target = e.target || e.srcElement;
  var tag = (target && target.tagName ? target.tagName : "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select" || (target && target.isContentEditable)) {
    return;
  }

  var words = clickWords && clickWords.length ? clickWords : DEFAULT_CLICK_WORDS;
  if (words.length === 0) {
    return;
  }else if(words.length === 1) {
    words = processText(words[0], 4);
  }
  var ii = document.createElement("span");
  ii.appendChild(document.createTextNode(words[a_idx]));
  a_idx = (a_idx + 1) % words.length;
  var x = e.clientX;
  var y = e.clientY;
  ii.setAttribute(
    "style",
    "top:" + (y - 20) + "px;left:" + x + "px;" +
    "position:fixed;pointer-events:none;font-weight:bold;color:" + getRandomTulipColor() + ";z-index:999999;"
  );
  document.body.appendChild(ii);
  var duration = 1600;
  floatClickText(ii, y, duration);
  window.setTimeout(function () {
    removeDomNode(ii);
  }, duration);
}

function clickTextEffect() {
  var hasCache = loadCachedClickWords();
  // 有本地缓存则首屏不抢网；idle 后再静默刷新。无缓存才立刻拉一次。
  if (hasCache) {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(function () { ensureClickTextWords(true); }, { timeout: 8000 });
    } else {
      window.setTimeout(function () { ensureClickTextWords(true); }, 4000);
    }
  } else {
    ensureClickTextWords(false);
  }
  if (!clickTextRefreshTimer) {
    clickTextRefreshTimer = window.setInterval(function () {
      ensureClickTextWords(true);
    }, 30 * 60 * 1000);
  }
  if (clickTextBound) return;
  clickTextBound = true;
  var bind = function () {
    if (window.addEventListener) {
      window.addEventListener("click", onClickTextEffect, false);
    } else if (document.attachEvent) {
      document.attachEvent("onclick", onClickTextEffect);
    }
  };
  if (document.readyState === "complete") {
    bind();
  } else if (window.addEventListener) {
    window.addEventListener("load", bind, false);
  } else if (window.attachEvent) {
    window.attachEvent("onload", bind);
  } else {
    bind();
  }
}
clickTextEffect();

// 供布局开关飘字复用，避免再打一遍 getClickTextWords
export function getCachedClickTextWords() {
  loadCachedClickWords();
  return clickWords.slice();
}
export function refreshClickTextWords(force) {
  return ensureClickTextWords(!!force);
}

/********************** 分割文本为句子数组 ************************/
function splitSentences1(text) {
  // 使用正则表达式匹配以句号、问号或感叹号结束的句子
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  return sentences;
}

function splitSentences2(text) {
  // 使用正则表达式匹配以句号、问号或感叹号结束的句子，忽略句子内的换行和多余空格
  const sentences = text.match(/(?:\r\n|\r|\n|\s)*[^.!?]+[.!?]+(?:\r\n|\r|\n|\s)*/g);
  return sentences;
}

function splitByWord(text, word) {
  // 使用正则表达式找到特定词汇，并根据其分割字符串
  const parts = text.split(new RegExp(`\\b${word}\\b`, 'i')); // 'i' 用于不区分大小写
  return parts;
}

// 正则匹配句子并分割，把分割的句子再次根据需要按长度分割
function preprocessString(str) {
  return str.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitSentences(str) {
  const sentences = [];
  let currentSentence = '';
  let inQuotes = false;
  let i = 0;
  while (i < str.length) {
      if (str[i] === '"') {
          inQuotes = !inQuotes;
          currentSentence += str[i];
      } else if (!inQuotes && (str[i] === '.' || str[i] === '?' || str[i] === '!')) {
          // 确保句子后有空白字符或句子结束
          if (i + 1 < str.length && /\s/.test(str[i + 1])) {
              sentences.push(currentSentence + str[i]);
              currentSentence = '';
              // 跳过空白字符，避免连续空白字符导致的问题
              while (i + 1 < str.length && /\s/.test(str[i + 1])) i++;
              continue;
          } else {
              currentSentence += str[i]; // 如果紧跟的不是空白字符，则保留该标点符号
          }
      } else {
          currentSentence += str[i];
      }
      i++;
  }
  if (currentSentence) sentences.push(currentSentence); // 添加最后一个句子（如果有）
  return sentences;
}

function splitLongSentences(sentences, maxLength) {
  return sentences.map(sentence => {
      if (sentence.length > maxLength) {
          return sentence.match(new RegExp('.{1,' + maxLength + '}', 'g')); // 分割成长度不超过maxLength的数组元素
      }
      return sentence;
  }).flat(); // 使用flat()将嵌套数组展平为单一数组
}

function processText(text, maxLength) {
  const preprocessedText = preprocessString(text);
  const sentences = splitSentences(preprocessedText);
  const result = splitLongSentences(sentences, maxLength); // 例如，maxLength为100个字符长度限制
  return result;
}

// function cleanAndSplitText(text) {
//   const regex = /([^\.\?\!]+[\.\?\!])(?=\s*$)/g;
//   // 移除文本中的所有换行符和额外的空格
//   const cleanedText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

//   // 使用正则表达式匹配句子
//   let sentences = cleanedText.match(regex);
//   if (sentences) {
//       // 如果有需要，对句子进行进一步的分割处理（例如，按长度分割）
//       sentences = sentences.map(sentence => {
//           // 移除句子末尾的标点符号
//           // sentence = sentence.replace(/[\.\?\!]$/, '');
//           // 如果需要按长度分割句子，可以再次处理（这里只是一个示例，实际应用中可能需要具体逻辑）
//           return splitSentenceByLength(sentence, 4); // 例如，按20个字符长度分割
//       });
//       // 展平数组，以便所有分割后的句子都在一个数组中
//       sentences = sentences.flat();
//   }
//   return sentences;
// }

// function splitSentenceByLength(sentence, maxLength) {
//   const words = sentence.split(' ');
//   let result = [];
//   let currentSentence = '';

//   words.forEach(word => {
//       if ((currentSentence + word).length > maxLength) {
//           result.push(currentSentence.trim());
//           currentSentence = word + ' '; // 开始新的一行，加上一个空格以保持单词间的间隔
//       } else {
//           currentSentence += word + ' ';
//       }
//   });
//   result.push(currentSentence.trim()); // 添加最后一行
//   return result;
// }

/***********************------全局复制携带网站信息-------************************* */
// document.body.oncopy = function(e) {
//     // 全局监听
// };
// $('.articl-content').oncopy = function(e) {
//     // 部分监听
// };
// window.addEventListener('copy', e => {
//     // 全局监听
// })
// window.addEventListener('copy',() => {
//swal("复制成功！", "若要转载请务必保留原文链接，申明来源，谢谢合作！By:梦极客园","success");
// addLink();
/* setTimeout( function () {
    //window.event.returnValue = false;
    var text = window.clipboardData.getData("text");
    if (text) {
    text = text + "\r\n本篇文章来源于google( www.google.com) 原文链接："+location.href;
    clipboardData.setData("text", text);
    }
    },100); */
// });
// export default plushome;
