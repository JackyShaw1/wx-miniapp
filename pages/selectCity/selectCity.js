var city = require('../../utils/city.js');
const { $Toast } = require('../../dist/base/index');
import { getAuthUrl } from '../../api/index';

var app = getApp();
Page({
  data: {
    searchLetter: [],
    showLetter: "",
    winHeight: 0,
    // tHeight: 0,
    // bHeight: 0,
    cityList: [],
    isShowLetter: false,
    scrollTop: 0,//置顶高度
    scrollTopId: '',//置顶id
    city: "",
    hotcityList: city.hotCity
  },
  onLoad: function () {
    // 生命周期函数--监听页面加载
    var searchLetter = city.searchLetter;
    var cityList = city.cityList();
    var sysInfo = wx.getSystemInfoSync();
    var winHeight = sysInfo.windowHeight;
    var itemH = winHeight / searchLetter.length;
    var tempObj = [];
    for (var i = 0; i < searchLetter.length; i++) {
      var temp = {};
      temp.name = searchLetter[i];
      temp.tHeight = i * itemH;
      temp.bHeight = (i + 1) * itemH;
      tempObj.push(temp)
    }
    this.setData({
      winHeight: winHeight,
      itemH: itemH,
      searchLetter: tempObj,
      cityList: cityList
    });
  },
  clickLetter: function (e) {
    var showLetter = e.currentTarget.dataset.letter;
    this.setData({
      showLetter: showLetter,
      isShowLetter: true,
      scrollTopId: showLetter,
    });
    var that = this;
    setTimeout(function () {
      that.setData({
        isShowLetter: false
      })
    }, 1000);
  },
  bindCity: function (e) { // 选择城市
    let { provincecode, citycode } = e.currentTarget.dataset;
    let timestamp = new Date().getTime();
    this.setData({ city: e.currentTarget.dataset.city });
    wx.showLoading({ title: '加载中...' });
    wx.login({
      success: res => {
        app.globalData.loginCode = res.code;
        console.log(res.code);
        let params = {
          proCode: provincecode,
          cityCode: citycode,
          reqId: timestamp,
          type: "wechat-plus",
          appletAuthCode: res.code
        }
        getAuthUrl(params).then((res) => {
          console.log(res);
          let { certTaxUrl, reqId } = res.data
          app.globalData.authUrl = certTaxUrl;
          app.globalData.reqId = reqId;
          wx.navigateTo({ url: '../auth/auth' });// 跳转认证授权页面

        });
      }
    });
   
  },
  hotCity: function () { // 点击热门城市回到顶部
    this.setData({scrollTop: 0});
  },
  bindScroll(e){
    
  }
})