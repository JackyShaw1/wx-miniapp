// pages/my/my.js
import regeneratorRuntime from '../../regenerator-runtime/runtime';
import { getTaxData } from '../../api/index';
const app = getApp();
Page({
  data: {
    visible1: false,
    actions1: [
      { name: '取消' },
      { name: '认证', color: '#ed3f14' }
    ],
    userInfo: {
      nickName: "",
      avatarUrl:"",
    },
    onTitleTap: 'handleTitleTap',
    panels: [
      {
        title: '查看企业征信报告',
        thumb: '../../images/my-img/icon4-2.png',
        expanded: false,
        content: []
      }
    ],
    listData: [],
  },
  onLoad() {
   
  },
  onHide() {
  },
  onShow() {
    this.getCompanyList();
  },
  async getCompanyList() {
    let tmp = this.data.panels;
    tmp[0].content = [];
    let data = await this.getCompanyData(); // 从缓存中读取数据;
    if (data && data.list) { // 缓存中有数据;
      this.setData({ listData: data.list });
      if (data.list.length === 0) {
        app.globalData.auth = false;
      }
    } else { // 缓存中没有数据
      app.globalData.auth = false;
    }
  },
  async companyHandler(e) { // 点击公司列表;
    let { nsrsbh, companyname } = e.target.dataset;
    let data = await this.getCompanyData(); // 从缓存中读取数据;
    // 检验当前认证的纳税识别号的报告是否有数据;
    if (data.dataObj[nsrsbh]) {
      wx.navigateTo({
        url: `../reportPage/reportPage?nsrsbh=${nsrsbh}&companyName=${companyname}`
      });
     } else {
      let currentData = await this.getReportAllData(nsrsbh); // 后台获取数据
      data.dataObj[nsrsbh] = currentData;
      wx.setStorage({
        key: 'reportData',
        data: data,
        success: function () {
          wx.navigateTo({
            url: `../reportPage/reportPage?nsrsbh=${nsrsbh}&companyName=${companyname}`
          })
        },
        fail: function () {
        }
      });
    }
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
  handleTitleTap(e) {
    if (!this.data.panels[0].content.length) {
      wx.showModal({
        title: '提示',
        content: '您还没有认证的企业, 请先认证企业?',
        confirmText: '认证',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../home/home',
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      });
    }
    const { index } = e.currentTarget.dataset;
    const panels = this.data.panels;
    // android does not supprt Array findIndex
    panels[index].expanded = !panels[index].expanded;
    this.setData({
      panels: [...panels],
    });
  },
  async deleteItemBtn(e) {
    let that = this;
    let { nsrsbh, index } = e.target.dataset;
    let data = await that.getCompanyData();
    wx.showModal({
      title: '提示',
      content: '确认要删除该企业认证信息吗?',
      success(res) {
        if (res.confirm) {
          data.list.splice(index, 1);
          delete data.dataObj[nsrsbh];
          that.setCompanyData(data);
        } else if (res.cancel) {
        }
      }
    });
  },
  setCompanyData(data) {
    let that = this;
    wx.setStorage({
      key: 'reportData',
      data: data,
      success: function () {
        that.getCompanyList();
      },
      fail: function () {

      }
    });
  },
  callPhoneBtn() { // 拨打客服电话
    wx.makePhoneCall({
      phoneNumber: '4008036188'
    });
  }
})