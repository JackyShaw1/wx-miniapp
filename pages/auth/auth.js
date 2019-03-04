// pages/auth/auth.js
import regeneratorRuntime from '../../regenerator-runtime/runtime';
import { pollingSearch } from '../../api/index'
let app = getApp();
let pageCloseState = false; // 页面关闭状态;
Page({
  data: {
    url: "",
    authData: {
      nsrsbh: '',
      companyName: ''
    }
  },
  onLoad() {
    // 调用轮询方法;
    this.getPollingSearch();
    console.log("进入 onLoad 方法")
    let that = this;
    this.setData({ url: encodeURI(app.globalData.authUrl) });
    // let wsUrl = `ws://192.168.81.124:8080/d-wechat/applet/websocket/${app.globalData.reqId}`

    // //建立连接
    // wx.connectSocket({
    //   url: wsUrl,
    // });

    // //连接成功
    // wx.onSocketOpen(function () {
    //   console.log('socket连接成功!');
    //   wx.sendSocketMessage({
    //     data: 'stock',
    //   })
    // });
    // //接收数据
    // wx.onSocketMessage(function (data) {
    //   wx.closeSocket();// 关闭socket连接;
    //   console.log(data);
    //   let obj = null;
    //   if (that.isJSON(data.data)){
    //     obj = JSON.parse(data.data);
    //   }
    //   if (obj && obj.status === "1"){
    //     let { nsrsbh, companyName } = obj;
    //     that.setData({
    //       authData: { nsrsbh: nsrsbh, companyName: companyName }
    //     });
    //     that.handlerMessage();
    //   } else if (obj && obj.status){ // 认证失败
    //     wx.redirectTo({ url: `../fail/fail` });
    //   }
    // });
    // // webScoket关闭
    // wx.onSocketClose(function (res) {
    //   console.log('WebSocket 已关闭！')
    //   wx.connectSocket({
    //     url: wsUrl
    //   });
    // });
    // //连接失败
    // wx.onSocketError(function () {
    //   console.log('websocket连接失败！');
    // });
  },
  // isJSON(str) {
  //   if (typeof str == 'string') {
  //     try {
  //       var obj = JSON.parse(str);
  //       if (typeof obj == 'object' && obj) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     } catch (e) {
  //       return false;
  //     }
  //   }
  // },
  async handlerMessage() {
    let data = {
      list: [],
      dataObj: {}
    };
    let { nsrsbh } = this.data.authData;
    let localData = await this.getCompanyData(); // 获取本地缓存数据
    if (localData && localData.list && localData.list.length < 5) { // 检验缓存数据是否有5条;
      data = {
        list: localData.list,
        dataObj: localData.dataObj
      };
      data.list = localData.list;
      data.list.push(this.data.authData);

      // 去重数组中的对象;
      let hash = {};
      const newArr = data.list.reduceRight((item, next) => {
        hash[next.nsrsbh] ? '' : hash[next.nsrsbh] = true && item.push(next);
        return item
      }, []);
      data.list = newArr;
      this.setCompanyData(data);
    } else {
      if (!localData) {
        data.list.push(this.data.authData);
        this.setCompanyData(data);
      } else {
        wx.showModal({
          title: '警告',
          content: '认证企业已经超出范围, 不能继续添加企业!',
        });
      }
    }
  },
  onShow(){
    pageCloseState = false;
    console.log('页面显示');
  },
  onUnload(){
    pageCloseState = true;
    console.log('页面隐藏');
  },
  getPollingSearch() { // 轮询查询授权状态
    let that = this;
    setTimeout(() => {
      let params = { reqId: app.globalData.reqId };
      pollingSearch(params).then((res) => {
        let { status, nsrsbh, companyName } = res.data;
        if (status == "") { // 没有查到
          if (!pageCloseState){
            console.log("没有查到认证成功状态");
            that.getPollingSearch();
          }
        } else if (status == 1) { // 认证成功
          console.log("企业认证成功");
          that.setData({
            authData: { nsrsbh: nsrsbh, companyName: companyName }
          });
          that.handlerMessage();
        } else { // 认证失败
          wx.redirectTo({ url: `../fail/fail` });
        }
      });
    }, 2000);
  },
  setCompanyData(data) {
    let { nsrsbh, companyName } = this.data.authData
    wx.setStorage({
      key: 'reportData',
      data: data,
      success: function () {
        wx.redirectTo({ url: `../success/success?nsrsbh=${nsrsbh}&companyName=${companyName}` });
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
  }
});
