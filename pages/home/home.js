import regeneratorRuntime from '../../regenerator-runtime/runtime';
import Promise from '../../utils/es6-promise.min.js';
import F2 from '@antv/wx-f2';
import dashBoardChart from '../components/chart/dashBoard-chart';
import { getAuthUrl, getTaxData } from '../../api/index';

let app = getApp();
Page({
  data: {
    isAuthStatus: app.globalData.auth,
    isHaveChart: false,
    bankList: [
      {
        thumb: 'icon01.png',
        title: '智能信贷'
      },
      {
        thumb: 'icon02.png',
        title: '融资租赁'
      },
      {
        thumb: 'icon03.png',
        title: '商业保理'
      },
      {
        thumb: 'icon04.png',
        title: '信用商务'
      }
    ],
    cityList: [
      {
        provinceCode: '440000',
        cityCode: '440100',
        areaName: '广东'
      },
      {
        provinceCode: '440000',
        cityCode: '440300',
        areaName: '深圳'
      }
    ],
    currentCity: app.globalData.currentCity,
    companyName: '',
    nsrsbh: '',
    dataObj: {
      scoreInfo: null
    },
    creditRating: {
      rating: '',
      paraphrase: ''
    }
  },
  onLoad() {
    this.checkIsAuth();
  },
  onShow() {
    var that = this;
    this.setData({ isAuthStatus: app.globalData.auth });
    if (!this.data.isAuthStatus) { // 如果没有认证状态就认为, 没有图表
      this.setData({
        isHaveChart: false
      });
    }
    if (app.globalData.auth && !this.data.isHaveChart) {
      wx.getStorage({
        key: 'reportData',
        success: function (res) {
          let data = res.data;
          if (data && data.list.length) {
            let { nsrsbh, companyName } = data.list[0];
            that.setData({
              companyName: companyName,
              nsrsbh: nsrsbh
            });
            let { scoreInfo } = data.dataObj[nsrsbh];
            that.setData({
              dataObj: {
                scoreInfo: scoreInfo // 评分
              }
            });
            that.initChart();
          }
        },
        fail: function (res) {
          my.alert({ content: res.errorMessage });
        }
      });
    }
  },
  async taxAuth(e) {
    let that = this;
    // 缓存中查看认证数量是否已有5条数据;
    // var data = await this.getCompanyData();
    // if ((data && data.list && (data.list.length < 5)) || !data) {
      wx.navigateTo({ url: '../selectCity/selectCity' });
    // } else {
    //   wx.showModal({
    //     title: '警告',
    //     content: '认证企业数量已经超出范围, 不能继续添加企业!',
    //   });
    // }
  },
  clickCityHandle(e) { // 首页点击城市按钮;
    console.log(e);
    let { citycode, provincecode } = e.currentTarget.dataset;
    app.globalData.provinceCode = citycode;
    app.globalData.cityCode = provincecode;
    this.getUrl();
  },
  getUrl() {
    let timestamp = new Date().getTime();
    let { provinceCode, cityCode } = app.globalData;
    wx.showLoading({ title: '加载中...' });
    wx.login({
      success: res => {
        app.globalData.loginCode = res.code;
        let params = {
          proCode: provinceCode,
          cityCode: cityCode,
          reqId: timestamp,
          type: "wechat-plus",
          appletAuthCode: res.code
        }
        console.log(res.code);
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
  getCompanyData() {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'reportData',
        success: function (res) {
          resolve(res.data);
        },
        fail: function (res) {
          reject(res.errorMessage);
          // wx.alert({content: res.errorMessage});
        }
      });
    });
  },
  async checkIsAuth() {
    var that = this;
    let data = await this.getCompanyData(); // 从缓存中读取数据;
    if (data && data.list.length) {
      app.globalData.auth = true;
      console.log('app.globalData.auth:' + app.globalData.auth);
      let { nsrsbh, companyName } = data.list[0];
      that.setData({
        companyName: companyName,
        nsrsbh: nsrsbh
      });
      // 检验当前认证的纳税识别号的报告是否有数据;
      if (data.dataObj[nsrsbh]) {
        that.setData({});
        let { scoreInfo } = data.dataObj[nsrsbh];
        that.setData({
          dataObj: {
            scoreInfo: scoreInfo // 评分
          }
        });
        that.setData({
          isAuthStatus: true, // 认证状态设置为true; 
          isHaveChart: false
        });
        that.initChart();
      }

    } else {
      app.globalData.auth = false;
    }
  },
  initChart() {
    var that = this;
    /************************ 仪表盘 图表*********************/
    this.setData({ isHaveChart: true });
    let { score, curDate } = this.data.dataObj.scoreInfo;
    if (typeof score === 'number' && !isNaN(score)) {
      let newScore = (score * 100).toFixed(2);
      let pointerText = '';
      let paraphrase = '';
      if (newScore < 51.6) {
        newScore = 51.6;
        pointerText = 'A';
        paraphrase = '企业信用等级一般';
      } else if (newScore >= 51.6 && newScore < 57.8) {
        pointerText = 'A';
        paraphrase = '企业信用等级一般';
      } else if (newScore >= 57.8 && newScore < 65) {
        pointerText = 'AA';
        paraphrase = '企业信用等级良好';
      } else if (newScore >= 65 && newScore < 72.3) {
        pointerText = 'AAA';
        paraphrase = '企业信用等级较好';
      } else if (newScore >= 72.3 && newScore < 81.2) {
        pointerText = 'AAAA';
        paraphrase = '企业信用等级很好';
      } else if (newScore >= 81.2) {
        pointerText = 'AAAAA';
        paraphrase = '企业信用等级极好';
      }

      that.setData({
        creditRating: {
          rating: pointerText,
          paraphrase: paraphrase
        }
      });

      let data = [{
        pointer: pointerText,
        curDate: curDate,
        value: newScore,
        length: 2,
        y: 1.05
      }];
      this.selectComponent('#dashBored-chart').init((canvas, width, height) => {
        dashBoardChart(canvas, width, height, data);
      });
    }
  },
  lookReportHander() {
    let { nsrsbh, companyName } = this.data;
    console.log(nsrsbh, companyName);
    wx.navigateTo({
      url: `../reportPage/reportPage?nsrsbh=${nsrsbh}&companyName=${companyName}`
    });
  }
});