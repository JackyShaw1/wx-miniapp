// pages/success/success.js
import regeneratorRuntime from '../../regenerator-runtime/runtime';
import { getTaxData } from '../../api/index';
var app = getApp();
Page({
  data: {
    companyName: '',
    nsrsbh: ''
  },
  onLoad(query) {
    let { nsrsbh, companyName } = query;
    this.setData({ companyName: companyName, nsrsbh: nsrsbh });
  },
  async getReportHandler() {
    let that = this;
    let { nsrsbh, companyName } = this.data;
    let data = await this.getCompanyData(); // 从缓存中读取数据;
    let currentData = await this.getReportAllData(nsrsbh); // 后台获取数据
    data.dataObj[nsrsbh] = currentData;
    wx.setStorage({
      key: 'reportData',
      data: data,
      success: function () {
        app.globalData.auth = true;
        wx.switchTab({
          url: `../home/home`
        });
      },
      fail: function () {
      }
    });
  },
  getCompanyData() {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'reportData',
        success: function (res) {
          resolve(res.data);
        },
        fail: function (res) {
          resolve(null);
        }
      });
    });
  },
  getReportAllData(nsrsbh) {
    let that = this;
    let params = { nsrsbh: nsrsbh };
    wx.showLoading({ title: '加载中...' });
    return getTaxData(params).then((res) => {
      let { data } = res;
      let obj = {
        baseInfo: JSON.parse(data.jcxxInfo), // 基础数据
        scoreInfo: JSON.parse(data.scoreInfo), // 评分
        manger: JSON.parse(data.bseInfo), // 经营稳定性评价
        earnProfit: JSON.parse(data.proeInfo), // 获利能力评价
        performance: JSON.parse(data.periInfo), // 履约意愿评价
        growUp: JSON.parse(data.salerInfo), // 成长能力评价
      }
      return obj;
    });
  },

});