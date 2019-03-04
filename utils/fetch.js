import regeneratorRuntime from '../regenerator-runtime/runtime';
/*
生产参数: 
 AppID(小程序ID)  wx905f4101f0dc6aea
 AppSecret 6d1420d9089eb3df2d5be5cd219fa48e
 */
// let baseUrl = 'https://www.vzoom.com/d-wechat'; // 开发地址
// let baseUrl = 'http://www.vzoom.com/miniapp'; // 生产地址
let baseUrl = 'https://www.vzoom.com/v-miniapp'; // 测试地址

let httpRequestFun = function (obj) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: obj.buIsHave ? obj.url : baseUrl + obj.url,
      method: obj.method,
      timeout: 120000,
      data: obj.params,
      dataType: 'json',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        if (res.data.httpCode == 200) {
          resolve(res.data);
        } else {
          wx.showModal({
            title: '服务器错误',
          })
        }
        wx.hideLoading();
      },
      fail: function (res) {
        reject(res);
        console.log(res);
        let message = '';
        wx.showModal({
          title: '服务器错误',
        });
        wx.hideLoading();
      }
    });
  })
}

module.exports = async function (obj) {
  let data = await httpRequestFun(obj);
  return data;
}