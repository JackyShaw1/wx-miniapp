// pages/assess/assess.js
const { $Toast } = require('../../dist/base/index');
Page({
  data: {
    companyName: '',
    productList: [
      {
        productName: "江苏银行",
        productId: 1,
        imgUrl: '../../images/product-img/jiangsu-bank-logo.png'
      },
      {
        productName: "交通银行",
        productId: 2,
        imgUrl: '../../images/product-img/jiaotong-bank-logo.png'
      },
      {
        productName: "平安银行",
        productId: 3,
        imgUrl: '../../images/product-img/pingan-bank-logo.png'
      }
    ]
  },
  onLoad(query) {
    let { nsrsbh, companyName } = query;
    this.setData({ companyName: companyName, nsrsbh: nsrsbh });
  },
  addAuthAssess(e) {
    wx.scanCode({
      success(res) {
        console.log(res)
      },
      fail(res){
        
      }
    });
  },
  formSubmit(e) {
    $Toast({
      content: '此功能还未开通'
    });
    // console.log('form发生了submit事件，携带数据为：', e.detail.value);
    // if (!e.detail.value.productId) {
    //   $Toast({
    //     content: '选择产品不能为空'
    //   });
      
    // } else {
    //   wx.navigateTo({ url: '../linkForm/linkForm?productId=' + e.detail.value.productId });
    // }
  }
});
